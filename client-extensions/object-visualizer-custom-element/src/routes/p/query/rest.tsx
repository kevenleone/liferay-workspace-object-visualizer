import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
    Send,
    History,
    Save,
    Trash2,
    Clock,
    CheckCircle,
    XCircle,
    MoreHorizontal,
    Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type RestHistoryItem } from '@/lib/db';
export const Route = createFileRoute('/p/query/rest')({
    component: RestPage,
});

function RestPage() {
    const [url, setUrl] = useState(
        'http://localhost:8080/o/object-admin/v1.0/object-definitions',
    );
    const [method] = useState('GET');
    const [response, setResponse] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [queryName, setQueryName] = useState('');
    const [showHistory, setShowHistory] = useState(true);
    const history =
        useLiveQuery(() =>
            db.restHistory.orderBy('executedAt').reverse().toArray(),
        ) || [];

    const executeQuery = async () => {
        if (!url) return;

        setLoading(true);
        const startTime = performance.now();
        setResponse(null);

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Basic ' + btoa('test@liferay.com:test'), // Basic auth for local
                },
            });

            const data = await res.json();
            const endTime = performance.now();
            const duration = `${((endTime - startTime) / 1000).toFixed(3)}s`;

            setResponse(JSON.stringify(data, null, 2));

            const newItem: RestHistoryItem = {
                id: Date.now().toString(),
                url,
                method,
                executedAt: new Date().toISOString(),
                duration,
                status: res.ok ? 'success' : 'error',
                statusCode: res.status,
                responseSize: `${(JSON.stringify(data).length / 1024).toFixed(2)} KB`,
                response: data,
            };

            await db.restHistory.add(newItem);
        } catch (err: any) {
            const endTime = performance.now();
            const duration = `${((endTime - startTime) / 1000).toFixed(3)}s`;

            setResponse(JSON.stringify({ error: err.message }, null, 2));

            const newItem: RestHistoryItem = {
                id: Date.now().toString(),
                url,
                method,
                executedAt: new Date().toISOString(),
                duration,
                status: 'error',
                statusCode: 0,
                response: { error: err.message },
            };

            await db.restHistory.add(newItem);
        } finally {
            setLoading(false);
        }
    };

    const saveQuery = async () => {
        if (!url || !queryName.trim()) return;

        const newItem: RestHistoryItem = {
            id: Date.now().toString(),
            url,
            method,
            executedAt: new Date().toISOString(),
            status: 'success',
            name: queryName.trim(),
        };

        await db.restHistory.add(newItem);
        setQueryName('');
    };

    const loadHistoryItem = (item: RestHistoryItem) => {
        setUrl(item.url);
        if (item.response) {
            setResponse(JSON.stringify(item.response, null, 2));
        }
    };

    const deleteHistoryItem = async (id: string) => {
        await db.restHistory.delete(id);
    };

    const savedQueries = history.filter((h) => h.name);

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="px-4 py-4 flex flex-col gap-4 bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        REST Client
                    </h2>
                    <div className="flex items-center gap-2">
                        <Select
                            onValueChange={(id) => {
                                const item = history.find((h) => h.id === id);
                                if (item) loadHistoryItem(item);
                            }}
                        >
                            <SelectTrigger className="w-56 bg-white">
                                <SelectValue placeholder="Load saved query" />
                            </SelectTrigger>
                            <SelectContent>
                                {savedQueries.map((h) => (
                                    <SelectItem key={h.id} value={h.id}>
                                        {h.name}
                                    </SelectItem>
                                ))}
                                {savedQueries.length === 0 && (
                                    <div className="p-2 text-xs text-muted-foreground text-center">
                                        No saved queries
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="sm"
                            className={showHistory ? 'bg-muted' : ''}
                            onClick={() => setShowHistory(!showHistory)}
                        >
                            <History className="h-4 w-4 mr-2" />
                            History
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-700 border-blue-200 font-mono h-9 px-3 flex items-center text-sm"
                    >
                        GET
                    </Badge>
                    <Input
                        className="font-mono text-sm flex-1 bg-white"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter API URL..."
                        onKeyDown={(e) => e.key === 'Enter' && executeQuery()}
                    />
                    <Button
                        onClick={executeQuery}
                        disabled={loading || !url}
                        className="gap-2 bg-blue-600 hover:bg-blue-700 min-w-[100px]"
                    >
                        {loading ? (
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send className="h-4 w-4" /> Send
                            </>
                        )}
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        className="h-8 max-w-[200px] bg-white"
                        placeholder="Save as..."
                        value={queryName}
                        onChange={(e) => setQueryName(e.target.value)}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={saveQuery}
                        disabled={!queryName || !url}
                    >
                        <Save className="h-3 w-3 mr-2" />
                        Save
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="border-b p-2 bg-gray-100 text-xs font-semibold text-gray-500 uppercase flex justify-between items-center">
                        <span>Response Body</span>
                        {response && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => {
                                    navigator.clipboard.writeText(response);
                                }}
                            >
                                <Copy className="h-3 w-3 mr-1" /> Copy
                            </Button>
                        )}
                    </div>
                    <div className="flex-1 bg-gray-900 text-green-400 p-4 font-mono text-sm overflow-auto">
                        {response ? (
                            <pre>{response}</pre>
                        ) : (
                            <div className="text-gray-500 italic">
                                Execute a request to see the response here...
                            </div>
                        )}
                    </div>
                </div>

                {showHistory && (
                    <div className="w-80 border-l bg-gray-50 flex flex-col">
                        <div className="p-3 border-b font-semibold text-sm flex items-center justify-between bg-white">
                            History
                            <span className="text-xs text-muted-foreground font-normal">
                                {history.length} items
                            </span>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-3 space-y-3">
                                {history.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white p-3 rounded-lg border shadow-sm group hover:border-blue-300 transition-colors cursor-pointer"
                                        onClick={() => loadHistoryItem(item)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-1.5">
                                                {item.status === 'success' ? (
                                                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-3.5 w-3.5 text-red-500" />
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    {
                                                        item.executedAt.split(
                                                            ',',
                                                        )[1]
                                                    }
                                                </span>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    asChild
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                                    >
                                                        <MoreHorizontal className="h-3 w-3" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteHistoryItem(
                                                                item.id,
                                                            );
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div
                                            className="text-xs font-mono break-all line-clamp-2 mb-1"
                                            title={item.url}
                                        >
                                            {item.url}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {item.statusCode && (
                                                <Badge
                                                    variant={
                                                        item.statusCode >=
                                                            200 &&
                                                        item.statusCode < 300
                                                            ? 'outline'
                                                            : 'destructive'
                                                    }
                                                    className="text-[10px] h-5 px-1 py-0"
                                                >
                                                    {item.statusCode}
                                                </Badge>
                                            )}
                                            {item.duration && (
                                                <span className="text-[10px] text-muted-foreground flex items-center">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {item.duration}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}
            </div>
        </div>
    );
}
