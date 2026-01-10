import { createRoot, Root } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';

import tailwindStyleSheet from './core/tailwind-ui.ts';
import { router } from './core/tanstack-router.tsx';
import { db } from './lib/db';
import { liferayClient, getClientOptions } from './lib/headless-client';

class ShadcnCustomElement extends HTMLElement {
    private root: Root | undefined;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        if (!this.root) {
            // Initialize client from Dexie
            const envState = await db.appState.get('selectedEnvironmentInfo');

            if (envState?.value) {
                liferayClient.setConfig(getClientOptions(envState.value));
            }

            const mountPoint = document.createElement('div');

            this.shadowRoot!.appendChild(mountPoint);
            this.shadowRoot!.adoptedStyleSheets = [tailwindStyleSheet];

            this.root = createRoot(mountPoint);
            this.root.render(
                <RouterProvider
                    context={{ shadowRoot: this.shadowRoot }}
                    router={router}
                />,
            );
        }
    }
}

if (!customElements.get('object-visualizer-custom-element')) {
    customElements.define(
        'object-visualizer-custom-element',
        ShadcnCustomElement,
    );
}
