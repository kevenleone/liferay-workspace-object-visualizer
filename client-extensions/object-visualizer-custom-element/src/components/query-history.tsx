import { useNavigate } from '@tanstack/react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import {
    CheckCircle,
    Clock,
    Copy,
    History,
    MoreHorizontal,
    Trash2,
    XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { db } from '@/lib/db';

interface QueryHistoryProps {
    externalReferenceCode: string;
}

export function QueryHistory({ externalReferenceCode }: QueryHistoryProps) {
    const navigate = useNavigate({ from: '/p/$externalReferenceCode/query' });
    const queryHistory =
        useLiveQuery(
            () =>
                db.odataHistory
                    .where('externalReferenceCode')
                    .equals(externalReferenceCode)
                    .reverse()
                    .sortBy('executedAt'),
            [externalReferenceCode],
        ) || [];

    const loadQuery = (query: string) => {
        navigate({
            params: { externalReferenceCode },
            replace: false,
            search: {
                page: 1,
                pageSize: 10,
                query,
            },
            to: '/p/$externalReferenceCode/query',
        });
    };

    const deleteQuery = async (id: string) => {
        await db.odataHistory.delete(id);
    };

    return (
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
                            No query history yet. Execute a query to save it
                            here.
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
                                                    {historyItem.duration}
                                                </Badge>
                                            )}
                                            {historyItem.status === 'success' &&
                                                historyItem.rowCount && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {historyItem.rowCount}{' '}
                                                        rows
                                                    </Badge>
                                                )}
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
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
    );
}
