import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../constants/theme';
import { ExerciseLogEntry } from '../../api/models/history';

interface HistoryTableProps {
    /** Array of log entries to display */
    entries: ExerciseLogEntry[];
    /** Whether to show the PR indicator bar */
    showPRIndicator?: boolean;
    /** Maximum number of rows to display (optional) */
    maxRows?: number;
    /** Unit for weight display */
    unit?: 'lbs' | 'kg';
    /** Optional custom style */
    style?: ViewStyle;
}

/**
 * Formats a date string to short format (e.g., "Oct 24")
 */
function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Reusable table for displaying exercise log history.
 * Shows date, weight, reps, and calculated 1RM for each entry.
 */
export function HistoryTable({
    entries,
    showPRIndicator = true,
    maxRows,
    unit = 'lbs',
    style,
}: HistoryTableProps) {
    const displayEntries = maxRows ? entries.slice(0, maxRows) : entries;

    if (displayEntries.length === 0) {
        return (
            <View style={[styles.container, style]}>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No history yet</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            {/* Table Header */}
            <View style={styles.header}>
                <Text style={[styles.headerCell, styles.dateCell]}>Date</Text>
                <Text style={[styles.headerCell, styles.centerCell]}>Weight</Text>
                <Text style={[styles.headerCell, styles.centerCell]}>Reps</Text>
            </View>

            {/* Table Rows */}
            {displayEntries.map((entry, index) => (
                <View
                    key={entry.id}
                    style={[
                        styles.row,
                        index < displayEntries.length - 1 && styles.rowBorder,
                    ]}
                >
                    {/* PR Indicator */}
                    {showPRIndicator && entry.isPR && (
                        <View style={styles.prIndicator} />
                    )}

                    <Text style={[styles.cell, styles.dateCell, styles.dateText]}>
                        {formatDate(entry.date)}
                    </Text>
                    <Text style={[styles.cell, styles.centerCell, styles.weightText]}>
                        {entry.weight}
                    </Text>
                    <Text style={[styles.cell, styles.centerCell, styles.repsText]}>
                        {entry.reps}
                    </Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: `${theme.colors.text}08`,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerCell: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 16,
        alignItems: 'center',
        position: 'relative',
    },
    rowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    prIndicator: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        backgroundColor: theme.colors.primary,
    },
    cell: {
        fontFamily: theme.text.mono.fontFamily,
    },
    dateCell: {
        flex: 1,
        paddingLeft: 4,
    },
    centerCell: {
        flex: 1,
        textAlign: 'center',
    },
    rmCell: {
        flex: 1,
        textAlign: 'right',
        paddingRight: 4,
    },
    dateText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    weightText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
    },
    repsText: {
        fontSize: 16,
        color: theme.colors.text,
    },
    rmText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.textMuted,
    },
    rmTextPR: {
        color: theme.colors.primary,
    },
    emptyState: {
        padding: theme.spacing.large,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: theme.colors.textMuted,
    },
});
