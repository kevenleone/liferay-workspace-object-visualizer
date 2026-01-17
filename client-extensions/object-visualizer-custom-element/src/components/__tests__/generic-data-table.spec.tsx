import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GenericDataTable } from '../generic-data-table';

const mockData = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
];

const mockColumns = [
    { header: 'ID', accessorKey: 'id' as const },
    { header: 'Name', accessorKey: 'name' as const },
];

describe('GenericDataTable', () => {
    it('should render table with data', () => {
        render(
            <GenericDataTable
                title="Test Table"
                data={mockData}
                columns={mockColumns}
            />
        );

        expect(screen.getByText('Test Table (2)')).toBeInTheDocument();
        expect(screen.getByText('ID')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('should show no results when no data', () => {
        render(
            <GenericDataTable
                title="Empty Table"
                data={[]}
                columns={mockColumns}
            />
        );

        expect(screen.getByText('No results.')).toBeInTheDocument();
    });
});