import { useState, useEffect } from 'react';
import { ChatMessage } from '@/shared';
import { v4 as uuidv4 } from 'uuid';

const API_BASE = '/api';

export const useChatLogic = (threadId?: string) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentThreadId, setCurrentThreadId] = useState<string | undefined>(threadId);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (threadId) {
            loadThreadMessages(threadId);
            setCurrentThreadId(threadId);
        } else {
            setMessages([]);
            setCurrentThreadId(undefined);
        }
    }, [threadId]);

    const loadThreadMessages = async (id: string) => {
        try {
            const response = await fetch(`${API_BASE}/threads/${id}`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data.thread.messages || []);
            }
        } catch (error) {
            console.error('Failed to load thread messages:', error);
        }
    };

    const handleSendMessage = async (content: string): Promise<string | undefined> => {
        const userMessage: ChatMessage = {
            id: uuidv4(),
            role: 'user',
            content,
            createdAt: new Date().toISOString(),
            status: 'sending',
        };

        setMessages((prev) => [...prev, userMessage]);
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [userMessage],
                    threadId: currentThreadId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();
            const botMessage = data.message;
            const responseThreadId = data.conversationId;

            // Update current thread ID if it was created
            if (!currentThreadId && responseThreadId) {
                setCurrentThreadId(responseThreadId);
            }

            // Update user message status
            setMessages((prev) => prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: 'success' } : msg)));

            // Add bot response
            setMessages((prev) => [...prev, botMessage]);

            return responseThreadId;
        } catch (error) {
            console.error('Failed to send message:', error);

            // Update user message status to error
            setMessages((prev) => prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: 'error' } : msg)));
        } finally {
            setLoading(false);
        }
    };

    return {
        messages,
        currentThreadId,
        loading,
        handleSendMessage,
        setMessages,
    };
};
