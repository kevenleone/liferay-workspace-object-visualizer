import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import {
    deletePortalInstance,
    putPortalInstanceDeactivate,
    putPortalInstanceActivate,
    PagePortalInstance,
    PortalInstance,
    getPortalInstancesPage,
    postPortalInstance,
} from 'liferay-headless-rest-client/headless-portal-instances-v1.0';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { GenericDataTable } from '@/components/generic-data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Database, Pause, Play, Plus, Trash2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { liferayClient } from '@/lib/headless-client';
import { siteInitializers } from '@/constants/siteInitializers';

export const Route = createFileRoute('/p/virtual-instances')({
    component: VirtualInstancesPage,
    loader: async () => {
        const { data, error } = await getPortalInstancesPage({
            client: liferayClient,
            query: { skipDefault: 'true' },
        });

        if (error) {
            return null;
        }

        return data as PagePortalInstance;
    },
});

function VirtualInstancesPage() {
    const portalInstancesPage = Route.useLoaderData();
    const router = useRouter();

    const instances = portalInstancesPage?.items ?? [];
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [instanceToDelete, setInstanceToDelete] =
        useState<PortalInstance | null>(null);
    const [newPortalInstance, setNewPortalInstance] = useState({
        domain: '',
        portalInstanceId: '',
        virtualHost: '',
        siteInitializerKey: 'com.liferay.site.initializer.welcome',
        admin: {
            emailAddress: '',
            familyName: '',
            givenName: '',
        },
    });

    const handleCreateInstance = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await postPortalInstance({
                body: newPortalInstance,
                client: liferayClient,
            });

            setIsCreateDialogOpen(false);

            setNewPortalInstance({
                portalInstanceId: '',
                domain: '',
                virtualHost: '',
                siteInitializerKey: 'com.liferay.site.initializer.welcome',
                admin: {
                    emailAddress: '',
                    familyName: '',
                    givenName: '',
                },
            });

            // invalidate cache
        } catch (error) {
            console.error('Error creating portal instance:', error);
        }
    };

    const handleActivate = async (instance: PortalInstance) => {
        try {
            await putPortalInstanceActivate({
                path: { portalInstanceId: instance.portalInstanceId as string },
                client: liferayClient,
            });
            router.invalidate();
            toast({
                title: 'Instance Activated',
                description: `Virtual instance "${instance.portalInstanceId}" has been activated.`,
            });
        } catch (error) {
            console.error('Error activating portal instance:', error);
            toast({
                title: 'Activation Failed',
                description: 'Failed to activate the virtual instance.',
                variant: 'destructive',
            });
        }
    };

    const handleDeactivate = async (instance: PortalInstance) => {
        try {
            await putPortalInstanceDeactivate({
                path: { portalInstanceId: instance.portalInstanceId as string },
                client: liferayClient,
            });
            router.invalidate();
            toast({
                title: 'Instance Deactivated',
                description: `Virtual instance "${instance.portalInstanceId}" has been deactivated.`,
            });
        } catch (error) {
            console.error('Error deactivating portal instance:', error);
            toast({
                title: 'Deactivation Failed',
                description: 'Failed to deactivate the virtual instance.',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = (instance: PortalInstance) => {
        setInstanceToDelete(instance);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (instanceToDelete) {
            try {
                await deletePortalInstance({
                    path: {
                        portalInstanceId:
                            instanceToDelete.portalInstanceId as string,
                    },
                    client: liferayClient,
                });
                router.invalidate();
                toast({
                    title: 'Instance Deleted',
                    description: `Virtual instance "${instanceToDelete.portalInstanceId}" has been deleted.`,
                });
                setDeleteDialogOpen(false);
                setInstanceToDelete(null);
            } catch (error) {
                console.error('Error deleting portal instance:', error);
                toast({
                    title: 'Deletion Failed',
                    description: 'Failed to delete the virtual instance.',
                    variant: 'destructive',
                });
            }
        }
    };

    const columns = [
        {
            header: 'Portal Instance ID',
            accessorKey: 'portalInstanceId' as const,
            cell: (item: PortalInstance) => (
                <span className="font-medium text-gray-900">
                    {item.portalInstanceId}
                </span>
            ),
        },
        {
            header: 'Domain',
            accessorKey: 'domain' as const,
        },
        {
            header: 'Virtual Host',
            accessorKey: 'virtualHost' as const,
        },
        {
            header: 'Company ID',
            accessorKey: 'companyId' as const,
            cell: (item: PortalInstance) => (
                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded text-gray-600">
                    {item.companyId}
                </code>
            ),
        },
        {
            header: 'Status',
            accessorKey: 'active' as const,
            cell: (item: PortalInstance) => (
                <Badge variant={item.active ? 'default' : 'secondary'}>
                    {item.active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            header: 'Actions',
            cell: (item: PortalInstance) => (
                <div className="flex items-center justify-end gap-2">
                    {item.active ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivate(item)}
                        >
                            <Pause className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleActivate(item)}
                        >
                            <Play className="h-4 w-4" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item)}
                        className="text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 h-full overflow-auto bg-gray-50/50">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold font-montserrat text-gray-900 flex items-center gap-2">
                        <Database className="h-6 w-6 text-blue-600" />
                        Virtual Instances
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and monitor your Liferay virtual instances.
                    </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Virtual Instance
                </Button>
            </div>

            <GenericDataTable
                title="Virtual Instances"
                data={instances}
                columns={columns}
            />

            <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create Virtual Instance</DialogTitle>
                        <DialogDescription>
                            Fill in the details to create a new virtual
                            instance.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateInstance} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="portalInstanceId">
                                Portal Instance ID
                            </Label>
                            <Input
                                id="portalInstanceId"
                                value={newPortalInstance.portalInstanceId}
                                onChange={(e) =>
                                    setNewPortalInstance({
                                        ...newPortalInstance,
                                        portalInstanceId: e.target.value,
                                    })
                                }
                                placeholder="e.g. liferay.com"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="domain">Domain</Label>
                                <Input
                                    id="domain"
                                    value={newPortalInstance.domain}
                                    onChange={(e) =>
                                        setNewPortalInstance({
                                            ...newPortalInstance,
                                            domain: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. liferay.com"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="virtualHost">
                                    Virtual Host
                                </Label>
                                <Input
                                    id="virtualHost"
                                    value={newPortalInstance.virtualHost}
                                    onChange={(e) =>
                                        setNewPortalInstance({
                                            ...newPortalInstance,
                                            virtualHost: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. www.liferay.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="siteInitializerKey">
                                Site Initializer
                            </Label>
                            <Select
                                value={newPortalInstance.siteInitializerKey}
                                onValueChange={(value) =>
                                    setNewPortalInstance({
                                        ...newPortalInstance,
                                        siteInitializerKey: value,
                                    })
                                }
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a site initializer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {siteInitializers.map((initializer) => (
                                        <SelectItem
                                            key={initializer.key}
                                            value={initializer.key}
                                        >
                                            {initializer.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                                Admin Details
                            </h3>
                            <div className="space-y-2">
                                <Label htmlFor="adminEmail">
                                    Admin Email Address
                                </Label>
                                <Input
                                    id="adminEmail"
                                    type="email"
                                    value={newPortalInstance.admin.emailAddress}
                                    onChange={(e) =>
                                        setNewPortalInstance({
                                            ...newPortalInstance,
                                            admin: {
                                                ...newPortalInstance.admin,
                                                emailAddress: e.target.value,
                                            },
                                        })
                                    }
                                    placeholder="e.g. admin@liferay.com"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="adminFamilyName">
                                        Admin Family Name
                                    </Label>
                                    <Input
                                        id="adminFamilyName"
                                        value={
                                            newPortalInstance.admin.familyName
                                        }
                                        onChange={(e) =>
                                            setNewPortalInstance({
                                                ...newPortalInstance,
                                                admin: {
                                                    ...newPortalInstance.admin,
                                                    familyName: e.target.value,
                                                },
                                            })
                                        }
                                        placeholder="e.g. Doe"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="adminGivenName">
                                        Admin Given Name
                                    </Label>
                                    <Input
                                        id="adminGivenName"
                                        value={
                                            newPortalInstance.admin.givenName
                                        }
                                        onChange={(e) =>
                                            setNewPortalInstance({
                                                ...newPortalInstance,
                                                admin: {
                                                    ...newPortalInstance.admin,
                                                    givenName: e.target.value,
                                                },
                                            })
                                        }
                                        placeholder="e.g. John"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setIsCreateDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Create Instance</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Virtual Instance</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the virtual instance
                            "{instanceToDelete?.portalInstanceId}"? This action
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
