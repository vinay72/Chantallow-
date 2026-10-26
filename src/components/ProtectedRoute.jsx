// src/components/ProtectedRoute.jsx
// <ProtectedRoute>              -> any signed-in user
// <ProtectedRoute role="admin"> -> admins only; signed-in users are sent home

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ role, children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div style={{ padding: 48, textAlign: "center", fontFamily: "'Lufga', sans-serif" }}>Loading…</div>;
    }
    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
    }
    if (role && user.role !== role) {
        return <Navigate to="/" replace />;
    }
    return children;
}
