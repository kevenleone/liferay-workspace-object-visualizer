import { createFileRoute } from '@tanstack/react-router';
import {
    getNotificationTemplateByExternalReferenceCode,
    NotificationTemplate,
} from 'liferay-headless-rest-client/notification-v1.0';

import EmailTemplateEditor from '@/components/email/email-template-editor';
import { liferayClient } from '@/lib/headless-client';

export const Route = createFileRoute(
    '/p/mailing/notification-templates/$externalReferenceCode',
)({
    component: Template,
    loader: async ({ params: { externalReferenceCode } }) => {
        const { data, error } =
            await getNotificationTemplateByExternalReferenceCode({
                client: liferayClient,
                path: { externalReferenceCode },
            });

        if (error) {
            console.error(error);
        }

        return data;
    },
});

function Template() {
    const notificationTemplate = Route.useLoaderData();

    return (
        <EmailTemplateEditor
            notificationTemplate={
                notificationTemplate as Required<NotificationTemplate>
            }
        />
    );
}
