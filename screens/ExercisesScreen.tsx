import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, StatusBar, Text } from 'react-native';
import { theme } from '../constants/theme';
import { SearchBar } from '../components/inputs/SearchBar';
import { ExerciseFilterBar } from '../components/business/ExerciseFilterBar';
import { ExerciseListItem } from '../components/display/ExerciseListItem';
import {
    searchExercises,
    getUniqueMuscles,
} from '../api/services/exerciseService';
import { Exercise } from '../api/models/exercise';

export function ExercisesScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

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

    // Handle exercise item press (future: navigate to detail view)
    const handleExercisePress = useCallback((exercise: Exercise) => {
        console.log('Exercise pressed:', exercise.name);
    }, []);

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
