import React, { useState } from 'react';
import MessageList from '../MessageList';
import { v4 as uuidv4 } from 'uuid';
import InputBoxWithCompose from '@/components/InputBoxWithCompose';
import { ChatMessage } from 'shared/types/chat';

const ChatContainer: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const handleSendMessage = (content: string) => {
        console.info(content);
        const newMessage: ChatMessage = {
            id: uuidv4(),
            role: 'user',
            content,
            createdAt: new Date().toISOString(),
            status: 'sending',
        };

        setMessages((prev) => [...prev, newMessage]);

        // 여기서 실제 API 호출이 이루어질 예정
        setTimeout(() => {
            // 성공 상태로 메시지 업데이트
            setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: 'success' } : msg)));

            // 응답 메시지 추가 (임시)
            const responseMessage: ChatMessage = {
                id: uuidv4(),
                role: 'assistant',
                content: `이것은 "${content}"에 대한 응답입니다.`,
                createdAt: new Date().toISOString(),
                status: 'success',
            };

            setMessages((prev) => [...prev, responseMessage]);
        }, 1000);
    };

    return (
        <div className="bg-white rounded-lg shadow-md h-[600px] flex flex-col">
            <div className="flex-1 overflow-hidden">
                <MessageList messages={messages} />
            </div>
            <div className="border-t p-4">
                <InputBoxWithCompose onSendMessage={handleSendMessage} />
                {/* <InputBox onSendMessage={handleSendMessage} />*/}
            </div>
        </div>
    );
};

export default ChatContainer;
