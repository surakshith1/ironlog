/**
 * Exercise Database Service
 * SQLite-based storage for faster exercise search and filtering.
 * Uses expo-sqlite for database operations.
 */

import * as SQLite from 'expo-sqlite';
import { Exercise, ExerciseFilters } from '../models/exercise';
import exercisesData from '../../constants/exercises.json';

// Database name
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
 * Initialize the exercises table and populate with data if needed.
 * Should be called once at app startup.
 */
export async function initializeExerciseDatabase(): Promise<void> {
    const database = await getDatabase();

    // Create exercises table if not exists
    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS exercises (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            force TEXT,
            level TEXT NOT NULL,
            mechanic TEXT,
            equipment TEXT,
            primaryMuscles TEXT NOT NULL,
            secondaryMuscles TEXT,
            instructions TEXT,
            category TEXT NOT NULL
        );
        
        CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name COLLATE NOCASE);
        CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
        CREATE INDEX IF NOT EXISTS idx_exercises_level ON exercises(level);
    `);

    // Check if data is already populated
    const result = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM exercises');

    if (result && result.count === 0) {
        // Populate with exercises from JSON
        await populateExercises(database);
    }
}

/**
 * Populate the database with exercises from the JSON file.
 */
async function populateExercises(database: SQLite.SQLiteDatabase): Promise<void> {
    const exercises = exercisesData as Exercise[];

    // Use a transaction for bulk insert
    await database.withTransactionAsync(async () => {
        for (const exercise of exercises) {
            await database.runAsync(
                `INSERT OR REPLACE INTO exercises 
                (id, name, force, level, mechanic, equipment, primaryMuscles, secondaryMuscles, instructions, category)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    exercise.id,
                    exercise.name,
                    exercise.force || null,
                    exercise.level,
                    exercise.mechanic || null,
                    exercise.equipment || null,
                    JSON.stringify(exercise.primaryMuscles),
                    JSON.stringify(exercise.secondaryMuscles),
                    JSON.stringify(exercise.instructions),
                    exercise.category
                ]
            );
        }
    });
}

/**
 * Search exercises using SQLite with indexed queries.
 * Much faster for large datasets.
 */
export async function searchExercisesDb(
    query: string = '',
    filters: ExerciseFilters = {}
): Promise<Exercise[]> {
    const database = await getDatabase();

    let sql = 'SELECT * FROM exercises WHERE 1=1';
    const params: (string | null)[] = [];

    // Text search on name
    if (query.trim()) {
        sql += ' AND name LIKE ?';
        params.push(`%${query.trim()}%`);
    }

    // Filter by muscle group (stored as JSON array)
    if (filters.muscle && filters.muscle !== 'all') {
        sql += ' AND LOWER(primaryMuscles) LIKE ?';
        params.push(`%"${filters.muscle.toLowerCase()}"%`);
    }

    // Filter by equipment
    if (filters.equipment) {
        sql += ' AND LOWER(equipment) = ?';
        params.push(filters.equipment.toLowerCase());
    }

    // Filter by category
    if (filters.category) {
        sql += ' AND category = ?';
        params.push(filters.category);
    }

    // Filter by level
    if (filters.level) {
        sql += ' AND level = ?';
        params.push(filters.level);
    }

    sql += ' ORDER BY name COLLATE NOCASE ASC LIMIT 100';

    const rows = await database.getAllAsync<{
        id: string;
        name: string;
        force: string | null;
        level: string;
        mechanic: string | null;
        equipment: string | null;
        primaryMuscles: string;
        secondaryMuscles: string;
        instructions: string;
        category: string;
    }>(sql, params);

    // Convert rows back to Exercise objects
    return rows.map(row => ({
        id: row.id,
        name: row.name,
        force: row.force as Exercise['force'],
        level: row.level as Exercise['level'],
        mechanic: row.mechanic as Exercise['mechanic'],
        equipment: row.equipment,
        primaryMuscles: JSON.parse(row.primaryMuscles),
        secondaryMuscles: JSON.parse(row.secondaryMuscles),
        instructions: JSON.parse(row.instructions),
        category: row.category as Exercise['category']
    }));
}

/**
 * Get a single exercise by ID from SQLite.
 */
export async function getExerciseByIdDb(id: string): Promise<Exercise | null> {
    const database = await getDatabase();

    const row = await database.getFirstAsync<{
        id: string;
        name: string;
        force: string | null;
        level: string;
        mechanic: string | null;
        equipment: string | null;
        primaryMuscles: string;
        secondaryMuscles: string;
        instructions: string;
        category: string;
    }>('SELECT * FROM exercises WHERE id = ?', [id]);

    if (!row) return null;

    return {
        id: row.id,
        name: row.name,
        force: row.force as Exercise['force'],
        level: row.level as Exercise['level'],
        mechanic: row.mechanic as Exercise['mechanic'],
        equipment: row.equipment,
        primaryMuscles: JSON.parse(row.primaryMuscles),
        secondaryMuscles: JSON.parse(row.secondaryMuscles),
        instructions: JSON.parse(row.instructions),
        category: row.category as Exercise['category']
    };
}

/**
 * Get all unique muscle groups from the database.
 */
export async function getUniqueMusclesDb(): Promise<string[]> {
    const database = await getDatabase();

    const rows = await database.getAllAsync<{ primaryMuscles: string }>('SELECT DISTINCT primaryMuscles FROM exercises');

    const muscleSet = new Set<string>();
    rows.forEach(row => {
        const muscles: string[] = JSON.parse(row.primaryMuscles);
        muscles.forEach(m => muscleSet.add(m.toLowerCase()));
    });

    return Array.from(muscleSet).sort();
}

/**
 * Get the total count of exercises in the database.
 */
export async function getExerciseCountDb(): Promise<number> {
    const database = await getDatabase();
    const result = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM exercises');
    return result?.count ?? 0;
}
