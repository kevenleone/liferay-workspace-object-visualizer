import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type PaginationControlsProps = {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    currentCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    pageSizeOptions?: number[];
};

export default function PaginationControls({
    currentPage,
    totalPages,
    pageSize,
    totalCount,
    currentCount,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [5, 10, 20, 50],
}: PaginationControlsProps) {
    const safeTotalPages = Math.max(totalPages, 1);
    const startIndex = Math.max(0, (currentPage - 1) * pageSize);
    const endIndex =
        totalCount === 0
            ? 0
            : Math.min(startIndex + pageSize, currentCount || totalCount);

    const goToPage = (page: number) => {
        const nextPage = Math.min(Math.max(page, 1), safeTotalPages);
        onPageChange(nextPage);
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                    Rows per page:
                </span>
                <Select
                    value={String(pageSize)}
                    onValueChange={(value) => onPageSizeChange(Number(value))}
                >
                    <SelectTrigger className="w-20">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {pageSizeOptions.map((option) => (
                            <SelectItem key={option} value={String(option)}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                    Showing {totalCount === 0 ? 0 : startIndex + 1} to{' '}
                    {endIndex} of {totalCount} entries
                </span>
            </div>

            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm px-3">
                    Page {currentPage} of {safeTotalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === safeTotalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(safeTotalPages)}
                    disabled={currentPage === safeTotalPages}
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
