// src/admin/AdminReturns.jsx
// /admin/returns — every return request customers have made. Approve or
// reject a request, then mark it refunded once the money has been sent back.

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from './api';
import { RETURN_STATUS, ReturnActions, StatusPill, formatDate, money } from './orderMeta';
import { lineProduct } from '../data/account';

export default function AdminReturns() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const [returns, setReturns] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    api
      .listReturns(status)
      .then((res) => !cancelled && setReturns(res.returns))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [status]);

  const tabs = [['', 'All'], ...Object.entries(RETURN_STATUS).map(([k, s]) => [k, s.label])];

  const updated = (row) =>
    setReturns((list) =>
      list
        .map((r) => (r.id === row.id ? { ...r, ...row } : r))
        // drop it from a filtered view once it no longer matches
        .filter((r) => !status || r.status === status)
    );

  return (
    <>
      <div className="page-head">
        <h1>Returns</h1>
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
              onClick={() => setParams(key ? { status: key } : {})}
            >
              {label}
            </button>
          ))}
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

      {!returns && !error && <div className="empty-state">Loading returns…</div>}

      {returns && returns.length === 0 && (
        <div className="empty-state">
          <h3>No return requests</h3>
          {status ? 'Nothing with this status.' : 'Requests customers make from My Account will appear here.'}
        </div>
      )}

      {returns && returns.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Order</th>
                <th>Customer</th>
                <th>Item</th>
                <th className="num">Refund</th>
                <th>Reason</th>
                <th>Status</th>
                <th aria-label="Actions" />
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
                  <td data-label="Customer">
                    <div className="cell-main">{r.customer || '—'}</div>
                    <div className="cell-sub">{r.email}</div>
                  </td>
                  <td data-label="Item">
                    {lineProduct({ productId: r.product_id }).shortName} ({r.size}) × {r.qty}
                  </td>
                  <td data-label="Refund" className="num">
                    {money(r.amount)}
                  </td>
                  <td data-label="Reason">
                    <div>{r.reason}</div>
                    {r.comment && <div className="cell-sub">“{r.comment}”</div>}
                  </td>
                  <td data-label="Status">
                    <StatusPill status={r.status} statuses={RETURN_STATUS} />
                  </td>
                  <td className="num">
                    <ReturnActions ret={r} onChange={updated} onError={setError} />
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
