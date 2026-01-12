import React, { useState } from 'react';
import { TextInput, TextInputProps, View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: any;
}

export function Input({ style, label, error, containerStyle, ...props }: InputProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                placeholderTextColor={theme.colors.textMuted}
                style={[
                    styles.input,
                    isFocused && styles.inputFocused,
                    !!error && styles.inputError,
                    style
                ]}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.medium,
    },
    label: {
        color: theme.colors.textSecondary,
        fontSize: theme.text.caption.fontSize,
        marginBottom: theme.spacing.micro,
        marginLeft: theme.spacing.micro,
    },
    input: {
        height: 56,
        backgroundColor: theme.colors.input,
        color: theme.colors.text,
        borderRadius: 12,
        paddingHorizontal: theme.spacing.medium,
        fontSize: theme.text.body.fontSize,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputFocused: {
        borderColor: theme.colors.primary,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: theme.spacing.micro,
        marginLeft: theme.spacing.micro,
    },
});
