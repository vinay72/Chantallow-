// src/data/account.js
// ------------------------------------------------------------------
// User Panel data store (My Account).
// Everything the account pages show lives here: profile, addresses,
// orders, return requests and reviews. Every page that calls useAccount()
// re-renders automatically when something changes.
//
// Orders and return requests live on the server (they are what the admin
// panel works with) and are loaded with loadAccountOrders(). Profile,
// addresses, payment method and reviews are saved in localStorage.
// ------------------------------------------------------------------
import { useSyncExternalStore } from "react";
import { api } from "../api/client";
import { getProductById } from "./products";

const STORAGE_KEY = "chantallow_account_v2"; // v2: new demo totals

/* ------------------------------ statuses ------------------------------ */
export const ORDER_STATUS = {
  "in-progress": { label: "In Progress", color: "#1e88e5" },
  canceled: { label: "Canceled", color: "#d32f2f" },
  delayed: { label: "Delayed", color: "#f0a30a" },
  delivered: { label: "Delivered", color: "#2c8a5a" },
};

export const PAYMENT_LABELS = {
  bank: "Direct Bank Transfer",
  card: "Credit or Debit Card",
  cod: "Cash on Delivery",
  paypal: "PayPal",
};

/* ------------------------------ helpers ------------------------------ */
const pad = (n) => String(n).padStart(2, "0");

// "May 21, 2024"
export const formatLongDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" });

