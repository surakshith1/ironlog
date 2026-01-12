import React from 'react';
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
import { HistoryTable } from './HistoryTable';
import { ExerciseLogEntry } from '../../api/models/history';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ExerciseHistoryModalProps {
    /** Whether the modal is visible */
    visible: boolean;
    /** Exercise name for the header */
    exerciseName: string;
    /** Full history entries to display */
    entries: ExerciseLogEntry[];
    /** Unit for weight display */
    unit?: 'lbs' | 'kg';
    /** Callback when modal should close */
    onClose: () => void;
}

/**
 * Modal for displaying the full exercise history.
 * Shows all log entries in a scrollable list.
 */
export function ExerciseHistoryModal({
    visible,
    exerciseName,
    entries,
    unit = 'lbs',
    onClose,
}: ExerciseHistoryModalProps) {
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
                        style={styles.backButton}
                    >
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {exerciseName}
                    </Text>
                    <View style={styles.backButton} />
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Section Header */}
                    <View style={styles.sectionHeader}>
                        <View style={styles.titleRow}>
                            <Text style={styles.sectionIcon}>📊</Text>
                            <Text style={styles.sectionTitle}>Full History</Text>
                        </View>
                        <Text style={styles.entryCount}>
                            {entries.length} entries
                        </Text>
                    </View>

                    {/* History Table - Full list */}
                    <HistoryTable
                        entries={entries}
                        showPRIndicator={true}
                        unit={unit}
                    />

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
        height: SCREEN_HEIGHT * 0.85,
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
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    backIcon: {
        fontSize: 20,
        color: theme.colors.primary,
    },
    headerTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        textAlign: 'center',
        paddingHorizontal: 8,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: theme.spacing.large,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.medium,
        paddingHorizontal: 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionIcon: {
        fontSize: 18,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    entryCount: {
        fontSize: 12,
        color: theme.colors.textMuted,
    },
    bottomPadding: {
        height: theme.spacing.xlarge,
    },
});
