// src/admin/AdminUsers.jsx
// /admin/users — every website account, with a role switch (user <-> admin).

import { useEffect, useState } from 'react';
import { api } from './api';
import { useAuth } from '../context/AuthContext';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    api
      .listUsers()
      .then((res) => setUsers(res.users))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const changeRole = async (u, role) => {
    if (role === 'admin' && !confirm(`Give ${u.name} full admin access?`)) return;
    setSavingId(u.id);
    setError(null);
    try {
      const { user } = await api.setUserRole(u.id, role);
      setUsers((list) => list.map((x) => (x.id === user.id ? user : x)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>Users</h1>
      </div>

      {error && (
        <div className="errors">
          <strong>Something went wrong:</strong>
          <ul>
            <li>{error}</li>
          </ul>
        </div>
      )}

      {loading && <div className="empty-state">Loading users…</div>}

      {!loading && users.length > 0 && (
        <div className="product-list">
          <div className="user-row head">
            <span>Name</span>
            <span>Email</span>
            <span>Joined</span>
            <span>Role</span>
          </div>
          {users.map((u) => (
            <div className="user-row" key={u.id}>
              <div>
                <strong>{u.name}</strong>
                {u.id === me?.id && <span className="meta-size"> (you)</span>}
              </div>
              <div className="meta-size">{u.email}</div>
              <div className="meta-size">{new Date(u.created_at).toLocaleDateString()}</div>
              <select
                value={u.role}
                disabled={u.id === me?.id || savingId === u.id}
                onChange={(e) => changeRole(u, e.target.value)}
                aria-label={`Role for ${u.name}`}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
