import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsMobile } from '../use-mobile';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock window
Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
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