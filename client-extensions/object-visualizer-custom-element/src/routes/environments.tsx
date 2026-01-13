import { EnvironmentSetup } from '@/components/environment-setup';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/environments')({
    component: EnvironmentSetup,
});
