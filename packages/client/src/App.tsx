import { useState } from 'react';
import { ChatContainer } from '@/features/chat';
import { ThreadSidebarContainer, useThreadStore } from '@/features/thread';

function App() {
    const [activeThreadId, setActiveThreadId] = useState<string | undefined>();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const threads = useThreadStore((state) => state.threads);

    const handleThreadSelect = (threadId: string) => {
        setActiveThreadId(threadId);
    };

    const handleThreadCreated = (threadId: string) => {
        setActiveThreadId(threadId);
    };

    const handleToggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="h-screen bg-gray-950 flex overflow-hidden">
            {/* Sidebar */}
            <div className={`${isSidebarCollapsed ? 'w-16' : 'w-80'} flex-shrink-0 transition-all duration-300`}>
                <ThreadSidebarContainer
                    activeThreadId={activeThreadId}
                    onThreadSelect={handleThreadSelect}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={handleToggleSidebar}
                    className="h-full"
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="bg-gray-900 border-b border-gray-700 px-6 py-4 flex-shrink-0">
                    <h1 className="text-xl font-semibold text-gray-100">
                        {activeThreadId ? threads.find((t) => t.id === activeThreadId)?.title || 'Chat' : 'New Chat'}
                    </h1>
                </div>
                <div className="flex-1 p-6 min-h-0">
                    <ChatContainer threadId={activeThreadId} onThreadCreated={handleThreadCreated} />
                </div>
            </div>
        </div>
    );
}

export default App;
