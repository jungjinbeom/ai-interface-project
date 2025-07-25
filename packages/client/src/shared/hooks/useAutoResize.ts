import { useEffect, RefObject } from 'react';

export const useAutoResize = (textareaRef: RefObject<HTMLTextAreaElement>, message: string) => {
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [message, textareaRef]);
};
