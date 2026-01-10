import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
    Play,
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
import { Textarea } from '@/components/ui/textarea';
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

export const Route = createFileRoute('/p/query/graphql')({
    component: GraphQLPage,
});

interface QueryHistoryItem {
    id: string;
    url: string;
    query: string;
    executedAt: string;
    duration?: string;
    status: 'success' | 'error';
    statusCode?: number;
    response?: any;
    name?: string;
}

function GraphQLPage() {
    const [url, setUrl] = useState('http://localhost:8080/o/graphql');
    const [query, setQuery] = useState<string>(`query {
  objectDefinitions(page: 1, pageSize: 10) {
    items {
      id
      name
      externalReferenceCode
    }
  }
}`);
    const [response, setResponse] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<QueryHistoryItem[]>([]);
    const [queryName, setQueryName] = useState('');
    const [showHistory, setShowHistory] = useState(true);

    const storageKey = 'graphql_playground_history';

    // Load history
    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                setHistory(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Failed to load history', e);
        }
    }, []);

    // Save history
    useEffect(() => {
        if (history.length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(history));
        }
    }, [history]);

    const executeQuery = async () => {
        if (!url || !query) return;

        setLoading(true);
        const startTime = performance.now();
        setResponse(null);

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Basic ' + btoa('test@liferay.com:test'),
                },
                body: JSON.stringify({ query }),
            });

            const data = await res.json();
            const endTime = performance.now();
            const duration = `${((endTime - startTime) / 1000).toFixed(3)}s`;

            setResponse(JSON.stringify(data, null, 2));

            const newItem: QueryHistoryItem = {
                id: Date.now().toString(),
                url,
                query,
                executedAt: new Date().toLocaleString(),
                duration,
                status: res.ok && !data.errors ? 'success' : 'error',
                statusCode: res.status,
                response: data,
            };

            setHistory((prev) => [newItem, ...prev.slice(0, 49)]);
        } catch (err: any) {
            const endTime = performance.now();
            const duration = `${((endTime - startTime) / 1000).toFixed(3)}s`;

            setResponse(JSON.stringify({ error: err.message }, null, 2));

            const newItem: QueryHistoryItem = {
                id: Date.now().toString(),
                url,
                query,
                executedAt: new Date().toLocaleString(),
                duration,
                status: 'error',
                statusCode: 0,
                response: { error: err.message },
            };

            setHistory((prev) => [newItem, ...prev.slice(0, 49)]);
        } finally {
            setLoading(false);
        }
    };

    const saveQuery = () => {
        if (!query.trim() || !queryName.trim()) return;

        const newItem: QueryHistoryItem = {
            id: Date.now().toString(),
            url,
            query,
            executedAt: new Date().toLocaleString(),
            status: 'success',
            name: queryName.trim(),
        };

        setHistory((prev) => [newItem, ...prev.slice(0, 49)]);
        setQueryName('');
    };

    const loadHistoryItem = (item: QueryHistoryItem) => {
        setQuery(item.query);
        setUrl(item.url || url);
        if (item.response) {
            setResponse(JSON.stringify(item.response, null, 2));
        }
    };

    const deleteHistoryItem = (id: string) => {
        setHistory((prev) => prev.filter((i) => i.id !== id));
    };

    const savedQueries = history.filter((h) => h.name);

    const formatQuery = () => {
        try {
            // Regex based approach often cleaner for simple "prettify" without AST
            // 1. Add newlines around brackets
            let s = query.replace(/\s+/g, ' ');
            s = s.replace(/\{/g, '{\n');
            s = s.replace(/\}/g, '\n}');

            // Re-indent
            const lines = s.split('\n');
            let output = '';
            let indent = 0;

            lines.forEach((line) => {
                let trimmed = line.trim();
                if (!trimmed) return;

                if (trimmed.startsWith('}')) indent--;
                if (indent < 0) indent = 0;

                output += '  '.repeat(indent) + trimmed + '\n';

                if (trimmed.endsWith('{')) indent++;
            });

            setQuery(output.trim());
        } catch (e) {
            console.error('Format error', e);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="px-4 py-4 flex flex-col gap-4 bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-pink-700">
                        GraphQL Playground
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
                        className="bg-pink-100 text-pink-700 border-pink-200 font-mono h-9 px-3 flex items-center text-sm"
                    >
                        POST
                    </Badge>
                    <Input
                        className="font-mono text-sm flex-1 bg-white"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter GraphQL API URL..."
                    />
                    <Button
                        variant="secondary"
                        onClick={formatQuery}
                        disabled={!query}
                        className="gap-2"
                        title="Format Query"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-align-left"
                        >
                            <line x1="21" x2="3" y1="6" y2="6" />
                            <line x1="15" x2="3" y1="12" y2="12" />
                            <line x1="17" x2="3" y1="18" y2="18" />
                        </svg>
                        Format
                    </Button>
                    <Button
                        onClick={executeQuery}
                        disabled={loading || !url}
                        className="gap-2 bg-pink-600 hover:bg-pink-700 min-w-[100px]"
                    >
                        {loading ? (
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Play className="h-4 w-4" /> Run
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
                        disabled={!queryName || !query}
                    >
                        <Save className="h-3 w-3 mr-2" />
                        Save
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex min-w-0">
                    {/* Left Panel: Query Editor */}
                    <div className="w-1/2 flex flex-col border-r bg-white">
                        <div className="border-b p-2 bg-gray-100 text-xs font-semibold text-gray-500 uppercase">
                            Query / Mutation
                        </div>
                        <Textarea
                            className="flex-1 font-mono text-sm p-4 border-0 resize-none focus-visible:ring-0 rounded-none bg-gray-900 text-gray-100"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            spellCheck={false}
                            placeholder="Type your GraphQL query here..."
                        />
                    </div>

                    {/* Right Panel: Response */}
                    <div className="w-1/2 flex flex-col bg-white">
                        <div className="border-b p-2 bg-gray-100 text-xs font-semibold text-gray-500 uppercase flex justify-between items-center">
                            <span>Response</span>
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
                        <div className="flex-1 bg-gray-50 p-4 font-mono text-sm overflow-auto text-gray-800">
                            {response ? (
                                <pre>{response}</pre>
                            ) : (
                                <div className="text-gray-400 italic">
                                    Execute a query to see the response here...
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {showHistory && (
                    <div className="w-80 border-l bg-gray-50 flex flex-col flex-shrink-0">
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
                                        className="bg-white p-3 rounded-lg border shadow-sm group hover:border-pink-300 transition-colors cursor-pointer"
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
                                        <div className="text-xs font-mono break-all line-clamp-3 mb-1 bg-muted/50 p-1 rounded">
                                            {item.query}
                                        </div>
                                        <div className="flex items-center gap-2">
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
