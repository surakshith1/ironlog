import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WorkoutState {
    activeProgramId: string | null;
    activeWorkoutId: string | null;
    previewProgramId: string | null; // For previewing a non-active program
    isWorkoutStarted: boolean; // True if the user has clicked "Start Workout" and is currently training
    startTime: number | null;

    /**
     * Tracks the current workout index for each program.
     * When a workout is completed, we advance to the next index.
     * Format: { programId: workoutIndex }
     */
    programWorkoutIndices: Record<string, number>;

    setActiveProgram: (programId: string) => void;
    setActiveWorkout: (workoutId: string) => void;
    setPreviewProgram: (programId: string | null) => void;
    startWorkout: () => void;
    /**
     * Finish workout and advance to the next workout in the program.
     * @param totalWorkouts - Total number of workouts in the program (for cycling)
     */
    finishWorkout: (totalWorkouts?: number) => void;
    clearActiveProgram: () => void;

    /**
     * Get the current workout index for a program.
     */
    getWorkoutIndex: (programId: string) => number;

    /**
     * Set the workout index for a program explicitly.
     */
    setWorkoutIndex: (programId: string, index: number) => void;
}

export const useWorkoutStore = create<WorkoutState>()(
    persist(
        (set, get) => ({
            activeProgramId: null,
            activeWorkoutId: null,
            previewProgramId: null,
            isWorkoutStarted: false,
            startTime: null,
            programWorkoutIndices: {},

            setActiveProgram: (programId) => set((state) => ({
                activeProgramId: programId,
                previewProgramId: null, // Clear preview when setting active
                activeWorkoutId: null, // Will be determined by workout index
                // Initialize workout index to 0 if not already set
                programWorkoutIndices: {
                    ...state.programWorkoutIndices,
                    [programId]: state.programWorkoutIndices[programId] ?? 0,
                },
            })),

            setActiveWorkout: (workoutId) => set({ activeWorkoutId: workoutId }),

            setPreviewProgram: (programId) => set({ previewProgramId: programId }),

            startWorkout: () => set({
                isWorkoutStarted: true,
                startTime: Date.now()
            }),

            finishWorkout: (totalWorkouts?: number) => set((state) => {
                const updates: Partial<WorkoutState> = {
                    isWorkoutStarted: false,
                    startTime: null,
                };

                // Advance to next workout if we have the program info
                if (state.activeProgramId && totalWorkouts && totalWorkouts > 0) {
                    const currentIndex = state.programWorkoutIndices[state.activeProgramId] ?? 0;
                    const nextIndex = (currentIndex + 1) % totalWorkouts; // Cycle back to 0

                    updates.programWorkoutIndices = {
                        ...state.programWorkoutIndices,
                        [state.activeProgramId]: nextIndex,
                    };
                    updates.activeWorkoutId = null; // Will be set based on new index
                }

                return updates;
            }),

            clearActiveProgram: () => set({
                activeProgramId: null,
                activeWorkoutId: null,
                previewProgramId: null,
                isWorkoutStarted: false,
                startTime: null
            }),

            getWorkoutIndex: (programId: string) => {
                return get().programWorkoutIndices[programId] ?? 0;
            },

            setWorkoutIndex: (programId: string, index: number) => set((state) => ({
                programWorkoutIndices: {
                    ...state.programWorkoutIndices,
                    [programId]: index,
                },
            })),
        }),
        {
            name: 'workout-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                // Don't persist previewProgramId - it's ephemeral
                activeProgramId: state.activeProgramId,
                activeWorkoutId: state.activeWorkoutId,
                isWorkoutStarted: state.isWorkoutStarted,
                startTime: state.startTime,
                programWorkoutIndices: state.programWorkoutIndices,
            }),
        }
    )
);
