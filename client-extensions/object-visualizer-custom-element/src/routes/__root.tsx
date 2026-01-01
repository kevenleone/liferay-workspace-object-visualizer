import useScrollUnlocked from '@/hooks/use-scroll';
import { createRootRoute, Outlet } from '@tanstack/react-router';

const RootLayout = () => {
    useScrollUnlocked();

    return (
        <div id="main-outlet">
            <Outlet />
        </div>
    );
};

export const Route = createRootRoute({
    component: RootLayout,
});
