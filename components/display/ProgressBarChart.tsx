import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface BarData {
    /** Label shown below the bar (e.g., 'M', 'T', 'W') */
    label: string;
    /** Value from 0-100 representing percentage of max height */
    value: number;
    /** Whether this bar should be highlighted (e.g., today or peak) */
    isHighlighted?: boolean;
}

interface ProgressBarChartProps {
    /** Array of data points for each bar */
    data: BarData[];
    /** Height of the chart area in pixels */
    height?: number;
}

/**
 * Vertical bar chart for displaying workout volume over time.
 */
export function ProgressBarChart({
    data,
    height = 140,
}: ProgressBarChartProps) {
    const maxValue = Math.max(...data.map((d) => d.value), 1);

    return (
        <View style={[styles.container, { height }]}>
            {data.map((item, index) => {
                const barHeight = (item.value / maxValue) * 100;
                return (
                    <View key={index} style={styles.barColumn}>
                        <View style={styles.barTrack}>
                            <View
                                style={[
                                    styles.barFill,
                                    {
                                        height: `${barHeight}%`,
                                    },
                                    item.isHighlighted && styles.barHighlighted,
                                ]}
                            />
                        </View>
                        <Text
                            style={[
                                styles.label,
                                item.isHighlighted && styles.labelHighlighted,
                            ]}
                        >
                            {item.label}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: theme.spacing.small,
    },
    barColumn: {
        flex: 1,
        alignItems: 'center',
        gap: theme.spacing.small,
    },
    barTrack: {
        flex: 1,
        width: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 999,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    barFill: {
        width: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 999,
    },
    barHighlighted: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    label: {
        fontSize: 10,
        fontWeight: '500',
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
    },
    labelHighlighted: {
        color: theme.colors.text,
        fontWeight: '700',
    },
});
