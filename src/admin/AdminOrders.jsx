// src/admin/AdminOrders.jsx
// /admin/orders — every order placed on the website, filterable by status
// and searchable by order number, customer name or email.

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from './api';
import { ORDER_STATUS, StatusPill, formatDate, money } from './orderMeta';

export default function AdminOrders() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const search = params.get('search') || '';

  const [query, setQuery] = useState(search);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .listOrders({ status, search })
      .then((res) => !cancelled && setData(res))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [status, search]);

  const setFilter = (next) => {
    const merged = { status, search, ...next };
    setParams(Object.fromEntries(Object.entries(merged).filter(([, v]) => v)));
  };

  const tabs = [['', 'All'], ...Object.entries(ORDER_STATUS).map(([k, s]) => [k, s.label])];

  return (
    <>
      <div className="page-head">
        <h1>Orders</h1>
      </div>

      <div className="toolbar">
        <div className="tab-row" role="tablist" aria-label="Filter by status">
          {tabs.map(([key, label]) => (
            <button
              key={key || 'all'}
              type="button"
              role="tab"
              aria-selected={status === key}
              className={status === key ? 'tab is-active' : 'tab'}
              onClick={() => setFilter({ status: key })}
            >
              {label}
              {data && <span className="tab-count">{data.counts[key || 'all']}</span>}
            </button>
          ))}
        </div>

        <form
          className="search-box"
          onSubmit={(e) => {
            e.preventDefault();
            setFilter({ search: query.trim() });
          }}
        >
          <input
            type="search"
            placeholder="Order #, name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search orders"
          />
          <button type="submit" className="btn btn-sm">
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="errors">
          <strong>Something went wrong:</strong>
          <ul>
            <li>{error}</li>
          </ul>
        </div>
      )}

      {loading && !data && <div className="empty-state">Loading orders…</div>}

      {data && data.orders.length === 0 && (
        <div className="empty-state">
          <h3>No orders found</h3>
          {status || search ? 'Try a different filter or search.' : 'Orders placed on the website will appear here.'}
        </div>
      )}

      {data && data.orders.length > 0 && (
        <div className={loading ? 'table-card is-loading' : 'table-card'}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th className="num">Items</th>
                <th className="num">Total</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {data.orders.map((o) => (
                <tr key={o.id}>
                  <td data-label="Order #">
                    <Link to={`/admin/orders/${o.id}`} className="order-no">
                      #{o.id}
                    </Link>
                    {o.return_count > 0 && <span className="mini-badge">{o.return_count} return{o.return_count > 1 ? 's' : ''}</span>}
                  </td>
                  <td data-label="Date">{formatDate(o.placed_at)}</td>
                  <td data-label="Customer">
                    <div className="cell-main">{o.customer_name || o.account_name || 'Guest'}</div>
                    <div className="cell-sub">{o.email}</div>
                  </td>
                  <td data-label="Items" className="num">
                    {o.items.reduce((n, l) => n + l.qty, 0)}
                  </td>
                  <td data-label="Total" className="num">
                    {money(o.total)}
                  </td>
                  <td data-label="Status">
                    <StatusPill status={o.status} />
                  </td>
                  <td className="num">
                    <Link to={`/admin/orders/${o.id}`} className="btn btn-outline btn-sm">
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
