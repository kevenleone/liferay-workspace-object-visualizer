import { useState } from 'react';

import { ExportImportDialog } from '@/components/export-import-dialog';
import { MainContent } from '@/components/main-content';
import { Sidebar } from '@/components/sidebar';

export function DatabaseBrowser() {
    const [selectedObject, setSelectedObject] = useState<string | null>(null);
    const [showExportImport, setShowExportImport] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <Sidebar
                selectedObject={selectedObject}
                onSelectObject={setSelectedObject}
                selectedEnvironment={''}
                onExportImport={() => setShowExportImport(true)}
            />

            <div className="flex-1 min-w-0">
                <MainContent selectedObject={selectedObject} />
            </div>

            <ExportImportDialog
                open={showExportImport}
                onOpenChange={setShowExportImport}
            />
        </div>
    );
}
