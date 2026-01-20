import { createClient } from 'liferay-headless-rest-client';

import { Liferay } from './liferay';

const tauriProxyBaseURL = import.meta.env.TAURI_ENV_PROXY_BASE_URL;

const { liferayInstance = true } = Liferay;

export function getClientOptions(environmentInfo?: any) {
    const clientOptions: Parameters<typeof createClient>[0] = {};

    if (liferayInstance) {
        clientOptions.baseUrl = '/';
        clientOptions.fetch = Liferay.Util.fetch;
    } else {
        clientOptions.baseUrl = `${tauriProxyBaseURL}/proxy`;
        clientOptions.headers = {
            'x-target-id': environmentInfo?.id,
        };
    }

    return clientOptions;
}

export const liferayClient = createClient(getClientOptions());
