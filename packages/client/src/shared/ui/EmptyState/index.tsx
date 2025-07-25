import React from 'react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, message, actionLabel, onAction }) => (
    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        {icon && <div className="mb-4 text-gray-500">{icon}</div>}
        <div className="text-sm text-center">{message}</div>
        {actionLabel && onAction && (
            <button onClick={onAction} className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                {actionLabel}
            </button>
        )}
    </div>
);
