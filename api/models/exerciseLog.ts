/**
 * Exercise Log data models for persistent workout tracking.
 * Used for storing completed sets and workout sessions.
 */

/**
 * Represents a single set logged during a workout session.
 */
export interface LoggedSet {
    /** Unique identifier for this set */
    id: string;
    /** Links to exercise library (e.g., 'Barbell_Squat') */
    exerciseId: string;
    /** Groups sets from the same workout session */
    workoutSessionId: string;
    /** Order of set in exercise (1, 2, 3...) */
    setNumber: number;
    /** Weight used (in user's preferred unit) */
    weight: number;
    /** Number of reps completed */
    reps: number;
    /** Pre-calculated volume: weight × reps */
    volume: number;
    /** Estimated 1RM using Epley formula: weight × (1 + reps/30) */
    oneRepMax: number;
    /** ISO timestamp when set was logged */
    loggedAt: string;
    /** Whether this set was a personal record at time of logging */
    isPR: boolean;
}

/**
 * Workout session metadata.
 * Represents a single completed workout.
 */
export interface WorkoutSession {
    /** Unique session ID */
    id: string;
    /** Which program was used */
    programId: string;
    /** Which workout from the program */
    workoutId: string;
    /** Name for display (e.g., 'Push Day') */
    workoutName: string;
    /** ISO timestamp when workout started */
    startedAt: string;
    /** ISO timestamp when workout was completed */
    finishedAt: string;
    /** Duration in seconds */
    duration: number;
}

/**
 * Personal record for an exercise (cached for quick access).
 */
export interface ExercisePersonalRecord {
    /** Links to exercise library */
    exerciseId: string;
    /** Heaviest weight lifted for this exercise */
    maxWeight: number;
    /** ISO date when max weight was achieved */
    maxWeightDate: string;
    /** Highest estimated 1RM achieved */
    maxOneRepMax: number;
    /** ISO date when max 1RM was achieved */
    maxOneRepMaxDate: string;
    /** Highest single-set volume (weight × reps) */
    maxVolume: number;
    /** ISO date when max volume was achieved */
    maxVolumeDate: string;
}

/**
 * Input data for logging a completed set (before ID generation).
 */
export interface SetLogInput {
    exerciseId: string;
    setNumber: number;
    weight: number;
    reps: number;
}

/**
 * Input data for logging a completed workout session.
 */
export interface WorkoutLogInput {
    programId: string;
    workoutId: string;
    workoutName: string;
    startedAt: number; // Unix timestamp from Date.now()
    sets: SetLogInput[];
}
