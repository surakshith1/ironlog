/**
 * History Service
 * Provides dummy data for exercise history and stats.
 * In a real app, this would fetch from local storage or API.
 */

import { ExerciseLogEntry, ExerciseStats } from '../models/history';

/**
 * Generates dummy exercise history data.
 * Creates realistic-looking workout logs with progressive overload.
 */
export function getExerciseHistory(exerciseId: string): ExerciseLogEntry[] {
    // Generate consistent dummy data based on exercise ID
    const seed = exerciseId.charCodeAt(0) + (exerciseId.charCodeAt(1) || 0);
    const baseWeight = 100 + (seed % 150); // Base weight between 100-250

    // Create entries for the last several weeks
    const entries: ExerciseLogEntry[] = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
        const daysAgo = i * 3 + Math.floor(Math.random() * 2); // Every 3 days roughly
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);

        // Simulate progressive overload (weight goes up over time)
        const progressFactor = 1 - i * 0.02; // Older entries have slightly less weight
        const weight = Math.round(baseWeight * progressFactor);
        const reps = 4 + Math.floor(Math.random() * 5); // 4-8 reps

        // Calculate 1RM using Epley formula: weight × (1 + reps/30)
        const oneRepMax = Math.round(weight * (1 + reps / 30));

        entries.push({
            id: `${exerciseId}-${i}`,
            date: date.toISOString(),
            weight,
            reps,
            oneRepMax,
            isPR: i === 0, // Most recent entry is a PR
        });
    }

    return entries;
}

/**
 * Gets a limited number of recent history entries.
 */
export function getRecentHistory(
    exerciseId: string,
    limit: number = 5
): ExerciseLogEntry[] {
    return getExerciseHistory(exerciseId).slice(0, limit);
}

/**
 * Gets aggregated stats for an exercise.
 */
export function getExerciseStats(exerciseId: string): ExerciseStats {
    const history = getExerciseHistory(exerciseId);

    // Find personal best
    const personalBest = Math.max(...history.map((e) => e.weight));

    // Calculate total volume
    const totalVolume = history.reduce((sum, e) => sum + e.weight * e.reps, 0);

    return {
        personalBest,
        totalVolume,
        unit: 'lbs',
    };
}

/**
 * Formats total volume for display (e.g., 4200 -> "4.2k")
 */
export function formatVolume(volume: number): string {
    if (volume >= 1000) {
        return `${(volume / 1000).toFixed(1)}k`;
    }
    return volume.toString();
}
