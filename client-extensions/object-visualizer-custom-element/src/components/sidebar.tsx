import { useEffect, useState } from 'react';
import { ObjectDefinition } from 'liferay-headless-rest-client/object-admin-v1.0';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Database,
    Download,
    Folder,
    FolderOpen,
    RefreshCw,
    Search,
    Table,
    Upload,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from '@tanstack/react-router';

interface SidebarProps {
    onExportImport?: (initialTab?: 'export' | 'import') => void;
    objectDefinitions: Required<ObjectDefinition>[];
}

export function Sidebar({ onExportImport, objectDefinitions }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, onToggleCollapse] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('sidebarCollapsed');
            return saved ? JSON.parse(saved) === true : false;
        } catch {
            return false;
        }
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [syncEnabled, setSyncEnabled] = useState(true);

    const [, externalReferenceCode] = location.pathname
        .split('/')
        .filter(Boolean);

    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
        new Set(['']),
    );

    const objectDefinitionGroups = Object.groupBy(
        objectDefinitions,
        (objectDefinition) =>
            objectDefinition.objectFolderExternalReferenceCode as string,
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

    useEffect(() => {
        try {
            localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
        } catch {
            void 0;
        }
    }, [collapsed]);

    return (
        <div
            className={cn(
                'bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out overflow-hidden',
                collapsed ? 'w-16 min-w-16 max-w-16' : 'w-80 min-w-80 max-w-80',
            )}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between shrink-0">
                {!collapsed && (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Database className="h-6 w-6 text-blue-600 shrink-0" />
                        <h1 className="font-montserrat font-bold text-lg text-gray-900 truncate">
                            Objects Browser
                        </h1>
                    </div>
                )}
                {/* Collapse toggle button */}
                <button
                    onClick={() => onToggleCollapse((value) => !value)}
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
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search objects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
            )}

            {/* Objects List with Groups */}
            <ScrollArea className="flex-1">
                <div className={cn(collapsed ? 'p-1' : 'p-2')}>
                    {collapsed ? null : (
                        <>
                            {Object.entries(objectDefinitionGroups).map(
                                ([group, _objectDefinitions], index) => {
                                    const objectDefinitions = (
                                        _objectDefinitions as Required<
                                            ObjectDefinition[]
                                        >
                                    ).filter((objectDefinition) =>
                                        objectDefinition?.name
                                            ?.toLowerCase()
                                            .includes(
                                                searchQuery.toLowerCase(),
                                            ),
                                    );

                                    return (
                                        <div className="mb-2" key={index}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    toggleGroup(group)
                                                }
                                                className="w-full justify-start p-2 h-auto font-medium text-gray-700 hover:bg-gray-100 overflow-hidden"
                                            >
                                                {expandedGroups.has(group) ? (
                                                    <>
                                                        <ChevronDown className="h-4 w-4 mr-1 shrink-0" />
                                                        <FolderOpen className="h-4 w-4 mr-2 shrink-0" />
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronRight className="h-4 w-4 mr-1 shrink-0" />
                                                        <Folder className="h-4 w-4 mr-2 shrink-0" />
                                                    </>
                                                )}
                                                <span className="truncate capitalize">
                                                    {group.toLowerCase()} (
                                                    {objectDefinitions.length})
                                                </span>
                                            </Button>

                                            {expandedGroups.has(group) && (
                                                <div className="ml-6 mt-1 space-y-1">
                                                    {(
                                                        objectDefinitions as ObjectDefinition[]
                                                    ).map(
                                                        (objectDefinition) => (
                                                            <Button
                                                                key={
                                                                    objectDefinition.name
                                                                }
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    onSelectObject(
                                                                        objectDefinition,
                                                                    )
                                                                }
                                                                className={cn(
                                                                    'w-full justify-start p-2 h-auto text-left hover:bg-gray-100 overflow-hidden',
                                                                    externalReferenceCode ===
                                                                        objectDefinition.externalReferenceCode &&
                                                                        'bg-blue-50 text-blue-900 border border-blue-200',
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-2 w-full min-w-0">
                                                                    <Table className="h-4 w-4 shrink-0" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="font-medium truncate">
                                                                            {
                                                                                objectDefinition.name
                                                                            }
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 truncate">
                                                                            {
                                                                                objectDefinition
                                                                                    .objectFields
                                                                                    ?.length
                                                                            }{' '}
                                                                            fields
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        className={cn(
                                                                            'text-xs px-1.5 py-0.5 rounded shrink-0',
                                                                            objectDefinition.system
                                                                                ? 'bg-blue-100 text-blue-700'
                                                                                : 'bg-gray-100 text-gray-700',
                                                                        )}
                                                                    >
                                                                        {objectDefinition.system
                                                                            ? 'System'
                                                                            : 'Custom'}
                                                                    </div>
                                                                </div>
                                                            </Button>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                },
                            )}
                        </>
                    )}
                </div>
            </ScrollArea>

            {/* Footer Options - hidden when collapsed */}
            {!collapsed && (
                <div className="p-4 border-t border-gray-200 space-y-3 shrink-0">
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
                            Export
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.preventDefault();
                                onExportImport?.('import');
                            }}
                            className="flex-1 text-xs bg-transparent"
                        >
                            <Upload className="h-3 w-3 mr-1 shrink-0" />
                            Import
                        </Button>
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
