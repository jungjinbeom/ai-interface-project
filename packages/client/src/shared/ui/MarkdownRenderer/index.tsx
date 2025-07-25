import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/github-dark.css';
import {
    TokenState,
    getCommonPrefixLength,
    getMarkdownStyles,
    getMarkdownContainerStyle,
    getCodeBlockStyle,
    getInlineCodeStyle,
    getTokenStyle,
    getFadeInStyle,
} from '@/shared';

// Register highlight.js languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', html);
hljs.registerLanguage('xml', html);

interface MarkdownRendererProps {
    content: string;
    isStreaming?: boolean;
    className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isStreaming = false, className = '' }) => {
    const [tokens, setTokens] = useState<TokenState[]>([]);
    const prevContentRef = useRef<string>('');

    // Style definitions
    const tokenStyle = getTokenStyle();
    const fadeInStyle = getFadeInStyle();
    const markdownContainerStyle = getMarkdownContainerStyle();
    const codeBlockStyle = getCodeBlockStyle();
    const inlineCodeStyle = getInlineCodeStyle();

    useEffect(() => {
        // Add keyframes and additional markdown styles
        const styleElement = document.createElement('style');
        styleElement.textContent = getMarkdownStyles();
        document.head.appendChild(styleElement);

        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    useEffect(() => {
        // Identify new text when content changes
        if (content !== prevContentRef.current) {
            const prevContent = prevContentRef.current;
            const commonLength = getCommonPrefixLength(prevContent, content);

            const existingTokens = tokens.map((token) => ({
                ...token,
                isNew: false, // Mark all existing tokens as not new
            }));

            if (commonLength === prevContent.length) {
                // Only new text was added
                const newContent = content.slice(commonLength);
                if (newContent) {
                    setTokens([...existingTokens, { content: newContent, isNew: true }]);
                } else {
                    setTokens(existingTokens);
                }
            } else {
                // Text was changed (e.g., edited) - reset everything
                setTokens([{ content, isNew: true }]);
            }

            prevContentRef.current = content;

            // Remove 'new' status after animation time
            if (isStreaming) {
                const timer = setTimeout(() => {
                    setTokens((current) => current.map((token) => ({ ...token, isNew: false })));
                }, 500); // Remove animation state after 500ms

                return () => clearTimeout(timer);
            }
        }
    }, [content, isStreaming, tokens]);

    // Function to render tokens as markdown
    return (
        <div className={`markdown-body ${className}`} style={markdownContainerStyle}>
            {tokens.map((token, index) => (
                <span key={index} style={{ ...tokenStyle, ...(token.isNew ? fadeInStyle : {}) }}>
                    <ReactMarkdown
                        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }], rehypeRaw]}
                        remarkPlugins={[remarkGfm]}
                        components={{
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            code: (props: any) => {
                                const match = /language-(\w+)/.exec(props.className || '');
                                const language = match && match[1] ? match[1] : '';

                                // Check if parent is pre tag to determine if it's a code block
                                const isCodeBlock = props.node?.parentNode?.tagName === 'pre';

                                return isCodeBlock ? (
                                    <div style={{ position: 'relative' }}>
                                        {language && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '0.5rem',
                                                    right: '0.5rem',
                                                    fontSize: '0.75rem',
                                                    color: '#666',
                                                    padding: '0.1rem 0.5rem',
                                                    borderRadius: '0.25rem',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                                    zIndex: 1,
                                                }}
                                            >
                                                {language}
                                            </div>
                                        )}
                                        <code className={props.className} style={codeBlockStyle}>
                                            {props.children}
                                        </code>
                                    </div>
                                ) : (
                                    <code style={inlineCodeStyle} className={props.className}>
                                        {props.children}
                                    </code>
                                );
                            },
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            pre: (props: any) => <pre>{props.children}</pre>,
                        }}
                    >
                        {token.content}
                    </ReactMarkdown>
                </span>
            ))}
        </div>
    );
};
