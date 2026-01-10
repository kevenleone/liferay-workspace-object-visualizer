import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { DOCUMENTS_DATA } from '@/lib/mock-data';
import { FileText, Folder, Image, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export const Route = createFileRoute('/p/documents')({
    component: DocumentsPage,
});

function DocumentsPage() {
    const [previewItem, setPreviewItem] = useState<any>(null);

    const handleDownload = (doc: any) => {
        // Mock download
        alert(`Downloading ${doc.title}...`);
    };

    return (
        <div className="p-6 h-full overflow-auto bg-gray-50/50">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-montserrat text-gray-900">
                        Documents and Media
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your digital assets.
                    </p>
                </div>
                <Button>Upload File</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {DOCUMENTS_DATA.map((doc) => (
                    <Card
                        key={doc.id}
                        className="overflow-hidden group hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setPreviewItem(doc)}
                    >
                        <CardContent className="p-0 aspect-[4/3] relative bg-gray-100 flex items-center justify-center">
                            {doc.thumbnail ? (
                                <img
                                    src={doc.thumbnail}
                                    alt={doc.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-gray-400">
                                    {doc.type === 'folder' ? (
                                        <Folder className="h-16 w-16 text-blue-400" />
                                    ) : (
                                        <FileText className="h-16 w-16" />
                                    )}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2 gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-700 bg-white/80 hover:bg-white rounded-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPreviewItem(doc);
                                    }}
                                    title="Preview"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-700 bg-white/80 hover:bg-white rounded-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload(doc);
                                    }}
                                    title="Download"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter className="p-3 block">
                            <div className="flex items-center gap-2 mb-1">
                                {doc.type === 'folder' ? (
                                    <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                ) : doc.type === 'image' ? (
                                    <Image className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                ) : (
                                    <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                )}
                                <div
                                    className="font-medium text-sm truncate"
                                    title={doc.title}
                                >
                                    {doc.title}
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {doc.size
                                    ? doc.size
                                    : `${Math.floor(Math.random() * 10) + 1} items`}{' '}
                                •{' '}
                                {new Date(
                                    doc.dateModified,
                                ).toLocaleDateString()}
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Dialog
                open={!!previewItem}
                onOpenChange={(open) => !open && setPreviewItem(null)}
            >
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{previewItem?.title}</DialogTitle>
                    </DialogHeader>
                    {previewItem && (
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 bg-gray-100 rounded-lg flex items-center justify-center min-h-[300px]">
                                {previewItem.thumbnail ? (
                                    <img
                                        src={previewItem.thumbnail}
                                        alt={previewItem.title}
                                        className="max-h-[400px] object-contain"
                                    />
                                ) : (
                                    <div className="text-gray-400">
                                        {previewItem.type === 'folder' ? (
                                            <Folder className="h-32 w-32 text-blue-400" />
                                        ) : (
                                            <FileText className="h-32 w-32" />
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="w-full md:w-64 space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Type
                                    </div>
                                    <div className="capitalize">
                                        {previewItem.type}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Size
                                    </div>
                                    <div>{previewItem.size || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Date Modified
                                    </div>
                                    <div>
                                        {new Date(
                                            previewItem.dateModified,
                                        ).toLocaleString()}
                                    </div>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={() => handleDownload(previewItem)}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
