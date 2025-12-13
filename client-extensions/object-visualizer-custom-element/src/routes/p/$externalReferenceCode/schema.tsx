import { SchemaViewer } from '@/components/schema-viewer';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';
import { ObjectDefinition } from 'liferay-headless-rest-client/object-admin-v1.0';

export const Route = createFileRoute('/p/$externalReferenceCode/schema')({
    component: RouteComponent,
});

function RouteComponent() {
    const objectDefinition = useLoaderData({
        from: '/p/$externalReferenceCode',
    });

    return (
        <SchemaViewer
            objectDefinition={objectDefinition as Required<ObjectDefinition>}
        />
    );
}
