import { getObjectDefinitionByExternalReferenceCode } from 'liferay-headless-rest-client/object-admin-v1.0';
import { Table, Eye, Code, Play } from 'lucide-react';
import {
    createFileRoute,
    Outlet,
    useLocation,
    useNavigate,
} from '@tanstack/react-router';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { liferayClient } from '@/lib/headless-client';
import { getLocalizedField } from '@/utils';

export const Route = createFileRoute('/p/$externalReferenceCode')({
    component: RouteComponent,
    loader: async ({ params: { externalReferenceCode } }) => {
        const { data } = await getObjectDefinitionByExternalReferenceCode({
            client: liferayClient,
            path: { externalReferenceCode },
        });

        if (data) {
            return data;
        }

        throw new Error('Object definition not found');
    },
    staleTime: 60000,
});

function RouteComponent() {
    const objectDefinition = Route.useLoaderData();
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { path: '/', icon: Eye, label: 'Data' },
        { path: 'schema', icon: Code, label: 'Schema' },
        { path: 'query', icon: Play, label: 'Query' },
    ];

    const activeRoute = navItems.some(({ path }) => pathname.endsWith(path));

    return (
        <div className="flex-1 flex flex-col bg-background min-h-0">
            <div className="border-b border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Table className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-montserrat font-bold text-foreground">
                        {getLocalizedField(objectDefinition.label)}
                    </h1>

                    <Badge variant="secondary" className="ml-2">
                        {objectDefinition.system ? 'System' : 'Custom Object'}
                    </Badge>
                </div>

                <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
                    {navItems.map(({ path, icon: Icon, label }, index) => (
                        <Button
                            className="h-9 px-4"
                            key={path}
                            variant={
                                (index === 0 && !activeRoute) ||
                                pathname.endsWith(path)
                                    ? 'default'
                                    : 'ghost'
                            }
                            size="sm"
                            onClick={() =>
                                navigate({
                                    to: `/p/${objectDefinition.externalReferenceCode}/${path}`,
                                })
                            }
                        >
                            <Icon className="h-4 w-4 mr-2" />
                            {label}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-hidden min-h-0">
                <div className="h-full p-6 overflow-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
