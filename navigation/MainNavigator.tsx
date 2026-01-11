import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DesignSystemDemo } from '../screens/DesignSystemDemo';
import { ProgramsScreen } from '../screens/ProgramsScreen';
import { WorkoutsScreen } from '../screens/WorkoutsScreen';
import { ExercisesScreen } from '../screens/ExercisesScreen';
import { theme } from '../constants/theme';
import { Home, Notebook, Dumbbell, Layers } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export const MainNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
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
