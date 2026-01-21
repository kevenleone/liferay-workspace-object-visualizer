import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import JsonToCsvConverter from '../dynamic-table';

// Mock dependencies
vi.mock('@/utils', () => ({
    getLocalizedField: vi.fn((label) => label?.en_US || 'Default'),
}));

vi.mock('@/lib/headless-client', () => ({
    liferayClient: {
        delete: vi.fn(),
    },
}));

vi.mock('@tanstack/react-router', () => ({
    useLocation: vi.fn(() => ({ pathname: '/p/test-erc' })),
    useNavigate: vi.fn(() => vi.fn()),
    useParams: vi.fn(() => ({ externalReferenceCode: 'test-erc' })),
    useRouter: vi.fn(() => ({ invalidate: vi.fn() })),
    useSearch: vi.fn(() => ({ page: 1, pageSize: 10 })),
}));

vi.mock('@/lib/db', () => ({
    db: {
        columnVisibility: {
            get: vi.fn(() => Promise.resolve({ visibility: {} })),
            put: vi.fn(),
        },
    },
}));

vi.mock('dexie-react-hooks', () => ({
    useLiveQuery: vi.fn(() => []),
}));

// Mock UI components
vi.mock('@/components/ui/table', () => ({
    Table: ({ children }: any) => <table>{children}</table>,
    TableBody: ({ children }: any) => <tbody>{children}</tbody>,
    TableCell: ({ children }: any) => <td>{children}</td>,
    TableHead: ({ children }: any) => <th>{children}</th>,
    TableHeader: ({ children }: any) => <thead>{children}</thead>,
    TableRow: ({ children }: any) => <tr>{children}</tr>,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

vi.mock('@/components/ui/badge', () => ({
    Badge: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
    DropdownMenu: ({ children }: any) => <div>{children}</div>,
    DropdownMenuCheckboxItem: ({ children, checked }: any) => <div>{checked ? 'Checked' : 'Unchecked'} {children}</div>,
    DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
    DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
    DropdownMenuSeparator: () => <hr />,
    DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children }: any) => <div>{children}</div>,
    DialogContent: ({ children }: any) => <div>{children}</div>,
    DialogHeader: ({ children }: any) => <div>{children}</div>,
    DialogTitle: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/card', () => ({
    Card: ({ children }: any) => <div>{children}</div>,
    CardContent: ({ children }: any) => <div>{children}</div>,
    CardDescription: ({ children }: any) => <div>{children}</div>,
    CardFooter: ({ children }: any) => <div>{children}</div>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardTitle: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/pagination', () => ({
    default: () => <div>Pagination</div>,
}));

vi.mock('@/components/ui/json-viewer', () => ({
    JsonViewer: () => <div>JSON Viewer</div>,
}));

const mockObjectDefinition = {
    externalReferenceCode: 'test-erc',
    label: { en_US: 'Test Object' },
    name: 'TestObject',
    restContextPath: '/test-objects',
};

const mockData = [
    { id: 1, name: 'Item 1', status: 'active' },
    { id: 2, name: 'Item 2', status: 'inactive' },
];

describe('JsonToCsvConverter', () => {
    it('should render table with data', () => {
        render(
            <JsonToCsvConverter
                data={mockData}
                entriesPage={{ items: mockData, page: 1, pageSize: 10, totalCount: 2 }}
                objectDefinition={mockObjectDefinition}
            />
        );

        expect(screen.getByText('Test Object (2)')).toBeInTheDocument();
        expect(screen.getByText('Download CSV')).toBeInTheDocument();
    });

    it('should show no data message when no data', () => {
        render(
            <JsonToCsvConverter
                data={[]}
                entriesPage={{ items: [], page: 1, pageSize: 10, totalCount: 0 }}
                objectDefinition={mockObjectDefinition}
            />
        );

        expect(screen.getByText('No data available.')).toBeInTheDocument();
    });
});