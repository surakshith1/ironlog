/**
 * Exercise Service
 * Provides data access methods for the static exercise library.
 */

import { Exercise, ExerciseFilters } from '../models/exercise';
import exercisesData from '../../constants/exercises.json';

// Type assertion for the imported JSON data
const exercises: Exercise[] = exercisesData as Exercise[];

/**
 * Get all exercises from the library.
 */
export function getAllExercises(): Exercise[] {
    return exercises;
}

/**
 * Get a single exercise by ID.
 */
export function getExerciseById(id: string): Exercise | undefined {
    return exercises.find((exercise) => exercise.id === id);
}

/**
 * Search and filter exercises.
 * @param query - Text search query (searches name)
 * @param filters - Optional filters for muscle, equipment, etc.
 */
export function searchExercises(
    query: string = '',
    filters: ExerciseFilters = {}
): Exercise[] {
    const normalizedQuery = query.toLowerCase().trim();

    return exercises.filter((exercise) => {
        // Text search on exercise name
        if (normalizedQuery && !exercise.name.toLowerCase().includes(normalizedQuery)) {
            return false;
        }

        // Filter by muscle group
        if (filters.muscle && filters.muscle !== 'all') {
            const hasMuscle = exercise.primaryMuscles.some(
                (m) => m.toLowerCase() === filters.muscle?.toLowerCase()
            );
            if (!hasMuscle) return false;
        }

        // Filter by equipment
        if (filters.equipment) {
            if (exercise.equipment?.toLowerCase() !== filters.equipment.toLowerCase()) {
                return false;
            }
        }

        // Filter by category
        if (filters.category) {
            if (exercise.category !== filters.category) {
                return false;
            }
        }

        // Filter by level
        if (filters.level) {
            if (exercise.level !== filters.level) {
                return false;
            }
        }

        return true;
    });
}

/**
 * Get unique muscle groups from all exercises.
 * Sorted alphabetically for consistent display.
 */
export function getUniqueMuscles(): string[] {
    const muscleSet = new Set<string>();

    exercises.forEach((exercise) => {
        exercise.primaryMuscles.forEach((muscle) => {
            muscleSet.add(muscle.toLowerCase());
        });
    });

    return Array.from(muscleSet).sort();
}

/**
 * Get unique equipment types from all exercises.
 * Filters out null values. Sorted alphabetically.
 */
export function getUniqueEquipment(): string[] {
    const equipmentSet = new Set<string>();

    exercises.forEach((exercise) => {
        if (exercise.equipment) {
            equipmentSet.add(exercise.equipment.toLowerCase());
        }
    });

    return Array.from(equipmentSet).sort();
}

/**
 * Get unique categories from all exercises.
 */
export function getUniqueCategories(): string[] {
    const categorySet = new Set<string>();

    exercises.forEach((exercise) => {
        categorySet.add(exercise.category);
    });

    return Array.from(categorySet).sort();
}

/**
 * Get the total count of exercises.
 */
export function getExerciseCount(): number {
    return exercises.length;
}
