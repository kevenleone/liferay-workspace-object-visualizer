import JsonToCsvConverter from '@/components/dynamic-table';
import { Badge } from '@/components/ui/badge';
import { Liferay } from '@/lib/liferay';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';
import {
    ObjectDefinition,
    ObjectField,
} from 'liferay-headless-rest-client/object-admin-v1.0';
import { useMemo } from 'react';

export const Route = createFileRoute('/p/$externalReferenceCode/')({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>) => {
        return {
            page:
                typeof search.page === 'string'
                    ? parseInt(search.page, 10)
                    : typeof search.page === 'number'
                    ? search.page
                    : 1,
            pageSize:
                typeof search.pageSize === 'string'
                    ? parseInt(search.pageSize, 10)
                    : typeof search.pageSize === 'number'
                    ? search.pageSize
                    : 10,
        };
    },
    loaderDeps: ({ search }) => ({
        page: search.page ?? 1,
        pageSize: search.pageSize ?? 10,
    }),
    loader: async ({ parentMatchPromise, deps }) => {
        const { loaderData } = await parentMatchPromise;
        const page = deps.page;
        const pageSize = deps.pageSize;

        try {
            const url = new URL(
                loaderData?.restContextPath as string,
                window.location.origin
            );
            url.searchParams.set('page', String(page));
            url.searchParams.set('pageSize', String(pageSize));

            const response = await Liferay.Util.fetch(url.toString());

            const data = await response.json();

            return data;
        } catch (error) {
            console.error(error);
        }

        return {};
    },
    staleTime: 60000,
});

function RouteComponent() {
    const loaderData = Route.useLoaderData();

    const objectDefinition = useLoaderData({
        from: '/p/$externalReferenceCode',
    });

    const rows = useMemo(() => {
        if (!loaderData || !loaderData?.items?.length) {
            return [];
        }

        const objectFields = objectDefinition.objectFields as ObjectField[];

        // Field transformation map for special field handling
        const fieldTransformers: Record<
            string,
            (
                item: any,
                options: {
                    objectDefinition: ObjectDefinition;
                    objectEntry: any;
                }
            ) => any
        > = {
            id: (item) => (
                <Badge className="bg-emerald-400" variant="destructive">
                    {item.id}
                </Badge>
            ),
            createDate: (item) =>
                new Date(item.createDate || item.dateCreated).toLocaleString(
                    Liferay.ThemeDisplay.getBCP47LanguageId()
                ),
            modifiedDate: (item) =>
                new Date(item.modifiedDate || item.dateModified).toLocaleString(
                    Liferay.ThemeDisplay.getBCP47LanguageId()
                ),
            status: (_item, { objectEntry }) => (
                <Badge variant={objectEntry?.code ? 'default' : 'secondary'}>
                    {objectEntry?.label_i18n}
                </Badge>
            ),
            creator: (_item, { objectEntry }) => objectEntry?.name,
        };

        const transformFieldValue = (
            fieldName: string,
            item: any,
            objectDefinition: ObjectDefinition,
            objectEntry: any
        ): any => {
            const transformer = fieldTransformers[fieldName];

            return transformer
                ? transformer(item, { objectEntry, objectDefinition })
                : objectEntry;
        };

        return loaderData.items.map((item: any) => {
            delete item.actions;

            const newItem: Record<string, any> = {};

            for (const objectField of objectFields) {
                if (!objectField.name) continue;

                const objectEntry = item[objectField.name];
                const fieldLabel =
                    objectField?.label?.en_US || objectField.name;

                // Only apply transformations for non-system fields or specific system fields
                if (
                    [
                        'createDate',
                        'creator',
                        'id',
                        'modifiedDate',
                        'status',
                    ].includes(objectField.name)
                ) {
                    newItem[fieldLabel] = transformFieldValue(
                        objectField.name,
                        item,
                        objectDefinition,
                        objectEntry
                    );
                } else {
                    newItem[fieldLabel] = objectEntry;
                }
            }

            return newItem;
        });
    }, [loaderData, objectDefinition]);

    return (
        <div>
            <JsonToCsvConverter
                entriesPage={loaderData}
                objectDefinition={objectDefinition}
                data={rows}
            />

            {/* <DataTableBrowser objectName="User"></DataTableBrowser> */}
        </div>
    );
}
