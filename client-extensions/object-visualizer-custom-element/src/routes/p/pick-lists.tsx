import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { GenericDataTable } from '@/components/generic-data-table';
import { PICK_LISTS_DATA } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export const Route = createFileRoute('/p/pick-lists')({
    component: PickListsPage,
});

function PickListsPage() {
    const [selectedList, setSelectedList] = useState<any>(null);

    const columns = [
        {
            header: 'ID',
            accessorKey: 'id' as const,
        },
        {
            header: 'Name',
            accessorKey: 'name' as const,
            cell: (item: any) => (
                <span className="font-medium">{item.name}</span>
            ),
        },
        {
            header: 'External Reference Code',
            accessorKey: 'externalReferenceCode' as const,
            cell: (item: any) => (
                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                    {item.externalReferenceCode}
                </code>
            ),
        },
        {
            header: 'System',
            accessorKey: 'system' as const,
            cell: (item: any) => (
                <Badge variant={item.system ? 'default' : 'secondary'}>
                    {item.system ? 'System' : 'Custom'}
                </Badge>
            ),
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: (item: any) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedList(item)}
                >
                    View Entries
                </Button>
            ),
        },
    ];

    return (
        <div className="p-6 h-full overflow-auto bg-gray-50/50">
            <div className="mb-6">
                <h1 className="text-2xl font-bold font-montserrat text-gray-900">
                    Pick Lists
                </h1>
                <p className="text-muted-foreground">
                    Manage your pick lists and list type entries.
                </p>
            </div>

            <GenericDataTable
                title="Pick Lists"
                data={PICK_LISTS_DATA}
                columns={columns}
            />

            <Dialog
                open={!!selectedList}
                onOpenChange={(open) => !open && setSelectedList(null)}
            >
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Pick List Entries</DialogTitle>
                        <DialogDescription>
                            Entries for {selectedList?.name} (
                            {selectedList?.externalReferenceCode})
                        </DialogDescription>
                    </DialogHeader>

                    <div className="border rounded-md mt-4 max-h-[400px] overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Key</TableHead>
                                    <TableHead>ERC</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedList?.listTypeEntries?.length > 0 ? (
                                    selectedList.listTypeEntries.map(
                                        (entry: any) => (
                                            <TableRow key={entry.id}>
                                                <TableCell className="font-medium">
                                                    {entry.name}
                                                </TableCell>
                                                <TableCell>
                                                    {entry.key}
                                                </TableCell>
                                                <TableCell>
                                                    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                                        {
                                                            entry.externalReferenceCode
                                                        }
                                                    </code>
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="text-center py-8 text-muted-foreground"
                                        >
                                            No entries found for this pick list.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
