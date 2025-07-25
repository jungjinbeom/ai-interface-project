import { useState } from 'react';
import { ChatContainer } from '@/features/chat';
import { ThreadSidebar, Thread, useThreads } from '@/features/thread';

function App() {
    const [activeThreadId, setActiveThreadId] = useState<string | undefined>();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { threads, deleteThread, updateThreadTitle, refetch } = useThreads();

    const handleThreadSelect = (thread: Thread) => {
        setActiveThreadId(thread.id);
    };

    const handleNewThread = () => {
        // Simply clear the active thread to start a new conversation
        setActiveThreadId(undefined);
    };

    const handleDeleteThread = async (threadId: string) => {
        const success = await deleteThread(threadId);
        if (success && activeThreadId === threadId) {
            setActiveThreadId(undefined);
        }
    };

    const handleThreadCreated = (threadId: string) => {
        setActiveThreadId(threadId);
        refetch(); // Refresh the thread list
    };

    const handleEditThread = async (threadId: string, newTitle: string) => {
        await updateThreadTitle(threadId, newTitle);
    };

    const handleToggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="min-h-screen bg-gray-950 flex">
            {/* Sidebar */}
            <div className={`${isSidebarCollapsed ? 'w-16' : 'w-80'} flex-shrink-0 transition-all duration-300`}>
                <ThreadSidebar
                    threads={threads}
                    activeThreadId={activeThreadId}
                    onThreadSelect={handleThreadSelect}
                    onNewThread={handleNewThread}
                    onDeleteThread={handleDeleteThread}
                    onEditThread={handleEditThread}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={handleToggleSidebar}
                    className="h-screen"
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <div className="bg-gray-900 border-b border-gray-700 px-6 py-4">
                    <h1 className="text-xl font-semibold text-gray-100">
                        {activeThreadId ? threads.find((t) => t.id === activeThreadId)?.title || 'Chat' : 'New Chat'}
                    </h1>
                </div>
                <div className="flex-1 p-6">
                    <ChatContainer threadId={activeThreadId} onThreadCreated={handleThreadCreated} />
                </div>
            </div>
        </div>
    );
}

export default App;
