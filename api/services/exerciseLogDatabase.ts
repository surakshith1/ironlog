/**
 * Exercise Log Database Service
 * SQLite-based storage for workout history, personal records, and analytics.
 * Uses expo-sqlite for database operations.
 */

import * as SQLite from 'expo-sqlite';
import {
    LoggedSet,
    WorkoutSession,
    ExercisePersonalRecord,
    WorkoutLogInput,
} from '../models/exerciseLog';
import { ExerciseLogEntry, ExerciseStats } from '../models/history';

// Database name (shared with exercise database)
const DATABASE_NAME = 'ironlog.db';

// Database instance (lazy initialization)
let db: SQLite.SQLiteDatabase | null = null;

/**
 * Get or create the database instance
 */
async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!db) {
        db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    }
    return db;
}

/**
 * Generate a unique ID for database records.
 */
function generateId(): string {
    return `${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculate estimated 1RM using Epley formula.
 */
function calculateOneRepMax(weight: number, reps: number): number {
    if (reps <= 0) return weight;
    return Math.round(weight * (1 + reps / 30));
}

/**
 * Initialize the exercise log tables.
 * Should be called once at app startup.
 */
export async function initializeExerciseLogDatabase(): Promise<void> {
    const database = await getDatabase();

    await database.execAsync(`
        -- Workout sessions table
        CREATE TABLE IF NOT EXISTS workout_sessions (
            id TEXT PRIMARY KEY,
            programId TEXT NOT NULL,
            workoutId TEXT NOT NULL,
            workoutName TEXT NOT NULL,
            startedAt TEXT NOT NULL,
            finishedAt TEXT NOT NULL,
            duration INTEGER NOT NULL
        );

        -- Logged sets table
        CREATE TABLE IF NOT EXISTS logged_sets (
            id TEXT PRIMARY KEY,
            exerciseId TEXT NOT NULL,
            workoutSessionId TEXT NOT NULL,
            setNumber INTEGER NOT NULL,
            weight REAL NOT NULL,
            reps INTEGER NOT NULL,
            volume REAL NOT NULL,
            oneRepMax REAL NOT NULL,
            loggedAt TEXT NOT NULL,
            isPR INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (workoutSessionId) REFERENCES workout_sessions(id)
        );

        -- Personal records cache
        CREATE TABLE IF NOT EXISTS personal_records (
            exerciseId TEXT PRIMARY KEY,
            maxWeight REAL,
            maxWeightDate TEXT,
            maxOneRepMax REAL,
            maxOneRepMaxDate TEXT,
            maxVolume REAL,
            maxVolumeDate TEXT
        );

        -- Indexes for efficient queries
        CREATE INDEX IF NOT EXISTS idx_logged_sets_exercise ON logged_sets(exerciseId);
        CREATE INDEX IF NOT EXISTS idx_logged_sets_session ON logged_sets(workoutSessionId);
        CREATE INDEX IF NOT EXISTS idx_logged_sets_date ON logged_sets(loggedAt);
        CREATE INDEX IF NOT EXISTS idx_sessions_date ON workout_sessions(finishedAt);
    `);
}

/**
 * Log a completed workout session with all its sets.
 * This is called when the user finishes a workout.
 */
export async function logWorkoutSession(input: WorkoutLogInput): Promise<string> {
    const database = await getDatabase();
    const sessionId = generateId();
    const finishedAt = new Date().toISOString();
    const startedAt = new Date(input.startedAt).toISOString();
    const duration = Math.round((Date.now() - input.startedAt) / 1000);

    await database.withTransactionAsync(async () => {
        // Insert workout session
        await database.runAsync(
            `INSERT INTO workout_sessions (id, programId, workoutId, workoutName, startedAt, finishedAt, duration)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [sessionId, input.programId, input.workoutId, input.workoutName, startedAt, finishedAt, duration]
        );

        // Get current personal records for all exercises in this workout
        const exerciseIds = [...new Set(input.sets.map(s => s.exerciseId))];
        const prMap = new Map<string, ExercisePersonalRecord>();

        for (const exerciseId of exerciseIds) {
            const pr = await getPersonalRecord(exerciseId);
            if (pr) {
                prMap.set(exerciseId, pr);
            }
        }

        // Insert logged sets and track PRs
        const prUpdates = new Map<string, Partial<ExercisePersonalRecord>>();

        for (const set of input.sets) {
            if (set.weight <= 0 || set.reps <= 0) continue; // Skip incomplete sets

            const setId = generateId();
            const volume = set.weight * set.reps;
            const oneRepMax = calculateOneRepMax(set.weight, set.reps);
            const currentPR = prMap.get(set.exerciseId);

            // Check if this is a new PR
            let isPR = false;
            const prUpdate = prUpdates.get(set.exerciseId) || {};

            // Check max weight
            if (!currentPR || set.weight > currentPR.maxWeight) {
                if (!prUpdate.maxWeight || set.weight > prUpdate.maxWeight) {
                    prUpdate.maxWeight = set.weight;
                    prUpdate.maxWeightDate = finishedAt;
                    isPR = true;
                }
            }

            // Check max 1RM
            if (!currentPR || oneRepMax > currentPR.maxOneRepMax) {
                if (!prUpdate.maxOneRepMax || oneRepMax > prUpdate.maxOneRepMax) {
                    prUpdate.maxOneRepMax = oneRepMax;
                    prUpdate.maxOneRepMaxDate = finishedAt;
                    isPR = true;
                }
            }

            // Check max volume
            if (!currentPR || volume > currentPR.maxVolume) {
                if (!prUpdate.maxVolume || volume > prUpdate.maxVolume) {
                    prUpdate.maxVolume = volume;
                    prUpdate.maxVolumeDate = finishedAt;
                }
            }

            if (Object.keys(prUpdate).length > 0) {
                prUpdates.set(set.exerciseId, prUpdate);
            }

            // Insert the set
            await database.runAsync(
                `INSERT INTO logged_sets (id, exerciseId, workoutSessionId, setNumber, weight, reps, volume, oneRepMax, loggedAt, isPR)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [setId, set.exerciseId, sessionId, set.setNumber, set.weight, set.reps, volume, oneRepMax, finishedAt, isPR ? 1 : 0]
            );
        }

        // Update personal records
        for (const [exerciseId, update] of prUpdates) {
            const existingPR = prMap.get(exerciseId);

            if (existingPR) {
                // Update existing record
                const updates: string[] = [];
                const values: (string | number)[] = [];

                if (update.maxWeight !== undefined) {
                    updates.push('maxWeight = ?', 'maxWeightDate = ?');
                    values.push(update.maxWeight, update.maxWeightDate!);
                }
                if (update.maxOneRepMax !== undefined) {
                    updates.push('maxOneRepMax = ?', 'maxOneRepMaxDate = ?');
                    values.push(update.maxOneRepMax, update.maxOneRepMaxDate!);
                }
                if (update.maxVolume !== undefined) {
                    updates.push('maxVolume = ?', 'maxVolumeDate = ?');
                    values.push(update.maxVolume, update.maxVolumeDate!);
                }

                if (updates.length > 0) {
                    values.push(exerciseId);
                    await database.runAsync(
                        `UPDATE personal_records SET ${updates.join(', ')} WHERE exerciseId = ?`,
                        values
                    );
                }
            } else {
                // Insert new record
                await database.runAsync(
                    `INSERT INTO personal_records (exerciseId, maxWeight, maxWeightDate, maxOneRepMax, maxOneRepMaxDate, maxVolume, maxVolumeDate)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        exerciseId,
                        update.maxWeight || 0,
                        update.maxWeightDate || finishedAt,
                        update.maxOneRepMax || 0,
                        update.maxOneRepMaxDate || finishedAt,
                        update.maxVolume || 0,
                        update.maxVolumeDate || finishedAt,
                    ]
                );
            }
        }
    });

    return sessionId;
}

