import { createFileRoute } from '@tanstack/react-router';
import { Database } from 'lucide-react';

export const Route = createFileRoute('/p/')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="flex-1 w-full h-full flex items-center justify-center bg-background">
            <div className="text-center">
                <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />

                <h2 className="text-xl font-montserrat font-semibold text-foreground mb-2">
                    Welcome to Objects Browser
                </h2>

                <p className="text-muted-foreground max-w-md">
                    Select an object from the sidebar to view its schema, browse
                    data, or run queries. This interface provides a
                    comprehensive view of your Liferay Objects organized by
                    groups.
                </p>
            </div>
        </div>
    );
}
