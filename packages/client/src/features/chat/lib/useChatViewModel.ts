import { useEffect } from 'react';
import { useChatStore } from '@/features';
import { useSendMessageMutation } from '../api';
import { useThreadMessagesQuery, useThreadsQuery } from '@/features/thread';

export const useChatViewModel = (threadId?: string) => {
    const { messages, currentThreadId, loading, setCurrentThreadId, clearMessages } = useChatStore();

    const sendMessageMutation = useSendMessageMutation();
    const threadMessagesQuery = useThreadMessagesQuery(threadId);
    useThreadsQuery();

    // Update current thread when threadId changes, but only clear messages when switching between different threads
    useEffect(() => {
        if (threadId) {
            // Only clear messages if we're switching to a different thread
            if (currentThreadId && currentThreadId !== threadId) {
                clearMessages();
            }
            setCurrentThreadId(threadId);
        } else if (currentThreadId) {
            // Only clear messages when explicitly switching away from a thread
            clearMessages();
            setCurrentThreadId(undefined);
        }
    }, [threadId, currentThreadId, setCurrentThreadId, clearMessages]);

    const handleSendMessage = async (content: string): Promise<string | undefined> => {
        try {
            const result = await sendMessageMutation.mutateAsync({
                content,
                threadId: currentThreadId,
            });

            return result;
        } catch (error) {
            console.error('Failed to send message:', error);
            return undefined;
        }
    };

    return {
        messages,
        currentThreadId,
        loading: loading || sendMessageMutation.isPending || threadMessagesQuery.isLoading,
        handleSendMessage,
        isError: sendMessageMutation.isError || threadMessagesQuery.isError,
        error: sendMessageMutation.error || threadMessagesQuery.error,
    };
};
