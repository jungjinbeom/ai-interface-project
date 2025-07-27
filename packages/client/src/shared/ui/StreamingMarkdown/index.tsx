import React from 'react';
import { MarkdownRenderer } from '../MarkdownRenderer';

interface StreamingMarkdownProps {
    markdown: string;
    isStreaming?: boolean;
    className?: string;
}

export const StreamingMarkdown: React.FC<StreamingMarkdownProps> = ({
    markdown,
    isStreaming = false,
    className = '',
}) => <MarkdownRenderer content={markdown} isStreaming={isStreaming} className={className} />;
