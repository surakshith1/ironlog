import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../components/display/Typography';
import { theme } from '../constants/theme';

export function ExercisesScreen() {
    return (
        <View style={styles.container}>
            <ThemedText variant="h1">Exercises Screen</ThemedText>
            <ThemedText variant="body" style={styles.subtitle}>Coming Soon</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    subtitle: {
        color: '#9ca3af',
    },
});
