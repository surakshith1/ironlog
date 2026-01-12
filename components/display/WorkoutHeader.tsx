import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { ThemedText } from './Typography';

interface WorkoutHeaderProps {
    title: string;
    startTime: number | null; // Timestamp when workout started, or null if not active
    onBack: () => void;
}

export function WorkoutHeader({ title, startTime, onBack }: WorkoutHeaderProps) {
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (!startTime) {
            setDuration(0);
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            setDuration(Math.floor((now - startTime) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${h > 0 ? pad(h) + ':' : ''}${pad(m)}:${pad(s)}`;
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <View style={styles.centerContent}>
                <ThemedText variant="h2" style={styles.title}>{title}</ThemedText>
                {startTime && (
                    <View style={styles.timerContainer}>
                        <View style={styles.activeDot} />
                        <ThemedText variant="caption" style={styles.timerText}>
                            {formatTime(duration)}
                        </ThemedText>
                    </View>
                )}
            </View>

            {/* Empty view for balance */}
            <View style={styles.rightPlaceholder} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.medium,
        paddingTop: 60, // Safe area top (adjust if using SafeAreaView)
        paddingBottom: theme.spacing.medium,
        backgroundColor: theme.colors.background,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerContent: {
        alignItems: 'center',
    },
    title: {
        textAlign: 'center',
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 6,
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.primary,
    },
    timerText: {
        color: theme.colors.primary,
        fontFamily: theme.text.mono.fontFamily, // Monospace if available, or just bold
        fontWeight: '600',
    },
    rightPlaceholder: {
        width: 40,
    },
});
