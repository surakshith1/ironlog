import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import { theme } from '../../constants/theme';

interface StreakBadgeProps {
    /** Number of consecutive workout days */
    streakDays: number;
}

/**
 * A pill-shaped badge displaying current workout streak with fire icon.
 */
export function StreakBadge({ streakDays }: StreakBadgeProps) {
    return (
        <View style={styles.container}>
            <Flame
                size={18}
                color={theme.colors.primary}
                fill={theme.colors.primary}
            />
            <Text style={styles.text}>
                {streakDays} DAY STREAK
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: theme.spacing.small,
        backgroundColor: theme.colors.surface,
        borderRadius: 999,
        paddingVertical: theme.spacing.small,
        paddingHorizontal: theme.spacing.medium,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    text: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
        color: theme.colors.primary,
    },
});
