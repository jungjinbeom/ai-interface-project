import React from 'react';
import { Bot, Settings } from 'lucide-react';
import { AssistantInfo } from '../AssistantModal';

interface AssistantCardProps {
    assistant: AssistantInfo;
    isActive?: boolean;
    onSelect?: (assistant: AssistantInfo) => void;
    onEdit?: (assistant: AssistantInfo, e: React.MouseEvent) => void;
    onViewDetails?: (assistant: AssistantInfo, e: React.MouseEvent) => void;
}

export const AssistantCard: React.FC<AssistantCardProps> = ({
    assistant,
    isActive = false,
    onSelect,
    onEdit,
    onViewDetails,
}) => (
    <div
        className={`
                group p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-700
                ${isActive ? 'bg-blue-900 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}
            `}
        onClick={() => onSelect?.(assistant)}
    >
        <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
                <Bot className="w-4 h-4 mt-1 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-100 truncate">{assistant.name}</h3>
                    <p className="text-xs text-gray-400 truncate mt-1">{assistant.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">{assistant.model}</span>
                        {onViewDetails && (
                            <button
                                onClick={(e) => onViewDetails(assistant, e)}
                                className="text-xs text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                View details
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {onEdit && (
                <button
                    onClick={(e) => onEdit(assistant, e)}
                    className="p-1 text-gray-400 hover:text-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Edit Assistant"
                >
                    <Settings className="w-3 h-3" />
                </button>
            )}
        </div>
    </div>
);
