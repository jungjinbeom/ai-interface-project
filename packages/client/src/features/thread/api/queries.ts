import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/lib/react-query';
import { threadApiClient } from './client';
import { useChatStore, useThreadStore } from '@/features';

export const useThreadsQuery = () => {
    const setThreads = useThreadStore((state) => state.setThreads);

    const query = useQuery({
        queryKey: QUERY_KEYS.threads.list(),
        queryFn: threadApiClient.getThreads.bind(threadApiClient),
    });

    // Update store when data changes
    React.useEffect(() => {
        if (query.data) {
            setThreads(query.data.threads);
        }
    }, [query.data, setThreads]);

    return query;
};

export const useThreadQuery = (threadId: string) =>
    useQuery({
        queryKey: QUERY_KEYS.threads.detail(threadId),
        queryFn: () => threadApiClient.getThread(threadId),
        enabled: !!threadId,
    });

export const useThreadMessagesQuery = (threadId?: string) => {
    const setMessages = useChatStore((state) => state.setMessages);
    const currentMessages = useChatStore((state) => state.messages);
    const loading = useChatStore((state) => state.loading);

    const query = useQuery({
        queryKey: QUERY_KEYS.threads.messages(threadId || ''),
        queryFn: () => threadApiClient.getThreadMessages(threadId!),
        enabled: !!threadId,
    });

    // Update store when data changes, but avoid overwriting during active streaming
    React.useEffect(() => {
        if (query.data && threadId && !loading) {
            // Only update if we don't have messages or if there's no active streaming
            const hasStreamingMessage = currentMessages.some((msg) => msg.status === 'sending');
            if (!hasStreamingMessage) {
                setMessages(query.data.thread.messages || []);
            }
        }
    }, [query.data, threadId, setMessages, loading, currentMessages]);

    return query;
};

export const useCreateThreadMutation = () => {
    const queryClient = useQueryClient();
    const addThread = useThreadStore((state) => state.addThread);

    return useMutation({
        mutationFn: threadApiClient.createThread.bind(threadApiClient),
        onSuccess: (data: any) => {
            addThread(data.thread);
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.threads.list() });
        },
    });
};

export const useUpdateThreadMutation = () => {
    const queryClient = useQueryClient();
    const updateThread = useThreadStore((state) => state.updateThread);

    return useMutation({
        mutationFn: ({ threadId, data }: { threadId: string; data: { title: string } }) =>
            threadApiClient.updateThread(threadId, data),
        onSuccess: (data, variables) => {
            updateThread(variables.threadId, data.thread);
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.threads.list() });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.threads.detail(variables.threadId) });
        },
    });
};

export const useDeleteThreadMutation = () => {
    const queryClient = useQueryClient();
    const removeThread = useThreadStore((state) => state.removeThread);

    return useMutation({
        mutationFn: (threadId: string) => threadApiClient.deleteThread(threadId),
        onSuccess: (_, threadId: string) => {
            removeThread(threadId);
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.threads.list() });
        },
    });
};
