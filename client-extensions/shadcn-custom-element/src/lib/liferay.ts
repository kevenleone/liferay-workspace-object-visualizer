export type IOAuth2ClientAgentApplication = {
    authorizeURL: string;
    clientId: string;
    encodedRedirectURL: string;
    fetch: typeof fetch;
    homePageURL: string;
    redirectURIs: string[];
    tokenURL: string;
};

export type IOAuth2Client = {
    FromUserAgentApplication: (
        agentName: string,
    ) => IOAuth2ClientAgentApplication;
};

type ILiferay = {
    CommerceContext: {
        account?: {
            accountId: number | string | null;
        };
        commerceChannelId: string;
    };
    MarketplaceCustomerFlow: { appId: number };
    OAuth2Client: IOAuth2Client;
    ThemeDisplay: {
        getBCP47LanguageId: () => string;
        getCanonicalURL: () => string;
        getCompanyGroupId: () => string;
        getCompanyId: () => string;
        getDefaultLanguageId: () => string;
        getLanguageId: () => string;
        getLayoutRelativeURL: () => string;
        getLayoutURL: () => string;
        getPathContext: () => string;
        getPathThemeImages: () => string;
        getPortalURL: () => string;
        getScopeGroupId: () => number;
        getURLHome: () => string;
        getUserEmailAddress: () => string;
        getUserId: () => string;
        getUserName: () => string;
        isSignedIn: () => boolean;
    };
    Util: {
        fetch: typeof fetch;
        navigate: (path: string) => void;
        openModal: (options?: any) => void;
        openToast: (options?: {
            message: string;
            onClick?: ({ event }: { event: any }) => void;
            title?: string;
            type?: 'danger' | 'info' | 'success';
        }) => void;
    };
    authToken: string;
    fire: (event: string, data: unknown) => null;
};

declare global {
    interface Window {
        Liferay: ILiferay;
    }
}

export const Liferay = window.Liferay || {
    CommerceContext: {},
    MarketplaceCustomerFlow: 0,
    Service: {},
    ThemeDisplay: {
        getCanonicalURL: () => window.location.href,
        getCompanyGroupId: () => '',
        getUserEmailAddress: () => '',
        getUserName: () => '',
        getCompanyId: () => '',
        getDefaultLanguageId: () => 'en_US',
        getLanguageId: () => '',
        getLayoutRelativeURL: () => '',
        getLayoutURL: () => '',
        getPathContext: () => '',
        getPathThemeImages: () => '',
        getPortalURL: () => '',
        getURLHome: () => '',
        getUserId: () => '',
        isSignedIn: () => {
            return false;
        },
    },
    Util: {
        LocalStorage: localStorage,
        SessionStorage: sessionStorage,
    },
    detach: (
        type: keyof WindowEventMap,
        callback: EventListenerOrEventListenerObject,
    ) => window.removeEventListener(type, callback),
    fire: () => null,
    on: (
        type: keyof WindowEventMap,
        callback: EventListenerOrEventListenerObject,
    ) => window.addEventListener(type, callback),
};
