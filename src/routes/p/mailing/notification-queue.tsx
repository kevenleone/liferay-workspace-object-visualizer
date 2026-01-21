import { createFileRoute } from '@tanstack/react-router';
import { getNotificationQueueEntriesPage } from 'liferay-headless-rest-client/notification-v1.0';
import { Mail } from 'lucide-react';
import { useState } from 'react';

import { EmailRender } from '@/components/email/email-render';
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

function EmailPreviewContent({
    notificationQueue,
}: {
    notificationQueue: any;
}) {
    return (
        <>
            <div className="bg-muted p-4 rounded-lg border">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                            From:
                        </span>
                        <span className="text-sm text-foreground font-medium">
                            {notificationQueue.fromName}
                        </span>
                    </div>
                    <div className="flex items-start justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                            To:
                        </span>
                        <div className="text-right">
                            <span className="text-sm text-foreground font-medium">
                                {notificationQueue.recipientsSummary}
                            </span>
                        </div>
                    </div>
                    {notificationQueue.recipients.some((r: any) => r.cc) && (
                        <div className="flex items-start justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                                Cc:
                            </span>
                            <div className="text-right">
                                {notificationQueue.recipients
                                    .filter((r: any) => r.cc)
                                    .map((r: any, index: number) => (
                                        <span
                                            key={index}
                                            className="text-sm text-foreground font-medium"
                                        >
                                            {r.cc}
                                            {index <
                                                notificationQueue.recipients.filter(
                                                    (r: any) => r.cc,
                                                ).length -
                                                1 && ', '}
                                        </span>
                                    ))}
                            </div>
                        </div>
                    )}
                    {notificationQueue.recipients.some((r: any) => r.bcc) && (
                        <div className="flex items-start justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                                Bcc:
                            </span>
                            <div className="text-right">
                                {notificationQueue.recipients
                                    .filter((r: any) => r.bcc)
                                    .map((r: any, index: number) => (
                                        <span
                                            key={index}
                                            className="text-sm text-foreground font-medium"
                                        >
                                            {r.bcc}
                                            {index <
                                                notificationQueue.recipients.filter(
                                                    (r: any) => r.bcc,
                                                ).length -
                                                1 && ', '}
                                        </span>
                                    ))}
                            </div>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                            Subject:
                        </span>
                        <span className="text-sm text-foreground font-medium">
                            {notificationQueue.subject}
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-card border rounded-lg">
                <div className="p-6">
                    <EmailRender>{notificationQueue.body}</EmailRender>
                </div>
                <div className="border-t bg-muted p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                        This is an automated notification from your system.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Please do not reply to this email.
                    </p>
                </div>
            </div>
        </>
    );
}

function NotificationQueuePage() {
    const notificationQueueEntriesPage = Route.useLoaderData();
    const notificationQueueEntries = notificationQueueEntriesPage?.items ?? [];

    const [notificationQueue, setNotificationQueue] = useState<any>(null);

    const columns = [
        {
            accessorKey: 'id' as const,
            header: 'ID',
        },
        {
            accessorKey: 'subject' as const,
            cell: (item: any) => (
                <span className="font-medium">{item.subject}</span>
            ),
            header: 'Subject',
        },
        {
            accessorKey: 'fromName' as const,
            cell: (item: any) => (
                <span className="text-gray-600">{item.fromName}</span>
            ),
            header: 'From',
        },
        {
            accessorKey: 'recipientsSummary' as const,
            header: 'Recipients',
        },
        {
            accessorKey: 'status' as const,
            cell: (item: any) => (
                <Badge variant={item.status === 0 ? 'secondary' : 'default'}>
                    {item.status === 0 ? 'Pending' : 'Sent'}
                </Badge>
            ),
            header: 'Status',
        },
        {
            cell: (item: any) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNotificationQueue(item)}
                >
                    Preview Email
                </Button>
            ),
            header: 'Actions',
            id: 'actions',
        },
    ];

    return (
        <div className="p-6 overflow-auto h-screen bg-gray-50/50">
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
                open={!!notificationQueue}
                onOpenChange={(open) => !open && setNotificationQueue(null)}
            >
                <DialogContent className="w-5xl h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-primary" />
                            Email Preview
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        {notificationQueue && (
                            <EmailPreviewContent
                                notificationQueue={notificationQueue}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
