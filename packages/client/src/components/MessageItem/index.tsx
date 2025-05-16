import React from 'react';
import { ChatMessage } from 'shared/types/chat';
import StreamingMarkdown from '@/components/StreamingMarkdown';

interface MarkdownMessageItemProps {
    message: ChatMessage;
    streamingContent?: string;
    isStreaming?: boolean;
}

const MarkdownMessageItem: React.FC<MarkdownMessageItemProps> = ({
    message,
    streamingContent,
    isStreaming = false,
}) => {
    const isUser = message.role === 'user';

    // 사용자 메시지는 일반 텍스트로, 어시스턴트 메시지는 마크다운으로 렌더링
    const content = isUser ? (
        <div className="whitespace-pre-wrap">{message.content}</div>
    ) : (
        <StreamingMarkdown
            markdown={isStreaming ? streamingContent || '' : message.content}
            isStreaming={isStreaming}
            className="prose prose-sm max-w-none prose-pre:bg-gray-50 prose-pre:p-2"
        />
    );

    return (
        <div className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-3/4 rounded-lg px-4 py-2 ${
                    isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                } ${
                    message.status === 'sending'
                        ? 'opacity-70'
                        : message.status === 'error'
                          ? 'border border-red-500'
                          : ''
                }`}
            >
                {content}
                {message.status === 'sending' && <div className="text-xs mt-1 opacity-70">전송 중...</div>}
                {message.status === 'error' && <div className="text-xs mt-1 text-red-400">오류 발생</div>}
            </div>
        </div>
    );
};

export default MarkdownMessageItem;
