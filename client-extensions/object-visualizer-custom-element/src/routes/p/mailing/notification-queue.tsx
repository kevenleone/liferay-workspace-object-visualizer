import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { getNotificationQueueEntriesPage } from 'liferay-headless-rest-client/notification-v1.0';

import { GenericDataTable } from '@/components/generic-data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { liferayClient } from '@/lib/headless-client';
import { JsonViewer } from '@/components/ui/json-viewer';

export const Route = createFileRoute('/p/mailing/notification-queue')({
    component: NotificationQueuePage,
    loader: async () => {
        const { data, error } = await getNotificationQueueEntriesPage({
            client: liferayClient,
        });

        if (error) {
            return null;
        }

        return data;
    },
});

function NotificationQueuePage() {
    const notificationQueueEntriesPage = Route.useLoaderData();
    const notificationQueueEntries = notificationQueueEntriesPage?.items ?? [];

    const [selectedItem, setSelectedItem] = useState<any>(null);

    const columns = [
        {
            header: 'ID',
            accessorKey: 'id' as const,
        },
        {
            header: 'Subject',
            accessorKey: 'subject' as const,
            cell: (item: any) => (
                <span className="font-medium">{item.subject}</span>
            ),
        },
        {
            header: 'From',
            accessorKey: 'fromName' as const,
            cell: (item: any) => (
                <span className="text-gray-600">{item.fromName}</span>
            ),
        },
        {
            header: 'Recipients',
            accessorKey: 'recipientsSummary' as const,
        },
        {
            header: 'Status',
            accessorKey: 'status' as const,
            cell: (item: any) => (
                <Badge variant={item.status === 0 ? 'secondary' : 'default'}>
                    {item.status === 0 ? 'Pending' : 'Sent'}
                </Badge>
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
        <div className="p-6 overflow-auto bg-gray-50/50">
            <div className="mb-6">
                <h1 className="text-2xl font-bold font-montserrat text-gray-900">
                    Notification Queue
                </h1>
                <p className="text-muted-foreground">
                    View and manage queued notifications.
                </p>
            </div>

            <GenericDataTable
                title="Queue Entries"
                data={notificationQueueEntries}
                columns={columns}
            />

            <Dialog
                open={!!selectedItem}
                onOpenChange={(open) => !open && setSelectedItem(null)}
            >
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Notification Details</DialogTitle>
                    </DialogHeader>

                    {selectedItem && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Subject
                                    </div>
                                    <div className="font-medium">
                                        {selectedItem.subject}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        From
                                    </div>
                                    <div>{selectedItem.fromName}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Status
                                    </div>
                                    <Badge
                                        variant={
                                            selectedItem.status === 0
                                                ? 'secondary'
                                                : 'default'
                                        }
                                    >
                                        {selectedItem.status === 0
                                            ? 'Pending'
                                            : 'Sent'}
                                    </Badge>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Recipients
                                    </div>
                                    <div>{selectedItem.recipientsSummary}</div>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">
                                    Raw Data
                                </div>
                                <div className="bg-muted p-4 rounded-md overflow-auto max-h-[600px]">
                                    <JsonViewer
                                        className="max-h-[600px]"
                                        data={selectedItem}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
