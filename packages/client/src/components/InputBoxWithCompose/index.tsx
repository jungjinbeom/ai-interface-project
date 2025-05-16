import React, { useEffect, useRef, useState } from 'react';

interface InputBoxProps {
    onSendMessage: (message: string) => void;
}

const InputBox: React.FC<InputBoxProps> = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');
    const [isComposing, setIsComposing] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);

        // 자동 높이 조절
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // IME 입력 중이 아닐 때만 Enter 키 처리
        if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        const trimmedMessage = message.trim();
        if (trimmedMessage) {
            onSendMessage(trimmedMessage);
            setMessage('');

            // 제출 후 높이 초기화
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    return (
        <div className="flex items-end">
            <textarea
                ref={textareaRef}
                className="flex-1 resize-none border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="메시지를 입력하세요..."
                rows={1}
                value={message}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
            />
            <button
                className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                onClick={handleSubmit}
                disabled={!message.trim()}
            >
                전송
            </button>
        </div>
    );
};

export default InputBox;
