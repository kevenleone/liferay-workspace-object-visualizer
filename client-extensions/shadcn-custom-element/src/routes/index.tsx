import { Button } from '@/components/ui/button';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="flex flex-col max-w-7xl mx-auto space-y-6">
            <span>Hello "/"</span>

            <Button>Hello with Liferay + ShadCN</Button>
        </div>
    );
}
