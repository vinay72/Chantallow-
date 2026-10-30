import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import AccountLayout, { EmptyState, StatusBadge } from "./AccountLayout";
import { useShop } from "../../context/ShopContext";
import {
  ORDER_STATUS,
  PAYMENT_LABELS,
  cancelOrder,
  downloadOrderFile,
  formatAddress,
  formatMoney,
  formatStamp,
  formatStartTime,
  lineProduct,
  orderSubtotal,
  orderTotal,
  requestConfirmation,
  useAccount,
} from "../../data/account";

/**
 * My Account → Order Details
 * Route: /account/orders/:orderId   (e.g. /account/orders/34VB5540K83)
 */
const TABS = [
  { key: "history", label: "Order History" },
  { key: "items", label: "Item Details" },
  { key: "courier", label: "Courier" },
  { key: "receiver", label: "Receiver" },
];

const CANCELLABLE = ["in-progress", "delayed"];

export default function AccountOrderDetails() {
  const { orderId } = useParams();
  const { orders, ordersStatus } = useAccount();
  const { showToast } = useShop();
  const [tab, setTab] = useState("history");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const order = orders.find((o) => o.id === String(orderId).replace(/^#/, ""));

  if (!order && (ordersStatus === "loading" || ordersStatus === "idle")) {
    return (
      <AccountLayout crumb="Account Order Details">
        <div className="ua-card">
          <p className="ua-card__text">Loading order…</p>
        </div>
      </AccountLayout>
    );
  }

  if (!order) {
    return (
      <AccountLayout crumb="Account Order Details">
        <div className="ua-card">
          <EmptyState
            title="Order not found"
            text={`We couldn't find an order with the number #${orderId}.`}
            action={
              <Link to="/account/orders" className="ua-btn ua-btn--primary">
                Back To Orders
              </Link>
            }
          />
        </div>
      </AccountLayout>
    );
  }

  const first = lineProduct(order.items[0]);
  const itemCount = order.items.reduce((s, l) => s + l.qty, 0);
  const extra = order.items.length - 1;
  const subtotal = orderSubtotal(order);
  const total = orderTotal(order);
  const canCancel = CANCELLABLE.includes(order.status);

  const onExport = () => {
    downloadOrderFile(order, "order-details");
    showToast && showToast(`Order #${order.id} details downloaded`);
  };

  const onConfirm = () => {
    requestConfirmation(order.id);
    showToast && showToast(`Confirmation sent to ${order.email}`);
  };

  const onCancel = async () => {
    setCanceling(true);
    try {
      await cancelOrder(order.id);
      setConfirmCancel(false);
      setTab("history");
      showToast && showToast(`Order #${order.id} has been canceled`);
    } catch (err) {
      showToast && showToast(err.message);
    } finally {
      setCanceling(false);
    }
  };

  return (
    <AccountLayout crumb="Account Order Details">
      <div className="ua-card ua-order">
        {/* ---------- Head ---------- */}
        <div className="ua-order__head">
          <div className="ua-thumb">{first.img && <img src={first.img} alt={first.name} />}</div>
          <div>
            <StatusBadge status={order.status} statuses={ORDER_STATUS} />
            <h4>Order #{order.id}</h4>
          </div>
        </div>

        {/* ---------- Summary ---------- */}
        <div className="ua-order__meta">
          <div>
            <span>Item</span>
            <h6>
              {first.shortName}
              {extra > 0 && ` + ${extra} more`} <small>({itemCount} {itemCount === 1 ? "item" : "items"})</small>
            </h6>
          </div>
          <div>
            <span>Courier</span>
            <h6>{order.courier.service}</h6>
          </div>
          <div>
            <span>Start Time</span>
            <h6>{formatStartTime(order.placedAt)}</h6>
          </div>
          <div>
            <span>Address</span>
            <h6>{formatAddress(order.address)}</h6>
          </div>
        </div>

        {/* ---------- Actions ---------- */}
        <div className="ua-order__actions">
          <button type="button" className="ua-btn ua-btn--primary" onClick={onExport}>
            Export Details
          </button>
          <button type="button" className="ua-btn ua-btn--outline" onClick={onConfirm} disabled={order.status === "canceled"}>
            {order.confirmationRequestedAt ? "Resend Confirmation" : "Request Confirmation"}
          </button>
          {canCancel && (
            <button type="button" className="ua-btn ua-btn--danger" onClick={() => setConfirmCancel(true)}>
              Cancel Order
            </button>
          )}
        </div>

        {confirmCancel && (
          <div className="ua-confirm" role="alertdialog" aria-label="Cancel order">
            <p>
              Are you sure you want to cancel order <strong>#{order.id}</strong>? This can't be undone.
            </p>
            <div>
              <button type="button" className="ua-btn ua-btn--danger-fill ua-btn--sm" onClick={onCancel} disabled={canceling}>
                {canceling ? "Canceling…" : "Yes, Cancel Order"}
              </button>
              <button type="button" className="ua-btn ua-btn--outline ua-btn--sm" onClick={() => setConfirmCancel(false)}>
                Keep Order
              </button>
            </div>
          </div>
        )}

        {/* ---------- Tabs ---------- */}
        <div className="ua-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={tab === t.key ? "is-active" : undefined}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="ua-tab-panel" role="tabpanel">
          {/* Order History */}
          {tab === "history" && (
            <ul className="ua-timeline">
              {order.history.map((h, i) => {
                const tone = h.danger ? "danger" : h.warning ? "warning" : i < 2 ? "success" : "muted";
                return (
                  <li key={`${h.title}-${h.at}-${i}`} className={`is-${tone}`}>
                    <span className="ua-timeline__dot" aria-hidden="true" />
                    <div className="ua-timeline__box">
                      <h6>{h.title}</h6>
                      <span className="ua-timeline__time">{formatStamp(h.at)}</span>
                      {h.details &&
                        h.details.map(([k, v]) => (
                          <p key={k}>
                            <strong>{k} : </strong>
                            {v}
                          </p>
                        ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Item Details */}
          {tab === "items" && (
            <div className="ua-items">
              <h5>Item Details</h5>
              {order.items.map((l, i) => {
                const p = lineProduct(l);
                const body = (
                  <>
                    <div className="ua-thumb ua-thumb--lg">{p.img && <img src={p.img} alt={p.name} />}</div>
                    <div className="ua-item__content">
                      <h6>{p.name}</h6>
                      <small>
                        <strong>Price</strong> : {formatMoney(l.price)}
                      </small>
                      <small>
                        <strong>Size</strong> : {l.size.replace("oz", " oz")}
                      </small>
                      <small>
                        <strong>Qty</strong> : {l.qty}
                      </small>
                    </div>
                  </>
                );
                return p.slug ? (
                  <Link key={i} to={`/product/${p.slug}`} className="ua-item">
                    {body}
                  </Link>
                ) : (
                  <div key={i} className="ua-item">
                    {body}
                  </div>
                );
              })}

              <div className="ua-sum-row">
                <span>Total Price</span>
                <h6>+ {formatMoney(subtotal)}</h6>
              </div>
              <div className="ua-sum-row ua-sum-row--discount">
                <span>Total Discounts</span>
                <h6>- {formatMoney(order.discount)}</h6>
              </div>
              {order.shippingCost > 0 && (
                <div className="ua-sum-row">
                  <span>Shipping</span>
                  <h6>+ {formatMoney(order.shippingCost)}</h6>
                </div>
              )}
              <div className="ua-sum-row ua-sum-row--total">
                <span>Order Total</span>
                <h6>{formatMoney(total)}</h6>
              </div>
            </div>
          )}

          {/* Courier */}
          {tab === "courier" && (
            <div className="ua-courier">
              <p>{order.courier.note}</p>
            </div>
          )}

          {/* Receiver */}
          {tab === "receiver" && (
            <div>
              {order.status === "canceled" ? (
                <h5 className="ua-receiver__title ua-receiver__title--danger">This order has been canceled</h5>
              ) : (
                <h5 className="ua-receiver__title">Thank you Your order has been received</h5>
              )}
              <ul className="ua-receiver">
                <li>
                  Order Number : <strong>#{order.id}</strong>
                </li>
                <li>
                  Date : <strong>{formatStamp(order.placedAt).replace(" ", ", ")}</strong>
                </li>
                <li>
                  Total : <strong>{formatMoney(total)}</strong>
                </li>
                <li>
                  Payment Methods : <strong>{PAYMENT_LABELS[order.payment] || order.payment}</strong>
                </li>
                <li>
                  Receiver : <strong>{`${order.address.firstName || ""} ${order.address.lastName || ""}`.trim() || "—"}</strong>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="ua-back">
          <Link to="/account/orders" className="ua-link">
            ← Back to all orders
          </Link>
        </div>
      </div>
    </AccountLayout>
  );
}
