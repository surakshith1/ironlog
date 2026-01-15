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

// ============================================================================
// Dashboard Analytics Functions
// ============================================================================

/**
 * Chart data point for volume visualization.
 */
export interface VolumeDataPoint {
    label: string;
    value: number;
    isHighlighted?: boolean;
}

/**
 * Recent PR record for dashboard display.
 */
export interface RecentPRRecord {
    id: string;
    exerciseId: string;
    exerciseName: string;
    date: string;
    weight: number;
    reps: number;
    isPR: boolean;
}

/**
 * Calculate the current workout streak (consecutive days with workouts).
 * Returns 0 if no workouts or streak is broken.
 */
export async function getWorkoutStreak(): Promise<number> {
    const database = await getDatabase();

    // Get distinct workout dates, ordered most recent first
    const rows = await database.getAllAsync<{ workoutDate: string }>(
        `SELECT DISTINCT date(finishedAt) as workoutDate
         FROM workout_sessions
         ORDER BY workoutDate DESC`
    );

    if (rows.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check each date starting from today or yesterday
    let checkDate = new Date(today);

    // If no workout today, check if streak can start from yesterday
    const todayStr = checkDate.toISOString().split('T')[0];
    const hasWorkoutToday = rows.some(r => r.workoutDate === todayStr);

    if (!hasWorkoutToday) {
        // Check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayStr = checkDate.toISOString().split('T')[0];
        const hasWorkoutYesterday = rows.some(r => r.workoutDate === yesterdayStr);
        if (!hasWorkoutYesterday) {
            return 0; // Streak broken
        }
    }

    // Count consecutive days
    for (const row of rows) {
        const checkDateStr = checkDate.toISOString().split('T')[0];
        if (row.workoutDate === checkDateStr) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else if (row.workoutDate < checkDateStr) {
            // Gap found, streak ends
            break;
        }
    }

    return streak;
}

/**
 * Get volume data by day for the last N days (for weekly chart).
 * Returns data for each day with day-of-week labels.
 */
export async function getVolumeByDay(days: number = 7): Promise<VolumeDataPoint[]> {
    const database = await getDatabase();

    const rows = await database.getAllAsync<{
        dayDate: string;
        dayOfWeek: string;
        totalVolume: number;
    }>(
        `SELECT 
            date(loggedAt) as dayDate,
            strftime('%w', loggedAt) as dayOfWeek,
            SUM(volume) as totalVolume
         FROM logged_sets
         WHERE loggedAt >= datetime('now', '-${days} days')
         GROUP BY dayDate
         ORDER BY dayDate ASC`
    );

    // Create a map for all days in the period
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const result: VolumeDataPoint[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();

        const row = rows.find(r => r.dayDate === dateStr);
        result.push({
            label: dayLabels[dayOfWeek],
            value: row?.totalVolume || 0,
            isHighlighted: i === 0, // Today is highlighted
        });
    }

    return result;
}

/**
 * Get volume data by week for the last N weeks (for monthly chart).
 */
export async function getVolumeByWeek(weeks: number = 4): Promise<VolumeDataPoint[]> {
    const database = await getDatabase();

    const rows = await database.getAllAsync<{
        weekNum: string;
        totalVolume: number;
    }>(
        `SELECT 
            strftime('%Y-%W', loggedAt) as weekNum,
            SUM(volume) as totalVolume
         FROM logged_sets
         WHERE loggedAt >= datetime('now', '-${weeks * 7} days')
         GROUP BY weekNum
         ORDER BY weekNum ASC`
    );

    // Generate week labels
    const result: VolumeDataPoint[] = [];
    const today = new Date();

    for (let i = weeks - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i * 7);
        const weekNum = getISOWeek(date);
        const weekStr = `${date.getFullYear()}-${weekNum.toString().padStart(2, '0')}`;

        const row = rows.find(r => r.weekNum === weekStr);
        result.push({
            label: `W${weeks - i}`,
            value: row?.totalVolume || 0,
            isHighlighted: i === 0, // Current week is highlighted
        });
    }

    return result;
}

/**
 * Get ISO week number for a date.
 */
function getISOWeek(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Get volume data by month for the last N months (for yearly chart).
 */
export async function getVolumeByMonth(months: number = 12): Promise<VolumeDataPoint[]> {
    const database = await getDatabase();

    const rows = await database.getAllAsync<{
        monthStr: string;
        totalVolume: number;
    }>(
        `SELECT 
            strftime('%Y-%m', loggedAt) as monthStr,
            SUM(volume) as totalVolume
         FROM logged_sets
         WHERE loggedAt >= datetime('now', '-${months} months')
         GROUP BY monthStr
         ORDER BY monthStr ASC`
    );

    // Generate month labels
    const monthLabels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    const result: VolumeDataPoint[] = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

        const row = rows.find(r => r.monthStr === monthStr);
        result.push({
            label: monthLabels[date.getMonth()],
            value: row?.totalVolume || 0,
            isHighlighted: i === 0, // Current month is highlighted
        });
    }

    return result;
}

/**
 * Get recent personal records for dashboard display (max 5).
 */
export async function getRecentPRRecords(limit: number = 5): Promise<RecentPRRecord[]> {
    const database = await getDatabase();

    const rows = await database.getAllAsync<{
        id: string;
        exerciseId: string;
        loggedAt: string;
        weight: number;
        reps: number;
        isPR: number;
    }>(
        `SELECT id, exerciseId, loggedAt, weight, reps, isPR
         FROM logged_sets
         WHERE isPR = 1
         ORDER BY loggedAt DESC
         LIMIT ?`,
        [limit]
    );

    // Map exercise IDs to readable names (convert underscore to space, title case)
    return rows.map(row => ({
        id: row.id,
        exerciseId: row.exerciseId,
        exerciseName: row.exerciseId
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' '),
        date: formatDateShort(row.loggedAt),
        weight: row.weight,
        reps: row.reps,
        isPR: row.isPR === 1,
    }));
}

/**
 * Format an ISO date string to short display format (e.g., "Jan 15").
 */
function formatDateShort(isoDate: string): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const date = new Date(isoDate);
    return `${months[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Get total volume for a specific period and the previous period (for % change).
 */
export async function getVolumesWithChange(
    periodType: 'week' | 'month' | 'year'
): Promise<{ currentVolume: number; previousVolume: number; percentChange: number }> {
    const database = await getDatabase();

    let currentDays: number;
    let previousOffset: string;

    switch (periodType) {
        case 'week':
            currentDays = 7;
            previousOffset = '-14 days';
            break;
        case 'month':
            currentDays = 30;
            previousOffset = '-60 days';
            break;
        case 'year':
            currentDays = 365;
            previousOffset = '-730 days';
            break;
    }

    const currentResult = await database.getFirstAsync<{ total: number | null }>(
        `SELECT SUM(volume) as total
         FROM logged_sets
         WHERE loggedAt >= datetime('now', '-${currentDays} days')`
    );

    const previousResult = await database.getFirstAsync<{ total: number | null }>(
        `SELECT SUM(volume) as total
         FROM logged_sets
         WHERE loggedAt >= datetime('now', '${previousOffset}')
           AND loggedAt < datetime('now', '-${currentDays} days')`
    );

    const currentVolume = currentResult?.total || 0;
    const previousVolume = previousResult?.total || 0;

    let percentChange = 0;
    if (previousVolume > 0) {
        percentChange = Math.round(((currentVolume - previousVolume) / previousVolume) * 100);
    } else if (currentVolume > 0) {
        percentChange = 100; // 100% increase from nothing
    }

    return { currentVolume, previousVolume, percentChange };
}

