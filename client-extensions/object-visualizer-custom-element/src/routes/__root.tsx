import useScrollUnlocked from '@/hooks/use-scroll';
import { createRootRoute, Outlet } from '@tanstack/react-router';

const RootLayout = () => {
    useScrollUnlocked();

    return <Outlet />;
};

export const Route = createRootRoute({
    component: RootLayout,
});
