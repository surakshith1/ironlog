import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { theme } from '../../constants/theme';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CollapsibleSectionProps {
    /** Section title */
    title: string;
    /** Icon name (emoji or text placeholder) */
    icon?: string;
    /** Whether section is open by default */
    defaultOpen?: boolean;
    /** Content to render when expanded */
    children: React.ReactNode;
    /** Optional custom style for container */
    style?: ViewStyle;
}

/**
 * Expandable section with title, icon, and animated chevron.
 * Useful for instructions, details, and other collapsible content.
 */
export function CollapsibleSection({
    title,
    icon = 'ℹ️',
    defaultOpen = false,
    children,
    style,
}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const toggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsOpen(!isOpen);
    };

    return (
        <View style={[styles.container, style]}>
            <TouchableOpacity
                onPress={toggle}
                style={styles.header}
                activeOpacity={0.7}
            >
                <View style={styles.titleRow}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>{icon}</Text>
                    </View>
                    <Text style={styles.title}>{title}</Text>
                </View>
                <Text style={[styles.chevron, isOpen && styles.chevronOpen]}>
                    ▼
                </Text>
            </TouchableOpacity>
            {isOpen && <View style={styles.content}>{children}</View>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.medium,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: `${theme.colors.primary}33`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
    },
    chevron: {
        fontSize: 12,
        color: theme.colors.textMuted,
        transform: [{ rotate: '0deg' }],
    },
    chevronOpen: {
        transform: [{ rotate: '180deg' }],
    },
    content: {
        paddingHorizontal: theme.spacing.medium,
        paddingBottom: theme.spacing.medium,
        paddingLeft: 52, // Align with title text (16 + 24 + 12)
    },
});
