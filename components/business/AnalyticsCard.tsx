import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { SegmentedControl } from '../display/SegmentedControl';
import { ProgressBarChart } from '../display/ProgressBarChart';
import { theme } from '../../constants/theme';

// Dummy data for each time period
const WEEKLY_DATA = [
    { label: 'M', value: 40 },
    { label: 'T', value: 75 },
    { label: 'W', value: 30 },
    { label: 'T', value: 95, isHighlighted: true },
    { label: 'F', value: 50 },
    { label: 'S', value: 20 },
    { label: 'S', value: 60 },
];

const MONTHLY_DATA = [
    { label: 'W1', value: 65 },
    { label: 'W2', value: 80 },
    { label: 'W3', value: 55, isHighlighted: true },
    { label: 'W4', value: 90 },
];

const YEARLY_DATA = [
    { label: 'J', value: 40 },
    { label: 'F', value: 55 },
    { label: 'M', value: 70 },
    { label: 'A', value: 60 },
    { label: 'M', value: 85 },
    { label: 'J', value: 75 },
    { label: 'J', value: 90 },
    { label: 'A', value: 80 },
    { label: 'S', value: 65 },
    { label: 'O', value: 95, isHighlighted: true },
    { label: 'N', value: 70 },
    { label: 'D', value: 50 },
];

const PERIOD_OPTIONS = ['Week', 'Month', 'Year'];

const VOLUME_BY_PERIOD = {
    0: { value: '12,450', change: '+15%' },
    1: { value: '48,200', change: '+8%' },
    2: { value: '580,500', change: '+23%' },
};

const DATA_BY_PERIOD = [WEEKLY_DATA, MONTHLY_DATA, YEARLY_DATA];

/**
 * Analytics card showing workout volume over time with period switcher.
 */
export function AnalyticsCard() {
    const [selectedPeriod, setSelectedPeriod] = useState(0);

    const currentData = DATA_BY_PERIOD[selectedPeriod];
    const currentVolume = VOLUME_BY_PERIOD[selectedPeriod as keyof typeof VOLUME_BY_PERIOD];

    return (
        <View style={styles.container}>
            <SegmentedControl
                options={PERIOD_OPTIONS}
                selectedIndex={selectedPeriod}
                onSelect={setSelectedPeriod}
            />

            <View style={styles.statsRow}>
                <View>
                    <Text style={styles.statsLabel}>Total Volume</Text>
                    <View style={styles.valueRow}>
                        <Text style={styles.statsValue}>{currentVolume.value}</Text>
                        <Text style={styles.statsUnit}>lbs</Text>
                    </View>
                </View>
                <View style={styles.trendBadge}>
                    <TrendingUp size={14} color={theme.colors.success} />
                    <Text style={styles.trendText}>{currentVolume.change}</Text>
                </View>
            </View>

            <ProgressBarChart data={currentData} height={140} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        padding: theme.spacing.large,
        gap: theme.spacing.large,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    statsLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.textSecondary,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
        marginTop: 4,
    },
    statsValue: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.text,
    },
    statsUnit: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.textSecondary,
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: theme.colors.backgroundAlt,
        paddingHorizontal: theme.spacing.small,
        paddingVertical: 4,
        borderRadius: 8,
    },
    trendText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.success,
    },
});
