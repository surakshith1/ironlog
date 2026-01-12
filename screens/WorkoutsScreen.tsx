import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../components/display/Typography';
import { theme } from '../constants/theme';

export function WorkoutsScreen() {
    return (
        <View style={styles.container}>
            <ThemedText variant="h1">Workouts Screen</ThemedText>
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
        gap: theme.spacing.small,
    },
    subtitle: {
        color: theme.colors.textSecondary,
    },
});
