import { createFileRoute, Outlet } from '@tanstack/react-router';
import { getMyUserAccount } from 'liferay-headless-rest-client/headless-admin-user-v1.0';
import {
    getObjectDefinitionsPage,
    ObjectDefinition,
} from 'liferay-headless-rest-client/object-admin-v1.0';
import { useState } from 'react';

import { ExportImportDialog } from '@/components/export-import-dialog';
import { Sidebar } from '@/components/sidebar';
import { liferayClient } from '@/lib/headless-client';

export const Route = createFileRoute('/p')({
    component: RouteComponent,
    loader: async () => {
        const [{ data: myUserAccount }, { data: objectDefinitionData }] =
            await Promise.all([
                getMyUserAccount({
                    client: liferayClient,
                }),
                getObjectDefinitionsPage({
                    client: liferayClient,
                    query: {
                        pageSize: '-1',
                        sort: 'name:asc',
                    },
                }),
            ]);

        return {
            myUserAccount,
            objectDefinitions:
                objectDefinitionData?.items as Required<ObjectDefinition>[],
        };
    },
    staleTime: 60000,
});

function RouteComponent() {
    const { myUserAccount, objectDefinitions } = Route.useLoaderData();
    const [showExportImport, setShowExportImport] = useState(false);
    const [exportImportInitialTab, setExportImportInitialTab] = useState<
        'export' | 'import'
    >('export');

    console.log(myUserAccount);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <Sidebar
                myUserAccount={myUserAccount}
                objectDefinitions={objectDefinitions}
                onExportImport={(initialTab) => {
                    setExportImportInitialTab(initialTab ?? 'export');
                    setShowExportImport(true);
                }}
            />

            <div className="flex-1 min-w-0">
                <Outlet />
            </div>

            <ExportImportDialog
                open={showExportImport}
                onOpenChange={setShowExportImport}
                objectDefinitions={objectDefinitions}
                initialTab={exportImportInitialTab}
            />
        </div>
    );
}
