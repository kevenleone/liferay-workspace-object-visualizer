import { createRootRoute, Outlet } from '@tanstack/react-router';

import useScrollUnlocked from '@/hooks/use-scroll';
import { Toaster } from '@/components/ui/toaster';

const RootLayout = () => {
    useScrollUnlocked();

    return <>
        <Toaster />

        <Outlet />
    </>;
};

export const Route = createRootRoute({
    component: RootLayout,
});
