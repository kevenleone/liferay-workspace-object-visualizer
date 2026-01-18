import { Check,ChevronRight, Copy } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { Button } from './button';

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

interface JsonViewerProps {
    data: JsonValue;
    defaultExpanded?: boolean;
    maxDepth?: number;
    className?: string;
}

export function JsonViewer({
    data,
    defaultExpanded = true,
    maxDepth = 10,
    className,
}: JsonViewerProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className={cn('relative rounded-md border bg-muted/50', className)}
        >
            <div className="flex items-center justify-between border-b bg-muted/30 px-2 py-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                    JSON
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1.5 text-xs"
                    onClick={handleCopy}
                >
                    {copied ? (
                        <>
                            <Check className="h-3 w-3" />
                        </>
                    ) : (
                        <>
                            <Copy className="h-3 w-3" />
                        </>
                    )}
                </Button>
            </div>
            <div className="overflow-auto p-3 max-h-[300px] text-sm [&.h-full]:max-h-none [&.h-full]:h-full">
                <JsonNode
                    data={data}
                    depth={0}
                    maxDepth={maxDepth}
                    defaultExpanded={defaultExpanded}
                />
            </div>
        </div>
    );
}

interface JsonNodeProps {
    data: JsonValue;
    depth: number;
    maxDepth: number;
    defaultExpanded: boolean;
}

function JsonNode({ data, depth, maxDepth, defaultExpanded }: JsonNodeProps) {
    const [isExpanded, setIsExpanded] = useState(
        defaultExpanded && depth < maxDepth
    );

    const renderValue = (value: JsonValue): React.ReactNode => {
        if (value === null) {
            return (
                <span className="text-purple-600 dark:text-purple-400">
                    null
                </span>
            );
        }

        if (typeof value === 'string') {
            return (
                <span className="text-green-600 dark:text-green-400">
                    "{value}"
                </span>
            );
        }

        if (typeof value === 'number') {
            return (
                <span className="text-blue-600 dark:text-blue-400">
                    {value}
                </span>
            );
        }

        if (typeof value === 'boolean') {
            return (
                <span className="text-orange-600 dark:text-orange-400">
                    {String(value)}
                </span>
            );
        }

        if (Array.isArray(value)) {
            if (value.length === 0) {
                return <span className="text-muted-foreground">[]</span>;
            }

            if (!isExpanded) {
                return (
                    <span className="text-muted-foreground">
                        [{value.length} item{value.length !== 1 ? 's' : ''}]
                    </span>
                );
            }

            return (
                <div>
                    <span className="text-muted-foreground">[</span>
                    <div className="ml-3">
                        {value.map((item, index) => (
                            <div key={index} className="flex py-0.5">
                                <span className="text-muted-foreground mr-2 select-none text-xs">
                                    {index}:
                                </span>
                                <div className="flex-1">
                                    <JsonNode
                                        data={item}
                                        depth={depth + 1}
                                        maxDepth={maxDepth}
                                        defaultExpanded={defaultExpanded}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <span className="text-muted-foreground">]</span>
                </div>
            );
        }

        if (typeof value === 'object') {
            const keys = Object.keys(value);
            if (keys.length === 0) {
                return <span className="text-muted-foreground">{'{}'}</span>;
            }

            if (!isExpanded) {
                return (
                    <span className="text-muted-foreground">
                        {'{'} {keys.length} propert
                        {keys.length !== 1 ? 'ies' : 'y'} {'}'}
                    </span>
                );
            }

            return (
                <div>
                    <span className="text-muted-foreground">{'{'}</span>
                    <div className="ml-3">
                        {keys.map((key) => (
                            <div key={key} className="flex py-0.5">
                                <span className="text-foreground font-medium mr-2">
                                    "{key}":
                                </span>
                                <div className="flex-1">
                                    <JsonNode
                                        data={value[key]}
                                        depth={depth + 1}
                                        maxDepth={maxDepth}
                                        defaultExpanded={defaultExpanded}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <span className="text-muted-foreground">{'}'}</span>
                </div>
            );
        }

        return null;
    };

    const isExpandable =
        (Array.isArray(data) && data.length > 0) ||
        (typeof data === 'object' &&
            data !== null &&
            Object.keys(data).length > 0);

    if (!isExpandable) {
        return <span>{renderValue(data)}</span>;
    }

    return (
        <div className="inline-flex items-start gap-1">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center hover:text-foreground text-muted-foreground transition-colors mt-0.5"
            >
                <ChevronRight
                    className={cn(
                        'h-3 w-3 transition-transform shrink-0',
                        isExpanded && 'rotate-90'
                    )}
                />
            </button>
            <div className="flex-1 min-w-0">{renderValue(data)}</div>
        </div>
    );
}
