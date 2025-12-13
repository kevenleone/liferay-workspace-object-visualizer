import { QueryInterface } from '@/components/query-interface';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/p/$externalReferenceCode/query')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div>
            <QueryInterface objectName={'User'} />
        </div>
    );
}
