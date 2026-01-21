import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
}

interface GenericDataTableProps<T> {
    title: string;
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
}

export function GenericDataTable<T>({
    title,
    data,
    columns,
    loading,
}: GenericDataTableProps<T>) {
    return (
        <Card className="h-full border-0 shadow-none">
            <CardHeader className="px-0 pt-0">
                <CardTitle>
                    {title} ({data.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((col, index) => (
                                    <TableHead key={index}>
                                        {col.header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {columns.map((col, colIndex) => (
                                        <TableCell key={colIndex}>
                                            {col.cell
                                                ? col.cell(item)
                                                : (item[
                                                      col.accessorKey as keyof T
                                                  ] as React.ReactNode)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                            {loading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
