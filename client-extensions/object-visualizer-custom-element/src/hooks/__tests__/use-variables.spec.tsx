import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVariables, useVariablesFlat } from '../use-variables';
import { variablesStore } from '@/store/variables-store';

// Mock the store
vi.mock('@xstate/store/react', () => ({
    useSelector: vi.fn(),
}));

// Mock the router
vi.mock('@tanstack/react-router', () => ({
    useParams: vi.fn(),
    useRouteContext: vi.fn(() => ({ shadowRoot: null })),
}));

// Mock the variables store
vi.mock('@/store/variables-store', () => ({
    variablesStore: {
        send: vi.fn(),
    },
}));

import { useSelector } from '@xstate/store/react';
import { useParams } from '@tanstack/react-router';

const mockUseSelector = useSelector as any;
const mockUseParams = useParams as any;
const mockSend = variablesStore.send as any;

describe('useVariablesFlat', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return replaceVariables function that replaces variables with custom markup', () => {
        const variables = { name: 'John', age: '25' };
        mockUseSelector.mockReturnValue({
            context: { variables: { someKey: variables } },
        });

        const { result } = renderHook(() => useVariablesFlat());

        const replaced = result.current.replaceVariables('Hello name, you are age years old', 'someKey', true);
        expect(replaced).toBe('Hello name, you are age years old');
    });

    it('should return replaceVariables function that replaces variables without custom markup', () => {
        const variables = { name: 'John', age: '25' };
        mockUseSelector.mockReturnValue({
            context: { variables: { someKey: variables } },
        });

        const { result } = renderHook(() => useVariablesFlat());

        const replaced = result.current.replaceVariables('Hello name, you are age years old', 'someKey', false);
        expect(replaced).toBe('Hello name, you are age years old');
    });
});

describe('useVariables', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return variables for the given externalReferenceCode', () => {
        const externalReferenceCode = 'test-erc';
        const variables = { name: 'John' };
        const allVariables = { [externalReferenceCode]: variables };

        mockUseParams.mockReturnValue({ externalReferenceCode });
        mockUseSelector.mockReturnValue(allVariables);

        const { result } = renderHook(() => useVariables());

        expect(result.current.variables).toEqual(variables);
    });

    it('should return empty object if no variables for externalReferenceCode', () => {
        const externalReferenceCode = 'test-erc';
        const allVariables = {};

        mockUseParams.mockReturnValue({ externalReferenceCode });
        mockUseSelector.mockReturnValue(allVariables);

        const { result } = renderHook(() => useVariables());

        expect(result.current.variables).toEqual({});
    });

    it('should replace variables with custom markup', () => {
        const externalReferenceCode = 'test-erc';
        const variables = { name: 'John' };
        const allVariables = { [externalReferenceCode]: variables };

        mockUseParams.mockReturnValue({ externalReferenceCode });
        mockUseSelector.mockReturnValue(allVariables);

        const { result } = renderHook(() => useVariables());

        const replaced = result.current.replaceVariables('Hello name');
        expect(replaced).toBe('Hello <mark class="variable-highlight" title="name">John</mark>');
    });

    it('should call setVariables with new values', () => {
        const externalReferenceCode = 'test-erc';
        const variables = { name: 'John' };
        const allVariables = { [externalReferenceCode]: variables };

        mockUseParams.mockReturnValue({ externalReferenceCode });
        mockUseSelector.mockReturnValue(allVariables);

        const { result } = renderHook(() => useVariables());

        result.current.setVariables({ age: '25' });

        expect(mockSend).toHaveBeenCalledWith({
            externalReferenceCode,
            values: { age: '25' },
            type: 'setVariables',
        });
    });
});