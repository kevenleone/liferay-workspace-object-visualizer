import { NotificationTemplate } from 'liferay-headless-rest-client/notification-v1.0';
import { Mail, Clock, Users, Maximize2 } from 'lucide-react';
import React, { Fragment, useMemo, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVariables } from '@/hooks/use-variables';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogHeader,
} from '../ui/dialog';

interface EmailPreviewProps {
    notificationTemplate: Required<NotificationTemplate>;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({
    notificationTemplate,
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const { replaceVariables } = useVariables();

    const { processedBody, processedSubject, processedRecipients } =
        useMemo(() => {
            return {
                processedBody: replaceVariables(
                    notificationTemplate.body.en_US,
                ),
                processedRecipients: notificationTemplate.recipients.map(
                    (recipient: any) => ({
                        ...recipient,
                        to: { en_US: replaceVariables(recipient.to!.en_US) },
                        cc: recipient.cc
                            ? { en_US: replaceVariables(recipient.cc!.en_US) }
                            : null,
                        bcc: recipient.bcc
                            ? { en_US: replaceVariables(recipient.bcc!.en_US) }
                            : null,
                        from: replaceVariables(recipient.from),
                        fromName: {
                            en_US: replaceVariables(recipient.fromName!.en_US),
                        },
                    }),
                ),
                processedSubject: replaceVariables(
                    notificationTemplate.subject.en_US,
                ),
            };
        }, [
            notificationTemplate.body.en_US,
            notificationTemplate.recipients,
            notificationTemplate.subject.en_US,
            replaceVariables,
        ]);

    const PreviewContent = () => (
        <>
            <div className="bg-muted p-4 rounded-lg border">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                            From:
                        </span>
                        <span className="text-sm text-foreground">
                            {processedRecipients.length > 0 && (
                                <>
                                    <span
                                        className="text-sm text-foreground font-medium"
                                        dangerouslySetInnerHTML={{
                                            __html: processedRecipients[0]
                                                .fromName.en_US,
                                        }}
                                    />
                                    &ensp;
                                    <span
                                        className="text-sm text-foreground font-medium"
                                        dangerouslySetInnerHTML={{
                                            __html: processedRecipients[0].from,
                                        }}
                                    />
                                    &gt;
                                </>
                            )}
                        </span>
                    </div>
                    <div className="flex items-start justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                            To:
                        </span>
                        <div className="text-right">
                            {processedRecipients.map(({ to }: any, index) => (
                                <Fragment key={index}>
                                    <span
                                        className="text-sm text-foreground font-medium"
                                        dangerouslySetInnerHTML={{
                                            __html: to.en_US,
                                        }}
                                    />

                                    {index < processedRecipients.length - 1 &&
                                        ', '}
                                </Fragment>
                            ))}
                        </div>
                    </div>
                    {processedRecipients.some((r: any) => r.cc) && (
                        <div className="flex items-start justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                                Cc:
                            </span>
                            <div className="text-right">
                                {processedRecipients
                                    .filter((r: any) => r.cc)
                                    .map(({ cc }: any, index) => (
                                        <span key={index}>
                                            {cc.en_US}
                                            {index <
                                                processedRecipients.filter(
                                                    (r: any) => r.cc,
                                                ).length -
                                                    1 && ', '}
                                        </span>
                                    ))}
                            </div>
                        </div>
                    )}
                    {processedRecipients.some((r: any) => r.bcc) && (
                        <div className="flex items-start justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                                Bcc:
                            </span>

                            <div className="text-right">
                                {processedRecipients
                                    .filter((r: any) => r.bcc)
                                    .map(({ bcc }: any, index) => (
                                        <span key={index}>
                                            {bcc.en_US}
                                            {index <
                                                processedRecipients.filter(
                                                    (r: any) => r.bcc,
                                                ).length -
                                                    1 && ', '}
                                        </span>
                                    ))}
                            </div>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                            Subject:
                        </span>

                        <span
                            className="text-sm text-foreground font-medium"
                            dangerouslySetInnerHTML={{
                                __html: processedSubject,
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-card border rounded-lg">
                <div className="p-6">
                    <iframe
                        srcDoc={`<html><head><style>body { margin: 0; } img, table { max-width: 100%; height: auto; } .variable-highlight { background-color: rgba(88, 28, 135, 0.5); color: inherit; padding: 0.25rem; border-radius: 0.25rem; font-weight: 600; }</style></head><body>${processedBody}<script>window.addEventListener('load', () => { const body = document.body; const scale = Math.min(1, body.clientWidth / body.scrollWidth); if (scale < 1) { body.style.transform = \`scale(\${scale})\`; body.style.transformOrigin = 'top left'; body.style.width = \`\${100 / scale}%\`; } });</script></body></html>`}
                        className="prose prose-sm max-w-none"
                        sandbox="allow-scripts allow-same-origin"
                        style={{
                            width: '100%',
                            height: '600px',
                            border: 'none',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            lineHeight: '1.6',
                        }}
                        title="Email Preview"
                    />
                </div>

                <div className="border-t bg-muted p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                        This is an automated notification from your system.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Please do not reply to this email.
                    </p>
                </div>
            </div>
        </>
    );

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary" />
                        Email Preview
                    </CardTitle>

                    <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Maximize2 className="w-4 h-4 mr-2" />
                                Fullscreen
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="w-5xl h-[90vh] scroll-smooth-touch overflow-y-auto mt-6">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-primary" />
                                    Email Preview (Fullscreen)
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 mt-4">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {processedRecipients.length} recipients
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {new Date().toLocaleDateString()}
                                    </div>
                                </div>

                                <PreviewContent />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {processedRecipients.length} recipients
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />

                        {new Date().toLocaleDateString()}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <PreviewContent />
            </CardContent>
        </Card>
    );
};
