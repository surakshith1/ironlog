import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';
import { ThemedText } from '../components/display/Typography';
import { ProgramCard } from '../components/business/ProgramCard';
import { useWorkoutStore } from '../store/workoutStore';
import { useNavigation } from '@react-navigation/native';
import { PROGRAMS } from '../constants/dummyData';

export function WorkoutsScreen() {
    const navigation = useNavigation<any>();

    // Global State
    const activeProgramId = useWorkoutStore((state) => state.activeProgramId);

    // Find the active program from the list
    const activeProgram = PROGRAMS.find((p) => p.id === activeProgramId);

    // Handler for clicking the active program card
    const handleProgramPress = () => {
        navigation.navigate('CurrentWorkout');
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
                        program={activeProgram}
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
