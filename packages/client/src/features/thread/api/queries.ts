import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/lib/react-query';
import { threadApi } from './threadApi';
import { useThreadStore } from '../model/store';
import { useChatStore } from '../../chat/model/store';

export const useThreadsQuery = () => {
    const setThreads = useThreadStore((state) => state.setThreads);

    const query = useQuery({
        queryKey: QUERY_KEYS.threads.list(),
        queryFn: threadApi.getThreads,
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
        queryFn: () => threadApi.getThread(threadId),
        enabled: !!threadId,
    });

export const useThreadMessagesQuery = (threadId?: string) => {
    const setMessages = useChatStore((state) => state.setMessages);

    const query = useQuery({
        queryKey: QUERY_KEYS.threads.messages(threadId || ''),
        queryFn: () => threadApi.getThreadMessages(threadId!),
        enabled: !!threadId,
    });

    // Update store when data changes
    React.useEffect(() => {
        if (query.data && threadId) {
            setMessages(query.data.thread.messages || []);
        }
    }, [query.data, threadId, setMessages]);

    return query;
};

export const useCreateThreadMutation = () => {
    const queryClient = useQueryClient();
    const addThread = useThreadStore((state) => state.addThread);

    return useMutation({
        mutationFn: threadApi.createThread,
        onSuccess: (data) => {
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
            threadApi.updateThread(threadId, data),
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
        mutationFn: threadApi.deleteThread,
        onSuccess: (_, threadId) => {
            removeThread(threadId);
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.threads.list() });
        },
    });
};
