import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Search } from 'lucide-react-native';
import { theme } from '../../constants/theme';

interface SearchBarProps extends TextInputProps {
    /** Callback when text changes */
    onChangeText?: (text: string) => void;
}

export function SearchBar({ onChangeText, style, ...props }: SearchBarProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, isFocused && styles.containerFocused, style]}>
            <View style={styles.iconContainer}>
                <Search
                    size={20}
                    color={isFocused ? theme.colors.primary : theme.colors.textMuted}
                />
            </View>
            <TextInput
                style={styles.input}
                placeholder="Search exercises..."
                placeholderTextColor={theme.colors.textMuted}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChangeText={onChangeText}
                autoCorrect={false}
                autoCapitalize="none"
                {...props}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceDark,
        borderRadius: 22,
        height: 44,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    containerFocused: {
        borderColor: `${theme.colors.primary}80`, // primary with 50% opacity
    },
    iconContainer: {
        paddingLeft: theme.spacing.medium,
        paddingRight: theme.spacing.small,
    },
    input: {
        flex: 1,
        height: '100%',
        color: theme.colors.text,
        fontSize: theme.text.body.fontSize,
        paddingRight: theme.spacing.medium,
    },
});
