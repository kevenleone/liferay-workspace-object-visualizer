'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Database,
    Table,
    Eye,
    Code,
    Play,
    BarChart3,
    Activity,
} from 'lucide-react';
import { SchemaViewer } from '@/components/schema-viewer';
import { DataTableBrowser } from '@/components/data-table-browser';
import { QueryInterface } from '@/components/query-interface';
import { DataVisualization } from '@/components/data-visualization';
import { LiveActivityFeed } from '@/components/live-activity-feed';

interface MainContentProps {
    selectedObject: string | null;
}

export function MainContent({ selectedObject }: MainContentProps) {
    const [activeView, setActiveView] = useState<
        'data' | 'schema' | 'query' | 'analytics' | 'live'
    >('data');

    if (!selectedObject) {
        return (
            <div className="flex-1 w-full h-full flex items-center justify-center bg-background">
                <div className="text-center">
                    <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-montserrat font-semibold text-foreground mb-2">
                        Welcome to Objects Browser
                    </h2>
                    <p className="text-muted-foreground max-w-md">
                        Select an object from the sidebar to view its schema,
                        browse data, or run queries. This interface provides a
                        comprehensive view of your Liferay Objects organized by
                        groups.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-background">
            {/* Header */}
            <div className="border-b border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Table className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-montserrat font-bold text-foreground">
                        {selectedObject}
                    </h1>
                    <Badge variant="secondary" className="ml-2">
                        Object
                    </Badge>
                </div>

                <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
                    <Button
                        variant={activeView === 'data' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveView('data')}
                        className="h-9 px-4"
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Data
                    </Button>
                    <Button
                        variant={activeView === 'schema' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveView('schema')}
                        className="h-9 px-4"
                    >
                        <Code className="h-4 w-4 mr-2" />
                        Schema
                    </Button>
                    <Button
                        variant={activeView === 'query' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveView('query')}
                        className="h-9 px-4"
                    >
                        <Play className="h-4 w-4 mr-2" />
                        Query
                    </Button>
                    <Button
                        variant={
                            activeView === 'analytics' ? 'default' : 'ghost'
                        }
                        size="sm"
                        onClick={() => setActiveView('analytics')}
                        className="h-9 px-4"
                    >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                    </Button>
                    <Button
                        variant={activeView === 'live' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveView('live')}
                        className="h-9 px-4"
                    >
                        <Activity className="h-4 w-4 mr-2" />
                        Live Feed
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
                <div className="h-full p-6 overflow-auto">
                    {activeView === 'schema' && (
                        <SchemaViewer objectName={selectedObject} />
                    )}
                    {activeView === 'data' && (
                        <DataTableBrowser objectName={selectedObject} />
                    )}
                    {activeView === 'query' && (
                        <QueryInterface objectName={selectedObject} />
                    )}
                    {activeView === 'analytics' && (
                        <DataVisualization objectName={selectedObject} />
                    )}
                    {activeView === 'live' && (
                        <LiveActivityFeed objectName={selectedObject} />
                    )}
                </div>
            </div>
        </div>
    );
}
