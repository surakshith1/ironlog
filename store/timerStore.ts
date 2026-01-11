import { create } from 'zustand';

interface TimerState {
    timeLeft: number;
    isRunning: boolean;
    intervalId: NodeJS.Timeout | null;
    startTime: number | null; // For tracking elapsed time accurately if needed

    startTimer: () => void;
    stopTimer: () => void;
    resetTimer: () => void;
    tick: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
    timeLeft: 0,
    isRunning: false,
    intervalId: null,
    startTime: null,

    startTimer: () => {
        if (get().isRunning) return;

        // We'll use a simple interval for this demo
        // Ideally, we'd use a delta-time approach for accuracy
        const intervalId = setInterval(() => {
            get().tick();
        }, 1000);

        set({ isRunning: true, intervalId });
    },

    stopTimer: () => {
        const { intervalId } = get();
        if (intervalId) {
            clearInterval(intervalId);
        }
        set({ isRunning: false, intervalId: null });
    },

    resetTimer: () => {
        const { intervalId } = get();
        if (intervalId) {
            clearInterval(intervalId);
        }
        set({ timeLeft: 0, isRunning: false, intervalId: null });
    },

    tick: () => {
        set((state) => ({ timeLeft: state.timeLeft + 1 }));
    },
}));
