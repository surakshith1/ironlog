import React, { useState } from 'react';
import { View, StyleSheet, FlatList, StatusBar, Text, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';
import { ProgramCard } from '../components/business/ProgramCard';
import { ImportProgramModal } from '../components/business/ImportProgramModal';
import { Button } from '../components/inputs/Button';
import { FileCode, Plus } from 'lucide-react-native';
import { ThemedText } from '../components/display/Typography';

import { useWorkoutStore } from '../store/workoutStore';
import { useProgramStore } from '../store/programStore';
import { useNavigation } from '@react-navigation/native';
import { Program } from '../api/models/program';

export const ProgramsScreen = () => {
    const [isImportModalVisible, setIsImportModalVisible] = useState(false);

    // Program Store
    const programs = useProgramStore((state) => state.programs);
    const deleteProgram = useProgramStore((state) => state.deleteProgram);

    // Workout Store
    const activeProgramId = useWorkoutStore((state) => state.activeProgramId);
    const setActiveProgram = useWorkoutStore((state) => state.setActiveProgram);
    const navigation = useNavigation<any>();

    const handleSetActive = (id: string) => {
        setActiveProgram(id);
        navigation.navigate('Workouts');
    };

    const handleDelete = (id: string) => {
        deleteProgram(id);
        // If we deleted the active program, clear the selection
        if (id === activeProgramId) {
            useWorkoutStore.getState().clearActiveProgram();
        }
    };

    const handleImportJson = () => {
        setIsImportModalVisible(true);
    };

    const handleImportSuccess = (count: number) => {
        console.log(`Imported ${count} programs`);
    };

    /**
     * Helper to get display info for the program card.
     * Maps from our new Program interface to what ProgramCard expects.
     */
    const mapProgramToCardData = (program: Program) => ({
        id: program.id,
        name: program.name,
        schedule: `${program.workouts.length} Workout${program.workouts.length !== 1 ? 's' : ''}`,
        focus: program.workouts[0]?.type || 'General',
        lastEdited: formatRelativeDate(program.importedAt),
    });

    /**
     * Format a timestamp to a relative date string.
     */
    const formatRelativeDate = (timestamp: number): string => {
        const now = Date.now();
        const diff = now - timestamp;

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return `${Math.floor(days / 30)} months ago`;
    };

    // Empty state
    if (programs.length === 0) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.emptyContainer}>
                    <FileCode size={64} color={theme.colors.textMuted} />
                    <ThemedText variant="h2" style={styles.emptyTitle}>
                        No Programs Yet
                    </ThemedText>
                    <ThemedText variant="body" style={styles.emptySubtitle}>
                        Import your first workout program to get started.
                    </ThemedText>
                    <Button
                        title="Import JSON"
                        variant="primary"
                        style={styles.emptyButton}
                        onPress={handleImportJson}
                        icon={<Plus size={20} color={theme.colors.background} />}
                    />
                </View>

                <ImportProgramModal
                    visible={isImportModalVisible}
                    onClose={() => setIsImportModalVisible(false)}
                    onSuccess={handleImportSuccess}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <FlatList
                data={programs}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.cardWrapper}>
                        <ProgramCard
                            program={mapProgramToCardData(item)}
                            isActive={item.id === activeProgramId}
                            onSetActive={handleSetActive}
                            onDelete={handleDelete}
                        />
                    </View>
                )}
                ListFooterComponent={
                    <View style={styles.footer}>
                        <Button
                            title="Import JSON"
                            variant="secondary"
                            style={styles.importButton}
                            onPress={handleImportJson}
                            icon={<FileCode size={20} color={theme.colors.primary} />}
                        />
                    </View>
                }
            />

            <ImportProgramModal
                visible={isImportModalVisible}
                onClose={() => setIsImportModalVisible(false)}
                onSuccess={handleImportSuccess}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyTitle: {
        marginTop: 24,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
    },
    emptyButton: {
        minWidth: 200,
    },
    listContent: {
        padding: 16,
        paddingTop: 16,
    },
    cardWrapper: {
        marginBottom: 16,
    },
    footer: {
        marginTop: 8,
        marginBottom: 32,
    },
    importButton: {
        backgroundColor: theme.colors.card,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        height: 56,
        justifyContent: 'center',
    },
});
