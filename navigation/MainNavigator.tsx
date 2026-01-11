import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DesignSystemDemo } from '../screens/DesignSystemDemo';
import { ProgramsScreen } from '../screens/ProgramsScreen';
import { WorkoutsScreen } from '../screens/WorkoutsScreen';
import { ExercisesScreen } from '../screens/ExercisesScreen';
import { theme } from '../constants/theme';
import { Home, Notebook, Dumbbell, Layers } from 'lucide-react-native';

import { Alert, Image, TouchableOpacity, View } from 'react-native';
import { Settings } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

export const MainNavigator = () => {
    const navigation = useNavigation<any>();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: true, // Enable header for top bar
                headerStyle: {
                    backgroundColor: theme.colors.background,
                    elevation: 0, // Remove shadow on Android
                    shadowOpacity: 0, // Remove shadow on iOS
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.surface,
                },
                headerTitle: '', // Hiding title to focus on Icon
                headerLeft: () => (
                    <View style={{ paddingLeft: 16 }}>
                        <Image
                            source={require('../assets/icon.png')}
                            style={{ width: 32, height: 32, borderRadius: 8 }}
                        />
                    </View>
                ),
                headerRight: () => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Settings')}
                        style={{ paddingRight: 16 }}
                    >
                        <Settings color={theme.colors.text} size={24} />
                    </TouchableOpacity>
                ),
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: '#3f3f46',
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: '#768598', // Muted Blue from design
            }}
        >
            <Tab.Screen
                name="Home"
                component={DesignSystemDemo}
                options={{
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                    tabBarLabel: 'Home',
                }}
            />
            <Tab.Screen
                name="Programs"
                component={ProgramsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Notebook color={color} size={size} />,
                    tabBarLabel: 'Programs',
                }}
            />
            <Tab.Screen
                name="Workouts"
                component={WorkoutsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} />,
                    tabBarLabel: 'Workouts',
                }}
            />
            <Tab.Screen
                name="Exercises"
                component={ExercisesScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Layers color={color} size={size} />,
                    tabBarLabel: 'Exercises',
                }}
            />
        </Tab.Navigator>
    );
};
