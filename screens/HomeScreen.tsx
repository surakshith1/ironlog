import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '../components/display/Typography';
import { StreakBadge } from '../components/display/StreakBadge';
import { AnalyticsCard } from '../components/business/AnalyticsCard';
import { RecordCard } from '../components/display/RecordCard';
import { theme } from '../constants/theme';
import {
    getWorkoutStreak,
    getRecentPRRecords,
    RecentPRRecord,
} from '../api/services/exerciseLogDatabase';

/**
 * Home dashboard screen displaying streak, analytics, and recent records.
 */
export function HomeScreen() {
    const [streak, setStreak] = useState(0);
    const [recentRecords, setRecentRecords] = useState<RecentPRRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        try {
            const [streakCount, records] = await Promise.all([
                getWorkoutStreak(),
                getRecentPRRecords(5),
            ]);
            setStreak(streakCount);
            setRecentRecords(records);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch data on initial mount
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Refresh data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchDashboardData();
        }, [fetchDashboardData])
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Streak Badge Section */}
                <View style={styles.streakSection}>
                    <StreakBadge streakDays={streak} />
                </View>

                {/* Analytics Card */}
                <View style={styles.analyticsSection}>
                    <AnalyticsCard />
                </View>

                {/* Recent Records Section */}
                <View style={styles.recordsSection}>
                    <ThemedText variant="h2" style={styles.sectionTitle}>
                        Recent Records
                    </ThemedText>
                    <View style={styles.recordsList}>
                        {recentRecords.length === 0 && !isLoading ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>
                                    No records yet. Complete a workout to see your PRs here!
                                </Text>
                            </View>
                        ) : (
                            recentRecords.map((record) => (
                                <RecordCard
                                    key={record.id}
                                    exercise={record.exerciseName}
                                    date={record.date}
                                    value={`${record.weight} lbs`}
                                    unit={`${record.reps} Reps`}
                                    iconType="weight"
                                    isNewMax={true}
                                />
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: theme.spacing.xlarge,
    },
    greetingSection: {
        paddingHorizontal: theme.spacing.large,
        paddingTop: theme.spacing.medium,
        paddingBottom: theme.spacing.large,
    },
    streakSection: {
        paddingHorizontal: theme.spacing.large,
        paddingTop: theme.spacing.medium,
        paddingBottom: theme.spacing.small,
    },
    analyticsSection: {
        paddingHorizontal: theme.spacing.medium,
        paddingVertical: theme.spacing.small,
    },
    recordsSection: {
        marginTop: theme.spacing.large,
        paddingHorizontal: theme.spacing.large,
    },
    sectionTitle: {
        fontWeight: '700',
        marginBottom: theme.spacing.medium,
    },
    recordsList: {
        gap: 12,
    },
    emptyState: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: theme.spacing.large,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
});
