import { useState, useCallback, useEffect } from 'react';
import {
    PortalInstance,
    getPortalInstancesPage,
    postPortalInstance,
} from 'liferay-headless-rest-client/headless-portal-instances-v1.0';
import { createFileRoute } from '@tanstack/react-router';
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
import { Database, Plus } from 'lucide-react';

export const Route = createFileRoute('/p/virtual-instances')({
    component: VirtualInstancesPage,
});

function VirtualInstancesPage() {
    const [instances, setInstances] = useState<PortalInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newPortalInstance, setNewPortalInstance] = useState<PortalInstance>({
        portalInstanceId: '',
        domain: '',
        virtualHost: '',
    });

    const fetchInstances = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getPortalInstancesPage();
            if (response.data) {
                setInstances(response.data.items || []);
            }
        } catch (error) {
            console.error('Error fetching portal instances:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInstances();
    }, [fetchInstances]);

    const handleCreateInstance = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await postPortalInstance({
                body: newPortalInstance,
            });
            setIsCreateDialogOpen(false);
            setNewPortalInstance({
                portalInstanceId: '',
                domain: '',
                virtualHost: '',
            });
            fetchInstances();
        } catch (error) {
            console.error('Error creating portal instance:', error);
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
                loading={loading}
            />

            <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            >
                <DialogContent>
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
                            <Label htmlFor="virtualHost">Virtual Host</Label>
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
        </div>
    );
}
