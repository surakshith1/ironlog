import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { theme } from '../../constants/theme';
import { Exercise } from '../../api/models/exercise';
import { ExerciseLogEntry, ExerciseStats } from '../../api/models/history';
import { Tag } from './Tag';
import { CollapsibleSection } from './CollapsibleSection';
import { StatCard } from './StatCard';
import { HistoryTable } from './HistoryTable';
import {
    getRecentHistoryAsync,
    getExerciseStatsAsync,
    formatVolume,
} from '../../api/services/historyService';
import { hasExerciseHistory } from '../../api/services/exerciseLogDatabase';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ExerciseDetailModalProps {
    /** Whether the modal is visible */
    visible: boolean;
    /** The exercise to display */
    exercise: Exercise | null;
    /** Callback when modal should close */
    onClose: () => void;
    /** Callback when "View Full History" is pressed */
    onViewFullHistory: () => void;
}

/**
 * Capitalizes first letter of a string.
 */
function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Modal drawer for displaying exercise details.
 * Shows title, tags, instructions, recent history, and stats.
 */
export function ExerciseDetailModal({
    visible,
    exercise,
    onClose,
    onViewFullHistory,
}: ExerciseDetailModalProps) {
    // State for async data
    const [isLoading, setIsLoading] = useState(true);
    const [hasRealHistory, setHasRealHistory] = useState(false);
    const [recentHistory, setRecentHistory] = useState<ExerciseLogEntry[]>([]);
    const [stats, setStats] = useState<ExerciseStats>({
        personalBest: 0,
        totalVolume: 0,
        unit: 'lbs',
    });

    // Load data when modal opens or exercise changes
    useEffect(() => {
        if (visible && exercise) {
            loadExerciseData(exercise.id);
        }
    }, [visible, exercise?.id]);

    const loadExerciseData = async (exerciseId: string) => {
        setIsLoading(true);
        try {
            // Check if real history exists
            const hasHistory = await hasExerciseHistory(exerciseId);
            setHasRealHistory(hasHistory);

            // Load history (will return empty array if no real data)
            if (hasHistory) {
                const [historyData, statsData] = await Promise.all([
                    getRecentHistoryAsync(exerciseId, 5),
                    getExerciseStatsAsync(exerciseId),
                ]);
                setRecentHistory(historyData);
                setStats(statsData);
            } else {
                // No real history - show empty state
                setRecentHistory([]);
                setStats({ personalBest: 0, totalVolume: 0, unit: 'lbs' });
            }
        } catch (error) {
            console.error('Error loading exercise data:', error);
            setRecentHistory([]);
            setStats({ personalBest: 0, totalVolume: 0, unit: 'lbs' });
        }
        setIsLoading(false);
    };

    if (!exercise) return null;

    // Format instructions as single paragraph
    const instructionsText = exercise.instructions.join(' ');

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            {/* Backdrop */}
            <TouchableOpacity
                style={styles.backdrop}
                activeOpacity={1}
                onPress={onClose}
            />

            {/* Modal Content */}
            <View style={styles.container}>
                {/* Handle bar */}
                <View style={styles.handleBar} />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.closeButton}
                    >
                        <Text style={styles.closeIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { flex: 1, textAlign: 'center' }]} numberOfLines={1}>
                        {exercise.name.toUpperCase()}
                    </Text>
                    <View style={styles.closeButton} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Tags - All Consistent */}
                    <View style={styles.tagsRow}>
                        {exercise.primaryMuscles[0] && (
                            <Tag
                                label={capitalize(exercise.primaryMuscles[0])}
                            />
                        )}
                        {exercise.mechanic && (
                            <Tag label={capitalize(exercise.mechanic)} />
                        )}
                        {exercise.force && (
                            <Tag label={capitalize(exercise.force)} />
                        )}
                    </View>

                    {/* Instructions - Default collapsed */}
                    <CollapsibleSection
                        title="Instructions"
                        icon="📋"
                        defaultOpen={false}
                        style={styles.section}
                    >
                        <Text style={styles.instructionsText}>
                            {instructionsText}
                        </Text>
                    </CollapsibleSection>

                    {/* Spacer */}
                    <View style={styles.spacer} />

                    {/* History Log */}
                    <View style={styles.historyHeader}>
                        <View style={styles.historyTitleRow}>
                            <Text style={styles.historyIcon}>📊</Text>
                            <Text style={styles.historyTitle}>History Log</Text>
                        </View>
                        {hasRealHistory && (
                            <Text style={styles.unitLabel}>
                                Unit: {stats.unit.toUpperCase()}
                            </Text>
                        )}
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        </View>
                    ) : hasRealHistory ? (
                        <>
                            <HistoryTable
                                entries={recentHistory}
                                maxRows={5}
                                unit={stats.unit}
                                style={styles.section}
                            />

                            {/* View Full History Button - Only show if has history */}
                            <TouchableOpacity
                                style={styles.viewHistoryButton}
                                onPress={onViewFullHistory}
                            >
                                <Text style={styles.viewHistoryText}>
                                    View Full History
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.emptyHistoryContainer}>
                            <Text style={styles.emptyHistoryIcon}>📝</Text>
                            <Text style={styles.emptyHistoryTitle}>No History Yet</Text>
                            <Text style={styles.emptyHistoryText}>
                                Complete a workout with this exercise to start tracking your progress.
                            </Text>
                        </View>
                    )}

                    {/* Performance Stats */}
                    <Text style={styles.statsLabel}>PERFORMANCE</Text>
                    <View style={styles.statsRow}>
                        <StatCard
                            label="Personal Best"
                            value={hasRealHistory ? stats.personalBest : '—'}
                            unit={hasRealHistory ? stats.unit : undefined}
                            highlight={hasRealHistory}
                            style={styles.statCard}
                        />
                        <StatCard
                            label="Total Volume"
                            value={hasRealHistory ? formatVolume(stats.totalVolume) : '—'}
                            unit={hasRealHistory ? stats.unit : undefined}
                            highlight={hasRealHistory}
                            style={styles.statCard}
                        />
                    </View>

                    {/* Bottom padding */}
                    <View style={styles.bottomPadding} />
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: SCREEN_HEIGHT * 0.9,
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: theme.colors.textMuted,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.medium,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    closeIcon: {
        fontSize: 20,
        color: theme.colors.primary,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
        letterSpacing: 0.5,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: theme.spacing.large,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: theme.spacing.large,
    },
    section: {
        marginBottom: 0,
    },
    instructionsText: {
        fontSize: 14,
        lineHeight: 22,
        color: theme.colors.textSecondary,
    },
    spacer: {
        height: theme.spacing.large,
    },
    historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.medium,
        paddingHorizontal: 4,
    },
    historyTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    historyIcon: {
        fontSize: 18,
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    unitLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: theme.colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    loadingContainer: {
        padding: theme.spacing.xlarge,
        alignItems: 'center',
    },
    emptyHistoryContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.xlarge,
        alignItems: 'center',
    },
    emptyHistoryIcon: {
        fontSize: 32,
        marginBottom: 12,
    },
    emptyHistoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 8,
    },
    emptyHistoryText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    viewHistoryButton: {
        paddingVertical: 12,
        backgroundColor: `${theme.colors.text}08`,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        alignItems: 'center',
        marginTop: -1,
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: theme.colors.border,
    },
    viewHistoryText: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.primary,
    },
    statsLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textMuted,
        letterSpacing: 0.5,
        marginTop: theme.spacing.large,
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
    },
    bottomPadding: {
        height: theme.spacing.xlarge,
    },
});
