/**
 * Exercise Log Store
 * Zustand store for managing exercise logging state and actions.
 */

import { create } from 'zustand';
import {
    logWorkoutSession,
    initializeExerciseLogDatabase,
} from '../api/services/exerciseLogDatabase';
import { WorkoutLogInput, SetLogInput } from '../api/models/exerciseLog';

interface ExerciseLogState {
    /** Whether the database has been initialized */
    isInitialized: boolean;
    /** Whether currently logging a workout */
    isLogging: boolean;
    /** Last error message, if any */
    lastError: string | null;
    /** Last logged session ID */
    lastSessionId: string | null;

    /** Initialize the exercise log database */
    initialize: () => Promise<void>;

    /** Log a completed workout session */
    logCompletedWorkout: (input: WorkoutLogInput) => Promise<boolean>;

    /** Clear any error state */
    clearError: () => void;
}

export const useExerciseLogStore = create<ExerciseLogState>()((set, get) => ({
    isInitialized: false,
    isLogging: false,
    lastError: null,
    lastSessionId: null,

    initialize: async () => {
        if (get().isInitialized) return;

        try {
            await initializeExerciseLogDatabase();
            set({ isInitialized: true });
        } catch (error) {
            console.error('Failed to initialize exercise log database:', error);
            set({ lastError: 'Failed to initialize exercise database' });
        }
    },

    logCompletedWorkout: async (input: WorkoutLogInput) => {
        // Filter out incomplete sets (no weight or reps)
        const completeSets: SetLogInput[] = input.sets.filter(
            (s) => s.weight > 0 && s.reps > 0
        );

        if (completeSets.length === 0) {
            set({ lastError: 'No completed sets to log' });
            return false;
        }

        set({ isLogging: true, lastError: null });

        try {
            const sessionId = await logWorkoutSession({
                ...input,
                sets: completeSets,
            });

            set({
                isLogging: false,
                lastSessionId: sessionId,
            });

            return true;
        } catch (error) {
            console.error('Failed to log workout:', error);
            set({
                isLogging: false,
                lastError: 'Failed to save workout data',
            });
            return false;
        }
    },

    clearError: () => set({ lastError: null }),
}));
