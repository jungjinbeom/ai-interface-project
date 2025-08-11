import React, { useState } from 'react';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { MessageSquare, Trash2, Edit2, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { SearchInput, EmptyState } from '@/shared/ui';

export interface ThreadWithMessages {
    id: string;
    title: string;
    messages: { id: string; content: string; role: string }[];
    createdAt: string;
    updatedAt: string;
}

// Keep backward compatibility
export type Thread = ThreadWithMessages;

interface ThreadSidebarProps {
    threads: Thread[];
    activeThreadId?: string;
    onThreadSelect?: (thread: Thread) => void;
    onNewThread?: () => void;
    onDeleteThread?: (threadId: string) => void;
    onEditThread?: (threadId: string, newTitle: string) => void;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    className?: string;
}

export const ThreadSidebar: React.FC<ThreadSidebarProps> = ({
    threads,
    activeThreadId,
    onThreadSelect,
    onNewThread,
    onDeleteThread,
    onEditThread,
    searchQuery = '',
    onSearchChange,
    isCollapsed = false,
    onToggleCollapse,
    className = '',
}) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [hover, setHover] = useState(false);

    const filteredThreads = threads.filter((thread) => thread.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleEditStart = (thread: Thread, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(thread.id);
        setEditTitle(thread.title);
    };

    const handleEditSave = (threadId: string) => {
        if (editTitle.trim() && onEditThread) {
            onEditThread(threadId, editTitle.trim());
        }
        setEditingId(null);
        setEditTitle('');
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditTitle('');
    };

    const handleKeyPress = (e: React.KeyboardEvent, threadId: string) => {
        if (e.key === 'Enter') {
            handleEditSave(threadId);
        } else if (e.key === 'Escape') {
            handleEditCancel();
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInDays === 1) {
            return 'Yesterday';
        } else if (diffInDays < 7) {
            return `${diffInDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    if (isCollapsed) {
        return (
            <div className={`flex flex-col h-full bg-gray-900 border-r border-gray-700 ${className}`}>
                {/* Collapsed Header */}
                <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-center">
                        {!hover ? (
                            /**
                             *
                             * isCollapsed 상태 시 MessageSquare 아이콘, ChevronRight 아이콘 UI 부자연스럽게 변경
                             *
                             * 마우스 hover 통해 처음에는 MessageSquare 아이콘에서 hover 시 ChevronRight 아이콘으로 변경
                             *
                             * ex) ChatGPT
                             *
                             * 새로운 로고 변경 예정
                             *
                             */
                            <MessageSquare className="w-6 h-6 text-gray-300" onMouseMove={() => setHover(true)} />
                        ) : (
                            <button
                                onClick={() => {
                                    setHover(false);
                                    onToggleCollapse?.();
                                }}
                                className="p-1 text-gray-400 hover:text-gray-200 rounded"
                                title="Expand sidebar"
                                onMouseLeave={() => setHover(false)}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Collapsed New Chat Button */}
                <div className="p-2">
                    <button
                        onClick={onNewThread}
                        className="w-full p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
                        title="New Chat"
                    >
                        <MessageSquare className="w-5 h-5 mx-auto" />
                    </button>
                </div>

                {/* Collapsed Thread List */}
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {threads.slice(0, 10).map((thread) => (
                            /**
                             *
                             * 마우스 커서 효과 추가
                             * 사이드바 collapsed 상태에서 아이콘 대신 텍스트 대신 타이틀 표시
                             *
                             * 추후 사이드 바에 채팅 히스토리 아이콘을 추가 클릭 후
                             * 메인 콘텐츠에 채팅 히스토리 UI 보일 수 있도록 고도화 예정
                             *
                             * ex) Cluade, ChatGPT
                             *
                             */
                            <div
                                key={thread.id}
                                onClick={() => onThreadSelect?.(thread)}
                                className={`w-full p-2 rounded-lg transition-colors truncate cursor-pointer ${
                                    thread.id === activeThreadId
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                                }`}
                                title={thread.title}
                            >
                                <span className="text-sm font-medium">{thread.title}</span>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* Collapsed Settings Button */}
                <div className="p-2 border-t border-gray-700">
                    <Link
                        to="/settings"
                        className="w-full p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center"
                        title="Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-full bg-gray-900 border-r border-gray-700 ${className}`}>
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-gray-300" />
                        <h2 className="text-lg font-semibold text-gray-100">Chat History</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onNewThread}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                            title="New Chat"
                        >
                            New Chat
                        </button>
                        <button
                            onClick={onToggleCollapse}
                            className="p-1 text-gray-400 hover:text-gray-200 rounded"
                            title="Collapse sidebar"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <SearchInput
                    value={searchQuery}
                    onChange={onSearchChange || (() => {})}
                    placeholder="Search conversations..."
                />
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2">
                    {filteredThreads.length === 0 ? (
                        <EmptyState
                            icon={<MessageSquare className="w-12 h-12 text-gray-500" />}
                            message={searchQuery ? 'No conversations found' : 'No conversations yet'}
                            actionLabel={!searchQuery ? 'Start your first chat' : undefined}
                            onAction={!searchQuery ? onNewThread : undefined}
                        />
                    ) : (
                        <div className="space-y-1">
                            {filteredThreads.map((thread) => (
                                <div
                                    key={thread.id}
                                    className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                                        thread.id === activeThreadId
                                            ? 'bg-blue-600 border border-blue-500'
                                            : 'hover:bg-gray-800 border border-transparent'
                                    }`}
                                    onClick={() => onThreadSelect?.(thread)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            {editingId === thread.id ? (
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    onBlur={() => handleEditSave(thread.id)}
                                                    onKeyDown={(e) => handleKeyPress(e, thread.id)}
                                                    className="w-full px-2 py-1 text-sm font-medium bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    autoFocus
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            ) : (
                                                <h3
                                                    className={`text-sm font-medium truncate ${
                                                        thread.id === activeThreadId ? 'text-white' : 'text-gray-200'
                                                    }`}
                                                >
                                                    {thread.title}
                                                </h3>
                                            )}
                                            <p
                                                className={`text-xs mt-1 ${
                                                    thread.id === activeThreadId ? 'text-blue-200' : 'text-gray-400'
                                                }`}
                                            >
                                                {formatDate(thread.updatedAt)}
                                            </p>
                                            <p
                                                className={`text-xs mt-0.5 ${
                                                    thread.id === activeThreadId ? 'text-blue-300' : 'text-gray-500'
                                                }`}
                                            >
                                                {thread.messages.length} messages
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => handleEditStart(thread, e)}
                                                className={`p-1 rounded transition-colors ${
                                                    thread.id === activeThreadId
                                                        ? 'text-blue-200 hover:text-white'
                                                        : 'text-gray-400 hover:text-gray-200'
                                                }`}
                                                title="Edit title"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteThread?.(thread.id);
                                                }}
                                                className={`p-1 rounded transition-colors ${
                                                    thread.id === activeThreadId
                                                        ? 'text-blue-200 hover:text-red-300'
                                                        : 'text-gray-400 hover:text-red-400'
                                                }`}
                                                title="Delete thread"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Expanded Settings Button */}
            <div className="p-4 border-t border-gray-700">
                <Link
                    to="/settings"
                    className="w-full p-3 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-3 group"
                >
                    <Settings className="w-5 h-5" />
                    <span className="text-sm font-medium">Settings</span>
                </Link>
            </div>
        </div>
    );
};
