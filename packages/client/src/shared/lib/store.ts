import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface AppState {
    // Global app state
    isLoading: boolean;
    error: string | null;

    // Actions
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
}

export const useAppStore = create<AppState>()(
    devtools(
        (set) => ({
            isLoading: false,
            error: null,

            setLoading: (loading) => set({ isLoading: loading }),
            setError: (error) => set({ error }),
            clearError: () => set({ error: null }),
        }),
        {
            name: 'app-store',
        }
    )
);
