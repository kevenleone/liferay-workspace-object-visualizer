import { createClient } from 'liferay-headless-rest-client';
import { Liferay } from './liferay';

export const liferayClient = createClient({
    baseUrl: '/',
    fetch: Liferay.Util.fetch,
});
