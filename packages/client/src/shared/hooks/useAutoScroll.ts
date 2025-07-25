import { useEffect, RefObject } from 'react';

export const useAutoScroll = (messagesEndRef: RefObject<HTMLDivElement>, dependencies: unknown[]) => {
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messagesEndRef, ...dependencies]);
};
