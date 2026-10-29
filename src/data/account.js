// src/data/account.js
// ------------------------------------------------------------------
// User Panel data store (My Account).
// Everything the account pages show lives here: profile, addresses,
// orders, return requests and reviews. It is saved in localStorage so
// it survives a page refresh, and every page that calls useAccount()
// re-renders automatically when something changes.
//
// Orders, cancellations and return requests are also sent to the
// backend (see syncToServer) so the admin dashboard can count them.
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

// Builds the "Order History" timeline (newest first) from the order's status.
function buildHistory({ placedAt, status, courier }) {
  const placed = { title: "Order Placed", at: placedAt, done: true };
  const packaging = { title: "Product Packaging", at: addHours(placedAt, 20), done: true };
  const shipped = {
    title: "Product Shipped",
    at: addHours(placedAt, 30),
    done: true,
    details: [
      ["Tracking Number", courier.tracking],
      ["Warehouse", courier.warehouse],
    ],
  };
  const outFor = {
    title: "Out For Delivery",
    at: addHours(placedAt, 52),
    done: true,
    details: [
      ["Courier Service", `${courier.service}, ${courier.agent}`],
      ["Estimated Delivery Date", courier.eta],
    ],
  };
  const delivered = { title: "Product Delivered", at: addHours(placedAt, 60), done: true };

  if (status === "canceled")
    return [{ title: "Order Canceled", at: addHours(placedAt, 6), done: true, danger: true }, placed];
  if (status === "delayed")
    return [
      { title: "Shipment Delayed", at: addHours(placedAt, 54), done: true, warning: true, details: [["Reason", "Courier backlog — new date will be shared soon"]] },
      shipped,
      packaging,
      placed,
    ];
  if (status === "delivered") return [delivered, outFor, shipped, packaging, placed];
  // in progress
  return [outFor, shipped, packaging, placed];
}

/* ------------------------------ seed data ------------------------------ */
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

// [order id, placed date, status, [[productId, size, qty, unitPrice], ...], discount]
const SEED = [
  ["34VB5540K83", "2024-05-21T15:43:23", "in-progress", [[4, "4oz", 2, 66], [1, "4oz", 2, 80], [6, "2oz", 1, 66.75]], 0],
  ["78A643CD409", "2024-12-09T11:12:05", "canceled", [[7, "4oz", 4, 95], [8, "4oz", 4, 95.125]], 0],
  ["112P45A90V2", "2024-10-15T09:30:44", "delayed", [[2, "4oz", 8, 89], [3, "4oz", 6, 92]], 0],
  ["28BA67U0981", "2024-07-19T18:02:10", "delivered", [[5, "4oz", 1, 95], [3, "2oz", 2, 51.675]], 0],
  ["502TR872W2", "2024-04-04T13:21:50", "delivered", [[1, "4oz", 10, 80], [4, "4oz", 12, 66], [6, "4oz", 5, 108.38]], 0],
  ["47H76G09F33", "2024-03-30T10:45:00", "delivered", [[8, "2oz", 1, 86.4]], 0],
  ["53U76G09E38", "2024-04-21T16:10:31", "delivered", [[2, "2oz", 1, 86.4]], 0],
  ["31M76G09G76", "2024-05-07T12:05:17", "delivered", [[7, "2oz", 2, 56.2]], 0],
  ["19K42L77P10", "2024-02-18T14:22:09", "delivered", [[4, "4oz", 1, 66]], 0],
  ["61D20Q88S41", "2024-02-02T09:12:40", "delivered", [[1, "2oz", 3, 45]], 0],
  ["90F31H65R27", "2024-01-26T17:48:13", "canceled", [[3, "4oz", 1, 92]], 0],
  ["74C18B39N55", "2024-01-11T11:03:56", "delivered", [[5, "4oz", 2, 95]], 10],
  ["38P90W12E63", "2023-12-28T19:31:22", "delivered", [[6, "4oz", 1, 89]], 0],
  ["25T67Y40M18", "2023-12-14T08:40:05", "delivered", [[2, "4oz", 2, 89], [8, "2oz", 1, 45]], 15],
  ["82G55J21K09", "2023-11-30T15:15:15", "delivered", [[7, "4oz", 1, 95]], 0],
  ["57R04V93X36", "2023-11-17T13:57:48", "delivered", [[4, "2oz", 4, 40]], 0],
  ["13N88U26D72", "2023-11-02T10:20:34", "delivered", [[1, "4oz", 1, 80]], 0],
  ["66Z31A57C84", "2023-10-21T16:44:02", "delivered", [[3, "2oz", 2, 48]], 0],
];

