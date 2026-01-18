import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/lib/db';

import { QueryInterface } from '../query-interface';

// Mock the router
vi.mock('@tanstack/react-router', () => ({
    useNavigate: vi.fn(),
    useRouteContext: vi.fn(() => ({ shadowRoot: null })),
    useSearch: vi.fn(),
}));

// Mock the DB
vi.mock('@/lib/db', () => ({
    db: {
        odataHistory: {
            add: vi.fn(),
            delete: vi.fn(),
            where: vi.fn(() => ({
                equals: vi.fn(() => ({
                    reverse: vi.fn(() => ({
                        sortBy: vi.fn(() => []),
                    })),
                })),
            })),
        },
    },
}));

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
    useLiveQuery: vi.fn(() => []),
}));

import { useNavigate, useSearch } from '@tanstack/react-router';
import { useLiveQuery } from 'dexie-react-hooks';

const mockUseNavigate = useNavigate as any;
const mockUseSearch = useSearch as any;
const mockUseLiveQuery = useLiveQuery as any;
const mockDbAdd = db.odataHistory.add as any;

const mockObjectDefinition = {
    name: 'TestObject',
    restContextPath: '/test-objects',
};

const defaultProps = {
    externalReferenceCode: 'test-erc',
    objectDefinition: mockObjectDefinition,
    onQueryExecute: vi.fn(),
    showHistory: true,
};

describe('QueryInterface', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseNavigate.mockReturnValue(vi.fn());
        mockUseSearch.mockReturnValue({ pageSize: 10, query: '' });
        mockUseLiveQuery.mockReturnValue([]);
    });

    it('should render the component correctly', () => {
        render(<QueryInterface {...defaultProps} />);

        expect(screen.getByText('REST API Query Builder')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter OData query parameters/)).toBeInTheDocument();
        expect(screen.getByText('Execute Query')).toBeInTheDocument();
    });

    it('should update current query when search params change', () => {
        mockUseSearch.mockReturnValue({ pageSize: 10, query: '$top=10' });

        render(<QueryInterface {...defaultProps} />);

        const textarea = screen.getByPlaceholderText(/Enter OData query parameters/);
        expect(textarea).toHaveValue('$top=10');
    });

    it('should execute query on button click', async () => {
        const mockNavigate = vi.fn();
        mockUseNavigate.mockReturnValue(mockNavigate);

        render(<QueryInterface {...defaultProps} />);

        const textarea = screen.getByPlaceholderText(/Enter OData query parameters/);
        const executeButton = screen.getByText('Execute Query');

        await userEvent.type(textarea, '$filter=status eq \'active\'');
        await userEvent.click(executeButton);

        expect(mockNavigate).toHaveBeenCalledWith({
            params: { externalReferenceCode: 'test-erc' },
            replace: false,
            search: expect.objectContaining({
                page: 1,
                pageSize: 10,
                query: '$filter=status eq \'active\'',
            }),
            to: '/p/$externalReferenceCode/query',
        });
        expect(defaultProps.onQueryExecute).toHaveBeenCalledWith('$filter=status eq \'active\'');
        expect(mockDbAdd).toHaveBeenCalled();
    });

    it('should save query with name', async () => {
        render(<QueryInterface {...defaultProps} />);

        const textarea = screen.getByPlaceholderText(/Enter OData query parameters/);
        const nameInput = screen.getByPlaceholderText('Query name (optional, for saving)');
        const saveButton = screen.getByText('Save');

        await userEvent.type(textarea, '$top=5');
        await userEvent.type(nameInput, 'Test Query');
        await userEvent.click(saveButton);

        expect(mockDbAdd).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Test Query',
            query: '$top=5',
        }));
    });

    it('should display API endpoint correctly', () => {
        render(<QueryInterface {...defaultProps} />);

        expect(screen.getByText('GET /test-objects')).toBeInTheDocument();
    });

    it('should show query history when available', () => {
        const historyItem = {
            duration: '0.123s',
            endpoint: '/test-objects',
            executedAt: '2023-01-01T00:00:00.000Z',
            id: '1',
            query: '$top=10',
            status: 'success',
        };

        mockUseLiveQuery.mockReturnValue([historyItem]);

        render(<QueryInterface {...defaultProps} />);

        expect(screen.getByText('Query History')).toBeInTheDocument();
        expect(screen.getAllByText('GET /test-objects')).toHaveLength(2);
    });
});