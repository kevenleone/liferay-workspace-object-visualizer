const tauriProxyBaseURL =
    import.meta.env.TAURI_ENV_PROXY_BASE_URL || 'http://localhost:3001';

function joinUrl(base: string, path: string) {
    const b = base.replace(/\/+$/, '');
    const p = path.replace(/^\/+/, '');
    return `${b}/${p}`;
}

export async function tauriFetch(path: string, init?: RequestInit) {
    const url = joinUrl(tauriProxyBaseURL, path);

    return fetch(url, init);
}

export async function tauriJson<T = any>(
    path: string,
    init?: RequestInit,
): Promise<T> {
    const res = await tauriFetch(path, init);

    return res.json();
}
