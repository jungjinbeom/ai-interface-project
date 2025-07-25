import React from 'react';
import { MarkdownRenderer } from '../MarkdownRenderer';

interface MarkdownProps {
    content: string;
    isStreaming?: boolean;
    className?: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ content, isStreaming = false, className = '' }) => (
    <MarkdownRenderer content={content} isStreaming={isStreaming} className={className} />
);
