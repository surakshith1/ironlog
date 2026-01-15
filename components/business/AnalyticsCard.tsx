import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { SegmentedControl } from '../display/SegmentedControl';
import { ProgressBarChart } from '../display/ProgressBarChart';
import { theme } from '../../constants/theme';
import {
    getVolumeByDay,
    getVolumeByWeek,
    getVolumeByMonth,
    getVolumesWithChange,
    VolumeDataPoint,
} from '../../api/services/exerciseLogDatabase';

const PERIOD_OPTIONS = ['Week', 'Month', 'Year'];
const PERIOD_TYPES: ('week' | 'month' | 'year')[] = ['week', 'month', 'year'];

/**
 * Format volume number with commas for display.
 */
function formatVolume(volume: number): string {
    return volume.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/**
 * Analytics card showing workout volume over time with period switcher.
 * Fetches real data from SQLite database.
 */
export function AnalyticsCard() {
    const [selectedPeriod, setSelectedPeriod] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [chartData, setChartData] = useState<VolumeDataPoint[]>([]);
    const [volumeInfo, setVolumeInfo] = useState({ volume: 0, change: 0 });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const periodType = PERIOD_TYPES[selectedPeriod];

            // Fetch chart data based on selected period
            let data: VolumeDataPoint[];
            switch (periodType) {
                case 'week':
                    data = await getVolumeByDay(7);
                    break;
                case 'month':
                    data = await getVolumeByWeek(4);
                    break;
                case 'year':
                    data = await getVolumeByMonth(12);
                    break;
            }

            // Fetch volume with change percentage
            const volumeData = await getVolumesWithChange(periodType);

            setChartData(data);
            setVolumeInfo({
                volume: volumeData.currentVolume,
                change: volumeData.percentChange,
            });
        } catch (error) {
            console.error('Error fetching analytics data:', error);
            setChartData([]);
            setVolumeInfo({ volume: 0, change: 0 });
        } finally {
            setIsLoading(false);
        }
    }, [selectedPeriod]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePeriodChange = (index: number) => {
        setSelectedPeriod(index);
    };

    const renderTrendIcon = () => {
        if (volumeInfo.change > 0) {
            return <TrendingUp size={14} color={theme.colors.success} />;
        } else if (volumeInfo.change < 0) {
            return <TrendingDown size={14} color={theme.colors.error} />;
        }
        return <Minus size={14} color={theme.colors.textSecondary} />;
    };

    const getTrendColor = () => {
        if (volumeInfo.change > 0) return theme.colors.success;
        if (volumeInfo.change < 0) return theme.colors.error;
        return theme.colors.textSecondary;
    };

    const formatChange = () => {
        if (volumeInfo.change === 0) return '0%';
        const sign = volumeInfo.change > 0 ? '+' : '';
        return `${sign}${volumeInfo.change}%`;
    };

    return (
        <View style={styles.container}>
            <SegmentedControl
                options={PERIOD_OPTIONS}
                selectedIndex={selectedPeriod}
                onSelect={handlePeriodChange}
            />

            <View style={styles.statsRow}>
                <View>
                    <Text style={styles.statsLabel}>Total Volume</Text>
                    <View style={styles.valueRow}>
                        {isLoading ? (
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        ) : (
                            <>
                                <Text style={styles.statsValue}>
                                    {formatVolume(volumeInfo.volume)}
                                </Text>
                                <Text style={styles.statsUnit}>lbs</Text>
                            </>
                        )}
                    </View>
                </View>
                {!isLoading && (
                    <View style={styles.trendBadge}>
                        {renderTrendIcon()}
                        <Text style={[styles.trendText, { color: getTrendColor() }]}>
                            {formatChange()}
                        </Text>
                    </View>
                )}
            </View>

            <ProgressBarChart data={chartData} height={140} />
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
        minHeight: 34, // Prevent layout shift during loading
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
    },
});
