import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTimerStore } from '../store/timerStore';
import { theme } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export const TimerScreen = () => {
    const { timeLeft, isRunning, startTimer, stopTimer, resetTimer } = useTimerStore();

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // We might want to keep the timer running in background, but for now we won't stop it here 
            // to allow navigation away if we had other screens. 
            // But since this is a simple app, it's fine.
        };
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Ironlog Timer</Text>

            <View style={styles.timerContainer}>
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>

            <View style={styles.controls}>
                {!isRunning ? (
                    <TouchableOpacity style={[styles.button, styles.startButton]} onPress={startTimer}>
                        <Text style={styles.buttonText}>Start</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stopTimer}>
                        <Text style={styles.buttonText}>Stop</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={resetTimer}>
                    <Text style={styles.buttonText}>Reset</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        ...theme.text.title,
        color: theme.colors.primary,
        marginBottom: theme.spacing.xlarge,
    },
    timerContainer: {
        marginVertical: theme.spacing.xlarge,
        padding: theme.spacing.large,
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        elevation: 4, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    timerText: {
        fontSize: 80,
        fontWeight: 'bold',
        fontVariant: ['tabular-nums'], // Monospaced numbers prevent jitter
        color: theme.colors.text,
    },
    controls: {
        flexDirection: 'row',
        gap: theme.spacing.medium,
    },
    button: {
        paddingVertical: theme.spacing.medium,
        paddingHorizontal: theme.spacing.large,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    startButton: {
        backgroundColor: theme.colors.secondary,
    },
    stopButton: {
        backgroundColor: theme.colors.error,
    },
    resetButton: {
        backgroundColor: '#cccccc',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
