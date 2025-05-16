import React, { useEffect, useRef } from 'react';
import MessageItem from '../MessageItem';
import { ChatMessage } from 'shared';

interface MessageListProps {
    messages: ChatMessage[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="p-4 overflow-y-auto h-full">
            {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">대화를 시작해보세요.</div>
            ) : (
                messages.map((message) => <MessageItem key={message.id} message={message} />)
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;
