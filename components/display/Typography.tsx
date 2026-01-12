import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { theme } from '../../constants/theme';

interface ThemedTextProps extends TextProps {
    variant?: 'display' | 'h1' | 'h2' | 'body' | 'caption' | 'mono';
}

export function ThemedText({ variant = 'body', style, ...props }: ThemedTextProps) {
    return (
        <Text
            style={[styles.base, styles[variant], style]}
            {...props}
        />
    );
}

const styles = StyleSheet.create({
    base: {
        color: theme.colors.text,
    },
    display: {
        fontSize: theme.text.title.fontSize,
        fontWeight: theme.text.title.fontWeight as TextStyle['fontWeight'],
        letterSpacing: theme.text.title.letterSpacing,
    },
    h1: {
        fontSize: theme.text.h1.fontSize,
        fontWeight: theme.text.h1.fontWeight as TextStyle['fontWeight'],
        letterSpacing: theme.text.h1.letterSpacing,
    },
    h2: {
        fontSize: theme.text.h2.fontSize,
        fontWeight: theme.text.h2.fontWeight as TextStyle['fontWeight'],
        letterSpacing: theme.text.h2.letterSpacing,
    },
    body: {
        fontSize: theme.text.body.fontSize,
    },
    caption: {
        fontSize: theme.text.caption.fontSize,
        color: theme.colors.textSecondary,
    },
    mono: {
        fontFamily: theme.text.mono.fontFamily,
        fontSize: 24, // Explicit for mono data input
    },
});
