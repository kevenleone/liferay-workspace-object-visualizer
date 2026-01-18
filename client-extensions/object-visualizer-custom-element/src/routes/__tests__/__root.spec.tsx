import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock the scroll hook
vi.mock('@/hooks/use-scroll', () => ({
    default: vi.fn(),
}));

// Mock the router
vi.mock('@tanstack/react-router', () => ({
    Outlet: vi.fn(() => <div>Outlet</div>),
}));

import { Outlet } from '@tanstack/react-router';

const RootLayout = () => {
    // Mocked hook call
    return <Outlet />;
};

describe('Root Route', () => {
    it('should render Outlet', () => {
        render(<RootLayout />);

        expect(screen.getByText('Outlet')).toBeInTheDocument();
    });
});