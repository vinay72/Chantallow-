// src/admin/AdminLayout.jsx
// Shell for every /admin page: sidebar nav + page outlet. Admin-only (see AppRouter).

import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Package, Users, Store, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import "./admin.css";

const NAV = [
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className={open ? "adm-shell is-open" : "adm-shell"}>
            <aside className="adm-sidebar">
                <div className="adm-sidebar-top">
                    <Link to="/admin" className="adm-logo" onClick={() => setOpen(false)}>
                        <img src={logo} alt="Chantallow" />
                        <span>Admin</span>
                    </Link>
                    <button className="adm-icon-btn adm-close" aria-label="Close menu" onClick={() => setOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="adm-nav">
                    {NAV.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setOpen(false)}
                            className={({ isActive }) => (isActive ? "adm-nav-link is-active" : "adm-nav-link")}
                        >
                            <Icon size={18} strokeWidth={1.75} />
                            {label}
                        </NavLink>
                    ))}
                    <Link to="/" className="adm-nav-link">
                        <Store size={18} strokeWidth={1.75} />
                        View website
                    </Link>
                </nav>

                <div className="adm-sidebar-user">
                    <div className="adm-user-name">{user?.name}</div>
                    <div className="adm-user-email">{user?.email}</div>
                    <button className="adm-btn adm-btn-ghost adm-logout" onClick={handleLogout}>
                        <LogOut size={16} /> Log out
                    </button>
                </div>
            </aside>

            <div className="adm-backdrop" onClick={() => setOpen(false)} />

            <div className="adm-main">
                <header className="adm-topbar">
                    <button className="adm-icon-btn adm-menu" aria-label="Open menu" onClick={() => setOpen(true)}>
                        <Menu size={22} />
                    </button>
                    <span className="adm-topbar-title">Chantallow Admin</span>
                </header>
                <main className="adm-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
