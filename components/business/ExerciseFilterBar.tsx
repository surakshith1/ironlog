import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { FilterChip } from '../display/FilterChip';
import { theme } from '../../constants/theme';

interface ExerciseFilterBarProps {
    /** List of filter options (muscle groups) */
    filters: string[];
    /** Currently active filter (null or 'all' for no filter) */
    activeFilter: string | null;
    /** Callback when a filter is selected */
    onFilterChange: (filter: string | null) => void;
}

/**
 * Capitalizes the first letter of a string.
 */
function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function ExerciseFilterBar({
    filters,
    activeFilter,
    onFilterChange,
}: ExerciseFilterBarProps) {
    const isAllActive = !activeFilter || activeFilter === 'all';

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* "All" chip is always first */}
                <FilterChip
                    label="All"
                    isActive={isAllActive}
                    onPress={() => onFilterChange(null)}
                />

                {/* Dynamic filter chips */}
                {filters.map((filter) => (
                    <FilterChip
                        key={filter}
                        label={capitalize(filter)}
                        isActive={activeFilter === filter}
                        onPress={() => onFilterChange(filter)}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.medium,
        paddingVertical: 12,
        gap: theme.spacing.small,
    },
});
