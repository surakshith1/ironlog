/**
 * Exercise history data models.
 * Used for tracking workout log entries.
 */

/**
 * A single log entry for an exercise set.
 */
export interface ExerciseLogEntry {
    /** Unique identifier for the log entry */
    id: string;
    /** Date of the workout (ISO string) */
    date: string;
    /** Weight used for the set */
    weight: number;
    /** Number of reps performed */
    reps: number;
    /** Calculated 1 Rep Max (Epley formula) */
    oneRepMax: number;
    /** Whether this entry is a Personal Record */
    isPR?: boolean;
}

/**
 * Aggregated statistics for an exercise.
 */
export interface ExerciseStats {
    /** Highest weight ever lifted for this exercise */
    personalBest: number;
    /** Total volume (weight × reps) across all sessions */
    totalVolume: number;
    /** Unit for weights (lbs or kg) */
    unit: 'lbs' | 'kg';
}
