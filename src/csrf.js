
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

    // Get CSRF token
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

    // Prepare headers with CSRF token
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

    // Make initial request
    let response = await fetch(url, finalOptions);

    // Handle 401 Unauthorized
    if (response.status === 401) {
        try {
            // Try to refresh token
            const refreshResponse = await fetch(
                'http://localhost:8080/api/v1/auth/refreshtoken',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        [CSRF_HEADER]: token || '',
                    }
                }
            );

            if (refreshResponse.ok) {
                // Retry original request with new token
                const newToken = getCsrfTokenFromCookie();
                finalOptions.headers[CSRF_HEADER] = newToken;
                response = await fetch(url, finalOptions);

                if (response.status === 401) {
                    window.location.href = '/login'; // Redirect to login if still unauthorized
                    return { __unauthorized: true };
                }
            } else {
                window.location.href = '/login'; // Redirect to login if refresh fails
                return { __unauthorized: true };
            }
        } catch (err) {
            console.error('Token refresh failed:', err);
            window.location.href = '/login';
            return { __unauthorized: true };
        }
    }

    return response;
};
