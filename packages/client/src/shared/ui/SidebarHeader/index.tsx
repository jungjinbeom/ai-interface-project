import React from 'react';
import { Plus } from 'lucide-react';

interface SidebarHeaderProps {
    title: string;
    icon?: React.ReactNode;
    onAdd?: () => void;
    addButtonTitle?: string;
    children?: React.ReactNode;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
    title,
    icon,
    onAdd,
    addButtonTitle = 'Add',
    children,
}) => (
    <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                {icon && <span className="mr-2">{icon}</span>}
                {title}
            </h2>
            {onAdd && (
                <button
                    onClick={onAdd}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title={addButtonTitle}
                >
                    <Plus className="w-5 h-5" />
                </button>
            )}
        </div>
        {children}
    </div>
);
