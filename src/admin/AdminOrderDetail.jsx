// src/admin/AdminOrderDetail.jsx
// /admin/orders/:orderId — one order: customer, delivery address, items,
// totals, timeline and return requests. The admin moves the order through
// its statuses here and handles its returns.

import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from './api';
import { ORDER_STATUS, RETURN_STATUS, ReturnActions, StatusPill, formatDate, money } from './orderMeta';
import { PAYMENT_LABELS, formatAddress, lineProduct, shipmentDetails } from '../data/account';

const HISTORY_LABELS = {
  placed: 'Order placed',
  'in-progress': 'Marked in progress',
  packaging: 'Product packaging',
  shipped: 'Product shipped',
  'out-for-delivery': 'Out for delivery',
  delayed: 'Marked delayed',
  delivered: 'Marked delivered',
  canceled: 'Canceled',
};

const COURIER_SUGGESTIONS = ['UPS', 'FedEx', 'DHL Express', 'USPS', 'Blue Dart', 'Delhivery', 'India Post'];
const EMPTY_SHIPMENT = { courier: '', trackingNumber: '', warehouse: '', eta: '', trackingUrl: '' };

// Packaging -> shipped -> out for delivery -> delivered. Each step adds an entry
// to the order's timeline, which the customer sees under My Account → Orders.
function DeliveryPanel({ order, onOrder, onDelivered, busy }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [shipForm, setShipForm] = useState(null); // null = closed

  const done = new Set((order.history || []).map((h) => h.type));
  const finished = order.status === 'delivered' || order.status === 'canceled';
  const shipment = order.shipment;

  const record = async (event) => {
    setSaving(true);
    setError(null);
    try {
      const res = await api.addOrderEvent(order.id, event);
      onOrder(res.order);
      setShipForm(null);
    } catch (err) {
      setError(err.errors ? err.errors.join(' ') : err.message);
    } finally {
      setSaving(false);
    }
  };

  const setField = (k) => (e) => setShipForm((f) => ({ ...f, [k]: e.target.value }));
  const disabled = saving || busy;

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Delivery</h2>
          <p className="muted">Each step appears on the customer's order history straight away.</p>
        </div>
      </div>

      {error && (
        <div className="errors">
          <ul>
            <li>{error}</li>
          </ul>
        </div>
      )}

      {shipment && (
        <dl className="kv" style={{ marginBottom: 16 }}>
          {shipmentDetails(shipment).map(([k, v]) => (
            <React.Fragment key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </React.Fragment>
          ))}
          {shipment.trackingUrl && (
            <>
              <dt>Tracking link</dt>
              <dd>
                <a href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer">
                  {shipment.trackingUrl}
                </a>
              </dd>
            </>
          )}
        </dl>
      )}

      {finished ? (
        <p className="muted">This order is {order.status}; no more delivery steps can be added.</p>
      ) : shipForm ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            record({ type: 'shipped', ...shipForm });
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 16px' }}>
            <label className="field">
              <span>Courier service *</span>
              <input type="text" list="courier-suggestions" value={shipForm.courier} maxLength={80} onChange={setField('courier')} required autoFocus />
              <datalist id="courier-suggestions">
                {COURIER_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <label className="field">
              <span>Tracking number *</span>
              <input type="text" value={shipForm.trackingNumber} maxLength={80} onChange={setField('trackingNumber')} required />
            </label>
            <label className="field">
              <span>Warehouse / shipped from</span>
              <input type="text" value={shipForm.warehouse} maxLength={120} onChange={setField('warehouse')} />
            </label>
            <label className="field">
              <span>Estimated delivery date</span>
              <input type="date" value={shipForm.eta} onChange={setField('eta')} />
            </label>
            <label className="field" style={{ gridColumn: '1 / -1' }}>
              <span>Tracking link (optional)</span>
              <input type="url" value={shipForm.trackingUrl} maxLength={500} placeholder="https://…" onChange={setField('trackingUrl')} />
            </label>
          </div>
          <div className="row-actions">
            <button type="submit" className="btn btn-sm" disabled={disabled}>
              {saving ? 'Saving…' : done.has('shipped') ? 'Update shipment' : 'Mark as shipped'}
            </button>
            <button type="button" className="btn btn-outline btn-sm" disabled={disabled} onClick={() => setShipForm(null)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="row-actions">
          <button type="button" className="btn btn-sm" disabled={disabled || done.has('packaging')} onClick={() => record({ type: 'packaging' })}>
            {done.has('packaging') ? '✓ Packaging' : 'Mark packaging'}
          </button>
          <button
            type="button"
            className="btn btn-sm"
            disabled={disabled}
            onClick={() => setShipForm({ ...EMPTY_SHIPMENT, ...(shipment || {}) })}
          >
            {done.has('shipped') ? 'Update shipment' : 'Ship order…'}
          </button>
          <button
            type="button"
            className="btn btn-sm"
            disabled={disabled || !done.has('shipped') || done.has('out-for-delivery')}
            title={done.has('shipped') ? undefined : 'Ship the order first'}
            onClick={() => record({ type: 'out-for-delivery' })}
          >
            {done.has('out-for-delivery') ? '✓ Out for delivery' : 'Out for delivery'}
          </button>
          <button type="button" className="btn btn-sm" disabled={disabled} onClick={onDelivered}>
            Mark delivered
          </button>
        </div>
      )}
    </section>
  );
}

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
                <th>Date &amp; Time</th>
                <th>Size</th>
                <th className="num">Qty</th>
                <th className="num">Price</th>
                <th className="num">Sub Total</th>
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
                    <td data-label="Date & Time">{formatDate(order.placed_at, true)}</td>
                    <td data-label="Size">{l.size}</td>
                    <td data-label="Qty" className="num">
                      {l.qty}
                    </td>
                    <td data-label="Price" className="num">
                      {money(l.price)}
                    </td>
                    <td data-label="Sub Total" className="num">
                      {money(l.price * l.qty)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <DeliveryPanel
        order={order}
        busy={saving}
        onOrder={(updated) => setOrder((o) => ({ ...o, ...updated }))}
        onDelivered={() => changeStatus('delivered')}
      />

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
                {h.type === 'shipped' &&
                  shipmentDetails(h.details).map(([k, v]) => (
                    <span key={k} className="cell-sub">
                      {k}: {v}
                    </span>
                  ))}
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
