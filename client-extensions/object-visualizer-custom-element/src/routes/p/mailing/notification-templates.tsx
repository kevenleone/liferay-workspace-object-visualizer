import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { GenericDataTable } from '@/components/generic-data-table';
import { NOTIFICATION_TEMPLATES_DATA } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export const Route = createFileRoute('/p/mailing/notification-templates')({
    component: NotificationTemplatesPage,
});

function NotificationTemplatesPage() {
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const columns = [
        {
            header: 'ID',
            accessorKey: 'id' as const,
        },
        {
            header: 'Name',
            accessorKey: 'name' as const,
            cell: (item: any) => (
                <span className="font-medium">{item.name}</span>
            ),
        },
        {
            header: 'External Reference Code',
            accessorKey: 'externalReferenceCode' as const,
            cell: (item: any) => (
                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                    {item.externalReferenceCode}
                </code>
            ),
        },
        {
            header: 'Subject',
            accessorKey: 'subject' as const,
            cell: (item: any) => <span>{item.subject?.en_US || ''}</span>,
        },
        {
            header: 'Recipient Type',
            accessorKey: 'recipientType' as const,
            cell: (item: any) => (
                <span className="capitalize text-sm text-gray-600">
                    {item.recipientType}
                </span>
            ),
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: (item: any) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedItem(item)}
                >
                    View Details
                </Button>
            ),
        },
    ];

    return (
        <div className="p-6 h-full overflow-auto bg-gray-50/50">
            <div className="mb-6">
                <h1 className="text-2xl font-bold font-montserrat text-gray-900">
                    Notification Templates
                </h1>
                <p className="text-muted-foreground">
                    Manage your email and notification templates.
                </p>
            </div>
            <GenericDataTable
                title="Templates"
                data={NOTIFICATION_TEMPLATES_DATA}
                columns={columns}
            />

            <Dialog
                open={!!selectedItem}
                onOpenChange={(open) => !open && setSelectedItem(null)}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Template Details</DialogTitle>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Name
                                    </div>
                                    <div className="font-medium">
                                        {selectedItem.name}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        ERC
                                    </div>
                                    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                        {selectedItem.externalReferenceCode}
                                    </code>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Recipient Type
                                    </div>
                                    <div className="capitalize">
                                        {selectedItem.recipientType}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        From Address
                                    </div>
                                    <div>{selectedItem.fromAddress || '-'}</div>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">
                                    Subject (en_US)
                                </div>
                                <div className="p-2 border rounded-md text-sm">
                                    {selectedItem.subject?.en_US}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">
                                    Body (en_US)
                                </div>
                                <div className="p-2 border rounded-md text-sm whitespace-pre-wrap max-h-[200px] overflow-auto bg-muted/30">
                                    {selectedItem.body?.en_US}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">
                                    Raw Data
                                </div>
                                <div className="bg-muted p-4 rounded-md overflow-auto max-h-[200px]">
                                    <pre className="text-xs font-mono">
                                        {JSON.stringify(selectedItem, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
