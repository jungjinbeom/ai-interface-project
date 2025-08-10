import type { ChatMessage } from '../../entities/message';

export interface SSEMessageData {
    id: string;
    content: string;
    role: 'assistant';
    conversationId: string;
    isDone: boolean;
}

export interface ChatCompletionRequest {
    messages: ChatMessage[];
    conversationId?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}
