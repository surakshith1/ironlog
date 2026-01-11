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
                placeholderTextColor="#6b7280"
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
        marginBottom: 16,
    },
    label: {
        color: '#9ca3af', // gray-400
        fontSize: 14,
        marginBottom: 4,
        marginLeft: 4,
    },
    input: {
        height: 56,
        backgroundColor: theme.colors.input,
        color: theme.colors.text,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
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
        marginTop: 4,
        marginLeft: 4,
    },
});
