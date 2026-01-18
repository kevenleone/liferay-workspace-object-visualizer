import { createFileRoute, useRouter } from '@tanstack/react-router';
import { toast } from '@/hooks/use-toast';
import { TemplatesList } from '@/components/notification-templates';

import {
    deleteNotificationTemplate,
    getNotificationTemplatesPage,
    NotificationTemplate,
    PageNotificationTemplate,
    postNotificationTemplate,
} from 'liferay-headless-rest-client/notification-v1.0';
import { liferayClient } from '@/lib/headless-client';

export const Route = createFileRoute('/p/mailing/notification-templates/')({
    component: NotificationTemplatesPage,
    loader: async () => {
        const { data } = await getNotificationTemplatesPage({
            query: { sort: 'name:asc' },
            client: liferayClient,
        });

        return data as PageNotificationTemplate;
    },
});

function NotificationTemplatesPage() {
    const pageNotificationTemplate = Route.useLoaderData();
    const { invalidate } = useRouter();

    const handleDeleteTemplate = async (notificationTemplateId: string) => {
        const { error } = await deleteNotificationTemplate({
            client: liferayClient,
            path: { notificationTemplateId },
        });

        if (error) {
            return console.error(error);
        }

        invalidate();

        toast({
            title: 'Template Deleted',
            description: 'Template has been deleted successfully.',
        });
    };

    const handleDuplicateTemplate = async (
        notificationTemplate: NotificationTemplate,
    ) => {
        const { error } = await postNotificationTemplate({
            body: {
                ...notificationTemplate,
                externalReferenceCode: `${notificationTemplate.externalReferenceCode}_COPY`,
                name: `${notificationTemplate.name} (Copy)`,
            },
            client: liferayClient,
        });

        if (error) {
            return toast({
                className: 'text-white',
                description: (error as any).title,
                title: 'Unable to duplicate template',
                variant: 'destructive',
            });
        }

        invalidate();

        toast({
            title: 'Template Duplicated',
            description: `Template "${notificationTemplate.name}" has been duplicated.`,
        });
    };

    return (
        <div className="p-6 overflow-auto bg-gray-50/50">
            <div className="mb-6">
                <h1 className="text-2xl font-bold font-montserrat text-gray-900">
                    Notification Templates
                </h1>
                <p className="text-muted-foreground">
                    Manage and create notification templates.
                </p>
            </div>

            <TemplatesList
                templates={pageNotificationTemplate?.items ?? []}
                onDeleteTemplate={handleDeleteTemplate}
                onDuplicateTemplate={handleDuplicateTemplate}
            />
        </div>
    );
}
