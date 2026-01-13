import { useState } from 'react';
import { ObjectDefinition } from 'liferay-headless-rest-client/object-admin-v1.0';
import {
    ChevronLeft,
    Database,
    Download,
    Folder,
    RefreshCw,
    Search,
    Server,
    Table,
    TimerReset,
    FileText,
    Activity,
    ChevronDown,
    Globe,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

interface SidebarProps {
    onExportImport?: (initialTab?: 'export' | 'import') => void;
    objectDefinitions: Required<ObjectDefinition>[];
}

function getContrastingTextColor(hex?: string) {
    if (!hex) return '#111827';

    const m = /^#?([a-fA-F0-9]{6})$/.exec(hex.trim());

    if (!m) return '#111827';

    const n = parseInt(m[1], 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;

    return yiq >= 128 ? '#111827' : '#FFFFFF';
}

export function Sidebar({
    onExportImport,
    objectDefinitions = [],
}: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const sidebarState = useLiveQuery(() =>
        db.appState.get('sidebarCollapsed'),
    );
    const collapsed = sidebarState?.value === true;

    const onToggleCollapse = async () => {
        await db.appState.put({ id: 'sidebarCollapsed', value: !collapsed });
    };

    const envState = useLiveQuery(() =>
        db.appState.get('selectedEnvironmentInfo'),
    );
    const selectedEnvInfo = envState?.value || null;

    const [, , externalReferenceCode] = location.pathname
        .split('/')
        .filter(Boolean);

    const objectDefinitionGroups = (objectDefinitions || []).reduce(
        (acc, objectDefinition) => {
            const key =
                (objectDefinition.objectFolderExternalReferenceCode as string) ||
                'Other';
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(objectDefinition);
            return acc;
        },
        {} as Record<string, typeof objectDefinitions>,
    );

    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
        () => new Set(),
    );

    const toggleGroup = (groupName: string) => {
        const newExpanded = new Set(expandedGroups);

        if (newExpanded.has(groupName)) {
            newExpanded.delete(groupName);
        } else {
            newExpanded.add(groupName);
        }

        setExpandedGroups(newExpanded);
    };

    const onSelectObject = (objectDefinition: ObjectDefinition) => {
        navigate({ to: `/p/${objectDefinition.externalReferenceCode}` });
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [syncEnabled, setSyncEnabled] = useState(true);

    const isActive = (path: string) => location.pathname.includes(path);

    return (
        <div
            className={cn(
                'bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out overflow-hidden h-full',
                collapsed ? 'w-16 min-w-16 max-w-16' : 'w-80 min-w-80 max-w-80',
            )}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between shrink-0">
                {!collapsed && (
                    <div
                        className="flex items-center gap-2 flex-1 min-w-0"
                        onClick={() => navigate({ to: '/p' })}
                        role="button"
                    >
                        <Database className="h-6 w-6 text-blue-600 shrink-0" />
                        <h1 className="font-montserrat font-bold text-lg text-gray-900 truncate">
                            Liferay Data Studio
                        </h1>
                    </div>
                )}

                {/* Collapse toggle button */}
                <button
                    onClick={() => onToggleCollapse()}
                    className="p-1 hover:bg-gray-100 rounded-md shrink-0 transition-colors"
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <ChevronLeft
                        className={cn(
                            'h-5 w-5 text-gray-600 transition-transform',
                            collapsed && 'rotate-180',
                        )}
                    />
                </button>
            </div>

            {/* Search - hidden when collapsed */}
            {!collapsed && (
                <div className="p-4 border-b border-gray-200 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-[10px] transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
            )}

            {/* Content List */}
            <ScrollArea className="flex-1">
                <div className={cn(collapsed ? 'p-1' : 'p-2', 'space-y-4')}>
                    {/* Objects Framework Section */}
                    <div className="space-y-1">
                        {!collapsed && (
                            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Objects Framework
                            </h3>
                        )}

                        {/* Objects Group */}
                        <div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleGroup('objects')}
                                className="w-full justify-start p-2 h-auto font-medium text-gray-700 hover:bg-gray-100 overflow-hidden"
                            >
                                <Folder className="h-4 w-4 shrink-0" />

                                {!collapsed && (
                                    <span className="truncate capitalize">
                                        Objects (
                                        {(objectDefinitions || []).length})
                                    </span>
                                )}
                            </Button>

                            {expandedGroups.has('objects') && !collapsed && (
                                <div className="ml-4 mt-1 space-y-1 border-l pl-2">
                                    {Object.entries(objectDefinitionGroups).map(
                                        ([group, definitions]) => (
                                            <div key={group} className="mt-2">
                                                <button
                                                    onClick={() =>
                                                        toggleGroup(group)
                                                    }
                                                    className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider hover:bg-gray-50 rounded transition-colors"
                                                >
                                                    <span>{group}</span>
                                                    <ChevronDown
                                                        className={cn(
                                                            'h-3 w-3 transition-transform',
                                                            !expandedGroups.has(
                                                                group,
                                                            ) && '-rotate-90',
                                                        )}
                                                    />
                                                </button>
                                                {expandedGroups.has(group) && (
                                                    <div className="mt-1 space-y-0.5">
                                                        {definitions.map(
                                                            (def) => (
                                                                <Button
                                                                    key={
                                                                        def.externalReferenceCode
                                                                    }
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        onSelectObject(
                                                                            def,
                                                                        )
                                                                    }
                                                                    className={cn(
                                                                        'w-full justify-start p-1.5 h-auto text-left hover:bg-gray-100 text-sm pl-4',
                                                                        externalReferenceCode ===
                                                                            def.externalReferenceCode &&
                                                                            'bg-blue-50 text-blue-900 font-medium',
                                                                    )}
                                                                >
                                                                    <span className="truncate">
                                                                        {
                                                                            def.name
                                                                        }
                                                                    </span>
                                                                </Button>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Pick Lists */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate({ to: '/p/pick-lists' })}
                            className={cn(
                                'w-full justify-start p-2 h-auto text-left hover:bg-gray-100',
                                isActive('/pick-lists') &&
                                    'bg-blue-50 text-blue-900',
                            )}
                        >
                            <div className="flex items-center gap-2 w-full min-w-0">
                                <Table className="h-4 w-4 shrink-0" />
                                {!collapsed && (
                                    <span className="font-medium">
                                        Pick Lists
                                    </span>
                                )}
                            </div>
                        </Button>
                    </div>

                    {/* Mailing Section */}
                    <div className="space-y-1">
                        {!collapsed && (
                            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4">
                                Mailing
                            </h3>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                navigate({
                                    to: '/p/mailing/notification-templates',
                                })
                            }
                            className={cn(
                                'w-full justify-start p-2 h-auto text-left hover:bg-gray-100',
                                isActive('/mailing/notification-templates') &&
                                    'bg-blue-50 text-blue-900',
                            )}
                        >
                            <div className="flex items-center gap-2 w-full min-w-0">
                                <FileText className="h-4 w-4 shrink-0" />
                                {!collapsed && (
                                    <span className="font-medium">
                                        Notification Templates
                                    </span>
                                )}
                            </div>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                navigate({
                                    to: '/p/mailing/notification-queue',
                                })
                            }
                            className={cn(
                                'w-full justify-start p-2 h-auto text-left hover:bg-gray-100',
                                isActive('/mailing/notification-queue') &&
                                    'bg-blue-50 text-blue-900',
                            )}
                        >
                            <div className="flex items-center gap-2 w-full min-w-0">
                                <Activity className="h-4 w-4 shrink-0" />
                                {!collapsed && (
                                    <span className="font-medium">
                                        Notification Queue
                                    </span>
                                )}
                            </div>
                        </Button>
                    </div>

                    {/* Global Section */}
                    <div className="space-y-1">
                        {!collapsed && (
                            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Global
                            </h3>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                navigate({ to: '/p/virtual-instances' })
                            }
                            className={cn(
                                'w-full justify-start p-2 h-auto text-left hover:bg-gray-100',
                                isActive('/virtual-instances') &&
                                    'bg-blue-50 text-blue-900',
                            )}
                        >
                            <div className="flex items-center gap-2 w-full min-w-0">
                                <Globe className="h-4 w-4 shrink-0" />
                                {!collapsed && (
                                    <span className="font-medium">
                                        Virtual Instances
                                    </span>
                                )}
                            </div>
                        </Button>
                    </div>

                    {/* Query Section */}
                    <div className="space-y-1">
                        {!collapsed && (
                            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4">
                                Query
                            </h3>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate({ to: '/p/query/graphql' })}
                            className={cn(
                                'w-full justify-start p-2 h-auto text-left hover:bg-gray-100',
                                isActive('/query/graphql') &&
                                    'bg-blue-50 text-blue-900',
                            )}
                        >
                            <div className="flex items-center gap-2 w-full min-w-0">
                                <Activity className="h-4 w-4 shrink-0" />
                                {!collapsed && (
                                    <span className="font-medium">
                                        GraphQL Playground
                                    </span>
                                )}
                            </div>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate({ to: '/p/query/rest' })}
                            className={cn(
                                'w-full justify-start p-2 h-auto text-left hover:bg-gray-100',
                                isActive('/query/rest') &&
                                    'bg-blue-50 text-blue-900',
                            )}
                        >
                            <div className="flex items-center gap-2 w-full min-w-0">
                                <Activity className="h-4 w-4 shrink-0" />
                                {!collapsed && (
                                    <span className="font-medium">
                                        Rest Playground
                                    </span>
                                )}
                            </div>
                        </Button>
                    </div>
                </div>
            </ScrollArea>

            {/* Footer Options - hidden when collapsed */}
            {!collapsed && (
                <div className="p-4 border-t border-gray-200 space-y-3 shrink-0">
                    {selectedEnvInfo &&
                        (() => {
                            const textColor = getContrastingTextColor(
                                selectedEnvInfo.color,
                            );
                            return (
                                <div
                                    className="p-3 rounded-lg border"
                                    style={{
                                        backgroundColor:
                                            selectedEnvInfo.color || '',
                                        borderColor:
                                            selectedEnvInfo.color || '',
                                        color: textColor,
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Server
                                            className="h-4 w-4 shrink-0"
                                            style={{ color: textColor }}
                                        />
                                        <span
                                            className="text-sm font-medium"
                                            style={{ color: textColor }}
                                        >
                                            {selectedEnvInfo.name}
                                        </span>
                                    </div>
                                    <div
                                        className="font-semibold text-xs truncate"
                                        style={{ color: textColor }}
                                    >
                                        {(
                                            selectedEnvInfo.baseUrl ||
                                            selectedEnvInfo.host
                                        )
                                            .replace('http://', '')
                                            .replace('https://', '')}

                                        <small className="ml-1">
                                            ({selectedEnvInfo.type})
                                        </small>
                                    </div>

                                    <div
                                        className="text-xs flex items-center gap-1 mt-2"
                                        style={{ color: textColor }}
                                    >
                                        <div className="w-2 h-2 bg-green-500 rounded-full shrink-0"></div>
                                        Connected
                                    </div>
                                </div>
                            );
                        })()}

                    {/* Auto Sync Toggle */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                                <RefreshCw className="h-4 w-4 text-gray-600 shrink-0" />
                                <span className="text-sm font-medium text-gray-700">
                                    Auto Sync
                                </span>
                            </div>
                            <Switch
                                checked={syncEnabled}
                                onCheckedChange={setSyncEnabled}
                                className="shrink-0"
                            />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {syncEnabled
                                ? 'Real-time updates enabled'
                                : 'Manual refresh only'}
                        </div>
                    </div>

                    {/* Export/Import Buttons */}
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.preventDefault();
                                onExportImport?.('export');
                            }}
                            className="flex-1 text-xs bg-transparent"
                        >
                            <Download className="h-3 w-3 mr-1 shrink-0" />
                            Import / Export
                        </Button>

                        {selectedEnvInfo && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={async (e) => {
                                    e.preventDefault();

                                    await db.appState.delete(
                                        'selectedEnvironmentInfo',
                                    );

                                    navigate({ to: '/environments' });
                                }}
                                className="flex-1 text-xs bg-transparent"
                            >
                                <TimerReset className="h-3 w-3 mr-1 shrink-0" />
                                Disconnect
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Collapsed footer icons */}
            {collapsed && (
                <div className="p-2 border-t border-gray-200 space-y-2 shrink-0">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onExportImport?.('export');
                        }}
                        className="w-full p-2 hover:bg-gray-100 rounded-md transition-colors flex justify-center"
                        title="Export/Import"
                    >
                        <Download className="h-4 w-4 text-gray-600" />
                    </button>
                </div>
            )}
        </div>
    );
}
