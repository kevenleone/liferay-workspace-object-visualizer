import { LiveActivityFeed } from '@/components/live-activity-feed';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/p/$externalReferenceCode/live')({
    component: RouteComponent,
});

function RouteComponent() {
    return <LiveActivityFeed objectName={'User'} />;
}
