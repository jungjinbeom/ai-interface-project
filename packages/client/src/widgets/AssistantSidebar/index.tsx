import React from 'react';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Bot } from 'lucide-react';
import { type AssistantInfo, AssistantModal, AssistantCard } from '@/features/assistant';
import { SidebarHeader, SearchInput, EmptyState } from '@/shared/ui';

interface AssistantSidebarProps {
    assistants: AssistantInfo[];
    activeAssistantId?: string;
    onAssistantSelect?: (assistant: AssistantInfo) => void;
    onCreateAssistant?: () => void;
    onEditAssistant?: (assistant: AssistantInfo) => void;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    className?: string;
}

export const AssistantSidebar: React.FC<AssistantSidebarProps> = ({
    assistants,
    activeAssistantId,
    onAssistantSelect,
    onCreateAssistant,
    onEditAssistant,
    searchQuery = '',
    onSearchChange,
    className = '',
}) => {
    const [modalState, setModalState] = React.useState<{
        isOpen: boolean;
        mode: 'view' | 'edit' | 'create';
        assistant?: AssistantInfo;
    }>({
        isOpen: false,
        mode: 'view',
    });

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
        onCreateAssistant?.();
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
            onEditAssistant?.(assistant);
        }
    };

    return (
        <>
            <div className={`flex flex-col h-full bg-white border-r border-gray-200 ${className}`}>
                <SidebarHeader
                    title="Assistants"
                    icon={<Bot className="w-5 h-5" />}
                    onAdd={handleCreateClick}
                    addButtonTitle="Create Assistant"
                >
                    <SearchInput
                        value={searchQuery}
                        onChange={onSearchChange || (() => {})}
                        placeholder="Search assistants..."
                    />
                </SidebarHeader>

                <ScrollArea className="flex-1">
                    <div className="p-2">
                        {filteredAssistants.length === 0 ? (
                            <EmptyState
                                icon={<Bot className="w-12 h-12" />}
                                message={searchQuery ? 'No assistants found' : 'No assistants yet'}
                                actionLabel={!searchQuery ? 'Create your first assistant' : undefined}
                                onAction={!searchQuery ? handleCreateClick : undefined}
                            />
                        ) : (
                            <div className="space-y-1">
                                {filteredAssistants.map((assistant) => (
                                    <AssistantCard
                                        key={assistant.id}
                                        assistant={assistant}
                                        isActive={assistant.id === activeAssistantId}
                                        onSelect={onAssistantSelect}
                                        onEdit={handleEditClick}
                                        onViewDetails={handleViewDetails}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            <AssistantModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                assistant={modalState.assistant}
                mode={modalState.mode}
                onSave={handleModalSave}
            />
        </>
    );
};