function makeOrder({ id, placedAt, status, items, discount = 0, shippingCost = 0, payment = "cod", address = DEMO_ADDRESS, email = "info@example.com", phone = "", notes = "", index = 0 }) {
  const c = COURIERS[index % COURIERS.length];
  const courier = {
    ...c,
    tracking: `${3409 + index * 7}-${4216 + index * 13}-${8759 - index * 11}`,
    warehouse: `Chantallow Warehouse ${12 + (index % 5)}b`,
    eta: formatStamp(addHours(placedAt, 72)).split(" ")[0],
    note:
      `Your parcel is handled by ${c.service}. Our courier partner will contact you on your registered phone number before delivery. ` +
      `You can track the parcel any time with the tracking number above. If you are not at home, the parcel will be left with a neighbour ` +
      `or taken back to the nearest ${c.service} point for collection within 5 working days.`,
  };
  return {
    id,
    placedAt,
    status,
    items,
    discount,
    shippingCost,
    payment,
    address,
    email,
    phone,
    notes,
    courier,
    history: buildHistory({ placedAt, status, courier }),
  };
}

function seedOrders() {
  return SEED.map(([id, placedAt, status, lines, discount], index) =>
    makeOrder({
      id,
      placedAt: new Date(placedAt).toISOString(),
      status,
      discount,
      index,
      items: lines.map(([productId, size, qty, price]) => ({ productId, size, qty, price })),
    })
  );
}

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
    orders: seedOrders(),
    returns: [],
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
      const saved = JSON.parse(raw);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

// The page updates straight away from localStorage; the server copy is sent in
// the background. A failure is logged rather than shown, because the
// customer's own copy is already saved (e.g. demo orders don't exist server-side).
function syncToServer(path, options) {
  api(path, options).catch((err) => console.warn(`Couldn't sync ${path} to the server:`, err.message));
}

/** Called by the checkout page. Returns the new order. */
export function placeOrder({ items, address, email, phone, payment, shippingCost = 0, discount = 0, notes = "" }) {
  const placedAt = new Date().toISOString();
  const order = {
    ...makeOrder({ id: randomId(), placedAt, status: "in-progress", items, discount, shippingCost, payment, address, email, phone, notes, index: state.orders.length }),
  };
  // A brand-new order has only been placed so far.
  order.history = [{ title: "Order Placed", at: placedAt, done: true }];
  setState((s) => ({ orders: [order, ...s.orders] }));
  syncToServer("/orders", {
    method: "POST",
    body: { id: order.id, items, discount, shippingCost, payment, email },
  });
  return order;
}

export function cancelOrder(id) {
  setState((s) => ({
    orders: s.orders.map((o) =>
      o.id === id
        ? { ...o, status: "canceled", history: [{ title: "Order Canceled", at: new Date().toISOString(), done: true, danger: true }, ...o.history] }
        : o
    ),
  }));
  syncToServer(`/orders/${encodeURIComponent(id)}/cancel`, { method: "POST" });
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

export function addReturnRequest({ orderId, productId, size, qty, reason, comment }) {
  const req = {
    id: `RR-${randomId().slice(0, 8)}`,
    orderId,
    productId,
    size,
    qty,
    reason,
    comment,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };
  setState((s) => ({ returns: [req, ...s.returns] }));
  syncToServer("/returns", {
    method: "POST",
    body: { id: req.id, orderId, productId, size, qty, reason, comment },
  });
  return req;
}

export function cancelReturnRequest(id) {
  setState((s) => ({ returns: s.returns.filter((r) => r.id !== id) }));
  syncToServer(`/returns/${encodeURIComponent(id)}`, { method: "DELETE" });
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

/** Clears everything back to the demo data. */
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