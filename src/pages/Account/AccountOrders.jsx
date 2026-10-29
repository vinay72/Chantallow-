import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AccountLayout, { EmptyState, Pagination, StatusBadge } from "./AccountLayout";
import { ORDER_STATUS, formatLongDate, formatMoney, orderTotal, useAccount } from "../../data/account";

/**
 * My Account → Orders
 * Route: /account/orders   (page number is kept in the URL: /account/orders?page=2)
 */
const PER_PAGE = 8;

export default function AccountOrders() {
  const { orders } = useAccount();
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState("all");

  // Same order as the original design; new orders from checkout are added at the top.
  const list = useMemo(() => orders.filter((o) => filter === "all" || o.status === filter), [orders, filter]);

  const pageCount = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const page = Math.min(pageCount, Math.max(1, Number(params.get("page")) || 1));
  const rows = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const goTo = (n) => {
    setParams(n > 1 ? { page: String(n) } : {});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AccountLayout crumb="Account Orders">
      <div className="ua-card">
        <div className="ua-card__toolbar">
          <label className="ua-filter">
            <span>Show</span>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setParams({});
              }}
            >
              <option value="all">All orders ({orders.length})</option>
              {Object.entries(ORDER_STATUS).map(([key, s]) => (
                <option key={key} value={key}>
                  {s.label} ({orders.filter((o) => o.status === key).length})
                </option>
              ))}
            </select>
          </label>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            title="No orders found"
            text={filter === "all" ? "You haven't placed any orders yet." : "There are no orders with this status."}
            action={
              <Link to="/shop-list" className="ua-btn ua-btn--primary">
                Start Shopping
              </Link>
            }
          />
        ) : (
          <>
            <div className="ua-table-wrap">
              <table className="ua-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date Purchased</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th className="ua-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <Link to={`/account/orders/${o.id}`} className="ua-order-no">
                          #{o.id}
                        </Link>
                      </td>
                      <td>{formatLongDate(o.placedAt)}</td>
                      <td>
                        <StatusBadge status={o.status} statuses={ORDER_STATUS} />
                      </td>
                      <td>{formatMoney(orderTotal(o))}</td>
                      <td className="ua-right">
                        <Link to={`/account/orders/${o.id}`} className="ua-link">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination page={page} pageCount={pageCount} onChange={goTo} />
          </>
        )}
      </div>
    </AccountLayout>
  );
}