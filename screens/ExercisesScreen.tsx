import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, StatusBar, Text } from 'react-native';
import { theme } from '../constants/theme';
import { SearchBar } from '../components/inputs/SearchBar';
import { ExerciseFilterBar } from '../components/business/ExerciseFilterBar';
import { ExerciseListItem } from '../components/display/ExerciseListItem';
import { ExerciseDetailModal } from '../components/display/ExerciseDetailModal';
import { ExerciseHistoryModal } from '../components/display/ExerciseHistoryModal';
import {
    searchExercises,
    getUniqueMuscles,
} from '../api/services/exerciseService';
import { getExerciseHistory, getExerciseStats } from '../api/services/historyService';
import { Exercise } from '../api/models/exercise';

export function ExercisesScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    // Modal state
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    // Get unique muscle groups for filter chips
    const muscleFilters = useMemo(() => getUniqueMuscles(), []);

    // Filter exercises based on search query and active filter
    const filteredExercises = useMemo(() => {
        return searchExercises(searchQuery, {
            muscle: activeFilter,
        });
    }, [searchQuery, activeFilter]);

    // Handle search input with debounce-like effect via state
    const handleSearchChange = useCallback((text: string) => {
        setSearchQuery(text);
    }, []);

    // Handle filter selection
    const handleFilterChange = useCallback((filter: string | null) => {
        setActiveFilter(filter);
    }, []);

    // Handle exercise item press - open detail modal
    const handleExercisePress = useCallback((exercise: Exercise) => {
        setSelectedExercise(exercise);
        setShowDetailModal(true);
    }, []);

    // Handle closing detail modal
    const handleCloseDetailModal = useCallback(() => {
        setShowDetailModal(false);
    }, []);

    // Handle "View Full History" button
    const handleViewFullHistory = useCallback(() => {
        // Close detail modal first to avoid stacking issues on iOS/Android
        setShowDetailModal(false);
        // Small delay to allow valid unmounting/animation completion
        setTimeout(() => {
            setShowHistoryModal(true);
        }, 400);
    }, []);

    // Handle closing history modal
    const handleCloseHistoryModal = useCallback(() => {
        setShowHistoryModal(false);
        // Re-open detail modal after delay to simulate "Back" navigation
        setTimeout(() => {
            setShowDetailModal(true);
        }, 400);
    }, []);

    // Get history data for selected exercise
    const historyEntries = useMemo(() => {
        if (!selectedExercise) return [];
        return getExerciseHistory(selectedExercise.id);
    }, [selectedExercise]);

    const stats = useMemo(() => {
        if (!selectedExercise) return { personalBest: 0, totalVolume: 0, unit: 'lbs' as const };
        return getExerciseStats(selectedExercise.id);
    }, [selectedExercise]);

    // Render each exercise item
    const renderExerciseItem = useCallback(
        ({ item }: { item: Exercise }) => (
            <ExerciseListItem
                name={item.name}
                primaryMuscles={item.primaryMuscles}
                onPress={() => handleExercisePress(item)}
            />
        ),
        [handleExercisePress]
    );

    // Key extractor for FlatList
    const keyExtractor = useCallback((item: Exercise) => item.id, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                />
            </View>

            {/* Filter Chips */}
            <ExerciseFilterBar
                filters={muscleFilters}
                activeFilter={activeFilter}
                onFilterChange={handleFilterChange}
            />

            {/* Section Header */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>LIBRARY</Text>
                <Text style={styles.sectionCount}>
                    {filteredExercises.length} exercises
                </Text>
            </View>

            {/* Exercise List */}
            <FlatList
                data={filteredExercises}
                keyExtractor={keyExtractor}
                renderItem={renderExerciseItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                initialNumToRender={20}
                maxToRenderPerBatch={20}
                windowSize={10}
                removeClippedSubviews={true}
            />

            {/* Exercise Detail Modal */}
            <ExerciseDetailModal
                visible={showDetailModal}
                exercise={selectedExercise}
                onClose={handleCloseDetailModal}
                onViewFullHistory={handleViewFullHistory}
            />

            {/* Exercise History Modal */}
            <ExerciseHistoryModal
                visible={showHistoryModal}
                exerciseName={selectedExercise?.name || ''}
                entries={historyEntries}
                unit={stats.unit}
                onClose={handleCloseHistoryModal}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundAlt,
    },
    searchContainer: {
        paddingHorizontal: theme.spacing.medium,
        paddingVertical: theme.spacing.small,
        backgroundColor: theme.colors.backgroundAlt,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.medium,
        paddingTop: theme.spacing.small,
        paddingBottom: theme.spacing.micro,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textMuted,
        letterSpacing: 0.5,
    },
    sectionCount: {
        fontSize: 12,
        color: theme.colors.textMuted,
    },
    listContent: {
        paddingBottom: 80, // Space for bottom navigation
    },
});
