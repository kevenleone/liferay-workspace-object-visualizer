import { createRootRoute, Outlet } from '@tanstack/react-router';
import useScrollUnlocked from '@/hooks/use-scroll';

const RootLayout = () => {
    useScrollUnlocked();

    return <Outlet />;
};

export const Route = createRootRoute({
    component: RootLayout,
});
