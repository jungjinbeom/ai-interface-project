import { useThreadStore } from '../model/store';
import { useThreadsQuery, useCreateThreadMutation, useUpdateThreadMutation, useDeleteThreadMutation } from '../api';

export const useThreadViewModel = () => {
    const { threads, selectedThreadId, setSelectedThreadId } = useThreadStore();

    const threadsQuery = useThreadsQuery();
    const createThreadMutation = useCreateThreadMutation();
    const updateThreadMutation = useUpdateThreadMutation();
    const deleteThreadMutation = useDeleteThreadMutation();

    const createThread = async (title?: string) => {
        try {
            const result = await createThreadMutation.mutateAsync({ title });
            setSelectedThreadId(result.thread.id);
            return result.thread;
        } catch (error) {
            console.error('Failed to create thread:', error);
            return null;
        }
    };

    const updateThread = async (threadId: string, title: string) => {
        try {
            await updateThreadMutation.mutateAsync({ threadId, data: { title } });
            return true;
        } catch (error) {
            console.error('Failed to update thread:', error);
            return false;
        }
    };

    const deleteThread = async (threadId: string) => {
        try {
            await deleteThreadMutation.mutateAsync(threadId);
            return true;
        } catch (error) {
            console.error('Failed to delete thread:', error);
            return false;
        }
    };

    const selectThread = (threadId?: string) => {
        setSelectedThreadId(threadId);
    };

    return {
        threads,
        selectedThreadId,
        loading:
            threadsQuery.isLoading ||
            createThreadMutation.isPending ||
            updateThreadMutation.isPending ||
            deleteThreadMutation.isPending,
        error:
            threadsQuery.error ||
            createThreadMutation.error ||
            updateThreadMutation.error ||
            deleteThreadMutation.error,
        createThread,
        updateThread,
        deleteThread,
        selectThread,
        refetch: threadsQuery.refetch,
    };
};
