import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WorkoutState {
    activeProgramId: string | null;
    activeWorkoutId: string | null;
    isWorkoutStarted: boolean; // True if the user has clicked "Start Workout" and is currently training
    startTime: number | null;

    setActiveProgram: (programId: string) => void;
    setActiveWorkout: (workoutId: string) => void;
    startWorkout: () => void;
    finishWorkout: () => void;
    clearActiveProgram: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
    persist(
        (set) => ({
            activeProgramId: null,
            activeWorkoutId: null,
            isWorkoutStarted: false,
            startTime: null,

            setActiveProgram: (programId) => set({ activeProgramId: programId }),

            setActiveWorkout: (workoutId) => set({ activeWorkoutId: workoutId }),

            startWorkout: () => set({
                isWorkoutStarted: true,
                startTime: Date.now()
            }),

            finishWorkout: () => set({
                isWorkoutStarted: false,
                startTime: null,
                // We keep the activeProgramId and activeWorkoutId selected for convenience
            }),

            clearActiveProgram: () => set({
                activeProgramId: null,
                activeWorkoutId: null,
                isWorkoutStarted: false,
                startTime: null
            })
        }),
        {
            name: 'workout-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
