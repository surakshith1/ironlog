import React, { useState } from 'react';
import { View, StyleSheet, FlatList, StatusBar, SafeAreaView } from 'react-native';
import { theme } from '../constants/theme';
import { PROGRAMS } from '../constants/dummyData';
import { ProgramCard } from '../components/business/ProgramCard';
import { Button } from '../components/inputs/Button';
import { FileCode, Plus } from 'lucide-react-native';
import { ThemedText } from '../components/display/Typography';

import { useWorkoutStore } from '../store/workoutStore';
import { useNavigation } from '@react-navigation/native';

export const ProgramsScreen = () => {
    const activeProgramId = useWorkoutStore((state) => state.activeProgramId);
    const setActiveProgram = useWorkoutStore((state) => state.setActiveProgram);
    const navigation = useNavigation<any>();

    const handleSetActive = (id: string) => {
        setActiveProgram(id);
        navigation.navigate('Workouts');
    };

    const handleDelete = (id: string) => {
        console.log('Delete program', id);
    };

    const handleImportJson = () => {
        console.log('Import JSON');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />



            <FlatList
                data={PROGRAMS}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.cardWrapper}>
                        <ProgramCard
                            program={item}
                            isActive={item.id === activeProgramId}
                            onSetActive={handleSetActive}
                            onDelete={handleDelete}
                        />
                    </View>
                )}
                ListFooterComponent={
                    <View style={styles.footer}>
                        <Button
                            title="Import JSON"
                            variant="secondary" // Used secondary for dark theme contrast, similar to card background but distinct
                            style={styles.importButton}
                            onPress={handleImportJson}
                            icon={<FileCode size={20} color={theme.colors.primary} />}
                        />
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        backgroundColor: 'rgba(31, 23, 19, 0.95)', // Background dark with opacity
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        zIndex: 10,
    },
    headerContent: {
        height: 56, // Standard header height
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: theme.colors.text,
        fontWeight: 'bold',
        fontSize: 18,
    },
    listContent: {
        padding: 16,
        paddingTop: 16,
    },
    cardWrapper: {
        marginBottom: 16,
    },
    footer: {
        marginTop: 8,
        marginBottom: 32, // Space at bottom
    },
    importButton: {
        backgroundColor: theme.colors.card,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        height: 56,
        justifyContent: 'center',
    },
});