/**
 * Get the personal record for an exercise.
 */
export async function getPersonalRecord(exerciseId: string): Promise<ExercisePersonalRecord | null> {
    const database = await getDatabase();

    const row = await database.getFirstAsync<{
        exerciseId: string;
        maxWeight: number;
        maxWeightDate: string;
        maxOneRepMax: number;
        maxOneRepMaxDate: string;
        maxVolume: number;
        maxVolumeDate: string;
    }>('SELECT * FROM personal_records WHERE exerciseId = ?', [exerciseId]);

    if (!row) return null;

    return {
        exerciseId: row.exerciseId,
        maxWeight: row.maxWeight,
        maxWeightDate: row.maxWeightDate,
        maxOneRepMax: row.maxOneRepMax,
        maxOneRepMaxDate: row.maxOneRepMaxDate,
        maxVolume: row.maxVolume,
        maxVolumeDate: row.maxVolumeDate,
    };
}

/**
 * Get exercise history formatted for the history UI.
 * Returns entries sorted by date (most recent first).
 */
export async function getExerciseHistoryDb(exerciseId: string): Promise<ExerciseLogEntry[]> {
    const database = await getDatabase();

    const rows = await database.getAllAsync<{
        id: string;
        loggedAt: string;
        weight: number;
        reps: number;
        oneRepMax: number;
        isPR: number;
    }>(
        `SELECT id, loggedAt, weight, reps, oneRepMax, isPR
         FROM logged_sets
         WHERE exerciseId = ?
         ORDER BY loggedAt DESC`,
        [exerciseId]
    );

    return rows.map(row => ({
        id: row.id,
        date: row.loggedAt,
        weight: row.weight,
        reps: row.reps,
        oneRepMax: row.oneRepMax,
        isPR: row.isPR === 1,
    }));
}

