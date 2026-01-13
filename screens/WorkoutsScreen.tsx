import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';
import { ThemedText } from '../components/display/Typography';
import { ProgramCard } from '../components/business/ProgramCard';
import { useWorkoutStore } from '../store/workoutStore';
import { useProgramStore } from '../store/programStore';
import { useNavigation } from '@react-navigation/native';

export function WorkoutsScreen() {
    const navigation = useNavigation<any>();

    // Global State
    const activeProgramId = useWorkoutStore((state) => state.activeProgramId);
    const getProgram = useProgramStore((state) => state.getProgram);

    // Find the active program from the store
    const activeProgram = activeProgramId ? getProgram(activeProgramId) : undefined;

    // Handler for clicking the active program card
    const handleProgramPress = () => {
        navigation.navigate('CurrentWorkout');
    };

    /**
     * Map program data to the format expected by ProgramCard.
     */
    const mapProgramToCardData = (program: typeof activeProgram) => {
        if (!program) return null;
        return {
            id: program.id,
            name: program.name,
            schedule: `${program.workouts.length} Workout${program.workouts.length !== 1 ? 's' : ''}`,
            focus: program.workouts[0]?.type || 'General',
            lastEdited: formatRelativeDate(program.importedAt),
        };
    };

    /**
     * Format a timestamp to a relative date string.
     */
    const formatRelativeDate = (timestamp: number): string => {
        const now = Date.now();
        const diff = now - timestamp;

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return `${Math.floor(days / 30)} months ago`;
    };

    // No active program state
    if (!activeProgramId || !activeProgram) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ThemedText variant="h2" style={styles.noActiveTitle}>
                    No Active Program
                </ThemedText>
                <ThemedText variant="body" style={styles.noActiveSubtitle}>
                    Go to the Programs tab to select a workout routine.
                </ThemedText>
            </View>
        );
    }

    const cardData = mapProgramToCardData(activeProgram);
    if (!cardData) return null;

    // Active program exists - show the program card
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <ThemedText variant="body" style={styles.sectionLabel}>
                    Current Program
                </ThemedText>

                <TouchableOpacity
                    onPress={handleProgramPress}
                    activeOpacity={0.8}
                >
                    <ProgramCard
                        program={cardData}
                        isActive={true}
                        onSetActive={() => { }}
                        onDelete={() => { }}
                        onOptions={() => { }}
                    />
                </TouchableOpacity>

                <ThemedText variant="caption" style={styles.tapHint}>
                    Tap to start your workout
                </ThemedText>
            </View>
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
    content: {
        padding: 16,
    },
    sectionLabel: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    noActiveTitle: {
        textAlign: 'center',
        marginBottom: 8,
    },
    noActiveSubtitle: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
    },
    tapHint: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: 16,
        fontSize: 13,
    },
});
