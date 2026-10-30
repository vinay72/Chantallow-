// src/admin/orderMeta.jsx
// Order / return statuses and small pieces shared by the dashboard, the
// orders pages and the returns page.

import { useState } from 'react';
import { api } from './api';

export const ORDER_STATUS = {
  'in-progress': { label: 'In Progress', color: '#3b82c4' },
  delayed: { label: 'Delayed', color: '#d9a21b' },
  delivered: { label: 'Delivered', color: '#3c8a5a' },
  canceled: { label: 'Canceled', color: '#b5483a' },
};

export const RETURN_STATUS = {
  Pending: { label: 'Pending', color: '#d9a21b' },
  Approved: { label: 'Approved', color: '#3b82c4' },
  Refunded: { label: 'Refunded', color: '#3c8a5a' },
  Rejected: { label: 'Rejected', color: '#b5483a' },
};

// Same rules as the server: where a return can go from each status.
const RETURN_ACTIONS = {
  Pending: [
    { to: 'Approved', label: 'Approve' },
    { to: 'Rejected', label: 'Reject', danger: true },
  ],
  Approved: [
    { to: 'Refunded', label: 'Mark refunded' },
    { to: 'Rejected', label: 'Reject', danger: true },
  ],
};

export const money = (n) =>
  `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (iso, withTime = false) =>
  new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });

export function StatusPill({ status, statuses = ORDER_STATUS }) {
  const s = statuses[status] || { label: status, color: '#6c7a70' };
  return (
    <span className="status-pill" style={{ '--status': s.color }}>
      {s.label}
    </span>
  );
}

// Approve / reject / refund buttons for one return request.
// onChange receives the updated return; onError an error message.
export function ReturnActions({ ret, onChange, onError }) {
  const [busy, setBusy] = useState(false);
  const actions = RETURN_ACTIONS[ret.status] || [];
  if (!actions.length) return null;

  const run = async (to) => {
    if (to === 'Refunded' && !confirm(`Mark ${money(ret.amount)} as refunded for ${ret.id}?`)) return;
    setBusy(true);
    try {
      const res = await api.setReturnStatus(ret.id, to);
      onChange(res.return);
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="row-actions">
      {actions.map((a) => (
        <button
          key={a.to}
          type="button"
          className={a.danger ? 'btn btn-sm btn-danger' : 'btn btn-sm'}
          disabled={busy}
          onClick={() => run(a.to)}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
