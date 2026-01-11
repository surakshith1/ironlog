import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { theme } from '../../constants/theme';

interface ButtonProps {
    onPress?: () => void;
    title?: string;
    variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
    loading?: boolean;
    disabled?: boolean;
    style?: any;
    icon?: React.ReactNode;
}

export function Button({
    onPress,
    title,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    icon
}: ButtonProps) {

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            style={({ pressed }) => [
                styles.base,
                styles[variant],
                disabled && styles.disabled,
                pressed && styles.pressed,
                style
            ]}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? 'black' : 'white'} />
            ) : (
                <>
                    {icon}
                    {title && <Text style={[styles.textBase, styles[`text${variant}` as keyof typeof styles], icon ? styles.textWithIcon : undefined]}>{title}</Text>}
                </>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9999, // Pill shape
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    disabled: {
        opacity: 0.5,
    },
    primary: {
        backgroundColor: theme.colors.text, // White
        height: 50,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    secondary: {
        backgroundColor: theme.colors.surface,
        height: 44,
        borderWidth: 1,
        borderColor: '#374151', // gray-700 approx
        borderRadius: 12,
    },
    ghost: {
        backgroundColor: 'transparent',
        height: 44,
    },
    icon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textBase: {
        fontSize: 16,
    },
    textprimary: {
        color: 'black',
        fontWeight: '700',
    },
    textsecondary: {
        color: theme.colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    textghost: {
        color: theme.colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    texticon: {
        display: 'none',
    },
    textWithIcon: {
        marginLeft: 8,
    },
});
