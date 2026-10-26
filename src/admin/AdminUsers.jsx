// src/admin/AdminUsers.jsx
// Every website account, with a role switch (user <-> admin).

import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function AdminUsers() {
    const { user: me } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [savingId, setSavingId] = useState(null);

    useEffect(() => {
        let cancelled = false;
        api("/admin/users")
            .then((data) => !cancelled && setUsers(data.users))
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, []);

    const changeRole = async (u, role) => {
        if (role === "admin" && !window.confirm(`Give ${u.name} full admin access?`)) return;
        setSavingId(u.id);
        setError("");
        try {
            const { user } = await api(`/admin/users/${u.id}`, { method: "PATCH", body: { role } });
            setUsers((list) => list.map((x) => (x.id === user.id ? user : x)));
        } catch (err) {
            setError(err.message);
        } finally {
            setSavingId(null);
        }
    };

    return (
        <div>
            <div className="adm-page-head">
                <div>
                    <h1 className="adm-title">Users</h1>
                    <p className="adm-subtitle">{loading ? "Loading…" : `${users.length} account${users.length === 1 ? "" : "s"}`}</p>
                </div>
            </div>

            {error && <div className="adm-alert">{error}</div>}

            <div className="adm-card adm-table-wrap">
                <table className="adm-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Joined</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td className="adm-product-name">
                                    {u.name}
                                    {u.id === me?.id && <span className="adm-muted"> (you)</span>}
                                </td>
                                <td>{u.email}</td>
                                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                <td>
                                    <select
                                        className="adm-input adm-role-select"
                                        value={u.role}
                                        disabled={u.id === me?.id || savingId === u.id}
                                        onChange={(e) => changeRole(u, e.target.value)}
                                        aria-label={`Role for ${u.name}`}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