/**
 * Get recent exercise history (limited entries).
 */
export async function getRecentHistoryDb(exerciseId: string, limit: number = 5): Promise<ExerciseLogEntry[]> {
    const database = await getDatabase();

    const rows = await database.getAllAsync<{
        id: string;
        loggedAt: string;
        weight: number;
        reps: number;
        oneRepMax: number;
        isPR: number;
    }>(
        `SELECT id, loggedAt, weight, reps, oneRepMax, isPR
         FROM logged_sets
         WHERE exerciseId = ?
         ORDER BY loggedAt DESC
         LIMIT ?`,
        [exerciseId, limit]
    );

    return rows.map(row => ({
        id: row.id,
        date: row.loggedAt,
        weight: row.weight,
        reps: row.reps,
        oneRepMax: row.oneRepMax,
        isPR: row.isPR === 1,
    }));
}

/**
 * Get aggregated stats for an exercise.
 */
export async function getExerciseStatsDb(exerciseId: string): Promise<ExerciseStats> {
    const database = await getDatabase();

    const stats = await database.getFirstAsync<{
        maxWeight: number | null;
        totalVolume: number | null;
    }>(
        `SELECT MAX(weight) as maxWeight, SUM(volume) as totalVolume
         FROM logged_sets
         WHERE exerciseId = ?`,
        [exerciseId]
    );

    return {
        personalBest: stats?.maxWeight || 0,
        totalVolume: stats?.totalVolume || 0,
        unit: 'lbs',
    };
}

/**
 * Check if any history exists for an exercise.
 */
export async function hasExerciseHistory(exerciseId: string): Promise<boolean> {
    const database = await getDatabase();

    const result = await database.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM logged_sets WHERE exerciseId = ?',
        [exerciseId]
    );

    return (result?.count || 0) > 0;
}

/**
 * Get total volume for the last N days.
 */
export async function getVolumeForPeriod(days: number): Promise<number> {
    const database = await getDatabase();

    const result = await database.getFirstAsync<{ total: number | null }>(
        `SELECT SUM(volume) as total
         FROM logged_sets
         WHERE loggedAt >= datetime('now', '-${days} days')`,
        []
    );

    return result?.total || 0;
}

/**
 * Get workout count for the last N days.
 */
export async function getWorkoutCountForPeriod(days: number): Promise<number> {
    const database = await getDatabase();

    const result = await database.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count
         FROM workout_sessions
         WHERE finishedAt >= datetime('now', '-${days} days')`,
        []
    );

    return result?.count || 0;
}

/**
 * Get max weight progression for an exercise (for charts).
 * Returns weekly max weights for the specified number of weeks.
 */
export async function getExerciseProgression(
    exerciseId: string,
    weeks: number = 12
): Promise<{ week: string; maxWeight: number }[]> {
    const database = await getDatabase();

    const rows = await database.getAllAsync<{
        week: string;
        maxWeight: number;
    }>(
        `SELECT strftime('%Y-%W', loggedAt) as week, MAX(weight) as maxWeight
         FROM logged_sets
         WHERE exerciseId = ?
           AND loggedAt >= datetime('now', '-${weeks * 7} days')
         GROUP BY week
         ORDER BY week ASC`,
        [exerciseId]
    );

    return rows;
}

/**
 * Get all workout sessions (for history view).
 */
export async function getAllWorkoutSessions(limit: number = 50): Promise<WorkoutSession[]> {
    const database = await getDatabase();

    const rows = await database.getAllAsync<{
        id: string;
        programId: string;
        workoutId: string;
        workoutName: string;
        startedAt: string;
        finishedAt: string;
        duration: number;
    }>(
        `SELECT * FROM workout_sessions ORDER BY finishedAt DESC LIMIT ?`,
        [limit]
    );

    return rows;
}
