export const theme = {
    colors: {
        primary: '#d68f71', // Clay Terra Cotta
        background: '#1f1713', // Background Dark
        card: '#2a221e', // Card Dark
        input: '#181210', // Input Dark
        surface: '#222224', // Surface Grey
        text: '#ffffff', // Primary White
        textSecondary: '#a1a1aa', // Text Secondary
        success: '#81c784', // Success Green
        error: '#e57373', // Error Red
        muted: '#768598', // Muted Blue
    },
    spacing: {
        micro: 4,
        small: 8,
        medium: 16,
        large: 24,
        xlarge: 48, // Reach
    },
    text: {
        title: {
            fontSize: 32,
            fontWeight: '600',
            letterSpacing: -0.5,
        },
        h1: {
            fontSize: 24,
            fontWeight: '600',
            letterSpacing: -0.3,
        },
        h2: {
            fontSize: 20,
            fontWeight: '500',
            letterSpacing: -0.2,
        },
        body: {
            fontSize: 16,
        },
        caption: {
            fontSize: 14,
            color: '#a1a1aa',
        },
        mono: {
            fontFamily: 'Courier New', // Fallback for now
        }
    },
} as const;
