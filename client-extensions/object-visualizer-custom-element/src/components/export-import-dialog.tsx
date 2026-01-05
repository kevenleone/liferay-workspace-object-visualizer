import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Download,
    Upload,
    FileJson,
    Database,
    Table,
    Settings,
} from 'lucide-react';
import { ObjectDefinition } from 'liferay-headless-rest-client/object-admin-v1.0';
import { getLocalizedField } from '@/utils';
import { Liferay } from '@/lib/liferay';

interface ExportImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    objectDefinitions: Required<ObjectDefinition>[];
    initialTab?: 'export' | 'import';
}

export function ExportImportDialog({
    open,
    onOpenChange,
    objectDefinitions,
    initialTab = 'export',
}: ExportImportDialogProps) {
    const [exportFormat, setExportFormat] = useState('json');
    const [exportType, setExportType] = useState('data');
    const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
    const [importData, setImportData] = useState('');
    const [activeTab, setActiveTab] = useState<'export' | 'import'>(initialTab);

    const groupedByFolder = useMemo(() => {
        return (objectDefinitions || []).reduce(
            (acc, def) => {
                const key = String(def.objectFolderExternalReferenceCode || '');
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(def);
                return acc;
            },
            {} as Record<string, typeof objectDefinitions>,
        );
    }, [objectDefinitions]);
    const sortedObjects = useMemo(() => {
        return [...(objectDefinitions ?? [])].sort((a, b) => {
            const la = getLocalizedField(a.label) || a.name || '';
            const lb = getLocalizedField(b.label) || b.name || '';
            return la.localeCompare(lb);
        });
    }, [objectDefinitions]);
    const sortedFolderKeys = useMemo(() => {
        return Object.keys(groupedByFolder).sort((a, b) => a.localeCompare(b));
    }, [groupedByFolder]);

    const handleObjectToggle = (externalReferenceCode: string) => {
        setSelectedObjects((prev) =>
            prev.includes(externalReferenceCode)
                ? prev.filter((erc) => erc !== externalReferenceCode)
                : [...prev, externalReferenceCode],
        );
    };

    const selectAllInFolder = (folderKey: string) => {
        const defs = groupedByFolder[folderKey] || [];
        const ercs = defs.map((d) => String(d.externalReferenceCode));
        setSelectedObjects((prev) => Array.from(new Set([...prev, ...ercs])));
    };

    const deselectAllInFolder = (folderKey: string) => {
        const defs = groupedByFolder[folderKey] || [];
        const ercs = new Set(defs.map((d) => String(d.externalReferenceCode)));
        setSelectedObjects((prev) => prev.filter((erc) => !ercs.has(erc)));
    };

    const fetchAllEntriesForObject = async (restContextPath: string) => {
        try {
            const url = new URL(restContextPath, window.location.origin);
            url.searchParams.set('page', '1');
            url.searchParams.set('pageSize', '-1');
            const response = await Liferay.Util.fetch(url.toString());
            const data = await response.json();
            return Array.isArray(data?.items) ? data.items : [];
        } catch {
            try {
                const items: any[] = [];
                let page = 1;
                const pageSize = 2000;
                // fallback pagination
                // iterate until no items
                // stop at 5 pages to avoid long operations
                for (let i = 0; i < 5; i++) {
                    const url = new URL(
                        restContextPath,
                        window.location.origin,
                    );
                    url.searchParams.set('page', String(page));
                    url.searchParams.set('pageSize', String(pageSize));
                    const response = await Liferay.Util.fetch(url.toString());
                    const data = await response.json();
                    const batch = Array.isArray(data?.items) ? data.items : [];
                    items.push(...batch);
                    if (batch.length < pageSize) break;
                    page++;
                }
                return items;
            } catch {
                return [];
            }
        }
    };

    const handleExport = async () => {
        const selectedDefs = sortedObjects.filter((def) =>
            selectedObjects.includes(def.externalReferenceCode as string),
        );

        const objectsPayload = await Promise.all(
            selectedDefs.map(async (def) => {
                const includeSchema =
                    exportType === 'schema' || exportType === 'both';
                const includeData =
                    exportType === 'data' || exportType === 'both';
                const entries = includeData
                    ? await fetchAllEntriesForObject(
                          def.restContextPath as string,
                      )
                    : undefined;
                return {
                    externalReferenceCode: def.externalReferenceCode,
                    name: def.name,
                    label: def.label,
                    system: def.system,
                    restContextPath: def.restContextPath,
                    fields: includeSchema ? def.objectFields : undefined,
                    entries,
                };
            }),
        );

        const exportData = {
            type: exportType,
            format: exportFormat,
            objectCount: selectedDefs.length,
            objects: objectsPayload,
            timestamp: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `liferay-objects-${exportType}-${Date.now()}.${exportFormat}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = () => {
        // Mock import functionality
        console.log('[v0] Import data:', importData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Export / Import Data & Definitions
                    </DialogTitle>
                    <DialogDescription>
                        Export or import object data and schema definitions
                    </DialogDescription>
                </DialogHeader>

                <Tabs
                    value={activeTab}
                    onValueChange={(v) =>
                        setActiveTab(v as 'export' | 'import')
                    }
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger
                            value="export"
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export
                        </TabsTrigger>
                        <TabsTrigger
                            value="import"
                            className="flex items-center gap-2"
                        >
                            <Upload className="h-4 w-4" />
                            Import
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="export" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Export Type</Label>
                                <Select
                                    value={exportType}
                                    onValueChange={setExportType}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="data">
                                            <div className="flex items-center gap-2">
                                                <Table className="h-4 w-4" />
                                                Data Only
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="schema">
                                            <div className="flex items-center gap-2">
                                                <Settings className="h-4 w-4" />
                                                Schema Only
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="both">
                                            <div className="flex items-center gap-2">
                                                <Database className="h-4 w-4" />
                                                Data + Schema
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Format</Label>
                                <Select
                                    value={exportFormat}
                                    onValueChange={setExportFormat}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="json">
                                            <div className="flex items-center gap-2">
                                                <FileJson className="h-4 w-4" />
                                                JSON
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="csv">CSV</SelectItem>
                                        <SelectItem value="xml">XML</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Select Objects</Label>
                            <div className="space-y-3 max-h-60 overflow-y-auto border rounded-md p-3">
                                {sortedFolderKeys.map((folderKey) => {
                                    const defs = (
                                        groupedByFolder[folderKey] || []
                                    )
                                        .slice()
                                        .sort((a, b) => {
                                            const la =
                                                getLocalizedField(a.label) ||
                                                a.name ||
                                                '';
                                            const lb =
                                                getLocalizedField(b.label) ||
                                                b.name ||
                                                '';
                                            return la.localeCompare(lb);
                                        });
                                    const folderLabel = folderKey.toLowerCase();
                                    return (
                                        <div
                                            key={folderKey}
                                            className="space-y-2"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {folderLabel} ({defs.length}
                                                    )
                                                </span>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs"
                                                        onClick={() =>
                                                            selectAllInFolder(
                                                                folderKey,
                                                            )
                                                        }
                                                    >
                                                        Select all
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs"
                                                        onClick={() =>
                                                            deselectAllInFolder(
                                                                folderKey,
                                                            )
                                                        }
                                                    >
                                                        Clear
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {defs.map((def) => (
                                                    <div
                                                        key={
                                                            def.externalReferenceCode
                                                        }
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <Checkbox
                                                            id={String(
                                                                def.externalReferenceCode,
                                                            )}
                                                            checked={selectedObjects.includes(
                                                                String(
                                                                    def.externalReferenceCode,
                                                                ),
                                                            )}
                                                            onCheckedChange={() =>
                                                                handleObjectToggle(
                                                                    String(
                                                                        def.externalReferenceCode,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                        <Label
                                                            htmlFor={String(
                                                                def.externalReferenceCode,
                                                            )}
                                                            className="text-sm font-normal"
                                                        >
                                                            {getLocalizedField(
                                                                def.label,
                                                            ) || def.name}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleExport}
                                className="bg-primary hover:bg-primary-dark"
                                disabled={selectedObjects.length === 0}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export ({selectedObjects.length} objects)
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="import" className="space-y-4">
                        <div className="space-y-2">
                            <Label>Import Data</Label>
                            <Textarea
                                placeholder="Paste your JSON, CSV, or XML data here..."
                                value={importData}
                                onChange={(e) => setImportData(e.target.value)}
                                className="min-h-[200px] font-mono text-sm"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="validate" />
                            <Label htmlFor="validate" className="text-sm">
                                Validate data before import
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="backup" defaultChecked />
                            <Label htmlFor="backup" className="text-sm">
                                Create backup before import
                            </Label>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={!importData.trim()}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Import Data
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
