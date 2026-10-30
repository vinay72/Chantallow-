// src/context/AuthContext.jsx
// Who is logged in, and with which role ("user" or "admin").
// On load it re-validates any stored token against /api/auth/me.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, clearToken, getToken, setToken, UNAUTHORIZED_EVENT } from "../api/client";
import { clearAccountOrders } from "../data/account";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    // true until we know whether a stored token is still valid
    const [loading, setLoading] = useState(() => Boolean(getToken()));

    useEffect(() => {
        if (!getToken()) return;
        let cancelled = false;
        api("/auth/me")
            .then((data) => !cancelled && setUser(data.user))
            .catch(() => !cancelled && setUser(null))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const onUnauthorized = () => {
            setUser(null);
            clearAccountOrders();
        };
        window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
        return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    }, []);

    const login = useCallback(async (email, password, remember = true) => {
        const data = await api("/auth/login", { method: "POST", body: { email, password } });
        setToken(data.token, remember);
        setUser(data.user);
        return data.user;
    }, []);

    const register = useCallback(async (name, email, password) => {
        const data = await api("/auth/register", { method: "POST", body: { name, email, password } });
        setToken(data.token, true);
        setUser(data.user);
        return data.user;
    }, []);

    const logout = useCallback(() => {
        clearToken();
        setUser(null);
        clearAccountOrders();
    }, []);

    const value = useMemo(
        () => ({ user, loading, isAdmin: user?.role === "admin", login, register, logout }),
        [user, loading, login, register, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}

// Where to send someone right after they sign in (and where a wrong-role visit is bounced to).
// Admins get the dashboard; customers get their account panel.
export const homeForRole = (role) => (role === "admin" ? "/admin/dashboard" : "/account/orders");

// The role a protected path belongs to, or null for public pages.
export const roleForPath = (path = "") =>
    path.startsWith("/admin") ? "admin" : path.startsWith("/account") ? "user" : null;
