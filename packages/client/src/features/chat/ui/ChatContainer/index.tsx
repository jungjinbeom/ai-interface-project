import React from 'react';
import { MessageList } from '@/features/message';
import InputBoxWithCompose from '../InputBoxWithCompose';
import { useChatLogic } from '../../lib/useChatLogic';

interface ChatContainerProps {
    threadId?: string;
    onThreadCreated?: (threadId: string) => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ threadId, onThreadCreated }) => {
    const { messages, loading, handleSendMessage } = useChatLogic(threadId);

    const onSendMessage = async (content: string) => {
        const newThreadId = await handleSendMessage(content);
        if (!threadId && newThreadId && onThreadCreated) {
            onThreadCreated(newThreadId);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-md h-[600px] flex flex-col border border-gray-700">
            <div className="flex-1 overflow-hidden">
                <MessageList messages={messages} />
            </div>
            <div className="border-t border-gray-700 p-4">
                <InputBoxWithCompose onSendMessage={onSendMessage} disabled={loading} />
            </div>
        </div>
    );
};

export default ChatContainer;
