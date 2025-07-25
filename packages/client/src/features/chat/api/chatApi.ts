export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: string;
    status: 'success' | 'error' | 'pending';
}

export interface ChatCompletionRequest {
    messages: ChatMessage[];
    conversationId?: string;
}

export interface ChatCompletionResponse {
    id: string;
    message: ChatMessage;
    conversationId: string;
}

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

    const requestBody: ChatCompletionRequest = {
        messages,
        conversationId,
    };

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
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

// Keep the old function for backward compatibility, but redirect to real API
export const simulateApiCall = async (content: string): Promise<string> => sendChatMessage(content);
