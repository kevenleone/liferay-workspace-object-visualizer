import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Database,
    Link,
    Type,
    Calendar,
    Hash,
    FileText,
    ToggleRightIcon as Toggle,
    CheckCircle,
    XCircle,
    Eye,
    EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ObjectDefinition } from 'liferay-headless-rest-client/object-admin-v1.0';
import { getLocalizedField } from '@/utils';

interface SchemaViewerProps {
    objectDefinition: Required<ObjectDefinition>;
}

const getFieldIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'string':
            return FileText;
        case 'long text':
            return FileText;
        case 'long':
            return Hash;
        case 'date':
            return Calendar;
        case 'boolean':
            return Toggle;
        default:
            return Type;
    }
};

const getSourceBadgeColor = (system: boolean) => {
    return system
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
};

export function SchemaViewer({ objectDefinition }: SchemaViewerProps) {
    const { objectFields = [], objectRelationships = [] } = objectDefinition;

    return (
        <ScrollArea className="max-h-[500px] ">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary" />
                        {getLocalizedField(objectDefinition.label)} Schema
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                                {objectFields.length}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Fields
                            </div>
                        </div>

                        <div className="text-center p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                                {objectRelationships.length || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Relationships
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Type className="h-5 w-5" />
                        Fields ({objectFields.length})
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <ScrollArea className="h-96">
                        <div className="space-y-3">
                            {objectFields.map((objectField, index) => {
                                const FieldIcon = getFieldIcon(
                                    objectField.DBType as string,
                                );

                                return (
                                    <div
                                        key={index}
                                        className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <FieldIcon className="h-4 w-4 text-muted-foreground" />
                                                <span
                                                    className="font-medium text-foreground"
                                                    title={`name: ${objectField.name}`}
                                                >
                                                    {getLocalizedField(
                                                        objectField.label,
                                                    )}{' '}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {objectField.DBType}
                                                </Badge>

                                                <Badge
                                                    className={cn(
                                                        'text-xs',
                                                        getSourceBadgeColor(
                                                            objectField.system!,
                                                        ),
                                                    )}
                                                >
                                                    {objectField.system
                                                        ? 'System'
                                                        : 'Custom Field'}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground mb-2">
                                            <div className="flex items-center gap-1">
                                                {objectField.required ? (
                                                    <CheckCircle className="h-3 w-3 text-red-500" />
                                                ) : (
                                                    <XCircle className="h-3 w-3 text-green-500" />
                                                )}
                                                {objectField.required
                                                    ? 'Required'
                                                    : 'Optional'}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {objectField.localized ? (
                                                    <Eye className="h-3 w-3 text-blue-500" />
                                                ) : (
                                                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                                                )}
                                                {objectField.localized
                                                    ? 'Translatable'
                                                    : 'Not Translatable'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Relationships */}
            {objectRelationships.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Link className="h-5 w-5" />
                            Relationships ({objectRelationships.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {objectRelationships.map(
                                (objectRelationship, index) => (
                                    <div
                                        key={index}
                                        className="border border-border rounded-lg p-4"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Link className="h-4 w-4 text-muted-foreground" />

                                                <span className="font-medium">
                                                    {getLocalizedField(
                                                        objectRelationship.label,
                                                    )}
                                                </span>
                                            </div>
                                            <Badge variant="outline">
                                                {objectRelationship.type}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Object Relationship to:{' '}
                                            <span className="font-medium text-foreground">
                                                {
                                                    objectRelationship.objectDefinitionName2
                                                }
                                            </span>
                                        </div>

                                        {objectRelationship.name && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {objectRelationship.name}
                                            </p>
                                        )}
                                    </div>
                                ),
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </ScrollArea>
    );
}
