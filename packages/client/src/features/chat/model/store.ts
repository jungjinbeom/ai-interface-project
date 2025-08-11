import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ChatMessage } from '@/shared';

export interface ChatState {
    messages: ChatMessage[];
    currentThreadId?: string;
    loading: boolean;
    isStreaming: boolean;

    // Actions
    setMessages: (messages: ChatMessage[]) => void;
    addMessage: (message: ChatMessage) => void;
    updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
    removeMessage: (messageId: string) => void;
    setCurrentThreadId: (threadId?: string) => void;
    setLoading: (loading: boolean) => void;
    setIsStreaming: (isStreaming: boolean) => void;
    clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
    devtools(
        (set) => ({
            messages: [],
            currentThreadId: undefined,
            loading: false,
            isStreaming: false,

            setMessages: (messages) => set({ messages }),

            addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

            updateMessage: (messageId, updates) =>
                set((state) => ({
                    messages: state.messages.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg)),
                })),

            removeMessage: (messageId) =>
                set((state) => ({
                    messages: state.messages.filter((msg) => msg.id !== messageId),
                })),

            setCurrentThreadId: (threadId) => set({ currentThreadId: threadId }),

            setLoading: (loading) => set({ loading }),
            setIsStreaming: (isStreaming) => set({ isStreaming }),

            clearMessages: () => set({ messages: [] }),
        }),
        {
            name: 'chat-store',
        }
    )
);
