import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { ThemedText } from '../components/display/Typography';
import { WorkoutHeader } from '../components/display/WorkoutHeader';
import { ExerciseCard } from '../components/business/ExerciseCard';
import { SetRow, SetData } from '../components/business/SetRow';
import { useWorkoutStore } from '../store/workoutStore';

// --- Dummy Data Types ---
interface Exercise {
    id: string;
    name: string;
    lastSession: string;
    sets: SetData[];
}

interface Workout {
    id: string;
    name: string;
    exercises: Exercise[];
}

const INITIAL_WORKOUT: Workout = {
    id: '1',
    name: 'Push A',
    exercises: [
        {
            id: 'e1',
            name: 'Barbell Bench Press',
            lastSession: 'Last: 225lbs x 5',
            sets: [
                { setNumber: 1, weight: '225', reps: '5', isCompleted: false },
                { setNumber: 2, weight: '225', reps: '', isCompleted: false },
                { setNumber: 3, weight: '', reps: '', isCompleted: false }
            ]
        },
        {
            id: 'e2',
            name: 'Incline Dumbbell Press',
            lastSession: 'Last: 80lbs x 10',
            sets: [
                { setNumber: 1, weight: '80', reps: '', isCompleted: false },
                { setNumber: 2, weight: '80', reps: '', isCompleted: false }
            ]
        }
    ]
};

export function WorkoutsScreen() {
    const insets = useSafeAreaInsets();

    // Global State
    const activeProgramId = useWorkoutStore((state) => state.activeProgramId);
    const isWorkoutStarted = useWorkoutStore(state => state.isWorkoutStarted);
    const startTimeHook = useWorkoutStore(state => state.startTime);
    const startWorkout = useWorkoutStore(state => state.startWorkout);
    const finishWorkout = useWorkoutStore(state => state.finishWorkout);

    // Local State
    const [workout, setWorkout] = useState<Workout>(INITIAL_WORKOUT);

    // Handlers
    const handleStartWorkout = () => {
        startWorkout();
    };

    const handleFinishWorkout = () => {
        Alert.alert(
            "Finish Workout",
            "Are you sure you want to finish this workout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Finish",
                    onPress: () => {
                        finishWorkout();
                    }
                }
            ]
        );
    };

    if (!activeProgramId) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
                <ThemedText variant="h2" style={{ textAlign: 'center', marginBottom: 8 }}>No Active Program</ThemedText>
                <ThemedText variant="body" style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
                    Go to the Programs tab to select a workout routine.
                </ThemedText>
            </View>
        );
    }

    const handleSetChange = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
        const newExercises = [...workout.exercises];
        const exercise = newExercises[exerciseIndex];
        const newSets = [...exercise.sets];
        newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        exercise.sets = newSets;
        setWorkout({ ...workout, exercises: newExercises });
    };

    const handleToggleSetComplete = (exerciseIndex: number, setIndex: number) => {
        const newExercises = [...workout.exercises];
        const exercise = newExercises[exerciseIndex];
        const newSets = [...exercise.sets];
        newSets[setIndex] = {
            ...newSets[setIndex],
            isCompleted: !newSets[setIndex].isCompleted
        };
        exercise.sets = newSets;
        setWorkout({ ...workout, exercises: newExercises });
    };

    const handleAddSet = (exerciseIndex: number) => {
        const newExercises = [...workout.exercises];
        const exercise = newExercises[exerciseIndex];
        const lastSet = exercise.sets[exercise.sets.length - 1];

        exercise.sets.push({
            setNumber: exercise.sets.length + 1,
            weight: lastSet ? lastSet.weight : '', // Copy previous weight
            reps: '',
            isCompleted: false
        });

        setWorkout({ ...workout, exercises: newExercises });
    };

    return (
        <View style={styles.container}>
            <WorkoutHeader
                title={workout.name}
                startTime={startTimeHook}
                onBack={() => { }}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: insets.bottom + 100 } // Space for footer
                    ]}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Routine Tabs */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
                        <TouchableOpacity style={[styles.activeTab, isWorkoutStarted && { opacity: 0.7 }]} disabled={isWorkoutStarted}>
                            <ThemedText style={styles.activeTabText}>Push A</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.inactiveTab, isWorkoutStarted && { opacity: 0.5 }]} disabled={isWorkoutStarted}>
                            <ThemedText style={styles.inactiveTabText}>Pull B</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.inactiveTab, isWorkoutStarted && { opacity: 0.5 }]} disabled={isWorkoutStarted}>
                            <ThemedText style={styles.inactiveTabText}>Legs</ThemedText>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Exercises */}
                    {workout.exercises.map((exercise, index) => (
                        <ExerciseCard
                            key={exercise.id}
                            exerciseName={exercise.name}
                            lastSession={exercise.lastSession}
                            sets={exercise.sets}
                            onSetChange={(sIndex, field, val) => handleSetChange(index, sIndex, field, val)}
                            onToggleSetComplete={(sIndex) => handleToggleSetComplete(index, sIndex)}
                            onAddSet={() => handleAddSet(index)}
                            onViewHistory={() => Alert.alert('Exercise History', 'Coming soon!')}
                            isEditable={isWorkoutStarted}
                        />
                    ))}

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Fixed Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                {!isWorkoutStarted ? (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.startButton]}
                        onPress={handleStartWorkout}
                    >
                        <ThemedText style={styles.startButtonText}>Start Workout</ThemedText>
                        <Ionicons name="play" size={24} color="white" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.finishButton]}
                        onPress={handleFinishWorkout}
                    >
                        <ThemedText style={styles.finishButtonText}>Finish Workout</ThemedText>
                        <Ionicons name="checkmark-circle-outline" size={24} color="black" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: theme.spacing.medium,
    },

    // Tabs
    tabsContainer: {
        marginBottom: 24,
        maxHeight: 40,
    },
    activeTab: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 12,
    },
    inactiveTab: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 12,
    },
    activeTabText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    inactiveTabText: {
        color: theme.colors.textSecondary,
        fontWeight: '600',
        fontSize: 14,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 16,
        paddingHorizontal: theme.spacing.medium,
        backgroundColor: theme.colors.background, // or transparent with blur if possible
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    actionButton: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    startButton: {
        backgroundColor: theme.colors.primary,
    },
    finishButton: {
        backgroundColor: 'white',
    },
    startButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    finishButtonText: {
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
