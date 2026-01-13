import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Program, RawProgram, Workout, RawWorkout, ProgramExercise } from '../api/models/program';

/**
 * Generates a unique ID based on the name and timestamp.
 */
function generateId(name: string): string {
    const sanitized = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const timestamp = Date.now().toString(36);
    return `${sanitized}_${timestamp}`;
}

/**
 * Transforms raw imported program data into the full Program structure with IDs.
 */
function transformProgram(raw: RawProgram): Program {
    const programId = generateId(raw.name);

    const workouts: Workout[] = raw.workouts.map((rawWorkout: RawWorkout, index: number) => ({
        id: `${programId}_workout_${index}`,
        name: rawWorkout.name,
        type: rawWorkout.type,
        exercises: rawWorkout.exercises.map((exercise): ProgramExercise => ({
            exerciseId: exercise.exerciseId,
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            targetWeight: exercise.targetWeight,
        })),
    }));

    return {
        id: programId,
        name: raw.name,
        workouts,
        importedAt: Date.now(),
    };
}

/**
 * Validates the structure of imported JSON data.
 * Returns an error message if invalid, or null if valid.
 */
function validateProgramData(data: unknown): string | null {
    if (!Array.isArray(data)) {
        return 'Data must be an array of programs';
    }

    for (let i = 0; i < data.length; i++) {
        const program = data[i];

        if (typeof program !== 'object' || program === null) {
            return `Program at index ${i} must be an object`;
        }

        if (typeof program.name !== 'string' || !program.name.trim()) {
            return `Program at index ${i} must have a valid name`;
        }

        if (!Array.isArray(program.workouts)) {
            return `Program "${program.name}" must have a workouts array`;
        }

        for (let j = 0; j < program.workouts.length; j++) {
            const workout = program.workouts[j];

            if (typeof workout !== 'object' || workout === null) {
                return `Workout at index ${j} in "${program.name}" must be an object`;
            }

            if (typeof workout.name !== 'string' || !workout.name.trim()) {
                return `Workout at index ${j} in "${program.name}" must have a valid name`;
            }

            if (typeof workout.type !== 'string') {
                return `Workout "${workout.name}" must have a type`;
            }

            if (!Array.isArray(workout.exercises)) {
                return `Workout "${workout.name}" must have an exercises array`;
            }

            for (let k = 0; k < workout.exercises.length; k++) {
                const exercise = workout.exercises[k];

                if (typeof exercise !== 'object' || exercise === null) {
                    return `Exercise at index ${k} in "${workout.name}" must be an object`;
                }

                if (typeof exercise.exerciseId !== 'string' || !exercise.exerciseId.trim()) {
                    return `Exercise at index ${k} in "${workout.name}" must have an exerciseId`;
                }

                if (typeof exercise.sets !== 'number' || exercise.sets < 1) {
                    return `Exercise "${exercise.name || exercise.exerciseId}" must have valid sets`;
                }

                if (typeof exercise.targetWeight !== 'string') {
                    return `Exercise "${exercise.name || exercise.exerciseId}" must have a targetWeight`;
                }
            }
        }
    }

    return null;
}

interface ProgramState {
    /** All imported programs */
    programs: Program[];

    /** Import programs from JSON string */
    importPrograms: (jsonString: string) => { success: boolean; error?: string; count?: number };

    /** Delete a program by ID */
    deleteProgram: (programId: string) => void;

    /** Get a program by ID */
    getProgram: (programId: string) => Program | undefined;

    /** Get a workout by ID */
    getWorkout: (workoutId: string) => Workout | undefined;

    /** Clear all programs */
    clearAllPrograms: () => void;
}

export const useProgramStore = create<ProgramState>()(
    persist(
        (set, get) => ({
            programs: [],

            importPrograms: (jsonString: string) => {
                try {
                    const parsed = JSON.parse(jsonString);
                    const validationError = validateProgramData(parsed);

                    if (validationError) {
                        return { success: false, error: validationError };
                    }

                    const rawPrograms = parsed as RawProgram[];
                    const newPrograms = rawPrograms.map(transformProgram);

                    set((state) => ({
                        programs: [...state.programs, ...newPrograms],
                    }));

                    return { success: true, count: newPrograms.length };
                } catch (error) {
                    if (error instanceof SyntaxError) {
                        return { success: false, error: 'Invalid JSON format' };
                    }
                    return { success: false, error: 'Failed to import programs' };
                }
            },

            deleteProgram: (programId: string) => {
                set((state) => ({
                    programs: state.programs.filter((p) => p.id !== programId),
                }));
            },

            getProgram: (programId: string) => {
                return get().programs.find((p) => p.id === programId);
            },

            getWorkout: (workoutId: string) => {
                for (const program of get().programs) {
                    const workout = program.workouts.find((w) => w.id === workoutId);
                    if (workout) return workout;
                }
                return undefined;
            },

            clearAllPrograms: () => {
                set({ programs: [] });
            },
        }),
        {
            name: 'program-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
