import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Bot, Settings, User, X } from 'lucide-react';

export interface AssistantInfo {
    id: string;
    name: string;
    description: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
}

interface AssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    assistant?: AssistantInfo;
    onSave?: (assistant: AssistantInfo) => void;
    mode?: 'view' | 'edit' | 'create';
}

export const AssistantModal: React.FC<AssistantModalProps> = ({
    isOpen,
    onClose,
    assistant,
    onSave,
    mode = 'view',
}) => {
    const [formData, setFormData] = React.useState<AssistantInfo>(
        assistant || {
            id: '',
            name: '',
            description: '',
            model: 'gpt-4',
            temperature: 0.7,
            maxTokens: 2048,
            systemPrompt: '',
        }
    );

    React.useEffect(() => {
        if (assistant) {
            setFormData(assistant);
        }
    }, [assistant]);

    const handleSave = () => {
        onSave?.(formData);
        onClose();
    };

    const isEditable = mode === 'edit' || mode === 'create';

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <Bot className="w-6 h-6 text-blue-500" />
                                <Dialog.Title className="text-xl font-semibold text-gray-900">
                                    {mode === 'create' && 'Create Assistant'}
                                    {mode === 'edit' && 'Edit Assistant'}
                                    {mode === 'view' && 'Assistant Details'}
                                </Dialog.Title>
                            </div>
                            <Dialog.Close asChild>
                                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </Dialog.Close>
                        </div>

                        {/* Form */}
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        disabled={!isEditable}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                        placeholder="Assistant name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        disabled={!isEditable}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                        placeholder="What does this assistant do?"
                                    />
                                </div>
                            </div>

                            {/* Configuration */}
                            <div className="border-t pt-6">
                                <div className="flex items-center space-x-2 mb-4">
                                    <Settings className="w-4 h-4 text-gray-500" />
                                    <h3 className="text-lg font-medium text-gray-900">Configuration</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                                        <select
                                            value={formData.model}
                                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                            disabled={!isEditable}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                        >
                                            <option value="gpt-4">GPT-4</option>
                                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                            <option value="claude-3">Claude 3</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Temperature ({formData.temperature})
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="2"
                                            step="0.1"
                                            value={formData.temperature}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    temperature: parseFloat(e.target.value),
                                                })
                                            }
                                            disabled={!isEditable}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Tokens</label>
                                    <input
                                        type="number"
                                        value={formData.maxTokens}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                maxTokens: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        disabled={!isEditable}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                        min="1"
                                        max="8192"
                                    />
                                </div>
                            </div>

                            {/* System Prompt */}
                            <div className="border-t pt-6">
                                <div className="flex items-center space-x-2 mb-4">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <h3 className="text-lg font-medium text-gray-900">System Prompt</h3>
                                </div>
                                <textarea
                                    value={formData.systemPrompt}
                                    onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                                    disabled={!isEditable}
                                    rows={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                    placeholder="System instructions for the assistant..."
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        {isEditable && (
                            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    {mode === 'create' ? 'Create' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
