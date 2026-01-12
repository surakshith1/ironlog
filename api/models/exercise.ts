/**
 * Exercise data models and TypeScript interfaces.
 * Based on the exercises.json schema.
 */

// Enum types for exercise properties
export type ExerciseForce = 'push' | 'pull' | 'static' | null;

export type ExerciseLevel = 'beginner' | 'intermediate' | 'expert';

export type ExerciseMechanic = 'compound' | 'isolation' | null;

export type ExerciseCategory =
    | 'strength'
    | 'stretching'
    | 'plyometrics'
    | 'strongman'
    | 'powerlifting'
    | 'cardio'
    | 'olympic weightlifting';

/**
 * Represents a single exercise from the exercise library.
 * Omits the `images` field as they are not used in v1.
 */
export interface Exercise {
    /** Unique identifier (e.g., '3_4_Sit-Up') */
    id: string;

    /** Display name of the exercise */
    name: string;

    /** Type of force generated */
    force: ExerciseForce;

    /** Difficulty level */
    level: ExerciseLevel;

    /** Compound (multiple joints) or isolation (single joint) */
    mechanic: ExerciseMechanic;

    /** Equipment required (e.g., 'body only', 'dumbbell') */
    equipment: string | null;

    /** Main muscles targeted */
    primaryMuscles: string[];

    /** Synergetic or stabilizing muscles */
    secondaryMuscles: string[];

    /** Step-by-step execution instructions */
    instructions: string[];

    /** Broad category of the exercise */
    category: ExerciseCategory;
}

/**
 * Filter options for searching exercises.
 */
export interface ExerciseFilters {
    /** Filter by muscle group (matches primaryMuscles) */
    muscle?: string | null;

    /** Filter by equipment type */
    equipment?: string | null;

    /** Filter by category */
    category?: ExerciseCategory | null;

    /** Filter by difficulty level */
    level?: ExerciseLevel | null;
}
