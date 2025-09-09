
const CSRF_COOKIE = 'XSRF-TOKEN';
const CSRF_HEADER = 'X-XSRF-TOKEN';

export const getCsrfTokenFromCookie = () => {
    try {
        const match = document.cookie.match(new RegExp('(?:^|; )' + CSRF_COOKIE + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : '';
    } catch {
        return '';
    }
};

export const initCsrf = async (baseUrl = 'http://localhost:8080') => {
    const url = `${baseUrl.replace(/\/$/, '')}/api/v1/auth/get`;
    await fetch(url, { method: 'GET', credentials: 'include', headers: { 'Accept': 'application/json' } });
};

export const csrfFetch = async (url, options = {}) => {
    const { headers = {}, body, credentials, ...rest } = options;

    let token = getCsrfTokenFromCookie();
    if (!token) {
        let inferredBase = undefined;
        try {
            const u = new URL(url, window.location.origin);
            inferredBase = `${u.protocol}//${u.host}`;
        } catch { /* ignore */ }

        await initCsrf(inferredBase || undefined);
        token = getCsrfTokenFromCookie();
    }

    const finalHeaders = {
        'Content-Type': 'application/json',
        [CSRF_HEADER]: token || '',
        ...headers,
    };

    const finalOptions = {
        method: rest.method || 'GET',
        credentials: credentials || 'include',
        headers: finalHeaders,
        ...(body !== undefined ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
        ...rest,
    };

    return fetch(url, finalOptions);
};
