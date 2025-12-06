import { createRoot, Root } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';

import ShadcnContextProvider from './context/ShadcnContextProvider.tsx';
import tailwindStyleSheet from './core/tailwind-ui.ts';
import { router } from './core/tanstack-router.ts';

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
                <ShadcnContextProvider shadowRoot={this.shadowRoot}>
                    <RouterProvider router={router} />
                </ShadcnContextProvider>,
            );
        }
    }
}

customElements.define('shadcn-custom-element', ShadcnCustomElement);
