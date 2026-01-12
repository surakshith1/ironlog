import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../constants/theme';

interface FilterChipProps {
    /** Label text for the chip */
    label: string;
    /** Whether the chip is currently active/selected */
    isActive?: boolean;
    /** Callback when chip is pressed */
    onPress?: () => void;
    /** Optional custom style */
    style?: ViewStyle;
}

export function FilterChip({ label, isActive = false, onPress, style }: FilterChipProps) {
    return (
        <TouchableOpacity
            style={[
                styles.chip,
                isActive ? styles.chipActive : styles.chipInactive,
                style,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    chip: {
        height: 32,
        paddingHorizontal: theme.spacing.medium,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chipActive: {
        backgroundColor: theme.colors.primary,
    },
    chipInactive: {
        backgroundColor: theme.colors.surfaceDark,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    label: {
        fontSize: theme.text.caption.fontSize,
        fontWeight: '500',
    },
    labelActive: {
        color: theme.colors.text,
    },
    labelInactive: {
        color: theme.colors.textSecondary,
    },
});
