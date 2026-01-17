import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EnvironmentSetup } from '../environment-setup';

// Mock dependencies
vi.mock('@tanstack/react-router', () => ({
    useNavigate: vi.fn(() => vi.fn()),
    useRouter: vi.fn(() => ({ invalidate: vi.fn() })),
}));

vi.mock('@/lib/headless-client', () => ({
    getClientOptions: vi.fn(() => ({})),
    liferayClient: {
        setConfig: vi.fn(),
    },
}));

vi.mock('@/lib/tauri-client', () => ({
    tauriFetch: vi.fn(() => Promise.resolve({ json: () => Promise.resolve([]) })),
}));

vi.mock('@/lib/db', () => ({
    db: {
        appState: {
            put: vi.fn(),
        },
    },
}));

describe('EnvironmentSetup', () => {
    it('should render environment setup form', () => {
        render(<EnvironmentSetup />);

        expect(screen.getByText('Select an Environment')).toBeInTheDocument();
        expect(screen.getAllByText('New Environment')).toHaveLength(2);
    });
});