import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { Send, Eye, Save, ArrowLeft } from 'lucide-react';
import { RichTextEditor } from './rich-text-editor';
import { EmailPreview } from './email-preview';
import { VariableSelector } from './variables-selector';
import { RecipientManager } from './recipient-manager';
import { useToast } from '@/hooks/use-toast';
import {
    NotificationTemplate,
    patchNotificationTemplate,
    postNotificationQueueEntry,
} from 'liferay-headless-rest-client/notification-v1.0';
import { useNavigate } from '@tanstack/react-router';
import { useVariables } from '@/hooks/use-variables';
import { Liferay } from '@/lib/liferay';
import { liferayClient } from '@/lib/headless-client';
import { ScrollArea } from '@radix-ui/react-scroll-area';

type EmailTemplateEditorProps = {
    notificationTemplate: Required<NotificationTemplate>;
};

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
    notificationTemplate: template,
}) => {
    const [activeTab, setActiveTab] = useState('preview');
    const [isSending, setIsSending] = useState(false);
    const [notificationTemplate, setNotificationTemplate] = useState(template);
    const { replaceVariables } = useVariables();

    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSave = async () => {
        if (!notificationTemplate) return;

        const { error } = await patchNotificationTemplate({
            body: notificationTemplate,
            client: liferayClient,
            path: {
                notificationTemplateId:
                    notificationTemplate.id as unknown as string,
            },
        });

        if (error) {
            return console.error(error);
        }

        toast({
            description: `Template "${notificationTemplate.name}" has been saved successfully.`,
            title: 'Template Saved',
        });
    };

    const handleSend = async () => {
        if (!notificationTemplate) return;

        if (notificationTemplate.recipients.length === 0) {
            toast({
                description:
                    'Please add at least one recipient before sending.',
                title: 'No Recipients',
                variant: 'destructive',
            });

            return;
        }

        setIsSending(true);

        const [recipient] = notificationTemplate.recipients as any;

        await postNotificationQueueEntry({
            body: {
                body: replaceVariables(notificationTemplate.body.en_US, false),
                fromName: recipient.fromName as string,
                recipients: [
                    {
                        fromName: recipient.fromName!.en_US,
                        from: recipient.from,
                        to: recipient.to!.en_US,
                    },
                ],
                subject: replaceVariables(
                    notificationTemplate.subject.en_US,
                    false,
                ),
                triggerBy: Liferay.ThemeDisplay.getUserName(),
                type: 'email',
            },
            client: liferayClient,
        });

        setIsSending(false);

        toast({
            title: 'Email Sent Successfully',
            description: `Email sent to ${notificationTemplate.recipients.length} recipient(s).`,
        });
    };

    const updateTemplate = (updates: Partial<NotificationTemplate>) => {
        setNotificationTemplate(
            (prevNotificationTemplate) =>
                ({
                    ...prevNotificationTemplate,
                    ...updates,
                }) as any,
        );
    };

    return (
        <ScrollArea className="max-w-7xl mx-auto space-y-6 h-screen">
            <div>
                <div className="flex mb-4 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            className="text-gray-600 hover:text-gray-800"
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate({ to: '/' })}
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back
                        </Button>
                    </div>

                    <div className="flex items-center gap-3">
                        <Badge
                            variant="outline"
                            className="text-blue-600 border-blue-200"
                        >
                            ID: {notificationTemplate!.id}
                        </Badge>

                        <Button variant="outline" onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Template
                        </Button>
                        <Button
                            onClick={handleSend}
                            disabled={isSending}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            {isSending ? 'Sending...' : 'Send Email'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                Template Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="templateName">
                                    Template Name
                                </Label>

                                <Input
                                    id="templateName"
                                    value={notificationTemplate.name}
                                    onChange={(e) =>
                                        updateTemplate({
                                            name: e.target.value,
                                        })
                                    }
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="subject">Subject Line</Label>

                                <Input
                                    id="subject"
                                    value={notificationTemplate.subject.en_US}
                                    onChange={(event) =>
                                        updateTemplate({
                                            subject: {
                                                en_US: event.target.value,
                                            },
                                        })
                                    }
                                    className="mt-1"
                                    placeholder="Enter email subject..."
                                />
                            </div>

                            <RecipientManager
                                recipients={notificationTemplate.recipients
                                    .map(({ to }: any) =>
                                        to.en_US
                                            ?.split(',')
                                            ?.map((value: any) =>
                                                replaceVariables(value),
                                            ),
                                    )
                                    .flat()}
                                onChange={(recipients) =>
                                    updateTemplate({
                                        recipients:
                                            notificationTemplate.recipients.map(
                                                (recipient) => ({
                                                    ...recipient,
                                                    to: {
                                                        en_US: recipients.join(
                                                            ',',
                                                        ),
                                                    },
                                                }),
                                            ),
                                    })
                                }
                            />
                        </CardContent>
                    </Card>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="compose">
                                Compose Email
                            </TabsTrigger>
                            <TabsTrigger value="preview">
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="compose" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Email Body</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RichTextEditor
                                        value={notificationTemplate.body.en_US}
                                        onChange={(body) =>
                                            updateTemplate({
                                                body: { en_US: body },
                                            })
                                        }
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="preview">
                            <EmailPreview
                                notificationTemplate={notificationTemplate}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <VariableSelector />
                </div>
            </div>
        </ScrollArea>
    );
};

export default EmailTemplateEditor;
