import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
    component: RouteComponent,
});

const showEnvironments = false;

function RouteComponent() {
    if (showEnvironments) {
        return <Navigate to="/environments" />;
    }

    return <Navigate to="/p" />;
}
