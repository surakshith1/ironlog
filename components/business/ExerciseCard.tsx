import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { ThemedText } from '../display/Typography';
import { SetRow, SetData } from './SetRow';

interface ExerciseCardProps {
    exerciseName: string;
    lastSession?: string; // e.g. "Last: 225lbs x 5"
    sets: SetData[];
    onSetChange: (setIndex: number, field: 'weight' | 'reps', value: string) => void;
    onToggleSetComplete: (setIndex: number) => void;
    onAddSet: () => void;
    onViewHistory: () => void;
    isEditable?: boolean;
}

export function ExerciseCard({
    exerciseName,
    lastSession,
    sets,
    onSetChange,
    onToggleSetComplete,
    onAddSet,
    onViewHistory,
    isEditable = true,
}: ExerciseCardProps) {
    return (
        <View style={styles.container}>
            {/* Header */}
            <TouchableOpacity onPress={onViewHistory} style={styles.header}>
                <View>
                    <ThemedText variant="h2">{exerciseName}</ThemedText>
                    {lastSession && (
                        <View style={styles.historyContainer}>
                            <Ionicons name="time-outline" size={14} color={theme.colors.textMuted} />
                            <ThemedText variant="caption" style={styles.historyText}>
                                {lastSession}
                            </ThemedText>
                        </View>
                    )}
                </View>

                <View style={styles.statsButton}>
                    <Ionicons name="bar-chart" size={18} color={theme.colors.primary} />
                </View>
            </TouchableOpacity>

            {/* Column Headers */}
            <View style={styles.columnHeaders}>
                <ThemedText variant="caption" style={[styles.headerText, styles.colSet]}>SET</ThemedText>
                <ThemedText variant="caption" style={[styles.headerText, styles.colInput]}>LBS</ThemedText>
                <ThemedText variant="caption" style={[styles.headerText, styles.colInput]}>REPS</ThemedText>
                <View style={styles.colCheck} />
            </View>

            {/* Set Rows */}
            <View style={styles.setsContainer}>
                {sets.map((set, index) => (
                    <SetRow
                        key={index}
                        data={set}
                        onChange={(field, value) => onSetChange(index, field, value)}
                        onToggleComplete={() => onToggleSetComplete(index)}
                        isEditable={isEditable}
                    />
                ))}
            </View>


            {/* Add Set Button */}
            {isEditable && (
                <TouchableOpacity onPress={onAddSet} style={styles.addSetButton}>
                    <Ionicons name="add" size={16} color={theme.colors.primary} />
                    <ThemedText style={styles.addSetText}>ADD SET</ThemedText>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 32,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    historyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    historyText: {
        color: theme.colors.textMuted,
    },
    statsButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Grid Headers
    columnHeaders: {
        flexDirection: 'row',
        marginBottom: 8,
        gap: 12,
        paddingHorizontal: 0,
    },
    headerText: {
        color: theme.colors.textMuted,
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    colSet: { flex: 0.3 },
    colInput: { flex: 1 },
    colCheck: { flex: 0.3 },

    setsContainer: {
        marginBottom: 8,
    },

    // Add Set
    addSetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 4,
    },
    addSetText: {
        color: theme.colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
