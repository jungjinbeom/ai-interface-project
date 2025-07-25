import { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';

interface AppProvidersProps {
    children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => <QueryProvider>{children}</QueryProvider>;

export * from './QueryProvider';
