import { createHashHistory, createRouter } from '@tanstack/react-router';

import { routeTree } from '../routeTree.gen';
import { RefreshCcw } from 'lucide-react';

const hashHistory = createHashHistory();

export const router = createRouter({
    basepath: '/',
    defaultPendingComponent: () => (
        <div className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white shadow-md border border-gray-200">
                <RefreshCcw className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-gray-700">Loading...</span>
            </div>
        </div>
    ),
    context: { shadowRoot: document },
    history: hashHistory,
    routeTree,
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
