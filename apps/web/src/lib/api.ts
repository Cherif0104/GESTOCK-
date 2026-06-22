/**
 * Client API typé minimaliste pour GESTOCK.
 * Gère l'authentification (Bearer) et le refresh token côté navigateur.
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:4000/api/v1';

const ACCESS_KEY = 'gestock_access_token';
const REFRESH_KEY = 'gestock_refresh_token';

export type RequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
};

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

function getAccess(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACCESS_KEY);
}
function getRefresh(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh?: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACCESS_KEY, access);
  if (refresh) window.localStorage.setItem(REFRESH_KEY, refresh);
}
export function clearTokens() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefresh();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers = {}, auth = true, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };
  if (auth) {
    const token = getAccess();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  let res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (res.status === 401 && auth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const token = getAccess();
      if (token) finalHeaders.Authorization = `Bearer ${token}`;
      res = await fetch(`${API_URL}${path}`, {
        ...rest,
        headers: finalHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        cache: 'no-store',
      });
    }
  }

  if (!res.ok) {
    let data: any = null;
    try { data = await res.json(); } catch { /* ignore */ }
    throw new ApiError(res.status, data?.message ?? res.statusText, data);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(p: string, o?: RequestOptions) => request<T>(p, { ...o, method: 'GET' }),
  post: <T>(p: string, body?: unknown, o?: RequestOptions) =>
    request<T>(p, { ...o, method: 'POST', body }),
  patch: <T>(p: string, body?: unknown, o?: RequestOptions) =>
    request<T>(p, { ...o, method: 'PATCH', body }),
  put: <T>(p: string, body?: unknown, o?: RequestOptions) =>
    request<T>(p, { ...o, method: 'PUT', body }),
  delete: <T>(p: string, o?: RequestOptions) => request<T>(p, { ...o, method: 'DELETE' }),
};

export const API_BASE_URL = API_URL;
