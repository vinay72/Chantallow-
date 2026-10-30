// src/admin/AdminUserDetail.jsx
// /admin/users/:id — one account in detail: profile, order statistics,
// addresses and phone numbers used at checkout, orders and return requests.

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from './api';
import { useAuth } from '../context/AuthContext';
import { RETURN_STATUS, StatusPill, formatDate, money } from './orderMeta';
import { formatAddress, lineProduct } from '../data/account';

function Stat({ label, value, sub }) {
  return (
    <div className="user-stat">
      <div className="user-stat-label">{label}</div>
      <div className="user-stat-value">{value}</div>
      {sub && <div className="user-stat-sub">{sub}</div>}
    </div>
  );
}

export default function AdminUserDetail() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    api
      .getUser(id)
      .then((res) => !cancelled && setData(res))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const changeRole = async (role) => {
    if (role === 'admin' && !confirm(`Give ${data.user.name} full admin access?`)) return;
    setSaving(true);
    setError(null);
    try {
      const { user } = await api.setUserRole(data.user.id, role);
      setData((d) => ({ ...d, user }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!data && !error) return <div className="empty-state">Loading user…</div>;

  if (!data) {
    return (
      <div className="empty-state">
        <h3>User not found</h3>
        {error}
        <p style={{ marginTop: 16 }}>
          <Link to="/admin/users" className="btn btn-outline btn-sm">
            Back to users
          </Link>
        </p>
      </div>
    );
  }

  const { user, stats, addresses, phones, orders, returns } = data;
  const initials = user.name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const isMe = user.id === me?.id;

  return (
    <>
      <div className="page-head">
        <div className="user-head">
          <span className="user-avatar" aria-hidden="true">
            {initials}
          </span>
          <div>
            <Link to="/admin/users" className="back-link">
              ← All users
            </Link>
            <h1>
              {user.name}
              {isMe && <span className="muted"> (you)</span>}
            </h1>
            <div className="head-meta">
              <a href={`mailto:${user.email}`}>{user.email}</a> · Joined {formatDate(user.created_at)}
            </div>
          </div>
        </div>
        <label className="status-pick">
          Role
          <select value={user.role} disabled={isMe || saving} onChange={(e) => changeRole(e.target.value)}>
            <option value="user">User (customer)</option>
            <option value="admin">Admin</option>
          </select>
        </label>
      </div>

      {error && (
        <div className="errors">
          <strong>Something went wrong:</strong>
          <ul>
            <li>{error}</li>
          </ul>
        </div>
      )}

      <div className="user-stats">
        <Stat label="Orders" value={stats.orders} sub={`${stats.delivered} delivered · ${stats.open} open · ${stats.canceled} canceled`} />
        <Stat label="Total spent" value={money(stats.total_spent)} sub="canceled orders not counted" />
        <Stat label="Average order" value={money(stats.average_order)} sub={`${stats.items} item${stats.items === 1 ? '' : 's'} bought`} />
        <Stat
          label="Returns"
          value={stats.returns}
          sub={stats.refunded ? `${money(stats.refunded)} refunded` : 'nothing refunded'}
        />
        <Stat
          label="Last order"
          value={stats.last_order_at ? formatDate(stats.last_order_at) : '—'}
          sub={stats.first_order_at ? `first: ${formatDate(stats.first_order_at)}` : 'no orders yet'}
        />
      </div>

      <div className="detail-grid">
        <section className="panel">
          <h2>Account</h2>
          <dl className="kv">
            <dt>Account ID</dt>
            <dd>#{user.id}</dd>
            <dt>Name</dt>
            <dd>{user.name}</dd>
            <dt>Email</dt>
            <dd>{user.email}</dd>
            <dt>Role</dt>
            <dd>{user.role === 'admin' ? 'Admin' : 'Customer'}</dd>
            <dt>Joined</dt>
            <dd>{formatDate(user.created_at, true)}</dd>
            <dt>Updated</dt>
            <dd>{data.updated_at ? formatDate(data.updated_at, true) : '—'}</dd>
          </dl>
        </section>

        <section className="panel">
          <h2>Phone numbers</h2>
          {phones.length ? (
            <ul className="plain-list">
              {phones.map((p) => (
                <li key={p}>
                  <a href={`tel:${p}`}>{p}</a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">None given at checkout yet.</p>
          )}
        </section>

        <section className="panel">
          <h2>Addresses used</h2>
          {addresses.length ? (
            <ul className="plain-list">
              {addresses.map((a, i) => (
                <li key={i}>
                  <strong>{[a.firstName, a.lastName].filter(Boolean).join(' ') || '—'}</strong>
                  {a.company && <div className="cell-sub">{a.company}</div>}
                  <div className="cell-sub">{formatAddress(a)}</div>
                  <div className="cell-sub">last used {formatDate(a.last_used_at)}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No orders with an address yet.</p>
          )}
        </section>
      </div>

      <section className="panel">
        <h2>
          Orders <span className="muted">({orders.length})</span>
        </h2>
        {orders.length === 0 ? (
          <p className="muted">This customer hasn't placed an order yet.</p>
        ) : (
          <div className="table-card table-card--flat">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th className="num">Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td data-label="Order #">
                      <Link to={`/admin/orders/${o.id}`} className="order-no">
                        #{o.id}
                      </Link>
                    </td>
                    <td data-label="Date">{formatDate(o.placed_at)}</td>
                    <td data-label="Items" className="cell-sub">
                      {o.items.map((l) => `${l.name || lineProduct(l).name} × ${l.qty}`).join(', ')}
                    </td>
                    <td data-label="Total" className="num">
                      {money(o.total)}
                    </td>
                    <td data-label="Status">
                      <StatusPill status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>
          Return requests <span className="muted">({returns.length})</span>
        </h2>
        {returns.length === 0 ? (
          <p className="muted">No return requests.</p>
        ) : (
          <div className="table-card table-card--flat">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Order</th>
                  <th>Item</th>
                  <th className="num">Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((r) => (
                  <tr key={r.id}>
                    <td data-label="Request">
                      <div className="cell-main">{r.id}</div>
                      <div className="cell-sub">{formatDate(r.created_at)}</div>
                    </td>
                    <td data-label="Order">
                      <Link to={`/admin/orders/${r.order_id}`} className="order-no">
                        #{r.order_id}
                      </Link>
                    </td>
                    <td data-label="Item">
                      {lineProduct({ productId: r.product_id }).shortName} ({r.size}) × {r.qty}
                    </td>
                    <td data-label="Amount" className="num">
                      {money(r.amount)}
                    </td>
                    <td data-label="Status">
                      <StatusPill status={r.status} statuses={RETURN_STATUS} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
