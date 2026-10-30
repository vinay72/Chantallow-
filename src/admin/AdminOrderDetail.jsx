// src/admin/AdminOrderDetail.jsx
// /admin/orders/:orderId — one order: customer, delivery address, items,
// totals, timeline and return requests. The admin moves the order through
// its statuses here and handles its returns.

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from './api';
import { ORDER_STATUS, RETURN_STATUS, ReturnActions, StatusPill, formatDate, money } from './orderMeta';
import { PAYMENT_LABELS, formatAddress, lineProduct } from '../data/account';

const HISTORY_LABELS = {
  placed: 'Order placed',
  'in-progress': 'Marked in progress',
  delayed: 'Marked delayed',
  delivered: 'Marked delivered',
  canceled: 'Canceled',
};

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getOrder(orderId)
      .then((res) => {
        if (cancelled) return;
        setOrder(res.order);
        setReturns(res.returns);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const changeStatus = async (status) => {
    if (status === order.status) return;
    if (status === 'canceled' && !confirm(`Cancel order #${order.id}? The customer will see it as canceled.`)) return;
    setSaving(true);
    setError(null);
    try {
      const res = await api.setOrderStatus(order.id, status);
      setOrder((o) => ({ ...o, ...res.order }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="empty-state">Loading order…</div>;

  if (!order) {
    return (
      <div className="empty-state">
        <h3>Order not found</h3>
        {error || `There is no order #${orderId}.`}
        <p style={{ marginTop: 16 }}>
          <Link to="/admin/orders" className="btn btn-outline btn-sm">
            Back to orders
          </Link>
        </p>
      </div>
    );
  }

  const address = order.address || {};
  const itemCount = order.items.reduce((n, l) => n + l.qty, 0);

  return (
    <>
      <div className="page-head">
        <div>
          <Link to="/admin/orders" className="back-link">
            ← All orders
          </Link>
          <h1>Order #{order.id}</h1>
          <div className="head-meta">
            Placed {formatDate(order.placed_at, true)} · <StatusPill status={order.status} />
          </div>
        </div>
        <label className="status-pick">
          Order status
          <select value={order.status} disabled={saving} onChange={(e) => changeStatus(e.target.value)}>
            {Object.entries(ORDER_STATUS).map(([value, s]) => (
              <option key={value} value={value}>
                {s.label}
              </option>
            ))}
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

      <div className="detail-grid">
        <section className="panel">
          <h2>Customer</h2>
          <dl className="kv">
            <dt>Name</dt>
            <dd>{order.customer_name || order.account_name || '—'}</dd>
            <dt>Email</dt>
            <dd>{order.email ? <a href={`mailto:${order.email}`}>{order.email}</a> : '—'}</dd>
            <dt>Phone</dt>
            <dd>{order.phone ? <a href={`tel:${order.phone}`}>{order.phone}</a> : '—'}</dd>
            <dt>Account</dt>
            <dd>{order.user_id ? `${order.account_name} (${order.account_email})` : 'Guest checkout'}</dd>
          </dl>
        </section>

        <section className="panel">
          <h2>Delivery address</h2>
          <p className="address">
            {[address.firstName, address.lastName].filter(Boolean).join(' ')}
            {address.company && <><br />{address.company}</>}
            <br />
            {formatAddress(address) || '—'}
          </p>
          {order.notes && (
            <>
              <h3>Order notes</h3>
              <p className="notes">{order.notes}</p>
            </>
          )}
        </section>

        <section className="panel">
          <h2>Payment</h2>
          <dl className="kv">
            <dt>Method</dt>
            <dd>{PAYMENT_LABELS[order.payment] || order.payment || '—'}</dd>
            <dt>Subtotal</dt>
            <dd>{money(order.subtotal)}</dd>
            <dt>Discount</dt>
            <dd>- {money(order.discount)}</dd>
            <dt>Shipping</dt>
            <dd>{money(order.shipping_cost)}</dd>
            <dt>Total</dt>
            <dd className="strong">{money(order.total)}</dd>
          </dl>
        </section>
      </div>

      <section className="panel">
        <h2>
          Items <span className="muted">({itemCount})</span>
        </h2>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Size</th>
                <th className="num">Qty</th>
                <th className="num">Price</th>
                <th className="num">Line total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((l, i) => {
                const p = lineProduct(l);
                return (
                  <tr key={i}>
                    <td data-label="Product">
                      <div className="item-cell">
                        <span className="item-thumb">{p.img && <img src={p.img} alt="" />}</span>
                        <span>{l.name || p.name}</span>
                      </div>
                    </td>
                    <td data-label="Size">{l.size}</td>
                    <td data-label="Qty" className="num">
                      {l.qty}
                    </td>
                    <td data-label="Price" className="num">
                      {money(l.price)}
                    </td>
                    <td data-label="Line total" className="num">
                      {money(l.price * l.qty)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="detail-grid two">
        <section className="panel">
          <h2>Timeline</h2>
          <ul className="timeline">
            {[...(order.history || [])].reverse().map((h, i) => (
              <li key={i}>
                <strong>{HISTORY_LABELS[h.type] || h.type}</strong>
                <span>
                  {formatDate(h.at, true)}
                  {h.by && ` · by ${h.by}`}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Return requests</h2>
          {returns.length === 0 ? (
            <p className="muted">No returns requested for this order.</p>
          ) : (
            <ul className="return-list">
              {returns.map((r) => (
                <li key={r.id}>
                  <div className="return-head">
                    <strong>{r.id}</strong>
                    <StatusPill status={r.status} statuses={RETURN_STATUS} />
                  </div>
                  <div className="cell-sub">
                    {lineProduct({ productId: r.product_id }).name} ({r.size}) × {r.qty} · {money(r.amount)}
                  </div>
                  <div className="cell-sub">
                    {r.reason}
                    {r.comment && ` — “${r.comment}”`}
                  </div>
                  <ReturnActions
                    ret={r}
                    onError={setError}
                    onChange={(updated) => setReturns((list) => list.map((x) => (x.id === updated.id ? updated : x)))}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
