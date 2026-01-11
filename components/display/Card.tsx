import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface CardProps extends ViewProps { }

export function Card({ style, children, ...props }: CardProps) {
    return (
        <View
            style={[styles.card, style]}
            {...props}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 16,
    },
});
