import { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { RouterProvider } from './RouterProvider';

interface AppProvidersProps {
    children?: ReactNode;
}

export const AppProviders = ({ children: _children }: AppProvidersProps) => (
    <QueryProvider>
        <RouterProvider />
    </QueryProvider>
);

export * from './QueryProvider';
export * from './RouterProvider';
