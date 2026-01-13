import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    StyleSheet,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { theme } from '../../constants/theme';
import { Button } from '../inputs/Button';
import { useProgramStore } from '../../store/programStore';
import { X, FileCode, CheckCircle, AlertCircle } from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImportProgramModalProps {
    /** Whether the modal is visible */
    visible: boolean;
    /** Callback when modal should close */
    onClose: () => void;
    /** Callback when import is successful */
    onSuccess?: (count: number) => void;
}

type ImportStatus = 'idle' | 'success' | 'error';

/**
 * Modal for importing workout programs via JSON paste.
 */
export function ImportProgramModal({
    visible,
    onClose,
    onSuccess,
}: ImportProgramModalProps) {
    const [jsonText, setJsonText] = useState('');
    const [status, setStatus] = useState<ImportStatus>('idle');
    const [message, setMessage] = useState('');

    const importPrograms = useProgramStore((state) => state.importPrograms);

    const handleImport = () => {
        if (!jsonText.trim()) {
            setStatus('error');
            setMessage('Please paste JSON data');
            return;
        }

        const result = importPrograms(jsonText);

        if (result.success) {
            setStatus('success');
            setMessage(`Successfully imported ${result.count} program${result.count !== 1 ? 's' : ''}`);

            // Reset and close after delay
            setTimeout(() => {
                handleClose();
                onSuccess?.(result.count || 0);
            }, 1500);
        } else {
            setStatus('error');
            setMessage(result.error || 'Failed to import');
        }
    };

    const handleClose = () => {
        setJsonText('');
        setStatus('idle');
        setMessage('');
        onClose();
    };

    const handleTextChange = (text: string) => {
        setJsonText(text);
        // Reset status when user starts typing again
        if (status !== 'idle') {
            setStatus('idle');
            setMessage('');
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            {/* Backdrop */}
            <TouchableOpacity
                style={styles.backdrop}
                activeOpacity={1}
                onPress={handleClose}
            />

            {/* Modal Content */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.container}>
                    {/* Handle bar */}
                    <View style={styles.handleBar} />

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={handleClose}
                            style={styles.closeButton}
                        >
                            <X size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Import Programs</Text>
                        <View style={styles.closeButton} />
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Instructions */}
                        <View style={styles.instructionsContainer}>
                            <FileCode size={24} color={theme.colors.primary} />
                            <Text style={styles.instructions}>
                                Paste your workout program JSON below. The data should be an array of programs with workouts and exercises.
                            </Text>
                        </View>

                        {/* JSON Input */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[
                                    styles.textInput,
                                    status === 'error' && styles.textInputError,
                                    status === 'success' && styles.textInputSuccess,
                                ]}
                                placeholder='[{"name": "My Program", "workouts": [...]}]'
                                placeholderTextColor={theme.colors.textMuted}
                                value={jsonText}
                                onChangeText={handleTextChange}
                                multiline
                                textAlignVertical="top"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Status Message */}
                        {message ? (
                            <View style={[
                                styles.messageContainer,
                                status === 'success' && styles.successMessage,
                                status === 'error' && styles.errorMessage,
                            ]}>
                                {status === 'success' ? (
                                    <CheckCircle size={18} color={theme.colors.success} />
                                ) : (
                                    <AlertCircle size={18} color={theme.colors.error} />
                                )}
                                <Text style={[
                                    styles.messageText,
                                    status === 'success' && { color: theme.colors.success },
                                    status === 'error' && { color: theme.colors.error },
                                ]}>
                                    {message}
                                </Text>
                            </View>
                        ) : null}

                        {/* Import Button */}
                        <Button
                            title="Import Programs"
                            variant="primary"
                            style={styles.importButton}
                            onPress={handleImport}
                            disabled={!jsonText.trim() || status === 'success'}
                        />

                        {/* Bottom padding */}
                        <View style={styles.bottomPadding} />
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    keyboardView: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    container: {
        height: SCREEN_HEIGHT * 0.75,
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: theme.colors.textMuted,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.medium,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
        letterSpacing: 0.5,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: theme.spacing.large,
    },
    instructionsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: theme.spacing.large,
        backgroundColor: theme.colors.card,
        padding: theme.spacing.medium,
        borderRadius: 12,
    },
    instructions: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        color: theme.colors.textSecondary,
    },
    inputContainer: {
        marginBottom: theme.spacing.medium,
    },
    textInput: {
        minHeight: 200,
        maxHeight: 300,
        backgroundColor: theme.colors.input,
        color: theme.colors.text,
        borderRadius: 12,
        padding: theme.spacing.medium,
        fontSize: 13,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    textInputError: {
        borderColor: theme.colors.error,
    },
    textInputSuccess: {
        borderColor: theme.colors.success,
    },
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: theme.spacing.medium,
        padding: 12,
        borderRadius: 8,
    },
    successMessage: {
        backgroundColor: `${theme.colors.success}15`,
    },
    errorMessage: {
        backgroundColor: `${theme.colors.error}15`,
    },
    messageText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
    importButton: {
        height: 50,
    },
    bottomPadding: {
        height: theme.spacing.xlarge,
    },
});
