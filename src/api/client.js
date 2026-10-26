// src/api/client.js
// Thin fetch wrapper for the Chantallow backend. Attaches the JWT, parses
// JSON, and turns API errors into thrown Error objects with a readable message.
//
// In dev, Vite proxies /api and /uploads to the backend (see vite.config.js),
// so API_BASE can stay empty. Set VITE_API_URL when the API lives elsewhere.

export const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const TOKEN_KEY = "chantallow_token";

// "Remember me" puts the token in localStorage; otherwise it lasts for the tab.
export function getToken() {
    try {
        return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

export function setToken(token, remember = true) {
    try {
        clearToken();
        (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
    } catch {
        /* storage unavailable — user stays logged in until refresh */
    }
}

export function clearToken() {
    try {
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
    } catch {
        /* ignore */
    }
}

// Fired when the API says the token is no longer valid; AuthContext listens.
export const UNAUTHORIZED_EVENT = "chantallow:unauthorized";

export async function api(path, { method = "GET", body, headers = {} } = {}) {
    const token = getToken();
    const isForm = body instanceof FormData;

    const res = await fetch(API_BASE + "/api" + path, {
        method,
        headers: {
            ...(body && !isForm ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });

    let data = null;
    try {
        data = await res.json();
    } catch {
        /* non-JSON response (e.g. proxy error page) */
    }

    if (!res.ok || data?.success === false) {
        if (res.status === 401 && token) {
            clearToken();
            window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
        }
        const message =
            data?.errors?.join(" ") ||
            data?.error ||
            (res.status >= 500 || !data ? "Can't reach the server. Is the backend running?" : `Request failed (${res.status})`);
        const err = new Error(message);
        err.status = res.status;
        err.errors = data?.errors || (data?.error ? [data.error] : [message]);
        throw err;
    }

    return data;
}

// Media URLs from the API are relative ("/uploads/..."); prefix when needed.
export const mediaUrl = (url) => (url && url.startsWith("/") ? API_BASE + url : url);
