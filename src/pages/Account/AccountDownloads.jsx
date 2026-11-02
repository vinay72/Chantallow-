import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AccountLayout, { EmptyState, Pagination } from "./AccountLayout";
import { useShop } from "../../context/ShopContext";
import { downloadOrderFile, formatLongDate, formatMoney, lineProduct, orderTotal, useAccount } from "../../data/account";

/**
 * My Account → Downloads
 * Route: /account/downloads
 * One invoice per order that wasn't canceled — click Download to save it.
 */
const PER_PAGE = 8;

export default function AccountDownloads() {
  const { orders } = useAccount();
  const { showToast } = useShop();
  const [page, setPage] = useState(1);

  const list = useMemo(
    () => orders.filter((o) => o.status !== "canceled").sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt)),
    [orders]
  );
  const pageCount = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const rows = list.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const onDownload = (o) => {
    downloadOrderFile(o, "invoice")
      .then(() => showToast && showToast(`Invoice for #${o.id} downloaded`))
      .catch(() => showToast && showToast("Couldn't create the invoice. Please try again."));
  };

  return (
    <AccountLayout crumb="Account Downloads">
      <div className="ua-card">
        <h4 className="ua-card__title">Downloads</h4>
        <p className="ua-card__text">Download an invoice for any of your orders.</p>

        {rows.length === 0 ? (
          <EmptyState title="No downloads yet" text="Invoices appear here after you place an order." />
        ) : (
          <>
            <div className="ua-table-wrap">
              <table className="ua-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Products</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th className="ua-right">File</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((o) => {
                    const first = lineProduct(o.items[0]);
                    return (
                      <tr key={o.id}>
                        <td>
                          <Link to={`/account/orders/${o.id}`} className="ua-order-no">
                            #{o.id}
                          </Link>
                        </td>
                        <td>
                          {first.shortName}
                          {o.items.length > 1 && ` + ${o.items.length - 1} more`}
                        </td>
                        <td>{formatLongDate(o.placedAt)}</td>
                        <td>{formatMoney(orderTotal(o))}</td>
                        <td className="ua-right">
                          <button type="button" className="ua-link ua-link-btn" onClick={() => onDownload(o)}>
                            Download Invoice
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
          </>
        )}
      </div>
    </AccountLayout>
  );
}
