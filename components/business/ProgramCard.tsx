import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Card } from '../display/Card';
import { ThemedText } from '../display/Typography';
import { Button } from '../inputs/Button';
import { theme } from '../../constants/theme';
import { CheckCircle, MoreHorizontal, Trash2 } from 'lucide-react-native';

/**
 * Data shape for displaying a program in a card.
 * This is a simplified view model, not the full Program from the store.
 */
export interface ProgramCardData {
    id: string;
    name: string;
    schedule: string;
    focus: string;
    lastEdited: string;
    isLegacy?: boolean;
}

interface ProgramCardProps {
    program: ProgramCardData;
    isActive: boolean;
    onSetActive: (id: string) => void;
    onDelete: (id: string) => void;
    onOptions?: (id: string) => void;
}

export function ProgramCard({ program, isActive, onSetActive, onDelete, onOptions }: ProgramCardProps) {
    if (isActive) {
        return (
            <Card style={styles.activeCard}>
                {/* Status Badge */}
                <View style={styles.activeBadge}>
                    <CheckCircle size={14} color="white" fill={theme.colors.primary} />
                    <Text style={styles.activeBadgeText}>ACTIVE</Text>
                </View>

                <View style={styles.contentContainer}>
                    <ThemedText variant="h2" style={styles.activeTitle}>{program.name}</ThemedText>
                    <View style={styles.metaRow}>
                        <ThemedText variant="body" style={styles.activeMeta}>{program.schedule}</ThemedText>
                        <View style={styles.dot} />
                        <ThemedText variant="body" style={styles.activeMeta}>{program.focus}</ThemedText>
                    </View>
                </View>

                <View style={styles.footer}>
                    <ThemedText variant="caption" style={styles.lastEdited}>Last edited: {program.lastEdited}</ThemedText>
                    <TouchableOpacity
                        onPress={() => onOptions?.(program.id)}
                        style={styles.iconButton}
                    >
                        <MoreHorizontal size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </Card>
        );
    }

    return (
        <Card style={[styles.inactiveCard, program.isLegacy && styles.legacyCard]}>
            <View style={styles.contentContainer}>
                <ThemedText variant="h2" style={styles.inactiveTitle}>{program.name}</ThemedText>
                <ThemedText variant="body" style={styles.inactiveMeta}>
                    {program.schedule} • {program.focus}
                </ThemedText>
            </View>

            <View style={styles.actionRow}>
                <Button
                    title="Set Active"
                    variant="secondary"
                    style={styles.setActiveButton}
                    onPress={() => onSetActive(program.id)}
                />
                <Button
                    variant="icon" // Using icon variant if available, or just styling a button
                    style={styles.deleteButton}
                    onPress={() => onDelete(program.id)}
                    icon={<Trash2 size={20} color={theme.colors.error} />}
                />
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    activeCard: {
        borderColor: theme.colors.primary,
        borderWidth: 2,
        paddingTop: 24, // Extra space for badge
        position: 'relative',
        overflow: 'hidden',
    },
    inactiveCard: {
        borderColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
    },
    legacyCard: {
        opacity: 0.6,
    },
    activeBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderBottomLeftRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    activeBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    contentContainer: {
        gap: 4,
        marginBottom: 16,
    },
    activeTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: '700',
    },
    inactiveTitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 20,
        fontWeight: '700',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    activeMeta: {
        color: '#bfa69b',
        fontWeight: '500',
        fontSize: 14,
    },
    inactiveMeta: {
        color: '#bfa69b',
        fontSize: 14,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(191, 166, 155, 0.4)',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    lastEdited: {
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '500',
        fontSize: 12,
    },
    iconButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 4,
    },
    setActiveButton: {
        flex: 1, // Take up remaining space
        height: 40,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: theme.colors.surface,
    },
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(229, 115, 115, 0.1)', // Error color low opacity
        justifyContent: 'center',
        alignItems: 'center',
    },
});
