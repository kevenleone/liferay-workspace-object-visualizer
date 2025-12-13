'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Play,
    Save,
    History,
    Download,
    Copy,
    Trash2,
    Clock,
    CheckCircle,
    XCircle,
    MoreHorizontal,
    Globe,
} from 'lucide-react';

interface QueryInterfaceProps {
    objectName: string;
}

const odataTemplates = {
    Report: [
        {
            name: 'All Reports',
            query: ``,
            description: 'Fetch all reports with basic fields',
        },
        {
            name: 'Approved Reports This Year',
            query: `$filter=status eq 'APPROVED' and createDate gt 2025-01-01T00:00:00Z&$orderby=modifiedDate desc`,
            description: 'Get approved reports created this year',
        },
        {
            name: 'Reports by Author',
            query: `$filter=contains(authorEmailAddress, 'test@user.com')&$select=name,value,status,author&$orderby=createDate desc`,
            description: 'Filter reports by specific author email',
        },
        {
            name: 'Reports with Name Pattern',
            query: `$filter=contains(name, 'Product_') and status eq 'APPROVED'&$top=50`,
            description: 'Find reports with specific name pattern',
        },
    ],
    User: [
        {
            name: 'Active Users',
            query: `$filter=active eq true&$select=firstName,lastName,emailAddress&$orderby=lastName,firstName`,
            description: 'Get all active users',
        },
        {
            name: 'Recent Users',
            query: `$filter=createDate gt 2025-01-01T00:00:00Z&$orderby=createDate desc&$top=20`,
            description: 'Users created this year',
        },
    ],
    Order: [
        {
            name: 'Paid Orders This Year',
            query: `$filter=orderDate gt 2025-01-01T00:00:00Z and status eq 'PAID'&$orderby=orderDate desc`,
            description: 'All paid orders from this year',
        },
        {
            name: 'Orders by Customer',
            query: `$filter=creatorEmailAddress eq 'test@user.com' and contains(name, 'Product_')&$expand=orderItems`,
            description: 'Orders for specific customer with product filter',
        },
    ],
};

const mockQueryHistory = [
    {
        id: 1,
        query: `$filter=status eq 'APPROVED'&$orderby=modifiedDate desc&$top=10`,
        executedAt: '2024-01-19 10:30:00',
        duration: '0.045s',
        status: 'success',
        rowCount: 15,
        endpoint: '/o/c/reports',
    },
    {
        id: 2,
        query: `$filter=active eq true&$count=true`,
        executedAt: '2024-01-19 10:25:00',
        duration: '0.023s',
        status: 'success',
        rowCount: 1,
        endpoint: '/o/c/users',
    },
    {
        id: 3,
        query: `$filter=invalidField eq 'test'`,
        executedAt: '2024-01-19 10:20:00',
        duration: '0.001s',
        status: 'error',
        error: "Invalid field 'invalidField' in filter expression",
        endpoint: '/o/c/reports',
    },
];

// Mock query results
const mockQueryResults = [
    {
        ID: 192167,
        Name: 'totalAmount',
        Value: '(USD=2000)',
        Status: 'APPROVED',
        Author: 'default-service-account',
    },
    {
        ID: 192169,
        Name: 'projectsUsingMarketplace',
        Value: '()',
        Status: 'APPROVED',
        Author: 'default-service-account',
    },
];

