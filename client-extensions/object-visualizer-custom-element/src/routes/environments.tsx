import { createFileRoute } from '@tanstack/react-router';

import { EnvironmentSetup } from '@/components/environment-setup';

export const Route = createFileRoute('/environments')({
    component: EnvironmentSetup,
});
