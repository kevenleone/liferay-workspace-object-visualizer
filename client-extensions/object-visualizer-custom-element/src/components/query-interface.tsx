'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    Trash2,
    Clock,
    CheckCircle,
    XCircle,
    MoreHorizontal,
    Globe,
    Copy,
} from 'lucide-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { ObjectDefinition } from 'liferay-headless-rest-client/object-admin-v1.0';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ODataHistoryItem } from '@/lib/db';

interface QueryInterfaceProps {
    objectDefinition: ObjectDefinition;
    externalReferenceCode: string;
    onQueryExecute?: (query: string) => void;
    showHistory?: boolean;
}

export function QueryInterface({
    objectDefinition,
    externalReferenceCode,
    onQueryExecute,
    showHistory = true,
}: QueryInterfaceProps) {
    const navigate = useNavigate({ from: '/p/$externalReferenceCode/query' });
    const search = useSearch({ from: '/p/$externalReferenceCode/query' });
    const [currentQuery, setCurrentQuery] = useState(search.query || '');
    const [queryName, setQueryName] = useState('');

    const restContextPath = objectDefinition.restContextPath || '';

    const queryHistory =
        useLiveQuery(() =>
            db.odataHistory
                .where('endpoint')
                .equals(restContextPath)
                .reverse()
                .sortBy('executedAt'),
        ) || [];

    // Update current query when search params change
    useEffect(() => {
        if (search.query !== undefined) {
            setCurrentQuery(search.query);
        }
    }, [search.query]);

    const executeQuery = async () => {
        const startTime = performance.now();

        // Navigate with query parameter to trigger loader
        navigate({
            to: '/p/$externalReferenceCode/query',
            params: { externalReferenceCode },
            search: {
                query: currentQuery,
                page: 1, // Reset to first page
                pageSize: search.pageSize ?? 10,
            },
            replace: false,
        });

        onQueryExecute?.(currentQuery);

        // Save to history after execution
        const endTime = performance.now();
        const duration = `${((endTime - startTime) / 1000).toFixed(3)}s`;

        // We'll update history after the query completes (in the route component)
        // For now, just add a pending entry
        const historyItem: ODataHistoryItem = {
            id: Date.now().toString(),
            query: currentQuery,
            executedAt: new Date().toISOString(),
            duration,
            status: 'success',
            endpoint: restContextPath,
        };

        await db.odataHistory.add(historyItem);
    };

    const saveQuery = async () => {
        if (!currentQuery.trim() || !queryName.trim()) return;

        const historyItem: ODataHistoryItem = {
            id: Date.now().toString(),
            query: currentQuery,
            executedAt: new Date().toISOString(),
            status: 'success',
            endpoint: restContextPath,
            name: queryName.trim(),
        };

        await db.odataHistory.add(historyItem);
        setQueryName('');
    };

    const loadQuery = (query: string) => {
        setCurrentQuery(query);
        navigate({
            to: '/p/$externalReferenceCode/query',
            params: { externalReferenceCode },
            search: {
                query,
                page: 1,
                pageSize: search.pageSize ?? 10,
            },
            replace: false,
        });
    };

    const deleteQuery = async (id: string) => {
        await db.odataHistory.delete(id);
    };

    const getApiEndpoint = () => {
        const baseUrl = restContextPath || '';
        return currentQuery ? `${baseUrl}?${currentQuery}` : baseUrl;
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
                                onValueChange={(id) => {
                                    const item = queryHistory.find(
                                        (h) => h.id === id,
                                    );
                                    if (item) {
                                        loadQuery(item.query);
                                    }
                                }}
                            >
                                <SelectTrigger className="w-64">
                                    <SelectValue placeholder="Load saved query" />
                                </SelectTrigger>
                                <SelectContent>
                                    {queryHistory
                                        .filter((h) => h.name)
                                        .map((h) => (
                                            <SelectItem key={h.id} value={h.id}>
                                                {h.name}
                                            </SelectItem>
                                        ))}
                                    {queryHistory.filter((h) => h.name)
                                        .length === 0 && (
                                        <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                            No saved queries
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={saveQuery}
                                disabled={
                                    !currentQuery.trim() || !queryName.trim()
                                }
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Query name (optional, for saving)"
                                value={queryName}
                                onChange={(e) => setQueryName(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                            <div className="text-sm font-medium mb-1">
                                API Endpoint:
                            </div>
                            <code className="text-sm text-muted-foreground break-all">
                                GET {getApiEndpoint()}
                            </code>
                        </div>

                        <Textarea
                            placeholder={`Enter OData query parameters:

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
                                    disabled={!currentQuery.trim()}
                                >
                                    <Play className="h-4 w-4 mr-2" />
                                    Execute Query
                                </Button>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Target:{' '}
                                <span className="font-medium">
                                    {objectDefinition.name}
                                </span>{' '}
                                API
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Query History */}
            {showHistory && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Query History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-96">
                            {queryHistory.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    No query history yet. Execute a query to
                                    save it here.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {queryHistory.map((historyItem) => (
                                        <div
                                            key={historyItem.id}
                                            className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {historyItem.status ===
                                                    'success' ? (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                    )}
                                                    <span className="text-sm text-muted-foreground">
                                                        {historyItem.executedAt}
                                                    </span>
                                                    {historyItem.duration && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            {
                                                                historyItem.duration
                                                            }
                                                        </Badge>
                                                    )}
                                                    {historyItem.status ===
                                                        'success' &&
                                                        historyItem.rowCount && (
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
                                                                loadQuery(
                                                                    historyItem.query,
                                                                )
                                                            }
                                                        >
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Load Query
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() =>
                                                                deleteQuery(
                                                                    historyItem.id,
                                                                )
                                                            }
                                                        >
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
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