export function QueryInterface({ objectName }: QueryInterfaceProps) {
    const [currentQuery, setCurrentQuery] = useState('');
    const [queryResults, setQueryResults] = useState<any[] | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionTime, setExecutionTime] = useState<string | null>(null);
    const [queryError, setQueryError] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [resultFormat, setResultFormat] = useState<'table' | 'json'>('table');

    const templates =
        odataTemplates[objectName as keyof typeof odataTemplates] || [];

    const executeQuery = async () => {
        if (!currentQuery.trim() && currentQuery !== '') return;

        setIsExecuting(true);
        setQueryError(null);
        setQueryResults(null);

        // Simulate API call execution
        setTimeout(() => {
            try {
                if (
                    currentQuery.includes('drop') ||
                    currentQuery.includes('delete')
                ) {
                    throw new Error(
                        'Destructive operations are not supported via OData queries'
                    );
                }

                setQueryResults(mockQueryResults);
                setExecutionTime('0.045s');
            } catch (error) {
                setQueryError(
                    error instanceof Error
                        ? error.message
                        : 'API request failed'
                );
            } finally {
                setIsExecuting(false);
            }
        }, 1000);
    };

    const loadTemplate = (template: string) => {
        const selectedTemp = templates.find((t) => t.name === template);
        if (selectedTemp) {
            setCurrentQuery(selectedTemp.query);
        }
    };

    const getApiEndpoint = () => {
        const baseUrl = `/o/c/${objectName.toLowerCase()}s`;
        return currentQuery ? `${baseUrl}?${currentQuery}` : baseUrl;
    };

    const formatQueryResult = (value: any) => {
        if (typeof value === 'boolean') {
            return (
                <Badge variant={value ? 'default' : 'secondary'}>
                    {value ? 'true' : 'false'}
                </Badge>
            );
        }
        return String(value);
    };

    return (
        <div className="space-y-4">
            {/* Query Editor */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            REST API Query Builder
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Select
                                value={selectedTemplate}
                                onValueChange={(value) => {
                                    setSelectedTemplate(value);
                                    loadTemplate(value);
                                }}
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Load template..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map((template) => (
                                        <SelectItem
                                            key={template.name}
                                            value={template.name}
                                        >
                                            <div>
                                                <div className="font-medium">
                                                    {template.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {template.description}
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm">
                                <Save className="h-4 w-4 mr-2" />
                                Save
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="p-3 bg-muted rounded-lg">
                            <div className="text-sm font-medium mb-1">
                                API Endpoint:
                            </div>
                            <code className="text-sm text-muted-foreground break-all">
                                GET {getApiEndpoint()}
                            </code>
                        </div>

                        <Textarea
                            placeholder={`Enter OData query parameters for ${objectName}:

Examples:
• $filter=status eq 'APPROVED' and createDate gt 2025-01-01T00:00:00Z
• $filter=contains(name, 'Product_') and active eq true
• $orderby=modifiedDate desc&$top=50&$skip=0
• $select=name,status,author&$expand=relatedObject

Leave empty to fetch all records with default pagination.`}
                            value={currentQuery}
                            onChange={(e) => setCurrentQuery(e.target.value)}
                            className="min-h-32 font-mono text-sm"
                        />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={executeQuery}
                                    disabled={isExecuting}
                                >
                                    <Play className="h-4 w-4 mr-2" />
                                    {isExecuting
                                        ? 'Fetching...'
                                        : 'Execute Query'}
                                </Button>
                                {executionTime && (
                                    <Badge
                                        variant="outline"
                                        className="text-green-600"
                                    >
                                        <Clock className="h-3 w-3 mr-1" />
                                        {executionTime}
                                    </Badge>
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Target:{' '}
                                <span className="font-medium">
                                    {objectName}
                                </span>{' '}
                                API
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results and History */}
            <Tabs defaultValue="results" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="results">API Results</TabsTrigger>
                    <TabsTrigger value="history">Query History</TabsTrigger>
                </TabsList>

                <TabsContent value="results">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Results</CardTitle>
                                {queryResults && (
                                    <div className="flex items-center gap-2">
                                        <Select
                                            value={resultFormat}
                                            onValueChange={(
                                                value: 'table' | 'json'
                                            ) => setResultFormat(value)}
                                        >
                                            <SelectTrigger className="w-24">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="table">
                                                    Table
                                                </SelectItem>
                                                <SelectItem value="json">
                                                    JSON
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Badge variant="outline">
                                            {queryResults.length} rows
                                        </Badge>
                                        <Button variant="outline" size="sm">
                                            <Download className="h-4 w-4 mr-2" />
                                            Export
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {queryError && (
                                <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                                    <XCircle className="h-4 w-4" />
                                    <span className="font-medium">
                                        API Error:
                                    </span>
                                    <span>{queryError}</span>
                                </div>
                            )}

                            {isExecuting && (
                                <div className="flex items-center justify-center py-12">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                        Fetching data from API...
                                    </div>
                                </div>
                            )}

                            {queryResults && queryResults.length > 0 && (
                                <div className="overflow-auto">
                                    {resultFormat === 'table' ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    {Object.keys(
                                                        queryResults[0]
                                                    ).map((column) => (
                                                        <TableHead key={column}>
                                                            {column}
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {queryResults.map(
                                                    (row, index) => (
                                                        <TableRow key={index}>
                                                            {Object.values(
                                                                row
                                                            ).map(
                                                                (
                                                                    value,
                                                                    cellIndex
                                                                ) => (
                                                                    <TableCell
                                                                        key={
                                                                            cellIndex
                                                                        }
                                                                        className="font-mono text-sm"
                                                                    >
                                                                        {formatQueryResult(
                                                                            value
                                                                        )}
                                                                    </TableCell>
                                                                )
                                                            )}
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                                            {JSON.stringify(
                                                queryResults,
                                                null,
                                                2
                                            )}
                                        </pre>
                                    )}
                                </div>
                            )}

                            {queryResults && queryResults.length === 0 && (
                                <div className="text-center py-12">
                                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                    <p className="text-muted-foreground">
                                        API request successful but returned no
                                        results.
                                    </p>
                                </div>
                            )}

                            {!queryResults && !isExecuting && !queryError && (
                                <div className="text-center py-12">
                                    <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">
                                        Execute a query to see API results here.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5" />
                                Query History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-96">
                                <div className="space-y-3">
                                    {mockQueryHistory.map((historyItem) => (
                                        <div
                                            key={historyItem.id}
                                            className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    {historyItem.status ===
                                                    'success' ? (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                    )}
                                                    <span className="text-sm text-muted-foreground">
                                                        {historyItem.executedAt}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {historyItem.duration}
                                                    </Badge>
                                                    {historyItem.status ===
                                                        'success' && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {
                                                                historyItem.rowCount
                                                            }{' '}
                                                            rows
                                                        </Badge>
                                                    )}
                                                </div>
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
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setCurrentQuery(
                                                                    historyItem.query
                                                                )
                                                            }
                                                        >
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Load Query
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive">
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-xs text-muted-foreground">
                                                    GET {historyItem.endpoint}
                                                </div>
                                                <code className="text-sm bg-muted p-2 rounded block overflow-x-auto">
                                                    {historyItem.query ||
                                                        '(no parameters)'}
                                                </code>
                                            </div>
                                            {historyItem.error && (
                                                <div className="mt-2 text-sm text-destructive">
                                                    {historyItem.error}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
