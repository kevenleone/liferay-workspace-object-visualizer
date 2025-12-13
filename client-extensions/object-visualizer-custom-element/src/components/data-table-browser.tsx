'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Search,
    Filter,
    Download,
    RefreshCw,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataTableBrowserProps {
    objectName: string;
}

// Mock data for different objects
const mockData: Record<string, any[]> = {
    Report: [
        {
            ID: 192167,
            Name: 'totalAmount',
            Value: '(USD=2000)',
            Status: 'APPROVED',
            Author: 'default-service-account',
            'Create Date': '2024-01-15',
            'Modified Date': '2024-01-15',
            'External Reference Code': 'd1fdfff8-5421-5d83-0189-3bcdaadbfc',
        },
        {
            ID: 192169,
            Name: 'projectsUsingMarketplace',
            Value: '()',
            Status: 'APPROVED',
            Author: 'default-service-account',
            'Create Date': '2024-01-16',
            'Modified Date': '2024-01-16',
            'External Reference Code': 'e2fefff9-6532-6e94-0290-4cdebbecgd',
        },
        {
            ID: 192170,
            Name: 'quarterlyRevenue',
            Value: '(USD=15000)',
            Status: 'PENDING',
            Author: 'john.doe',
            'Create Date': '2024-01-17',
            'Modified Date': '2024-01-17',
            'External Reference Code': 'f3gfggg0-7643-7fa5-0391-5defccfdhe',
        },
        {
            ID: 192171,
            Name: 'userEngagement',
            Value: '(75%)',
            Status: 'APPROVED',
            Author: 'jane.smith',
            'Create Date': '2024-01-18',
            'Modified Date': '2024-01-18',
            'External Reference Code': 'g4hghhh1-8754-8gb6-0492-6efgddeif',
        },
    ],
    User: [
        {
            ID: 1001,
            Email: 'john.doe@example.com',
            'First Name': 'John',
            'Last Name': 'Doe',
            Active: true,
            'Create Date': '2023-12-01',
            'Modified Date': '2024-01-10',
        },
        {
            ID: 1002,
            Email: 'jane.smith@example.com',
            'First Name': 'Jane',
            'Last Name': 'Smith',
            Active: true,
            'Create Date': '2023-12-02',
            'Modified Date': '2024-01-11',
        },
        {
            ID: 1003,
            Email: 'bob.wilson@example.com',
            'First Name': 'Bob',
            'Last Name': 'Wilson',
            Active: false,
            'Create Date': '2023-12-03',
            'Modified Date': '2024-01-12',
        },
    ],
};

type SortDirection = 'asc' | 'desc' | null;

export function DataTableBrowser({ objectName }: DataTableBrowserProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    const data = mockData[objectName] || [];
    const columns = data.length > 0 ? Object.keys(data[0]) : [];

    // Filter and sort data
    const filteredAndSortedData = useMemo(() => {
        const filtered = data.filter((row) =>
            Object.values(row).some((value) =>
                String(value).toLowerCase().includes(searchQuery.toLowerCase())
            )
        );

        if (sortColumn && sortDirection) {
            filtered.sort((a, b) => {
                const aVal = a[sortColumn];
                const bVal = b[sortColumn];

                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }

                const aStr = String(aVal).toLowerCase();
                const bStr = String(bVal).toLowerCase();

                if (sortDirection === 'asc') {
                    return aStr.localeCompare(bStr);
                } else {
                    return bStr.localeCompare(aStr);
                }
            });
        }

        return filtered;
    }, [data, searchQuery, sortColumn, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredAndSortedData.slice(
        startIndex,
        startIndex + pageSize
    );

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else if (sortDirection === 'desc') {
                setSortColumn(null);
                setSortDirection(null);
            } else {
                setSortDirection('asc');
            }
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRows(
                new Set(paginatedData.map((_, index) => startIndex + index))
            );
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleSelectRow = (index: number, checked: boolean) => {
        const newSelected = new Set(selectedRows);
        const actualIndex = startIndex + index;

        if (checked) {
            newSelected.add(actualIndex);
        } else {
            newSelected.delete(actualIndex);
        }

        setSelectedRows(newSelected);
    };

    const getSortIcon = (column: string) => {
        if (sortColumn !== column) return <ArrowUpDown className="h-4 w-4" />;
        if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4" />;
        if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4" />;
        return <ArrowUpDown className="h-4 w-4" />;
    };

    const formatCellValue = (value: any, column: string) => {
        if (typeof value === 'boolean') {
            return (
                <Badge variant={value ? 'default' : 'secondary'}>
                    {value ? 'Active' : 'Inactive'}
                </Badge>
            );
        }

        if (column === 'Status') {
            return (
                <Badge
                    variant={
                        value === 'APPROVED'
                            ? 'default'
                            : value === 'PENDING'
                            ? 'secondary'
                            : 'destructive'
                    }
                >
                    {value}
                </Badge>
            );
        }

        return String(value);
    };

    if (data.length === 0) {
        return (
            <div className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                    No data available for {objectName}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                            {objectName} Data ({filteredAndSortedData.length}{' '}
                            entries)
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search data..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </Button>
                        {selectedRows.size > 0 && (
                            <Badge variant="secondary">
                                {selectedRows.size} selected
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="w-full overflow-x-auto">
                        <div className="min-w-full">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12 sticky left-0 bg-background">
                                            <Checkbox
                                                checked={
                                                    selectedRows.size ===
                                                        paginatedData.length &&
                                                    paginatedData.length > 0
                                                }
                                                onCheckedChange={
                                                    handleSelectAll
                                                }
                                            />
                                        </TableHead>
                                        {columns.map((column) => (
                                            <TableHead
                                                key={column}
                                                className="min-w-32 whitespace-nowrap"
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleSort(column)
                                                    }
                                                    className="h-auto p-0 font-medium hover:bg-transparent"
                                                >
                                                    <span className="mr-2">
                                                        {column}
                                                    </span>
                                                    {getSortIcon(column)}
                                                </Button>
                                            </TableHead>
                                        ))}
                                        <TableHead className="w-12 sticky right-0 bg-background">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedData.map((row, index) => (
                                        <TableRow
                                            key={startIndex + index}
                                            className={cn(
                                                'hover:bg-muted/50',
                                                selectedRows.has(
                                                    startIndex + index
                                                ) && 'bg-muted'
                                            )}
                                        >
                                            <TableCell className="sticky left-0 bg-background">
                                                <Checkbox
                                                    checked={selectedRows.has(
                                                        startIndex + index
                                                    )}
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleSelectRow(
                                                            index,
                                                            checked as boolean
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                            {columns.map((column) => (
                                                <TableCell
                                                    key={column}
                                                    className="font-mono text-sm whitespace-nowrap max-w-48 truncate"
                                                >
                                                    {formatCellValue(
                                                        row[column],
                                                        column
                                                    )}
                                                </TableCell>
                                            ))}
                                            <TableCell className="sticky right-0 bg-background">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive">
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Rows per page:
                            </span>
                            <Select
                                value={String(pageSize)}
                                onValueChange={(value) =>
                                    setPageSize(Number(value))
                                }
                            >
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Showing {startIndex + 1} to{' '}
                                {Math.min(
                                    startIndex + pageSize,
                                    filteredAndSortedData.length
                                )}{' '}
                                of {filteredAndSortedData.length} entries
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm px-3">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
