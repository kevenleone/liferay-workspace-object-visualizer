import JsonToCsvConverter from '@/components/dynamic-table';
import { QueryInterface } from '@/components/query-interface';
import { Badge } from '@/components/ui/badge';
import { Liferay } from '@/lib/liferay';
import {
    createFileRoute,
    useLoaderData,
    useParams,
} from '@tanstack/react-router';
import {
    ObjectDefinition,
    ObjectField,
} from 'liferay-headless-rest-client/object-admin-v1.0';
import { useMemo, useState, useEffect } from 'react';

export const Route = createFileRoute('/p/$externalReferenceCode/query')({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>) => {
        return {
            query: typeof search.query === 'string' ? search.query : '',
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
        query: search.query ?? '',
        page: search.page ?? 1,
        pageSize: search.pageSize ?? 10,
    }),
    loader: async ({ parentMatchPromise, deps }) => {
        const { loaderData } = await parentMatchPromise;
        const { query, page, pageSize } = deps;

        // Only fetch if there's a query
        if (!query) {
            return null;
        }

        try {
            const baseUrl = loaderData?.restContextPath as string;
            if (!baseUrl) {
                return { error: 'REST context path not found' };
            }

            const url = new URL(baseUrl, window.location.origin);

            // Parse and add OData query parameters from the query string
            if (query) {
                // The query string contains OData parameters like "$filter=...&$orderby=..."
                // We need to parse them and add to URL
                const queryParams = new URLSearchParams(query);
                queryParams.forEach((value, key) => {
                    url.searchParams.set(key, value);
                });
            }

            // Add pagination if not already in query
            if (!url.searchParams.has('page')) {
                url.searchParams.set('page', String(page));
            }
            if (!url.searchParams.has('pageSize')) {
                url.searchParams.set('pageSize', String(pageSize));
            }

            const response = await Liferay.Util.fetch(url.toString());
            const data = await response.json();

            return data;
        } catch (error) {
            console.error('Query execution error:', error);
            return {
                error:
                    error instanceof Error
                        ? error.message
                        : 'Query execution failed',
            };
        }
    },
    staleTime: 0, // Don't cache query results
});

function RouteComponent() {
    const params = useParams({ from: '/p/$externalReferenceCode/query' });
    const externalReferenceCode = params.externalReferenceCode;
    const loaderData = Route.useLoaderData();
    const search = Route.useSearch();

    const objectDefinition = useLoaderData({
        from: '/p/$externalReferenceCode',
    });

    const [queryResults, setQueryResults] = useState<any>(loaderData);

    // Update results when loader data changes
    useEffect(() => {
        if (loaderData !== null && loaderData !== undefined) {
            setQueryResults(loaderData);
        }
    }, [loaderData]);

    const rows = useMemo(() => {
        if (
            !queryResults ||
            queryResults.error ||
            !queryResults?.items?.length
        ) {
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
            createDate: (item, { objectDefinition }) =>
                new Date(
                    objectDefinition.system ? item.createDate : item.dateCreated
                ).toLocaleString(Liferay.ThemeDisplay.getBCP47LanguageId()),
            modifiedDate: (item, { objectDefinition }) =>
                new Date(
                    objectDefinition.system
                        ? item.modifiedDate
                        : item.dateModified
                ).toLocaleString(Liferay.ThemeDisplay.getBCP47LanguageId()),
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

        return queryResults.items.map((item: any) => {
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
    }, [queryResults, objectDefinition]);

    return (
        <div className="space-y-4">
            <QueryInterface
                objectDefinition={objectDefinition}
                externalReferenceCode={externalReferenceCode}
            />

            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                    Debug: queryResults=
                    {JSON.stringify({
                        hasResults: !!queryResults,
                        hasError: !!queryResults?.error,
                        hasItems: !!queryResults?.items,
                        itemsLength: queryResults?.items?.length,
                        rowsLength: rows.length,
                    })}
                </div>
            )}

            {queryResults &&
                !queryResults.error &&
                queryResults.items &&
                Array.isArray(queryResults.items) &&
                queryResults.items.length > 0 && (
                    <JsonToCsvConverter
                        entriesPage={queryResults}
                        objectDefinition={objectDefinition}
                        data={rows}
                    />
                )}

            {queryResults &&
                !queryResults.error &&
                (!queryResults.items ||
                    (Array.isArray(queryResults.items) &&
                        queryResults.items.length === 0)) && (
                    <div className="rounded-lg border border-border bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground">
                            Query executed successfully but returned no results.
                        </p>
                    </div>
                )}

            {queryResults?.error && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                    <p className="text-sm font-medium text-destructive">
                        Query Error: {queryResults.error}
                    </p>
                </div>
            )}

            {!queryResults && search?.query && (
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">
                        Loading query results...
                    </p>
                </div>
            )}
        </div>
    );
}
