import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
    component: RouteComponent,
});

function RouteComponent() {
    if (import.meta.env.TAURI_ENV_PROXY_BASE_URL) {
        return <Navigate to="/environments" />;
    }

    return <Navigate to="/p" />;
}
