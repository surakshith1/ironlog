import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DesignSystemDemo } from '../screens/DesignSystemDemo';
import { theme } from '../constants/theme';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: theme.colors.background }
                }}
            >
                <Stack.Screen name="DesignSystem" component={DesignSystemDemo} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
