import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Bot, Settings, User } from 'lucide-react';
import { AssistantCard, AssistantModal, type AssistantInfo } from '@/features/assistant';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { SearchInput, EmptyState } from '@/shared/ui';

export const SettingsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        mode: 'view' | 'edit' | 'create';
        assistant?: AssistantInfo;
    }>({
        isOpen: false,
        mode: 'view',
    });

    // Mock data - in a real app, this would come from a store/API
    const [assistants, setAssistants] = useState<AssistantInfo[]>([
        {
            id: '1',
            name: 'General Assistant',
            description: 'A helpful general-purpose AI assistant',
            model: 'gpt-4',
            temperature: 0.7,
            maxTokens: 2048,
            systemPrompt: 'You are a helpful AI assistant.',
        },
        {
            id: '2',
            name: 'Code Helper',
            description: 'Specialized in programming and software development',
            model: 'gpt-4',
            temperature: 0.3,
            maxTokens: 4096,
            systemPrompt:
                'You are an expert programming assistant. Help with code, debugging, and software architecture.',
        },
    ]);

    const filteredAssistants = assistants.filter(
        (assistant) =>
            assistant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assistant.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateClick = () => {
        setModalState({
            isOpen: true,
            mode: 'create',
            assistant: undefined,
        });
    };

    const handleEditClick = (assistant: AssistantInfo, e: React.MouseEvent) => {
        e.stopPropagation();
        setModalState({
            isOpen: true,
            mode: 'edit',
            assistant,
        });
    };

    const handleViewDetails = (assistant: AssistantInfo, e: React.MouseEvent) => {
        e.stopPropagation();
        setModalState({
            isOpen: true,
            mode: 'view',
            assistant,
        });
    };

    const closeModal = () => {
        setModalState({
            isOpen: false,
            mode: 'view',
        });
    };

    const handleModalSave = (assistant: AssistantInfo) => {
        if (modalState.mode === 'edit') {
            setAssistants((prev) => prev.map((a) => (a.id === assistant.id ? assistant : a)));
        } else if (modalState.mode === 'create') {
            const newAssistant = {
                ...assistant,
                id: Date.now().toString(),
            };
            setAssistants((prev) => [...prev, newAssistant]);
        }
    };

    const handleAssistantSelect = (assistant: AssistantInfo) => {
        // Handle assistant selection logic here
        // eslint-disable-next-line no-console
        console.log('Selected assistant:', assistant);
    };

    return (
        <div className="h-screen bg-gray-950 flex overflow-hidden">
            {/* Settings Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center space-x-4">
                    <Link to="/" className="text-gray-400 hover:text-gray-200 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <Settings className="w-5 h-5 text-gray-400" />
                    <h1 className="text-xl font-semibold text-gray-100">Settings</h1>
                </div>

                <div className="flex-1 flex">
                    {/* Settings Sidebar */}
                    <div className="w-64 bg-gray-900 border-r border-gray-700">
                        <div className="p-4">
                            <nav className="space-y-2">
                                <div className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-blue-400 bg-blue-500/10 rounded-lg">
                                    <Bot className="w-4 h-4" />
                                    <span>Assistants</span>
                                </div>
                                <div className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-400 hover:text-gray-300 rounded-lg cursor-pointer">
                                    <User className="w-4 h-4" />
                                    <span>Profile</span>
                                </div>
                            </nav>
                        </div>
                    </div>

                    {/* Main Settings Area */}
                    <div className="flex-1 flex flex-col">
                        {/* Assistant Management */}
                        <div className="flex flex-col h-full bg-gray-950">
                            <div className="p-6 border-b border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-100">AI Assistants</h2>
                                        <p className="text-sm text-gray-400">Manage your AI assistant configurations</p>
                                    </div>
                                    <button
                                        onClick={handleCreateClick}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                        Create Assistant
                                    </button>
                                </div>
                                <SearchInput
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="Search assistants..."
                                    className="bg-gray-800 border-gray-600 text-gray-100"
                                />
                            </div>

                            <ScrollArea className="flex-1">
                                <div className="p-6">
                                    {filteredAssistants.length === 0 ? (
                                        <EmptyState
                                            icon={<Bot className="w-12 h-12 text-gray-500" />}
                                            message={searchQuery ? 'No assistants found' : 'No assistants yet'}
                                            actionLabel={!searchQuery ? 'Create your first assistant' : undefined}
                                            onAction={!searchQuery ? handleCreateClick : undefined}
                                        />
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {filteredAssistants.map((assistant) => (
                                                <div
                                                    key={assistant.id}
                                                    className="bg-gray-800 rounded-lg border border-gray-700 p-1"
                                                >
                                                    <AssistantCard
                                                        assistant={assistant}
                                                        onSelect={handleAssistantSelect}
                                                        onEdit={handleEditClick}
                                                        onViewDetails={handleViewDetails}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </div>

            <AssistantModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                assistant={modalState.assistant}
                mode={modalState.mode}
                onSave={handleModalSave}
            />
        </div>
    );
};
