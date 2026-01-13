/**
 * Program data models for workout programs imported via JSON.
 * These interfaces match the JSON schema for program import.
 */

/**
 * An individual exercise within a workout.
 */
export interface ProgramExercise {
    /** The unique ID of the exercise from exercises.json */
    exerciseId: string;
    /** The name of the exercise for easy reference */
    name?: string;
    /** Number of sets to perform */
    sets: number;
    /** Number of repetitions or duration (e.g., '10', '12-15', '30 sec') */
    reps?: string;
    /** The target weight or intensity (e.g., 'Bodyweight', '80% 1RM', '20 lbs') */
    targetWeight: string;
}

/**
 * Workout type enum matching the schema.
 */
export type WorkoutType =
    | 'Strength'
    | 'Hypertrophy'
    | 'Endurance'
    | 'Power'
    | 'Flexibility'
    | 'Cardio'
    | 'Plyometrics';

/**
 * A single workout within a program.
 */
export interface Workout {
    /** Unique identifier for this workout (generated on import) */
    id: string;
    /** Name of the specific workout (e.g., 'Leg Day', 'Full Body A') */
    name: string;
    /** The primary focus of the workout */
    type: WorkoutType;
    /** List of exercises in this workout */
    exercises: ProgramExercise[];
}

/**
 * A complete workout program containing multiple workouts.
 */
export interface Program {
    /** Unique identifier for this program (generated on import) */
    id: string;
    /** The name of the workout program (e.g., 'Beginner Strength') */
    name: string;
    /** A list of workouts included in this program */
    workouts: Workout[];
    /** Timestamp when the program was imported */
    importedAt: number;
}

/**
 * Raw program data as it appears in the import JSON (without generated IDs).
 */
export interface RawProgramExercise {
    exerciseId: string;
    name?: string;
    sets: number;
    reps?: string;
    targetWeight: string;
}

export interface RawWorkout {
    name: string;
    type: WorkoutType;
    exercises: RawProgramExercise[];
}

export interface RawProgram {
    name: string;
    workouts: RawWorkout[];
}
