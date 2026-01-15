import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../components/display/Typography';
import { StreakBadge } from '../components/display/StreakBadge';
import { AnalyticsCard } from '../components/business/AnalyticsCard';
import { RecordCard } from '../components/display/RecordCard';
import { theme } from '../constants/theme';

// Dummy data for recent records
const RECENT_RECORDS = [
    {
        id: '1',
        exercise: 'Bench Press',
        date: 'Oct 24',
        value: '225 lbs',
        unit: '',
        iconType: 'weight' as const,
        isNewMax: true,
    },
    {
        id: '2',
        exercise: 'Deadlift',
        date: 'Oct 22',
        value: '315 lbs',
        unit: '5 Reps',
        iconType: 'reps' as const,
        isNewMax: false,
    },
    {
        id: '3',
        exercise: '5K Run',
        date: 'Oct 20',
        value: '22:30',
        unit: 'Time',
        iconType: 'time' as const,
        isNewMax: false,
    },
];

export function HomeScreen() {
    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Streak Badge Section */}
                <View style={styles.streakSection}>
                    <StreakBadge streakDays={12} />
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
                        {RECENT_RECORDS.map((record) => (
                            <RecordCard
                                key={record.id}
                                exercise={record.exercise}
                                date={record.date}
                                value={record.value}
                                unit={record.unit}
                                iconType={record.iconType}
                                isNewMax={record.isNewMax}
                            />
                        ))}
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
});
