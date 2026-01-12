import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../constants/theme';

interface ExerciseListItemProps {
    /** Exercise name */
    name: string;
    /** Primary muscles (displayed as subtitle) */
    primaryMuscles: string[];
    /** Callback when item is pressed */
    onPress?: () => void;
    /** Optional custom style */
    style?: ViewStyle;
}

/**
 * Capitalizes the first letter of each word in a string.
 */
function capitalizeWords(str: string): string {
    return str
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function ExerciseListItem({
    name,
    primaryMuscles,
    onPress,
    style,
}: ExerciseListItemProps) {
    // Format muscles: capitalize and join with comma
    const musclesText = primaryMuscles
        .map((muscle) => capitalizeWords(muscle))
        .join(', ');

    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={onPress}
            activeOpacity={0.6}
        >
            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={1}>
                    {name}
                </Text>
                <Text style={styles.muscles} numberOfLines={1}>
                    {musclesText}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.medium,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        color: theme.colors.text,
        fontSize: theme.text.body.fontSize,
        fontWeight: '500',
        lineHeight: 22,
    },
    muscles: {
        color: theme.colors.textMuted,
        fontSize: theme.text.caption.fontSize,
        lineHeight: 20,
        marginTop: 2,
    },
});
