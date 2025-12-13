import {
    Download,
    Edit,
    Eye,
    MoreHorizontal,
    Trash2,
    FileJson,
    Columns,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from './ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuCheckboxItem,
} from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import PaginationControls from './ui/pagination';
import { JsonViewer } from './ui/json-viewer';
import { getLocalizedField } from '@/utils';
import { ObjectDefinition } from 'liferay-headless-rest-client/object-admin-v1.0';
import { liferayClient } from '@/lib/headless-client';
import {
    useRouter,
    useNavigate,
    useSearch,
    useParams,
} from '@tanstack/react-router';

type Props = {
    data: any[];
    entriesPage: {
        pageSize: number;
        page: number;
        totalCount: number;
    };
    objectDefinition: ObjectDefinition;
};

export default function JsonToCsvConverter({
    data,
    entriesPage,
    objectDefinition,
}: Props) {
    const [csvOutput, setCsvOutput] = useState('');
    const [headers, setHeaders] = useState<string[]>([]);
    const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
    const [rows, setRows] = useState<string[][]>([]);
    const [selectedJsonData, setSelectedJsonData] = useState<any>(null);
    const { invalidate } = useRouter();
    const navigate = useNavigate({ from: '/p/$externalReferenceCode/' });
    const params = useParams({ from: '/p/$externalReferenceCode/' });
    const search = useSearch({ from: '/p/$externalReferenceCode/' });
    const [columnVisibility, setColumnVisibility] = useState<
        Record<string, boolean>
    >({});

    const currentPage = search.page ?? entriesPage.page;
    const pageSize = search.pageSize ?? entriesPage.pageSize;

    const externalReferenceCode = params.externalReferenceCode;

    const totalPages = Math.max(
        1,
        Math.ceil(entriesPage.totalCount / pageSize)
    );

    const handlePageChange = (page: number) => {
        navigate({
            search: (prev) => ({
                ...prev,
                page,
            }),
        });
    };

    const handlePageSizeChange = (newPageSize: number) => {
        navigate({
            search: (prev) => ({
                ...prev,
                pageSize: newPageSize,
                page: 1, // Reset to first page when changing page size
            }),
        });
    };

    async function onDeleteEntry(entry: any[]) {
        const objectEntryId = entry[0].props.children;

        if (!objectEntryId) {
            return console.log('Object Entry not found');
        }

        await liferayClient.delete({
            url: `${objectDefinition.restContextPath}/${objectEntryId}`,
        });

        await invalidate({
            filter: (route) => {
                // invalidate only the object definition page results

                return route.id.includes(
                    `externalReferenceCode/p/${objectDefinition.externalReferenceCode}`
                );
            },
        });
    }

    const convertJsonToCsv = useCallback(
        (data: any) => {
            try {
                // Parse JSON input
                const jsonData =
                    typeof data === 'object' ? data : JSON.parse(data.trim());

                // Handle different JSON structures
                let dataArray: Record<string, any>[] = [];

                if (Array.isArray(jsonData)) {
                    dataArray = jsonData;
                } else if (typeof jsonData === 'object' && jsonData !== null) {
                    // If it's a single object, wrap it in an array
                    dataArray = [jsonData];
                } else {
                    throw new Error(
                        'Invalid JSON structure. Please provide an array of objects or a single object.'
                    );
                }

                if (dataArray.length === 0) {
                    throw new Error('No data found in the JSON input.');
                }

                // Extract headers (all unique keys from all objects)
                const allHeaders = new Set<string>();
                dataArray.forEach((item) => {
                    Object.keys(item).forEach((key) => allHeaders.add(key));
                });

                const headerArray = [
                    'ID',
                    ...Array.from(allHeaders).filter((value) => value !== 'ID'),
                ];

                setHeaders(headerArray);

                // Load column visibility from localStorage
                const storageKey = `columnVisibility_${externalReferenceCode}`;
                const savedVisibility = localStorage.getItem(storageKey);
                if (savedVisibility) {
                    try {
                        const parsed = JSON.parse(savedVisibility);
                        // Initialize visibility for all headers (default: true)
                        const initialVisibility: Record<string, boolean> = {};
                        headerArray.forEach((header) => {
                            initialVisibility[header] =
                                parsed[header] !== undefined
                                    ? parsed[header]
                                    : true;
                        });
                        setColumnVisibility(initialVisibility);
                    } catch (error) {
                        console.error(
                            'Error parsing column visibility:',
                            error
                        );
                        // Initialize all columns as visible
                        const initialVisibility: Record<string, boolean> = {};
                        headerArray.forEach((header) => {
                            initialVisibility[header] = true;
                        });
                        setColumnVisibility(initialVisibility);
                    }
                } else {
                    // Initialize all columns as visible
                    const initialVisibility: Record<string, boolean> = {};
                    headerArray.forEach((header) => {
                        initialVisibility[header] = true;
                    });
                    setColumnVisibility(initialVisibility);
                }

                // Create CSV content
                const csvRows = dataArray.map((item) => {
                    return headerArray.map((header) => {
                        const value = item[header];
                        // Handle different value types and escape commas and quotes
                        if (value === null || value === undefined) return '';
                        if (typeof value === 'object') return value;
                        return value;
                    });
                });

                setRows(csvRows);

                // Create CSV string
                const csvContent = [
                    headerArray.join(','),
                    ...csvRows.map((row) => row.join(',')),
                ].join('\n');

                setCsvOutput(csvContent);
            } catch (error) {
                console.error(error);
                setCsvOutput('');
                setHeaders([]);
                setRows([]);
            }
        },
        [externalReferenceCode]
    );

    useEffect(() => {
        if (data) {
            convertJsonToCsv(data);
        }
    }, [convertJsonToCsv, data]);

    // Save column visibility to localStorage whenever it changes
    useEffect(() => {
        if (Object.keys(columnVisibility).length > 0 && externalReferenceCode) {
            const storageKey = `columnVisibility_${externalReferenceCode}`;
            localStorage.setItem(storageKey, JSON.stringify(columnVisibility));
        }
    }, [columnVisibility, externalReferenceCode]);

    const toggleColumnVisibility = (header: string) => {
        setColumnVisibility((prev) => ({
            ...prev,
            [header]: !prev[header],
        }));
    };

    const resetColumnVisibility = () => {
        const allVisible: Record<string, boolean> = {};
        headers.forEach((header) => {
            allVisible[header] = true;
        });
        setColumnVisibility(allVisible);
    };

    const visibleHeaders = headers.filter(
        (header) => columnVisibility[header] !== false
    );

    // Calculate how many columns are hidden
    const hiddenColumnsCount = headers.filter(
        (header) => columnVisibility[header] === false
    ).length;

    // Check if any columns have been hidden (changed from default)
    const hasHiddenColumns = hiddenColumnsCount > 0;

    const downloadCsv = () => {
        if (!csvOutput) return;

        const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'converted_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>
                                {`${getLocalizedField(
                                    objectDefinition.label
                                )} (${entriesPage?.totalCount ?? 0})`}
                            </CardTitle>

                            <CardDescription className="mt-1">
                                {objectDefinition.restContextPath}
                            </CardDescription>
                        </div>
                        {csvOutput && headers.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="relative pr-2"
                                    >
                                        <Columns className="h-4 w-4 mr-2" />
                                        <span className="mr-1">Columns</span>
                                        {hasHiddenColumns && (
                                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                                                {hiddenColumnsCount}
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56"
                                >
                                    <div className="flex items-center justify-between px-2 py-1.5">
                                        <DropdownMenuLabel className="px-0">
                                            Toggle Columns
                                        </DropdownMenuLabel>
                                        {hasHiddenColumns && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={resetColumnVisibility}
                                                className="h-7 px-2 text-xs"
                                            >
                                                Reset
                                            </Button>
                                        )}
                                    </div>
                                    <DropdownMenuSeparator />
                                    {headers.map((header) => (
                                        <DropdownMenuCheckboxItem
                                            key={header}
                                            checked={
                                                columnVisibility[header] !==
                                                false
                                            }
                                            onCheckedChange={() =>
                                                toggleColumnVisibility(header)
                                            }
                                        >
                                            {header}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </CardHeader>

                <CardContent>
                    {csvOutput ? (
                        <div className="border rounded-md overflow-auto max-h-[450px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {visibleHeaders.map((header, index) => (
                                            <TableHead key={index}>
                                                {header}
                                            </TableHead>
                                        ))}

                                        <TableHead className="w-12 sticky right-0 bg-background">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {rows.map((row, rowIndex) => (
                                        <TableRow key={rowIndex}>
                                            {row
                                                .map((cell, cellIndex) => ({
                                                    cell,
                                                    cellIndex,
                                                    header: headers[cellIndex],
                                                }))
                                                .filter(
                                                    ({ header }) =>
                                                        columnVisibility[
                                                            header
                                                        ] !== false
                                                )
                                                .map(
                                                    (
                                                        { cell },
                                                        filteredIndex
                                                    ) => {
                                                        const cellType =
                                                            typeof cell;

                                                        let value =
                                                            cell ||
                                                            ('<empty>' as any);

                                                        if (
                                                            React.isValidElement(
                                                                cell
                                                            )
                                                        ) {
                                                            return (
                                                                <TableCell
                                                                    key={`${rowIndex}-${filteredIndex}`}
                                                                >
                                                                    {cell}
                                                                </TableCell>
                                                            );
                                                        }

                                                        if (
                                                            cellType ===
                                                            'object'
                                                        ) {
                                                            return (
                                                                <TableCell
                                                                    key={`${rowIndex}-${filteredIndex}`}
                                                                    className="p-4"
                                                                >
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setSelectedJsonData(
                                                                                cell
                                                                            );
                                                                            setIsJsonModalOpen(
                                                                                true
                                                                            );
                                                                        }}
                                                                        className="gap-2"
                                                                    >
                                                                        <FileJson className="h-4 w-4" />
                                                                        View
                                                                        JSON
                                                                    </Button>
                                                                </TableCell>
                                                            );
                                                        }

                                                        if (
                                                            cellType ===
                                                            'boolean'
                                                        ) {
                                                            value = (
                                                                <Badge
                                                                    variant={
                                                                        cell
                                                                            ? 'default'
                                                                            : 'secondary'
                                                                    }
                                                                >
                                                                    {JSON.stringify(
                                                                        cell
                                                                    )}
                                                                </Badge>
                                                            );
                                                        }

                                                        return (
                                                            <TableCell
                                                                className="p-4"
                                                                key={`${rowIndex}-${filteredIndex}`}
                                                            >
                                                                {value}
                                                            </TableCell>
                                                        );
                                                    }
                                                )}

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

                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() =>
                                                                onDeleteEntry(
                                                                    row
                                                                )
                                                            }
                                                        >
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
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No data available.
                        </div>
                    )}
                </CardContent>

                {csvOutput && headers.length > 0 && (
                    <CardContent className="py-4">
                        <PaginationControls
                            currentCount={rows.length}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                            pageSize={pageSize}
                            totalCount={entriesPage.totalCount}
                            totalPages={totalPages}
                        />
                    </CardContent>
                )}

                {csvOutput && (
                    <CardFooter>
                        <Button onClick={downloadCsv} className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Download CSV
                        </Button>
                    </CardFooter>
                )}
            </Card>

            <Dialog open={isJsonModalOpen} onOpenChange={setIsJsonModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>JSON Viewer</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden min-h-0">
                        {selectedJsonData && (
                            <JsonViewer
                                data={selectedJsonData}
                                defaultExpanded={true}
                                maxDepth={10}
                                className="h-full"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
