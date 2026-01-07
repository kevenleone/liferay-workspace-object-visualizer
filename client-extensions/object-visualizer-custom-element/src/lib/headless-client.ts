import { createClient } from 'liferay-headless-rest-client';

import { Liferay } from './liferay';
import { StorageKeys } from '@/utils/storage';

const tauriProxyBaseURL = import.meta.env.TAURI_ENV_PROXY_BASE_URL;

const { liferayInstance = true } = Liferay;

export function getClientOptions() {
    const clientOptions: Parameters<typeof createClient>[0] = {};

    if (liferayInstance) {
        clientOptions.baseUrl = '/';
        clientOptions.fetch = Liferay.Util.fetch;
    } else {
        const environmentInfo = localStorage.getItem(
            StorageKeys.SELECTED_ENVIRONMENT_INFO,
        );

        let applicationId;

        if (environmentInfo) {
            const { id } = JSON.parse(environmentInfo);

            applicationId = id;
        }

        clientOptions.baseUrl = `${tauriProxyBaseURL}/proxy`;
        clientOptions.headers = {
            'x-target-id': applicationId,
        };
    }

    console.log({ clientOptions });

    return clientOptions;
}

export const liferayClient = createClient(getClientOptions());
