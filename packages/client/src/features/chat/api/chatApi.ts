import { ChatMessage } from '@/shared';

const API_BASE = '/api';

export interface ChatCompletionRequest {
    messages: ChatMessage[];
    conversationId?: string;
}

export interface ChatCompletionResponse {
    id: string;
    message: ChatMessage;
    conversationId: string;
}

export interface SSEMessageData {
    id: string;
    content: string;
    role: 'assistant';
    conversationId: string;
    isDone: boolean;
}

export const chatApi = {
    sendMessage: async (messages: ChatMessage[], conversationId?: string): Promise<Response> => {
        const response = await fetch(`${API_BASE}/chat/sse`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages,
                conversationId,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response;
    },
};

// Legacy support
export const sendChatMessage = async (content: string, conversationId?: string): Promise<string> => {
    const messages: ChatMessage[] = [
        {
            id: Date.now().toString(),
            role: 'user',
            content,
            createdAt: new Date().toISOString(),
            status: 'success',
        },
    ];

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages, conversationId }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ChatCompletionResponse = await response.json();
        return data.message.content;
    } catch (error) {
        console.error('Chat API error:', error);
        throw error;
    }
};

export const simulateApiCall = async (content: string): Promise<string> => sendChatMessage(content);
