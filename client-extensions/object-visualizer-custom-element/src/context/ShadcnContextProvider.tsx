import { useRouteContext } from '@tanstack/react-router';

export function useShadcnContext() {
    const { shadowRoot } = useRouteContext({
        from: '__root__',
        strict: true,
    }) as { shadowRoot: ShadowRoot };

    return { shadowRoot };
}
