import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AccountLayout, { EmptyState, StatusBadge } from "./AccountLayout";
import { useShop } from "../../context/ShopContext";
import { addReturnRequest, cancelReturnRequest, formatLongDate, lineProduct, useAccount } from "../../data/account";

/**
 * My Account → Return request
 * Route: /account/return-request
 * Pick a delivered order + item, give a reason, and submit. Requests are listed below the form.
 */
const REASONS = [
  "Damaged or leaking jar",
  "Wrong item received",
  "Wrong size received",
  "Skin reaction / allergy",
  "Item not as described",
  "Changed my mind",
  "Other",
];

const RETURN_STATUS = {
  Pending: { label: "Pending", color: "#f0a30a" },
  Approved: { label: "Approved", color: "#1e88e5" },
  Refunded: { label: "Refunded", color: "#2c8a5a" },
  Rejected: { label: "Rejected", color: "#d32f2f" },
};

const EMPTY = { orderId: "", line: "0", qty: 1, reason: "", comment: "" };

export default function AccountReturnRequest() {
  const { orders, returns } = useAccount();
  const { showToast } = useShop();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const delivered = useMemo(
    () => orders.filter((o) => o.status === "delivered").sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt)),
    [orders]
  );
  const order = delivered.find((o) => o.id === form.orderId);
  const line = order ? order.items[Number(form.line)] : null;

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const out = {};
    if (!order) out.orderId = "Please choose an order.";
    if (!form.reason) out.reason = "Please choose a reason.";
    if (line && (form.qty < 1 || form.qty > line.qty)) out.qty = `Enter a quantity between 1 and ${line.qty}.`;
    if (form.reason === "Other" && !form.comment.trim()) out.comment = "Please tell us a little more.";
    setErrors(out);
    if (Object.keys(out).length) return;

    setBusy(true);
    try {
      const req = await addReturnRequest({
        orderId: order.id,
        productId: line.productId,
        size: line.size,
        qty: Number(form.qty),
        reason: form.reason,
        comment: form.comment.trim(),
      });
      setForm(EMPTY);
      showToast && showToast(`Return request ${req.id} submitted`);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setBusy(false);
    }
  };

  const onWithdraw = async (id) => {
    try {
      await cancelReturnRequest(id);
      showToast && showToast(`Return request ${id} withdrawn`);
    } catch (err) {
      showToast && showToast(err.message);
    }
  };

  return (
    <AccountLayout crumb="Account Return Request">
      <div className="ua-card">
        <h4 className="ua-card__title">Return Request</h4>
        <p className="ua-card__text">
          You can request a return for items from delivered orders within 30 days. Read our{" "}
          <Link to="/return-refund-policy" className="ua-link">
            Return &amp; Refund Policy
          </Link>
          .
        </p>

        {delivered.length === 0 ? (
          <EmptyState title="Nothing to return" text="Only delivered orders can be returned." />
        ) : (
          <form className="ua-form" onSubmit={onSubmit} noValidate>
            <div className="ua-form__grid">
              <label className={`ua-field${errors.orderId ? " has-error" : ""}`}>
                <span>Order *</span>
                <select value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value, line: "0", qty: 1 })}>
                  <option value="">Select an order</option>
                  {delivered.map((o) => (
                    <option key={o.id} value={o.id}>
                      #{o.id} — {formatLongDate(o.placedAt)}
                    </option>
                  ))}
                </select>
                {errors.orderId && <em>{errors.orderId}</em>}
              </label>

              <label className="ua-field">
                <span>Item *</span>
                <select value={form.line} onChange={(e) => setForm({ ...form, line: e.target.value, qty: 1 })} disabled={!order}>
                  {order ? (
                    order.items.map((l, i) => (
                      <option key={i} value={i}>
                        {lineProduct(l).name} ({l.size})
                      </option>
                    ))
                  ) : (
                    <option>Choose an order first</option>
                  )}
                </select>
              </label>

              <label className={`ua-field${errors.qty ? " has-error" : ""}`}>
                <span>Quantity *</span>
                <input type="number" min="1" max={line ? line.qty : 1} value={form.qty} onChange={(e) => set("qty", Number(e.target.value))} disabled={!order} />
                {errors.qty && <em>{errors.qty}</em>}
              </label>

              <label className={`ua-field${errors.reason ? " has-error" : ""}`}>
                <span>Reason *</span>
                <select value={form.reason} onChange={(e) => set("reason", e.target.value)}>
                  <option value="">Select a reason</option>
                  {REASONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                {errors.reason && <em>{errors.reason}</em>}
              </label>

              <label className={`ua-field ua-field--full${errors.comment ? " has-error" : ""}`}>
                <span>Comments</span>
                <textarea rows={4} placeholder="Tell us what went wrong (optional)" value={form.comment} onChange={(e) => set("comment", e.target.value)} />
                {errors.comment && <em>{errors.comment}</em>}
              </label>
            </div>
            {errors.submit && <p className="ua-form__error" role="alert">{errors.submit}</p>}
            <button type="submit" className="ua-btn ua-btn--primary" disabled={busy}>
              {busy ? "Submitting…" : "Submit Request"}
            </button>
          </form>
        )}

        <h5 className="ua-subtitle">Your Requests</h5>
        {returns.length === 0 ? (
          <p className="ua-card__text">You haven't made any return requests yet.</p>
        ) : (
          <div className="ua-table-wrap">
            <table className="ua-table">
              <thead>
                <tr>
                  <th>Request #</th>
                  <th>Order</th>
                  <th>Item</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th className="ua-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((r) => (
                  <tr key={r.id}>
                    <td className="ua-order-no">{r.id}</td>
                    <td>
                      <Link to={`/account/orders/${r.orderId}`} className="ua-link">
                        #{r.orderId}
                      </Link>
                    </td>
                    <td>
                      {lineProduct(r).shortName} ({r.size}) × {r.qty}
                    </td>
                    <td>{r.reason}</td>
                    <td>
                      <StatusBadge status={r.status} statuses={RETURN_STATUS} />
                    </td>
                    <td className="ua-right">
                      {r.status === "Pending" && (
                        <button type="button" className="ua-link ua-link-btn ua-link--danger" onClick={() => onWithdraw(r.id)}>
                          Withdraw
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
