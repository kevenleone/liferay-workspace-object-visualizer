import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useIsMobile } from '../use-mobile';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    value: vi.fn().mockImplementation(query => ({
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: false,
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
        removeListener: vi.fn(),
    })),
    writable: true,
});

// Mock window
Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: 1024,
    writable: true,
});

describe('useMobile', () => {
    it('should return false for desktop width', () => {
        window.innerWidth = 1024;
        window.dispatchEvent(new Event('resize'));

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(false);
    });

    it('should return true for mobile width', () => {
        window.innerWidth = 600;
        window.dispatchEvent(new Event('resize'));

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(true);
    });
});