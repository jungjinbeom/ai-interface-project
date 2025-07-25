import { useState, useEffect } from 'react';
import { Thread } from '../ui/ThreadSidebar';

const API_BASE = '/api';

export const useThreads = () => {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchThreads = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/threads`);
            if (!response.ok) {
                throw new Error('Failed to fetch threads');
            }
            const data = await response.json();
            setThreads(data.threads || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const createThread = async (): Promise<Thread | null> => {
        try {
            const response = await fetch(`${API_BASE}/threads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to create thread');
            }
            const data = await response.json();
            const newThread = data.thread;
            setThreads((prev) => [newThread, ...prev]);
            return newThread;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return null;
        }
    };

    const deleteThread = async (threadId: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_BASE}/threads/${threadId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete thread');
            }
            setThreads((prev) => prev.filter((thread) => thread.id !== threadId));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return false;
        }
    };

    const updateThreadTitle = async (threadId: string, title: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_BASE}/threads/${threadId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title }),
            });
            if (!response.ok) {
                throw new Error('Failed to update thread');
            }
            setThreads((prev) =>
                prev.map((thread) =>
                    thread.id === threadId ? { ...thread, title, updatedAt: new Date().toISOString() } : thread
                )
            );
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return false;
        }
    };

    const getThread = async (threadId: string): Promise<Thread | null> => {
        try {
            const response = await fetch(`${API_BASE}/threads/${threadId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch thread');
            }
            const data = await response.json();
            return data.thread;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return null;
        }
    };

    useEffect(() => {
        fetchThreads();
    }, []);

    return {
        threads,
        loading,
        error,
        createThread,
        deleteThread,
        updateThreadTitle,
        getThread,
        refetch: fetchThreads,
    };
};
