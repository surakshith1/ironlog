import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { ThemedText } from '../components/display/Typography';
import { WorkoutHeader } from '../components/display/WorkoutHeader';
import { ExerciseCard } from '../components/business/ExerciseCard';
import { ExerciseDetailModal } from '../components/display/ExerciseDetailModal';
import { ExerciseHistoryModal } from '../components/display/ExerciseHistoryModal';
import { SetData } from '../components/business/SetRow';
import { useWorkoutStore } from '../store/workoutStore';
import { useProgramStore } from '../store/programStore';
import { useExerciseLogStore } from '../store/exerciseLogStore';
import { useNavigation } from '@react-navigation/native';
import { getExerciseById } from '../api/services/exerciseService';
import { getExerciseHistoryAsync, getExerciseStatsAsync } from '../api/services/historyService';
import { Exercise } from '../api/models/exercise';
import { ExerciseLogEntry, ExerciseStats } from '../api/models/history';
import { ProgramExercise, Workout as ProgramWorkout } from '../api/models/program';
import { SetLogInput } from '../api/models/exerciseLog';
import { hasExerciseHistory } from '../api/services/exerciseLogDatabase';

// --- Workout Data Types ---
interface WorkoutExercise {
    id: string; // Links to exercise library
    name: string;
    lastSession: string;
    sets: SetData[];
}

interface LocalWorkoutState {
    [workoutId: string]: WorkoutExercise[];
}

// Helper to create fresh sets from ProgramExercise data
const createSetsFromProgram = (programExercise: ProgramExercise): SetData[] => {
    const sets: SetData[] = [];
    for (let i = 0; i < programExercise.sets; i++) {
        sets.push({
            setNumber: i + 1,
            weight: programExercise.targetWeight !== 'Bodyweight' ? '' : 'BW',
            reps: '',
            isCompleted: false
        });
    }
    return sets;
};

// Helper to reset all sets to uncompleted
const resetSets = (exercises: WorkoutExercise[]): WorkoutExercise[] => {
    return exercises.map(exercise => ({
        ...exercise,
        sets: exercise.sets.map(set => ({
            ...set,
            isCompleted: false
        }))
    }));
};

// Transform program exercises to local workout exercise state
const transformProgramExercises = (programExercises: ProgramExercise[]): WorkoutExercise[] => {
    return programExercises.map(pe => ({
        id: pe.exerciseId,
        name: pe.name || pe.exerciseId.replace(/_/g, ' '),
        lastSession: pe.reps ? `Target: ${pe.reps} reps @ ${pe.targetWeight}` : `Target: ${pe.targetWeight}`,
        sets: createSetsFromProgram(pe)
    }));
};

