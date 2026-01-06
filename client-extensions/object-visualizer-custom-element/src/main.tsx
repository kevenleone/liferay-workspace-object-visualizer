import { createRoot, Root } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';

import tailwindStyleSheet from './core/tailwind-ui.ts';
import { router } from './core/tanstack-router.tsx';

class ShadcnCustomElement extends HTMLElement {
    private root: Root | undefined;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        if (!this.root) {
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
