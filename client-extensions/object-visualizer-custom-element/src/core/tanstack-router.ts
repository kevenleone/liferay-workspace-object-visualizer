import { createHashHistory, createRouter } from '@tanstack/react-router';

import { routeTree } from '../routeTree.gen';

const hashHistory = createHashHistory();

export const router = createRouter({
    basepath: '/',
    context: { shadowRoot: document },
    history: hashHistory,
    routeTree,
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
