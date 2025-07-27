import React from 'react';
import { RouterProvider as TanstackRouterProvider } from '@tanstack/react-router';
import { router } from '../router';

interface RouterProviderProps {
    children?: React.ReactNode;
}

export const RouterProvider: React.FC<RouterProviderProps> = () => <TanstackRouterProvider router={router} />;
