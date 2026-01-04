import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
    component: RouteComponent,
});

const showEnvironments = true;

function RouteComponent() {
    if (showEnvironments) {
        return <Navigate to="/environments" />;
    }

    return <Navigate to="/p" />;
}
