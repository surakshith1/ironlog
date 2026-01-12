import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../constants/theme';

interface StatCardProps {
    /** Label describing the stat */
    label: string;
    /** The value to display */
    value: string | number;
    /** Unit suffix (e.g., 'lbs', 'kg') */
    unit?: string;
    /** Whether to highlight the unit with primary color */
    highlight?: boolean;
    /** Optional custom style */
    style?: ViewStyle;
}

/**
 * Small stat display card showing a label and value with optional unit.
 * Used for Personal Best, Total Volume, etc.
 */
export function StatCard({
    label,
    value,
    unit,
    highlight = false,
    style,
}: StatCardProps) {
    return (
        <View style={[styles.container, style]}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.valueRow}>
                <Text style={styles.value}>{value}</Text>
                {unit && (
                    <Text
                        style={[
                            styles.unit,
                            highlight && styles.unitHighlight,
                        ]}
                    >
                        {unit}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.medium,
        height: 96,
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 12,
        color: theme.colors.textMuted,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    value: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.text,
        fontFamily: theme.text.mono.fontFamily,
    },
    unit: {
        fontSize: 12,
        color: theme.colors.textMuted,
        fontFamily: theme.text.mono.fontFamily,
    },
    unitHighlight: {
        color: theme.colors.primary,
    },
});
