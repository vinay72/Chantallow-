// src/admin/AdminUsers.jsx
// /admin/users — every website account with its orders and spend, a role
// switch (user <-> admin) and a link to the user's details.

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from './api';
import { useAuth } from '../context/AuthContext';
import { formatDate, money } from './orderMeta';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [query, setQuery] = useState('');

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
      setUsers((list) => list.map((x) => (x.id === user.id ? { ...x, ...user } : x)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? users.filter(
          (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || String(u.id) === q
        )
      : users;
  }, [users, query]);

  const customers = users.filter((u) => u.role === 'user').length;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Users</h1>
          {!loading && (
            <p className="muted head-sub">
              {users.length} account{users.length === 1 ? '' : 's'} · {customers} customer{customers === 1 ? '' : 's'} ·{' '}
              {users.length - customers} admin{users.length - customers === 1 ? '' : 's'}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="errors">
          <strong>Something went wrong:</strong>
          <ul>
            <li>{error}</li>
          </ul>
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="toolbar">
          <div className="search-box">
            <input
              type="search"
              placeholder="Search by name, email, or user ID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search users"
            />
          </div>
        </div>
      )}

      {loading && <div className="empty-state">Loading users…</div>}

      {!loading && shown.length === 0 && (
        <div className="empty-state">{users.length ? 'No users match your search.' : 'No users yet.'}</div>
      )}

      {!loading && shown.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th className="num">Orders</th>
                <th className="num">Spent</th>
                <th>Last order</th>
                <th>Joined</th>
                <th>Role</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => (
                <tr key={u.id}>
                  <td data-label="Name">
                    <Link to={`/admin/users/${u.id}`} className="order-no">
                      {u.name}
                    </Link>
                    {u.id === me?.id && <span className="cell-sub"> (you)</span>}
                  </td>
                  <td data-label="Email" className="cell-sub">
                    {u.email}
                  </td>
                  <td data-label="Orders" className="num">
                    {u.order_count}
                  </td>
                  <td data-label="Spent" className="num">
                    {money(u.total_spent)}
                  </td>
                  <td data-label="Last order">{u.last_order_at ? formatDate(u.last_order_at) : '—'}</td>
                  <td data-label="Joined">{formatDate(u.created_at)}</td>
                  <td data-label="Role">
                    <select
                      className="role-select"
                      value={u.role}
                      disabled={u.id === me?.id || savingId === u.id}
                      onChange={(e) => changeRole(u, e.target.value)}
                      aria-label={`Role for ${u.name}`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="num">
                    <Link to={`/admin/users/${u.id}`} className="btn btn-outline btn-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
