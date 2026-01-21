import { createFileRoute, useLoaderData, useNavigate } from '@tanstack/react-router';
import { Activity, Database, FileText, Globe } from 'lucide-react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/p/')({
    component: RouteComponent,
});

const capabilities = [
    {
        bg: 'bg-gray-50',
        color: 'text-gray-600',
        description: 'Manage global settings and virtual instances.',
        icon: Globe,
        items: [
            {
                label: 'Virtual Instances',
                path: '/p/virtual-instances',
            },
        ],
        title: 'Global',
    },
    {
        bg: 'bg-purple-50',
        color: 'text-purple-600',
        description: 'Manage notification templates and queues.',
        icon: FileText,
        items: [
            {
                label: 'Notification Templates',
                path: '/p/mailing/notification-templates',
            },
            {
                label: 'Notification Queue',
                path: '/p/mailing/notification-queue',
            },
        ],
        title: 'Mailing',
    },
    {
        bg: 'bg-blue-50',
        color: 'text-blue-600',
        description: 'Define and manage custom objects and lists.',
        icon: Database,
        items: [
            { label: 'Objects', path: '/p' },
            { label: 'Pick Lists', path: '/p/pick-lists' },
        ],
        title: 'Objects Framework',
    },
    {
        bg: 'bg-orange-50',
        color: 'text-orange-600',
        description: 'Test and debug your API queries.',
        icon: Activity,
        items: [
            { label: 'GraphQL Playground', path: '/p/query/graphql' },
            { label: 'REST Playground', path: '/p/query/rest' },
        ],
        title: 'Query',
    },
];

function RouteComponent() {
    const navigate = useNavigate();
    const { myUserAccount } = useLoaderData({ from: "/p" })


    return (
        <div className="p-8 h-full overflow-auto bg-gray-50/30">
            <div className="mb-8">
                <h1 className="text-3xl font-montserrat font-bold text-indigo-700 mb-2">
                    Hello{myUserAccount && `, ${myUserAccount?.name?.split(" ")?.at(0)}`} 👋🏻
                </h1>

                <p className="text-lg text-muted-foreground">
                    Welcome to Liferay Playground. Your central hub for data management and
                    exploration.

                    <p className='text-2xl mt-4'>Capabalities</p>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {capabilities.map((cap, index) => (
                    <Card
                        key={index}
                        className="hover:shadow-lg transition-shadow border-gray-200"
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${cap.bg}`}>
                                    <cap.icon
                                        className={`h-6 w-6 ${cap.color}`}
                                    />
                                </div>

                                <div>
                                    <CardTitle className="text-xl">
                                        {cap.title}
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        {cap.description}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-2">
                                {cap.items.map((item, i) => (
                                    <div
                                        key={i}
                                        onClick={() =>
                                            navigate({ to: item.path })
                                        }
                                        className="p-3 rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer flex items-center justify-between group transition-colors"
                                    >
                                        <span className="font-medium text-gray-700 group-hover:text-gray-900">
                                            {item.label}
                                        </span>
                                        <span className="text-gray-400 group-hover:text-gray-600">
                                            →
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
