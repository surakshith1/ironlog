import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dumbbell, TrendingUp, Timer } from 'lucide-react-native';
import { theme } from '../../constants/theme';

interface RecordCardProps {
    /** Exercise name */
    exercise: string;
    /** Date of the record */
    date: string;
    /** Value achieved */
    value: string;
    /** Unit or description (e.g., 'lbs', '5 Reps', 'Time') */
    unit: string;
    /** Icon type: 'weight', 'reps', or 'time' */
    iconType?: 'weight' | 'reps' | 'time';
    /** Whether this is a new personal best */
    isNewMax?: boolean;
}

/**
 * Card displaying a recent workout record or personal best.
 */
export function RecordCard({
    exercise,
    date,
    value,
    unit,
    iconType = 'weight',
    isNewMax = false,
}: RecordCardProps) {
    const renderIcon = () => {
        const iconColor = isNewMax ? theme.colors.primary : theme.colors.textSecondary;
        const iconProps = { size: 24, color: iconColor };

        switch (iconType) {
            case 'reps':
                return <TrendingUp {...iconProps} />;
            case 'time':
                return <Timer {...iconProps} />;
            case 'weight':
            default:
                return <Dumbbell {...iconProps} />;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                <View style={styles.iconContainer}>
                    {renderIcon()}
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.exercise}>{exercise}</Text>
                    <Text style={styles.date}>{date}</Text>
                </View>
            </View>
            <View style={styles.rightSection}>
                <Text style={[styles.value, isNewMax && styles.valueHighlight]}>
                    {value}
                </Text>
                {isNewMax ? (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>New Max</Text>
                    </View>
                ) : (
                    <Text style={styles.unit}>{unit}</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: theme.spacing.medium,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.medium,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: theme.colors.backgroundAlt,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        gap: 2,
    },
    exercise: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
    },
    date: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.textSecondary,
    },
    rightSection: {
        alignItems: 'flex-end',
        gap: 4,
    },
    value: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
    },
    valueHighlight: {
        color: theme.colors.primary,
    },
    unit: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.textSecondary,
    },
    badge: {
        backgroundColor: `${theme.colors.primary}33`,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
