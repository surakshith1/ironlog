import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../components/display/Typography';
import { Button } from '../components/inputs/Button';
import { Input } from '../components/inputs/Input';
import { Card } from '../components/display/Card';
import { Icon } from '../components/display/Icon';
import { theme } from '../constants/theme';

export function DesignSystemDemo() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.section}>
                    <ThemedText variant="display">Iron & Clay</ThemedText>
                    <ThemedText variant="body" style={styles.subtitle}>Design System Demo</ThemedText>
                </View>

                <Card style={styles.card}>
                    <ThemedText variant="h2">Typography</ThemedText>
                    <ThemedText variant="display">Display 32px</ThemedText>
                    <ThemedText variant="h1">Heading 1 24px</ThemedText>
                    <ThemedText variant="h2">Heading 2 20px</ThemedText>
                    <ThemedText variant="body">Body text 16px. The quick brown fox jumps over the lazy dog.</ThemedText>
                    <ThemedText variant="caption">Caption text 14px</ThemedText>
                    <ThemedText variant="mono">MONOSPACE 123</ThemedText>
                </Card>

                <Card style={styles.card}>
                    <ThemedText variant="h2">Buttons</ThemedText>
                    <Button title="Primary Action" variant="primary" onPress={() => { }} />
                    <Button title="Secondary Action" variant="secondary" onPress={() => { }} />
                    <Button title="Ghost Action" variant="ghost" onPress={() => { }} />
                    <View style={styles.row}>
                        <Button title="Loading" loading onPress={() => { }} style={styles.flex1} />
                        <Button title="Disabled" disabled onPress={() => { }} style={styles.flex1} />
                    </View>
                    <View style={styles.centeredRow}>
                        <Button title="" variant="icon" icon={<Icon name="Play" color="primary" />} onPress={() => { }} />
                        <Button title="" variant="icon" icon={<Icon name="Pause" color="white" />} onPress={() => { }} />
                    </View>
                </Card>

                <Card style={styles.card}>
                    <ThemedText variant="h2">Inputs</ThemedText>
                    <Input label="Exercise Name" placeholder="e.g. Bench Press" />
                    <Input label="Weight (lbs)" placeholder="0" keyboardType="numeric" />
                    <Input label="With Error" placeholder="Invalid" error="This field is required" />
                </Card>

                <Card style={styles.card}>
                    <ThemedText variant="h2">Icons</ThemedText>
                    <View style={styles.row}>
                        <Icon name="Dumbbell" size={32} color="primary" />
                        <Icon name="Timer" size={32} />
                        <Icon name="Calendar" size={32} color="success" />
                        <Icon name="AlertCircle" size={32} color="error" />
                    </View>
                </Card>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: 16,
        gap: 24,
        paddingBottom: 80,
    },
    section: {
        gap: 8,
    },
    subtitle: {
        color: '#9ca3af',
    },
    card: {
        gap: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    centeredRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    flex1: {
        flex: 1,
    },
});
