export const PICK_LISTS_DATA = [
    {
        dateCreated: '2025-12-26T02:27:04Z',
        dateModified: '2026-01-06T15:00:03Z',
        externalReferenceCode: 'H1S4_LEAD_TYPE',
        id: 35504,
        listTypeEntries: [
            {
                dateCreated: '2025-12-26T02:27:04Z',
                dateModified: '2026-01-06T15:00:03Z',
                externalReferenceCode: 'NEW_BUSINESS',
                id: 35505,
                key: 'newBusiness',
                name: 'New Business',
                name_i18n: {
                    'en-US': 'New Business',
                },
                system: false,
                type: '',
            },

            {
                dateCreated: '2025-12-26T02:27:04Z',
                dateModified: '2026-01-06T15:00:03Z',
                externalReferenceCode: 'UPSELL',
                id: 35506,
                key: 'upsell',
                name: 'Upsell',
                name_i18n: {
                    'en-US': 'Upsell',
                },
                system: false,
                type: '',
            },

            {
                dateCreated: '2025-12-30T18:58:59Z',
                dateModified: '2026-01-06T15:00:03Z',
                externalReferenceCode: 'RE_ATTEMPTING',
                id: 36889,
                key: 'reattempting',
                name: 'Re-attempting',
                name_i18n: {
                    'en-US': 'Re-attempting',
                },
                system: false,
                type: '',
            },
        ],

        name: 'H1S4 Lead Type',
        name_i18n: {
            'en-US': 'H1S4 Lead Type',
        },
        system: false,
    },
    {
        dateCreated: '2025-12-27T03:30:04Z',
        dateModified: '2026-01-07T16:00:03Z',
        externalReferenceCode: 'COMMERCE_ORDER_STATUS',
        id: 35507,
        listTypeEntries: [],
        name: 'Commerce Order Status',
        name_i18n: {
            'en-US': 'Commerce Order Status',
        },
        system: true,
    },
];

export const NOTIFICATION_TEMPLATES_DATA = [
    {
        attachmentObjectFieldExternalReferenceCodes: [],
        attachmentObjectFieldIds: [],
        body: {
            en_US: '<html>...</html>',
        },

        dateCreated: '2025-12-26T01:18:31Z',
        dateModified: '2025-12-26T01:18:31Z',
        description: '',
        editorType: 'richText',
        externalReferenceCode: 'L_COMMERCE_ORDER_TEMPLATE',
        id: 33336,
        name: 'Commerce Order Notification',
        name_i18n: {
            en_US: 'Commerce Order Notification',
        },

        objectDefinitionExternalReferenceCode: '',
        objectDefinitionId: 0,
        recipientType: 'email',
        recipients: [
            {
                cc: '',
                bcc: '',
                singleRecipient: false,
                fromName: {
                    en_US: 'Liferay Commerce',
                },

                from: 'admin@test.com',
                to: {
                    en_US: '[%COMMERCEORDER_AUTHOR_EMAIL_ADDRESS%]',
                },
            },
        ],

        subject: {
            en_US: 'Order #[%COMMERCEORDER_ID%]',
        },
        system: false,
        type: 'email',
        typeLabel: 'Email',
    },
];

export const NOTIFICATION_QUEUE_DATA = [
    {
        actions: {
            get: {
                method: 'GET',
                href: 'http://localhost:8080/o/notification/v1.0/notification-queue-entries/41417',
            },
            update: {
                method: 'PUT',
                href: 'http://localhost:8080/o/notification/v1.0/notification-queue-entries/41417/resend',
            },
            delete: {
                method: 'DELETE',
                href: 'http://localhost:8080/o/notification/v1.0/notification-queue-entries/41417',
            },
        },
        body: '<html>...</html>',
        fromName: 'Liferay Commerce',
        id: 41417,
        recipients: [
            {
                cc: '',
                ccType: 'email',
                bccType: 'email',
                bcc: '',
                toType: 'email',
                fromName: 'Liferay Commerce',
                from: 'admin@test.com',
                to: '[%COMMERCEORDER_AUTHOR_EMAIL_ADDRESS%]',
            },
        ],

        recipientsSummary: '[%COMMERCEORDER_AUTHOR_EMAIL_ADDRESS%]',
        status: 0,
        subject: 'Order ORD-HAFJYI',
        triggerBy: 'Added via API',
        type: 'email',
        typeLabel: 'Email',
    },
];

export const DOCUMENTS_DATA = [
    {
        id: '1',
        title: 'Marketing Assets',
        type: 'folder',
        size: null,
        dateModified: '2025-01-15T10:00:00Z',
    },
    {
        id: '2',
        title: 'Q4 Report.pdf',
        type: 'pdf',
        size: '2.4 MB',
        dateModified: '2025-01-14T14:30:00Z',
        thumbnail: 'https://placehold.co/100x140/e2e8f0/475569?text=PDF',
    },
    {
        id: '3',
        title: 'Banner.jpg',
        type: 'image',
        size: '1.2 MB',
        dateModified: '2025-01-12T09:15:00Z',
        thumbnail: 'https://placehold.co/200x150/e2e8f0/475569?text=IMG',
    },
];
