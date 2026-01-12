import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { theme } from '../../constants/theme';
import { Exercise } from '../../api/models/exercise';
import { Tag } from './Tag';
import { CollapsibleSection } from './CollapsibleSection';
import { StatCard } from './StatCard';
import { HistoryTable } from './HistoryTable';
import {
    getRecentHistory,
    getExerciseStats,
    formatVolume,
} from '../../api/services/historyService';

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
 * Splits exercise name to highlight the last word in primary color.
 */
function splitExerciseName(name: string): { prefix: string; highlight: string } {
    const words = name.split(' ');
    if (words.length <= 1) {
        return { prefix: '', highlight: name };
    }
    const highlight = words.pop() || '';
    return { prefix: words.join(' ') + ' ', highlight };
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
    if (!exercise) return null;

    const { prefix, highlight } = splitExerciseName(exercise.name);
    const recentHistory = getRecentHistory(exercise.id);
    const stats = getExerciseStats(exercise.id);

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

                    {/* Instructions */}
                    <CollapsibleSection
                        title="Instructions"
                        icon="📋"
                        defaultOpen={true}
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
                        <Text style={styles.unitLabel}>
                            Unit: {stats.unit.toUpperCase()}
                        </Text>
                    </View>

                    <HistoryTable
                        entries={recentHistory}
                        maxRows={5}
                        unit={stats.unit}
                        style={styles.section}
                    />

                    {/* View Full History Button */}
                    <TouchableOpacity
                        style={styles.viewHistoryButton}
                        onPress={onViewFullHistory}
                    >
                        <Text style={styles.viewHistoryText}>
                            View Full History
                        </Text>
                    </TouchableOpacity>

                    {/* Performance Stats */}
                    <Text style={styles.statsLabel}>PERFORMANCE</Text>
                    <View style={styles.statsRow}>
                        <StatCard
                            label="Personal Best"
                            value={stats.personalBest}
                            unit={stats.unit}
                            highlight={true}
                            style={styles.statCard}
                        />
                        <StatCard
                            label="Total Volume"
                            value={formatVolume(stats.totalVolume)}
                            unit={stats.unit}
                            highlight={true}
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
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.text,
        letterSpacing: -0.5,
        marginBottom: theme.spacing.medium,
    },
    titleHighlight: {
        color: theme.colors.primary,
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