// "08/04/2024 5:23pm"
export const formatStamp = (iso) => {
  const d = new Date(iso);
  let h = d.getHours();
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${h}:${pad(d.getMinutes())}${ampm}`;
};

// "05 April 2024, 15:43:23"
export const formatStartTime = (iso) => {
  const d = new Date(iso);
  const month = d.toLocaleDateString("en-US", { month: "long" });
  return `${pad(d.getDate())} ${month} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export const formatMoney = (value) =>
  `$${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatAddress = (a) => {
  if (!a) return "";
  const city = a.city === "Other" ? a.cityOther : a.city;
  return [a.street1, a.street2, city, a.state, a.zip, a.country].filter(Boolean).join(", ");
};

// Order line -> product name / image (looked up live from products.js)
export const lineProduct = (line) => {
  const p = getProductById(line.productId);
  return {
    name: (p && (p.displayName || p.name)) || line.name || "Chantallow product",
    shortName: (p && p.name) || line.name || "Chantallow product",
    img: p ? p.cardImage || (p.gallery && p.gallery[0]) : line.img,
    slug: p ? p.slug : "",
  };
};

export const orderSubtotal = (order) => order.items.reduce((s, l) => s + l.price * l.qty, 0);
export const orderTotal = (order) => Math.max(0, orderSubtotal(order) - (order.discount || 0) + (order.shippingCost || 0));

const addHours = (iso, h) => new Date(new Date(iso).getTime() + h * 3600 * 1000).toISOString();

// Server timeline events -> the "Order History" entries the page shows.
const HISTORY_STEPS = {
  placed: { title: "Order Placed" },
  "in-progress": { title: "Order Processing" },
  delayed: { title: "Shipment Delayed", warning: true },
  delivered: { title: "Product Delivered" },
  canceled: { title: "Order Canceled", danger: true },
};

// Newest first, as the timeline is drawn top-down.
function buildHistory(events = []) {
  return events
    .map((e) => ({
      ...(HISTORY_STEPS[e.type] || { title: e.type }),
      at: e.at,
      done: true,
      details: e.type === "canceled" ? [["Canceled By", e.by === "admin" ? "Chantallow" : "You"]] : undefined,
    }))
    .reverse();
}

/* ------------------------------ defaults ------------------------------ */
// Placeholder profile email; replaced with the signed-in user's on first visit.
export const DEMO_EMAIL = "info@example.com";

const DEMO_ADDRESS = {
  firstName: "Username",
  lastName: "",
  company: "",
  country: "United Kingdom",
  street1: "451 Wall Street",
  street2: "",
  state: "London",
  city: "London",
  cityOther: "",
  zip: "EC1A 1BB",
};

const COURIERS = [
  { service: "UPS", agent: "R. Gosling" },
  { service: "DHL Express", agent: "M. Carter" },
  { service: "FedEx", agent: "S. Patel" },
  { service: "Blue Dart", agent: "A. Mehra" },
];

// Courier shown on an order (the shop doesn't track couriers yet, so this is
// picked from the order number and stays the same for each order).
function courierFor(order) {
  const index = [...order.id].reduce((n, ch) => n + ch.charCodeAt(0), 0);
  const c = COURIERS[index % COURIERS.length];
  return {
    ...c,
    eta: formatStamp(addHours(order.placed_at, 72)).split(" ")[0],
    note:
      `Your parcel is handled by ${c.service}. Our courier partner will contact you on your registered phone number before delivery. ` +
      `If you are not at home, the parcel will be left with a neighbour ` +
      `or taken back to the nearest ${c.service} point for collection within 5 working days.`,
  };
}

// API order row -> the shape the account pages use.
function fromServerOrder(o) {
  return {
    id: o.id,
    placedAt: o.placed_at,
    status: o.status,
    items: o.items,
    discount: o.discount,
    shippingCost: o.shipping_cost,
    payment: o.payment,
    address: o.address || {},
    email: o.email || "",
    phone: o.phone || "",
    notes: o.notes || "",
    courier: courierFor(o),
    history: buildHistory(o.history),
  };
}

// API return row -> the shape the account pages use.
const fromServerReturn = (r) => ({
  id: r.id,
  orderId: r.order_id,
  productId: r.product_id,
  size: r.size,
  qty: r.qty,
  amount: r.amount,
  reason: r.reason,
  comment: r.comment || "",
  status: r.status,
  createdAt: r.created_at,
});

function initialState() {
  return {
    profile: {
      firstName: "Username",
      lastName: "",
      email: DEMO_EMAIL,
      phone: "",
      gender: "",
      birthday: "",
      avatar: "", // data URL of the uploaded photo
    },
    addresses: {
      billing: { ...DEMO_ADDRESS },
      shipping: { ...DEMO_ADDRESS },
    },
    orders: [], // loaded from the server
    returns: [], // loaded from the server
    ordersStatus: "idle", // idle | loading | ready | error
    ordersUserId: null, // whose orders are loaded
    reviews: [],
    // default way to pay; a card keeps only brand / last4 / expiry / name
    paymentMethod: { type: "cod", card: null, paypalEmail: "" },
  };
}

/* ------------------------------ the store ------------------------------ */
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      // eslint-disable-next-line no-unused-vars
      const { orders, returns, ordersStatus, ordersUserId, ...saved } = JSON.parse(raw);
      return { ...initialState(), ...saved };
    }
  } catch (e) {
    /* storage blocked or corrupt — fall back to defaults */
  }
  return initialState();
}

let state = typeof window === "undefined" ? initialState() : load();
const listeners = new Set();

function setState(updater) {
  state = { ...state, ...updater(state) };
  try {
    // eslint-disable-next-line no-unused-vars
    const { orders, returns, ordersStatus, ordersUserId, ...local } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
  } catch (e) {
    /* ignore quota / private mode */
  }
  listeners.forEach((l) => l());
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** React hook — returns the whole account state and re-renders on change. */
export function useAccount() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

export const getOrder = (id) => state.orders.find((o) => o.id === String(id).replace(/^#/, ""));

/* ------------------------------ actions ------------------------------ */
const randomId = () =>
  Array.from({ length: 11 }, () => "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random() * 34)]).join("");

/** Loads the signed-in customer's orders and return requests from the server. */
export async function loadAccountOrders(userId) {
  // a different account: don't show the previous one's orders while loading
  setState((s) => (s.ordersUserId === userId ? { ordersStatus: "loading" } : { orders: [], returns: [], ordersStatus: "loading", ordersUserId: userId }));
  try {
    const [o, r] = await Promise.all([api("/orders/mine"), api("/returns/mine")]);
    setState(() => ({ orders: o.orders.map(fromServerOrder), returns: r.returns.map(fromServerReturn), ordersStatus: "ready" }));
  } catch (err) {
    setState(() => ({ ordersStatus: "error" }));
    throw err;
  }
}

/** Called on sign-out so the next person doesn't see these orders. */
export function clearAccountOrders() {
  setState(() => ({ orders: [], returns: [], ordersStatus: "idle", ordersUserId: null }));
}

/** Called by the checkout page. Saves the order on the server and returns it. Throws on failure. */
export async function placeOrder({ items, address, email, phone, payment, shippingCost = 0, discount = 0, notes = "" }) {
  const body = {
    id: randomId(),
    // the name is kept on the order so the admin can read it even if the product changes
    items: items.map((l) => ({ ...l, name: l.name || lineProduct(l).name })),
    address,
    email,
    phone,
    payment,
    shippingCost,
    discount,
    notes,
  };
  const { order } = await api("/orders", { method: "POST", body });
  const saved = fromServerOrder(order);
  setState((s) => ({ orders: [saved, ...s.orders.filter((o) => o.id !== saved.id)] }));
  return saved;
}

/** Cancels one of the customer's orders on the server. Throws on failure. */
export async function cancelOrder(id) {
  const { order } = await api(`/orders/${encodeURIComponent(id)}/cancel`, { method: "POST" });
  const saved = fromServerOrder(order);
  setState((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...saved, confirmationRequestedAt: o.confirmationRequestedAt } : o)) }));
  return saved;
}

export function requestConfirmation(id) {
  setState((s) => ({
    orders: s.orders.map((o) =>
      o.id === id
        ? {
            ...o,
            confirmationRequestedAt: new Date().toISOString(),
            history: [{ title: "Confirmation Requested", at: new Date().toISOString(), done: true, details: [["Sent To", o.email]] }, ...o.history],
          }
        : o
    ),
  }));
}

export function saveProfile(profile) {
  setState((s) => ({ profile: { ...s.profile, ...profile } }));
}

export function saveAddress(type, address) {
  setState((s) => ({ addresses: { ...s.addresses, [type]: { ...address } } }));
}

export function savePaymentMethod(method) {
  setState((s) => ({ paymentMethod: { ...s.paymentMethod, ...method } }));
}

export function removeSavedCard() {
  setState((s) => ({
    paymentMethod: { ...s.paymentMethod, card: null, type: s.paymentMethod.type === "card" ? "cod" : s.paymentMethod.type },
  }));
}

/** Sends a return request to the server and returns it. Throws on failure. */
export async function addReturnRequest({ orderId, productId, size, qty, reason, comment }) {
  const body = { id: `RR-${randomId().slice(0, 8)}`, orderId, productId, size, qty, reason, comment };
  const { return: row } = await api("/returns", { method: "POST", body });
  const req = fromServerReturn(row);
  setState((s) => ({ returns: [req, ...s.returns] }));
  return req;
}

/** Withdraws a pending return request. Throws on failure. */
export async function cancelReturnRequest(id) {
  await api(`/returns/${encodeURIComponent(id)}`, { method: "DELETE" });
  setState((s) => ({ returns: s.returns.filter((r) => r.id !== id) }));
}

export function saveReview({ productId, rating, title, text }) {
  setState((s) => {
    const existing = s.reviews.find((r) => r.productId === productId);
    const review = { id: existing ? existing.id : `RV-${Date.now()}`, productId, rating, title, text, updatedAt: new Date().toISOString() };
    return {
      reviews: existing ? s.reviews.map((r) => (r.productId === productId ? review : r)) : [review, ...s.reviews],
    };
  });
}

export function deleteReview(id) {
  setState((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) }));
}

/** Clears everything stored in this browser back to the defaults. */
export function resetAccountData() {
  setState(() => initialState());
}

/* ------------------------------ files ------------------------------ */
/** Downloads a plain-text invoice / order summary for one order. */
export function downloadOrderFile(order, kind = "invoice") {
  const lines = [
    "CHANTALLOW",
    kind === "invoice" ? "INVOICE" : "ORDER DETAILS",
    "",
    `Order Number : #${order.id}`,
    `Date         : ${formatStartTime(order.placedAt)}`,
    `Status       : ${ORDER_STATUS[order.status].label}`,
    `Payment      : ${PAYMENT_LABELS[order.payment] || order.payment}`,
    `Ship To      : ${formatAddress(order.address)}`,
    "",
    "ITEMS",
    ...order.items.map((l) => {
      const p = lineProduct(l);
      return `- ${p.name} [${l.size}] x ${l.qty}  ${formatMoney(l.price * l.qty)}`;
    }),
    "",
    `Subtotal  : ${formatMoney(orderSubtotal(order))}`,
    `Discount  : - ${formatMoney(order.discount)}`,
    `Shipping  : ${formatMoney(order.shippingCost)}`,
    `Total     : ${formatMoney(orderTotal(order))}`,
    "",
    "Thank you for shopping with Chantallow.",
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chantallow-${kind}-${order.id}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}