export function CurrentWorkoutScreen({ route }: { route?: { params?: { programId?: string } } }) {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    // Get programId from route params (passed during navigation)
    const routeProgramId = route?.params?.programId;

    // Global State - Workout Store
    const activeProgramId = useWorkoutStore(state => state.activeProgramId);
    const previewProgramId = useWorkoutStore(state => state.previewProgramId);
    const activeWorkoutId = useWorkoutStore(state => state.activeWorkoutId);
    const setActiveWorkout = useWorkoutStore(state => state.setActiveWorkout);
    const isWorkoutStarted = useWorkoutStore(state => state.isWorkoutStarted);
    const startTimeHook = useWorkoutStore(state => state.startTime);
    const startWorkout = useWorkoutStore(state => state.startWorkout);
    const finishWorkout = useWorkoutStore(state => state.finishWorkout);
    const getWorkoutIndex = useWorkoutStore(state => state.getWorkoutIndex);
    const setWorkoutIndex = useWorkoutStore(state => state.setWorkoutIndex);

    // Global State - Program Store
    const getProgram = useProgramStore(state => state.getProgram);

    // Determine which program to display: route param > preview > active
    const displayProgramId = routeProgramId || previewProgramId || activeProgramId;
    const displayProgram = displayProgramId ? getProgram(displayProgramId) : undefined;

    // Check if viewing the currently active program (matches activeProgramId)
    const isActiveProgram = displayProgramId === activeProgramId;

    // Get current workout index for this program (for rotation)
    const currentWorkoutIndex = displayProgramId ? getWorkoutIndex(displayProgramId) : 0;

    // Create rotated workout list: current workout first, then others in order
    const rotatedWorkouts = useMemo(() => {
        if (!displayProgram) return [];
        const workouts = displayProgram.workouts;
        if (workouts.length <= 1) return workouts;

        // Rotate array so currentWorkoutIndex is first
        const validIndex = currentWorkoutIndex % workouts.length;
        return [
            ...workouts.slice(validIndex),
            ...workouts.slice(0, validIndex),
        ];
    }, [displayProgram, currentWorkoutIndex]);

    // Local State - Tracks exercise data per workout
    const [workoutStates, setWorkoutStates] = useState<LocalWorkoutState>({});

    // Get current selected workout (first in rotated list, or use activeWorkoutId if set)
    const selectedWorkout = useMemo(() => {
        if (!displayProgram || rotatedWorkouts.length === 0) return undefined;
        if (activeWorkoutId) {
            const found = rotatedWorkouts.find((w: { id: string }) => w.id === activeWorkoutId);
            // If the activeWorkoutId doesn't match any workout in this program, fall back to first in rotated list
            if (found) return found;
        }
        // Default to first workout in rotated list (the "current" workout)
        return rotatedWorkouts[0];
    }, [displayProgram, rotatedWorkouts, activeWorkoutId]);

    // Initialize exercise state when workout changes
    useEffect(() => {
        if (selectedWorkout && !workoutStates[selectedWorkout.id]) {
            setWorkoutStates(prev => ({
                ...prev,
                [selectedWorkout.id]: transformProgramExercises(selectedWorkout.exercises)
            }));
        }
    }, [selectedWorkout]);

    // Get current exercises for selected workout
    const currentExercises = useMemo(() => {
        if (!selectedWorkout) return [];
        return workoutStates[selectedWorkout.id] || transformProgramExercises(selectedWorkout.exercises);
    }, [selectedWorkout, workoutStates]);

    // Modal state for exercise details
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    // History data for the full history modal (async)
    const [historyEntries, setHistoryEntries] = useState<ExerciseLogEntry[]>([]);
    const [stats, setStats] = useState<ExerciseStats>({ personalBest: 0, totalVolume: 0, unit: 'lbs' });

    // Load full history when opening full history modal
    const loadFullHistory = useCallback(async (exerciseId: string) => {
        try {
            const hasHistory = await hasExerciseHistory(exerciseId);
            if (hasHistory) {
                const [history, exerciseStats] = await Promise.all([
                    getExerciseHistoryAsync(exerciseId),
                    getExerciseStatsAsync(exerciseId),
                ]);
                setHistoryEntries(history);
                setStats(exerciseStats);
            } else {
                setHistoryEntries([]);
                setStats({ personalBest: 0, totalVolume: 0, unit: 'lbs' });
            }
        } catch (error) {
            console.error('Error loading history:', error);
            setHistoryEntries([]);
        }
    }, []);

    // Handlers
    const handleStartWorkout = () => {
        // Reset all sets to uncompleted (fresh start)
        if (selectedWorkout) {
            setWorkoutStates(prev => ({
                ...prev,
                [selectedWorkout.id]: resetSets(currentExercises)
            }));
        }
        startWorkout();
    };

    // Exercise Log Store
    const logCompletedWorkout = useExerciseLogStore(state => state.logCompletedWorkout);
    const isLogging = useExerciseLogStore(state => state.isLogging);

    const handleFinishWorkout = () => {
        Alert.alert(
            "Finish Workout",
            "Are you sure you want to finish this workout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Finish",
                    onPress: async () => {
                        // Collect all completed sets from current exercises
                        const setsToLog: SetLogInput[] = [];

                        currentExercises.forEach(exercise => {
                            exercise.sets.forEach(set => {
                                if (set.isCompleted) {
                                    const weight = parseFloat(set.weight) || 0;
                                    const reps = parseInt(set.reps, 10) || 0;

                                    if (weight > 0 && reps > 0) {
                                        setsToLog.push({
                                            exerciseId: exercise.id,
                                            setNumber: set.setNumber,
                                            weight,
                                            reps,
                                        });
                                    }
                                }
                            });
                        });

                        // Log the workout if there are completed sets
                        if (setsToLog.length > 0 && displayProgramId && selectedWorkout && startTimeHook) {
                            const success = await logCompletedWorkout({
                                programId: displayProgramId,
                                workoutId: selectedWorkout.id,
                                workoutName: selectedWorkout.name,
                                startedAt: startTimeHook,
                                sets: setsToLog,
                            });

                            if (!success) {
                                Alert.alert('Warning', 'Workout data may not have been saved properly.');
                            }
                        }

                        finishWorkout(displayProgram?.workouts.length);
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    const handleSetChange = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
        if (!selectedWorkout) return;

        const newExercises = [...currentExercises];
        const exercise = { ...newExercises[exerciseIndex] };
        const newSets = [...exercise.sets];
        newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        exercise.sets = newSets;
        newExercises[exerciseIndex] = exercise;

        setWorkoutStates(prev => ({
            ...prev,
            [selectedWorkout.id]: newExercises
        }));
    };

    const handleToggleSetComplete = (exerciseIndex: number, setIndex: number) => {
        if (!selectedWorkout) return;

        const newExercises = [...currentExercises];
        const exercise = { ...newExercises[exerciseIndex] };
        const newSets = [...exercise.sets];
        newSets[setIndex] = {
            ...newSets[setIndex],
            isCompleted: !newSets[setIndex].isCompleted
        };
        exercise.sets = newSets;
        newExercises[exerciseIndex] = exercise;

        setWorkoutStates(prev => ({
            ...prev,
            [selectedWorkout.id]: newExercises
        }));
    };

    const handleAddSet = (exerciseIndex: number) => {
        if (!selectedWorkout) return;

        const newExercises = [...currentExercises];
        const exercise = { ...newExercises[exerciseIndex] };
        const lastSet = exercise.sets[exercise.sets.length - 1];

        exercise.sets = [...exercise.sets, {
            setNumber: exercise.sets.length + 1,
            weight: lastSet ? lastSet.weight : '', // Copy previous weight
            reps: '',
            isCompleted: false
        }];
        newExercises[exerciseIndex] = exercise;

        setWorkoutStates(prev => ({
            ...prev,
            [selectedWorkout.id]: newExercises
        }));
    };

    // Handle tab selection
    const handleWorkoutTabPress = (workoutId: string) => {
        if (!isWorkoutStarted) {
            setActiveWorkout(workoutId);
        }
    };

    // Handle clicking on exercise name/chart button to view details
    const handleViewExerciseHistory = useCallback((exerciseId: string) => {
        const exercise = getExerciseById(exerciseId);
        if (exercise) {
            setSelectedExercise(exercise);
            setShowDetailModal(true);
        } else {
            Alert.alert('Exercise Details', 'Exercise details not found.');
        }
    }, []);

    // Handle closing detail modal
    const handleCloseDetailModal = useCallback(() => {
        setShowDetailModal(false);
    }, []);

    // Handle "View Full History" button
    const handleViewFullHistory = useCallback(() => {
        setShowDetailModal(false);
        if (selectedExercise) {
            loadFullHistory(selectedExercise.id);
        }
        setTimeout(() => {
            setShowHistoryModal(true);
        }, 400);
    }, [selectedExercise, loadFullHistory]);

    // Handle closing history modal
    const handleCloseHistoryModal = useCallback(() => {
        setShowHistoryModal(false);
        setTimeout(() => {
            setShowDetailModal(true);
        }, 400);
    }, []);

    // Early return if no program to display
    if (!displayProgram || !selectedWorkout) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ThemedText variant="h2" style={styles.noActiveTitle}>
                    No Program Found
                </ThemedText>
                <ThemedText variant="body" style={styles.noActiveSubtitle}>
                    Go back and select a program to view.
                </ThemedText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <WorkoutHeader
                title={selectedWorkout.name}
                startTime={startTimeHook}
                onBack={() => navigation.goBack()}
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
                    {/* Routine Tabs - Dynamic from program workouts (rotated order) */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
                        {rotatedWorkouts.map((workout: { id: string; name: string }) => {
                            const isActive = workout.id === selectedWorkout.id;
                            return (
                                <TouchableOpacity
                                    key={workout.id}
                                    style={[
                                        isActive ? styles.activeTab : styles.inactiveTab,
                                        isWorkoutStarted && { opacity: isActive ? 0.7 : 0.5 }
                                    ]}
                                    disabled={isWorkoutStarted}
                                    onPress={() => handleWorkoutTabPress(workout.id)}
                                >
                                    <ThemedText style={isActive ? styles.activeTabText : styles.inactiveTabText}>
                                        {workout.name}
                                    </ThemedText>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Exercises - Dynamic from selected workout */}
                    {currentExercises.map((exercise: WorkoutExercise, index: number) => (
                        <ExerciseCard
                            key={exercise.id}
                            exerciseName={exercise.name}
                            lastSession={exercise.lastSession}
                            sets={exercise.sets}
                            onSetChange={(sIndex, field, val) => handleSetChange(index, sIndex, field, val)}
                            onToggleSetComplete={(sIndex) => handleToggleSetComplete(index, sIndex)}
                            onAddSet={() => handleAddSet(index)}
                            onViewHistory={() => handleViewExerciseHistory(exercise.id)}
                            isEditable={isWorkoutStarted}
                        />
                    ))}

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Fixed Footer - Only show for active program */}
            {isActiveProgram && (
                <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                    {!isWorkoutStarted ? (
                        // Active program, not started: Show "Start Workout" button
                        <TouchableOpacity
                            style={[styles.actionButton, styles.startButton]}
                            onPress={handleStartWorkout}
                        >
                            <ThemedText style={styles.startButtonText}>Start Workout</ThemedText>
                            <Ionicons name="play" size={24} color="white" />
                        </TouchableOpacity>
                    ) : (
                        // Active program, workout started: Show "Finish Workout" button
                        <TouchableOpacity
                            style={[styles.actionButton, styles.finishButton]}
                            onPress={handleFinishWorkout}
                        >
                            <ThemedText style={styles.finishButtonText}>Finish Workout</ThemedText>
                            <Ionicons name="checkmark-circle-outline" size={24} color="black" />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Exercise Detail Modal */}
            <ExerciseDetailModal
                visible={showDetailModal}
                exercise={selectedExercise}
                onClose={handleCloseDetailModal}
                onViewFullHistory={handleViewFullHistory}
            />

            {/* Exercise History Modal */}
            <ExerciseHistoryModal
                visible={showHistoryModal}
                exerciseName={selectedExercise?.name || ''}
                entries={historyEntries}
                unit={stats.unit}
                onClose={handleCloseHistoryModal}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    noActiveTitle: {
        textAlign: 'center',
        marginBottom: 8,
    },
    noActiveSubtitle: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
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
        backgroundColor: theme.colors.background,
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
