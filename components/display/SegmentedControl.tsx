import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface SegmentedControlProps {
    /** Array of segment labels */
    options: string[];
    /** Currently selected index */
    selectedIndex: number;
    /** Callback when a segment is selected */
    onSelect: (index: number) => void;
}

/**
 * A segmented control for switching between options (e.g., Week/Month/Year).
 */
export function SegmentedControl({
    options,
    selectedIndex,
    onSelect,
}: SegmentedControlProps) {
    return (
        <View style={styles.container}>
            {options.map((option, index) => {
                const isSelected = index === selectedIndex;
                return (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.segment,
                            isSelected && styles.segmentSelected,
                        ]}
                        onPress={() => onSelect(index)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.segmentText,
                                isSelected && styles.segmentTextSelected,
                            ]}
                        >
                            {option}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: theme.colors.backgroundAlt,
        borderRadius: 999,
        padding: 4,
    },
    segment: {
        flex: 1,
        paddingVertical: theme.spacing.small,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    segmentSelected: {
        backgroundColor: theme.colors.primary,
    },
    segmentText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    segmentTextSelected: {
        color: theme.colors.text,
    },
});
