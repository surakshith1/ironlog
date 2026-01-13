import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DesignSystemDemo } from '../screens/DesignSystemDemo';
import { ProgramsScreen } from '../screens/ProgramsScreen';
import { WorkoutsScreen } from '../screens/WorkoutsScreen';
import { CurrentWorkoutScreen } from '../screens/CurrentWorkoutScreen';
import { ExercisesScreen } from '../screens/ExercisesScreen';
import { theme } from '../constants/theme';
import { Home, Notebook, Dumbbell, Layers } from 'lucide-react-native';

import { Image, TouchableOpacity, View } from 'react-native';
import { Settings } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const Tab = createBottomTabNavigator();
const WorkoutsStack = createNativeStackNavigator();
const ProgramsStack = createNativeStackNavigator();

// Stack navigator for Workouts tab
function WorkoutsStackNavigator() {
    return (
        <WorkoutsStack.Navigator
            screenOptions={{
                headerShown: false, // We use tab navigator header
            }}
        >
            <WorkoutsStack.Screen name="WorkoutsMain" component={WorkoutsScreen} />
            <WorkoutsStack.Screen
                name="CurrentWorkout"
                component={CurrentWorkoutScreen}
                options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            />
        </WorkoutsStack.Navigator>
    );
}

// Stack navigator for Programs tab
function ProgramsStackNavigator() {
    return (
        <ProgramsStack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <ProgramsStack.Screen name="ProgramsMain" component={ProgramsScreen} />
            <ProgramsStack.Screen
                name="ProgramWorkout"
                component={CurrentWorkoutScreen}
                options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            />
        </ProgramsStack.Navigator>
    );
}

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
                headerTitleStyle: {
                    color: theme.colors.text,
                    fontSize: 18,
                    fontWeight: 'bold',
                },
                headerTitleAlign: 'center',
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
                component={ProgramsStackNavigator}
                options={{
                    tabBarIcon: ({ color, size }) => <Notebook color={color} size={size} />,
                    tabBarLabel: 'Programs',
                }}
            />
            <Tab.Screen
                name="Workouts"
                component={WorkoutsStackNavigator}
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
