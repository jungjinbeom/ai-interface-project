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
import 'highlight.js/styles/github.css';

// highlight.js 언어 등록
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

interface StreamingMarkdownProps {
    markdown: string;
    isStreaming?: boolean;
    className?: string;
}

interface TokenState {
    content: string;
    isNew: boolean;
}

const StreamingMarkdown: React.FC<StreamingMarkdownProps> = ({ markdown, isStreaming = false, className = '' }) => {
    const [tokens, setTokens] = useState<TokenState[]>([]);
    const prevMarkdownRef = useRef<string>('');

    // 스타일 정의
    const tokenStyle = {
        transition: 'opacity 0.5s ease-in-out',
    };

    const fadeInKeyframes = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;

    const fadeInStyle = {
        animation: 'fadeIn 0.5s ease-in-out',
    };

    // 마크다운 컨테이너 스타일
    const markdownContainerStyle = {
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
        lineHeight: 1.6,
        color: '#24292e',
    };

    // 코드 블록 스타일
    const codeBlockStyle = {
        borderRadius: '6px',
        fontSize: '0.9em',
        margin: '1em 0',
        padding: '0.5em',
        overflow: 'auto',
        backgroundColor: '#f6f8fa',
        border: '1px solid #eaecef',
    };

    // 인라인 코드 스타일
    const inlineCodeStyle = {
        padding: '0.2em 0.4em',
        margin: '0',
        fontSize: '85%',
        backgroundColor: 'rgba(27, 31, 35, 0.05)',
        borderRadius: '3px',
        fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
    };

    useEffect(() => {
        // 키프레임과 추가 마크다운 스타일 추가
        const styleElement = document.createElement('style');
        styleElement.textContent = `
      ${fadeInKeyframes}
      
      /* 깃허브 테마 추가 스타일 */
      .markdown-body h1 {
        font-size: 2em;
        border-bottom: 1px solid #eaecef;
        padding-bottom: 0.3em;
      }
      
      .markdown-body h2 {
        font-size: 1.5em;
        border-bottom: 1px solid #eaecef;
        padding-bottom: 0.3em;
      }
      
      .markdown-body h3 {
        font-size: 1.25em;
      }
      
      .markdown-body h4 {
        font-size: 1em;
      }
      
      .markdown-body h5 {
        font-size: 0.875em;
      }
      
      .markdown-body h6 {
        font-size: 0.85em;
        color: #6a737d;
      }
      
      .markdown-body blockquote {
        padding: 0 1em;
        color: #6a737d;
        border-left: 0.25em solid #dfe2e5;
        margin: 0;
      }
      
      .markdown-body table {
        border-collapse: collapse;
        width: 100%;
        margin: 1em 0;
      }
      
      .markdown-body table th,
      .markdown-body table td {
        padding: 6px 13px;
        border: 1px solid #dfe2e5;
      }
      
      .markdown-body table tr {
        background-color: #fff;
        border-top: 1px solid #c6cbd1;
      }
      
      .markdown-body table tr:nth-child(2n) {
        background-color: #f6f8fa;
      }
      
      .markdown-body img {
        max-width: 100%;
        box-sizing: content-box;
      }
      
      .markdown-body hr {
        height: 0.25em;
        padding: 0;
        margin: 24px 0;
        background-color: #e1e4e8;
        border: 0;
      }
    `;
        document.head.appendChild(styleElement);

        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    useEffect(() => {
        // 마크다운이 변경되었을 때 새로운 텍스트 식별
        if (markdown !== prevMarkdownRef.current) {
            // 이전 마크다운과 현재 마크다운의 차이를 찾아 새로운 토큰으로 표시
            const prevMarkdown = prevMarkdownRef.current;
            const commonLength = getCommonPrefixLength(prevMarkdown, markdown);

            const existingTokens = tokens.map((token) => ({
                ...token,
                isNew: false, // 모든 기존 토큰을 'new'가 아닌 상태로 표시
            }));

            if (commonLength === prevMarkdown.length) {
                // 새 텍스트만 추가된 경우
                const newContent = markdown.slice(commonLength);
                if (newContent) {
                    setTokens([...existingTokens, { content: newContent, isNew: true }]);
                } else {
                    setTokens(existingTokens);
                }
            } else {
                // 텍스트가 변경된 경우 (예: 편집 등) - 전체를 다시 설정
                setTokens([{ content: markdown, isNew: true }]);
            }

            prevMarkdownRef.current = markdown;

            // 일정 시간이 지난 후 새 토큰을 더 이상 '새 것'으로 표시하지 않음
            if (isStreaming) {
                const timer = setTimeout(() => {
                    setTokens((current) => current.map((token) => ({ ...token, isNew: false })));
                }, 500); // 500ms 후에 애니메이션 상태 제거

                return () => clearTimeout(timer);
            }
        }
    }, [markdown, isStreaming]);

    // 두 문자열의 공통 접두사 길이를 반환하는 도우미 함수
    const getCommonPrefixLength = (a: string, b: string): number => {
        let i = 0;
        const minLength = Math.min(a.length, b.length);
        while (i < minLength && a[i] === b[i]) {
            i++;
        }
        return i;
    };

    // 토큰을 마크다운으로 렌더링하는 함수
    const renderMarkdown = () => (
        <div className={`markdown-body ${className}`} style={markdownContainerStyle}>
            {tokens.map((token, index) => (
                <span key={index} style={{ ...tokenStyle, ...(token.isNew ? fadeInStyle : {}) }}>
                    <ReactMarkdown
                        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }], rehypeRaw]}
                        remarkPlugins={[remarkGfm]}
                        components={{
                            // TypeScript 오류를 피하기 위해 any 타입 사용
                            code: (props: any) => {
                                const match = /language-(\w+)/.exec(props.className || '');
                                const language = match && match[1] ? match[1] : '';

                                // pre 태그가 부모인지 확인하여 인라인 여부 결정
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
                            pre: (props: any) => <pre>{props.children}</pre>,
                        }}
                    >
                        {token.content}
                    </ReactMarkdown>
                </span>
            ))}
        </div>
    );

    return renderMarkdown();
};

export default StreamingMarkdown;
