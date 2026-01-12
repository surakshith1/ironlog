import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { ThemedText } from '../display/Typography';

export interface SetData {
    setNumber: number;
    weight: string;
    reps: string;
    isCompleted: boolean;
}

interface SetRowProps {
    data: SetData;
    onChange: (field: 'weight' | 'reps', value: string) => void;
    onToggleComplete: () => void;
    isEditable?: boolean;
}

export function SetRow({ data, onChange, onToggleComplete, isEditable = true }: SetRowProps) {
    return (
        <View style={[styles.container, data.isCompleted && styles.completedContainer]}>
            {/* Set Number */}
            <View style={[styles.column, styles.setColumn]}>
                <View style={[styles.setBadge, data.isCompleted ? styles.setBadgeCompleted : styles.setBadgeActive]}>
                    <ThemedText style={[styles.setText, data.isCompleted && styles.setTextCompleted]}>
                        {data.setNumber}
                    </ThemedText>
                </View>
            </View>

            {/* Weight Input */}
            <View style={styles.column}>
                <TextInput
                    style={[styles.input, data.isCompleted && styles.inputCompleted]}
                    value={data.weight}
                    onChangeText={(val) => onChange('weight', val)}
                    placeholder="-"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="numeric"
                    editable={!data.isCompleted && isEditable}
                />
            </View>

            {/* Reps Input */}
            <View style={styles.column}>
                <TextInput
                    style={[styles.input, data.isCompleted && styles.inputCompleted]}
                    value={data.reps}
                    onChangeText={(val) => onChange('reps', val)}
                    placeholder="-"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="numeric"
                    editable={!data.isCompleted && isEditable}
                />
            </View>

            {/* Checkbox */}
            <View style={[styles.column, styles.checkColumn]}>
                <TouchableOpacity
                    style={[
                        styles.checkbox,
                        data.isCompleted ? styles.checkboxChecked : styles.checkboxUnchecked,
                        ((!data.weight || !data.reps) && !data.isCompleted) || !isEditable ? styles.checkboxDisabled : {}
                    ]}
                    onPress={onToggleComplete}
                    disabled={((!data.weight || !data.reps) && !data.isCompleted) || !isEditable}
                >
                    {data.isCompleted && (
                        <Ionicons name="checkmark" size={18} color={theme.colors.background} />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    completedContainer: {
        opacity: 0.6,
    },
    column: {
        flex: 1,
    },
    setColumn: {
        flex: 0.3, // Narrower
        alignItems: 'center',
    },
    checkColumn: {
        flex: 0.3, // Narrower
        alignItems: 'center',
    },

    // Set Badge
    setBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    setBadgeActive: {
        backgroundColor: theme.colors.surface,
    },
    setBadgeCompleted: {
        backgroundColor: theme.colors.primary + '30', // Transparent primary
    },
    setText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.colors.textSecondary,
    },
    setTextCompleted: {
        color: theme.colors.primary,
    },

    // Inputs
    input: {
        height: 44,
        backgroundColor: theme.colors.surface, // Surface grey
        borderRadius: 8,
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: 16,
        fontFamily: theme.text.mono.fontFamily, // Monospace preferred for numbers
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputCompleted: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.text, // Keep text white/primary for readability
        fontWeight: 'bold',
    },

    // Checkbox
    checkbox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxUnchecked: {
        backgroundColor: theme.colors.surface,
    },
    checkboxChecked: {
        backgroundColor: theme.colors.success, // Use success green for completion
    },
    checkboxDisabled: {
        opacity: 0.3,
    },
});
