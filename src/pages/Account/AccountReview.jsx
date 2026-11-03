import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AccountLayout, { EmptyState } from "./AccountLayout";
import { useShop } from "../../context/ShopContext";
import { useAccount } from "../../data/account";
import { api } from "../../api/client";
import { ReviewCard, ReviewForm } from "../../components/ProductReviews";

/**
 * My Account → Review
 * Route: /account/review
 * Every product or combo from a delivered order can be reviewed. Writing a review opens a
 * full "Ratings & Reviews" screen (tips on the left; star rating, description,
 * title, name and photos on the right). Reviews are saved on the server, so they
 * show on the product page and the admin can reply to them.
 */

// An order line's productId -> the key reviews are stored under
const reviewKeyOf = (productId) => {
  const id = String(productId);
  const server = /^srv-(\d+)$/.exec(id);
  if (server) return server[1];
  if (id === "9") return "furkind-pet-tallow";
  if (/^combo-\d+$/.test(id)) return id;
  if (/^[1-8]$/.test(id)) return `legacy-${id}`; // from the old built-in catalogue
  return null;
};

function ReviewRow({ line, review, onWrite, onChanged }) {
  const { showToast } = useShop();

  const remove = async () => {
    if (!window.confirm("Delete your review?")) return;
    try {
      await api(`/reviews/${review.id}`, { method: "DELETE" });
      showToast && showToast("Review deleted");
      onChanged();
    } catch (err) {
      showToast && showToast(err.message);
    }
  };

  return (
    <div className="ua-review">
      <Link to={line.path} className="ua-thumb ua-thumb--lg">
        {line.img && <img src={line.img} alt={line.name} />}
      </Link>
      <div className="ua-review__body">
        <h6>
          {line.name} {line.size && <small>({line.size})</small>}
        </h6>

        {review ? (
          <>
            <ul className="ct-review-list ua-rv-card">
              <ReviewCard review={review} mine onHelpful={() => {}} />
            </ul>
            <div className="ua-review__actions">
              <button type="button" className="ua-link ua-link-btn" onClick={() => onWrite(line)}>
                Edit
              </button>
              <button type="button" className="ua-link ua-link-btn ua-link--danger" onClick={remove}>
                Delete
              </button>
            </div>
          </>
        ) : (
          <button type="button" className="ua-btn ua-btn--outline ua-btn--sm" onClick={() => onWrite(line)}>
            Write A Review
          </button>
        )}
      </div>
    </div>
  );
}

export default function AccountReview() {
  const { orders } = useAccount();
  const { showToast } = useShop();
  const [reviews, setReviews] = useState(null);
  const [writing, setWriting] = useState(null); // the order line being reviewed

  const load = useCallback(
    () =>
      api("/reviews/mine")
        .then((res) => setReviews(res.reviews))
        .catch(() => setReviews([])),
    []
  );
  useEffect(() => {
    load();
  }, [load]);

  // unique, reviewable products from delivered orders (the line carries its name + photo)
  const lines = useMemo(() => {
    const seen = new Map();
    orders
      .filter((o) => o.status === "delivered")
      .forEach((o) =>
        o.items.forEach((l) => {
          const key = reviewKeyOf(l.productId);
          if (!key || seen.has(key)) return;
          seen.set(key, {
            key,
            name: l.name || "Chantallow product",
            img: l.img || "",
            size: l.size,
            path: key === "furkind-pet-tallow" ? "/furkind-pet-tallow" : key.startsWith("combo-") ? `/combo/${key.slice(6)}` : key.startsWith("legacy-") ? "/shop-list" : `/product/${key}`,
          });
        })
      );
    return [...seen.values()];
  }, [orders]);

  const reviewOf = (key) => (reviews || []).find((r) => r.product_key === key);
  const reviewedCount = lines.filter((l) => reviewOf(l.key)).length;

  /* ---------- the full "write a review" screen ---------- */
  if (writing) {
    return (
      <AccountLayout crumb="Account Review">
        <div className="ua-rw-page">
          <div className="ua-rw-head">
            <h4>Ratings &amp; Reviews</h4>
            <Link to={writing.path} className="ua-rw-product">
              <span>{writing.name}</span>
              {writing.img && <img src={writing.img} alt="" />}
            </Link>
          </div>
          <ReviewForm
            productKey={writing.key}
            existing={reviewOf(writing.key)}
            onCancel={() => setWriting(null)}
            onDone={async () => {
              await load();
              setWriting(null);
              showToast && showToast("Thank you for your review!");
            }}
          />
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout crumb="Account Review">
      <div className="ua-card">
        <h4 className="ua-card__title">Reviews</h4>
        <p className="ua-card__text">
          {lines.length
            ? `You've reviewed ${reviewedCount} of ${lines.length} products you've received.`
            : "Products from your delivered orders will appear here for you to review."}
        </p>

        {lines.length === 0 ? (
          <EmptyState title="Nothing to review yet" />
        ) : (
          <div className="ua-review-list">
            {lines.map((line) => (
              <ReviewRow key={line.key} line={line} review={reviewOf(line.key)} onWrite={setWriting} onChanged={load} />
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
