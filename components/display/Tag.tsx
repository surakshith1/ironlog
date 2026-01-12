import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../constants/theme';

interface TagProps {
    /** Label text to display */
    label: string;
    /** Visual variant - primary uses clay color, secondary uses surface color */
    variant?: 'primary' | 'secondary';
    /** Size variant */
    size?: 'small' | 'medium';
    /** Optional custom style */
    style?: ViewStyle;
}

/**
 * Pill-shaped tag/chip for displaying labels.
 * Used for muscle groups, mechanics, force types, etc.
 */
export function Tag({
    label,
    variant = 'secondary',
    size = 'medium',
    style,
}: TagProps) {
    const isPrimary = variant === 'primary';
    const isSmall = size === 'small';

    return (
        <View
            style={[
                styles.container,
                isPrimary ? styles.primary : styles.secondary,
                isSmall && styles.small,
                style,
            ]}
        >
            <Text
                style={[
                    styles.label,
                    isPrimary ? styles.primaryLabel : styles.secondaryLabel,
                    isSmall && styles.smallLabel,
                ]}
            >
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 9999, // Full pill shape
        borderWidth: 1,
    },
    small: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    primary: {
        backgroundColor: `${theme.colors.primary}15`, // 15% opacity
        borderColor: `${theme.colors.primary}33`, // 20% opacity
    },
    secondary: {
        backgroundColor: theme.colors.surface,
        borderColor: 'transparent',
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
    },
    smallLabel: {
        fontSize: 11,
    },
    primaryLabel: {
        color: theme.colors.primary,
    },
    secondaryLabel: {
        color: theme.colors.textSecondary,
    },
});
