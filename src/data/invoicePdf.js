// src/data/invoicePdf.js
// Builds the A4 PDF invoice / order summary a customer downloads from My Account.
// Loaded on demand (see downloadOrderFile) so jsPDF never ships with the main bundle.

import { jsPDF } from "jspdf";

const GREEN = [27, 77, 62];
const INK = [45, 46, 47];
const MUTED = [110, 110, 102];
const LINE = [213, 226, 218];
const TINT = [237, 248, 243];

const PAGE_W = 210;
const PAGE_H = 297;
const M = 18; // page margin
const RIGHT = PAGE_W - M;

// x position (and alignment) of each item-table column
const COLS = [
  { key: "product", label: "Product", x: M + 3, align: "left" },
  { key: "size", label: "Size", x: 112, align: "left" },
  { key: "qty", label: "Qty", x: 140, align: "right" },
  { key: "price", label: "Price", x: 165, align: "right" },
  { key: "sub", label: "Sub Total", x: RIGHT - 3, align: "right" },
];
const PRODUCT_W = 112 - (M + 3) - 4;

/**
 * order: the account-page order shape (id, placedAt, status, items, payment,
 * address, email, phone, discount, shippingCost).
 * f: the formatting helpers from data/account.js, passed in to keep this
 * module free of app imports.
 */
export function buildInvoicePdf(order, kind, f) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const title = kind === "invoice" ? "INVOICE" : "ORDER DETAILS";
  const a = order.address || {};
  const customer = [a.firstName, a.lastName].filter(Boolean).join(" ");

  /* ---------- header band ---------- */
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, PAGE_W, 34, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("CHANTALLOW", M, 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Natural Tallow Skincare", M, 24);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, RIGHT, 17, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`#${order.id}`, RIGHT, 24, { align: "right" });

  /* ---------- billed to / order info ---------- */
  let y = 48;
  const label = (text, x, yy) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(text.toUpperCase(), x, yy);
  };
  const body = (lines, x, yy, opts) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(lines, x, yy, opts);
  };

  label("Billed to", M, y);
  const addressLines = doc.splitTextToSize(f.formatAddress(a) || "-", 85);
  const billed = [customer || "Customer", ...addressLines, order.email, order.phone].filter(Boolean);
  body(billed, M, y + 6);

  const infoX = 118;
  const info = [
    ["Order Number", `#${order.id}`],
    ["Order Date", f.formatStartTime(order.placedAt)],
    ["Status", f.statusLabel(order.status)],
    ["Payment", f.paymentLabel(order.payment)],
  ];
  info.forEach(([k, v], i) => {
    const yy = y + i * 7;
    label(k, infoX, yy);
    body(String(v), RIGHT, yy, { align: "right" });
  });

  y = Math.max(y + 6 + billed.length * 5, y + info.length * 7) + 10;

  /* ---------- items table ---------- */
  const tableHeader = () => {
    doc.setFillColor(...TINT);
    doc.rect(M, y, RIGHT - M, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...GREEN);
    COLS.forEach((c) => doc.text(c.label.toUpperCase(), c.x, y + 6, { align: c.align }));
    y += 9;
  };
  tableHeader();

  order.items.forEach((l) => {
    const name = doc.splitTextToSize(f.itemName(l), PRODUCT_W);
    const rowH = Math.max(9, name.length * 4.6 + 4.4);
    if (y + rowH > PAGE_H - 60) {
      doc.addPage();
      y = M;
      tableHeader();
    }
    const base = y + 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(name, COLS[0].x, base);
    doc.text(String(l.size || "-"), COLS[1].x, base);
    doc.text(String(l.qty), COLS[2].x, base, { align: "right" });
    doc.text(f.money(l.price), COLS[3].x, base, { align: "right" });
    doc.text(f.money(l.price * l.qty), COLS[4].x, base, { align: "right" });
    y += rowH;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.line(M, y, RIGHT, y);
  });

  /* ---------- totals ---------- */
  y += 8;
  const totals = [
    ["Subtotal", f.money(f.subtotal)],
    ["Discount", `- ${f.money(order.discount)}`],
    ["Shipping", f.money(order.shippingCost)],
  ];
  const tx = 132;
  totals.forEach(([k, v]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(k, tx, y);
    doc.setTextColor(...INK);
    doc.text(v, RIGHT, y, { align: "right" });
    y += 7;
  });
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.4);
  doc.line(tx, y - 3, RIGHT, y - 3);
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...GREEN);
  doc.text("Total", tx, y);
  doc.text(f.money(f.total), RIGHT, y, { align: "right" });

  /* ---------- footer on every page ---------- */
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.line(M, PAGE_H - 20, RIGHT, PAGE_H - 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text("Thank you for shopping with Chantallow.", M, PAGE_H - 13);
    doc.text(`Page ${p} of ${pages}`, RIGHT, PAGE_H - 13, { align: "right" });
  }

  return doc;
}
