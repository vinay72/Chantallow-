import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AccountLayout, { EmptyState } from "./AccountLayout";
import { useShop } from "../../context/ShopContext";
import { deleteReview, formatLongDate, lineProduct, saveReview, useAccount } from "../../data/account";

/**
 * My Account → Review
 * Route: /account/review
 * Every product from a delivered order can be reviewed (1–5 stars + text). Reviews can be edited or deleted.
 */
function Stars({ value, onChange, size = 20 }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="ua-stars" onMouseLeave={() => setHover(0)} role={onChange ? "radiogroup" : undefined} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const star = (
          <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9L12 2.5Z"
              fill={n <= shown ? "#E8A93B" : "none"}
              stroke={n <= shown ? "#E8A93B" : "#B9C3BD"}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        );
        return onChange ? (
          <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onMouseEnter={() => setHover(n)} onClick={() => onChange(n)}>
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
    </div>
  );
}

function ReviewRow({ productId, size, review }) {
  const { showToast } = useShop();
  const p = lineProduct({ productId });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ rating: 0, title: "", text: "" });
  const [error, setError] = useState("");

  const start = () => {
    setForm(review ? { rating: review.rating, title: review.title, text: review.text } : { rating: 0, title: "", text: "" });
    setError("");
    setEditing(true);
  };

  const onSave = (e) => {
    e.preventDefault();
    if (!form.rating) return setError("Please choose a star rating.");
    if (form.text.trim().length < 10) return setError("Please write at least 10 characters.");
    saveReview({ productId, rating: form.rating, title: form.title.trim(), text: form.text.trim() });
    setEditing(false);
    showToast && showToast(review ? "Review updated" : "Thank you for your review!");
  };

  return (
    <div className="ua-review">
      <Link to={p.slug ? `/product/${p.slug}` : "/shop-list"} className="ua-thumb ua-thumb--lg">
        {p.img && <img src={p.img} alt={p.name} />}
      </Link>
      <div className="ua-review__body">
        <h6>
          {p.name} <small>({size})</small>
        </h6>

        {editing ? (
          <form className="ua-form" onSubmit={onSave} noValidate>
            <Stars value={form.rating} onChange={(n) => setForm((f) => ({ ...f, rating: n }))} size={24} />
            <label className="ua-field ua-field--full">
              <span>Title (optional)</span>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Sum it up in a few words" />
            </label>
            <label className={`ua-field ua-field--full${error ? " has-error" : ""}`}>
              <span>Your Review *</span>
              <textarea rows={4} value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} placeholder="How did it work for your skin?" />
              {error && <em>{error}</em>}
            </label>
            <div className="ua-form__buttons">
              <button type="submit" className="ua-btn ua-btn--primary ua-btn--sm">
                {review ? "Update Review" : "Submit Review"}
              </button>
              <button type="button" className="ua-btn ua-btn--outline ua-btn--sm" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : review ? (
          <>
            <div className="ua-review__meta">
              <Stars value={review.rating} />
              <span>{formatLongDate(review.updatedAt)}</span>
            </div>
            {review.title && <strong className="ua-review__title">{review.title}</strong>}
            <p>{review.text}</p>
            <div className="ua-review__actions">
              <button type="button" className="ua-link ua-link-btn" onClick={start}>
                Edit
              </button>
              <button
                type="button"
                className="ua-link ua-link-btn ua-link--danger"
                onClick={() => {
                  deleteReview(review.id);
                  showToast && showToast("Review deleted");
                }}
              >
                Delete
              </button>
            </div>
          </>
        ) : (
          <button type="button" className="ua-btn ua-btn--outline ua-btn--sm" onClick={start}>
            Write A Review
          </button>
        )}
      </div>
    </div>
  );
}

export default function AccountReview() {
  const { orders, reviews } = useAccount();

  // unique products from delivered orders
  const products = useMemo(() => {
    const seen = new Map();
    orders
      .filter((o) => o.status === "delivered")
      .forEach((o) => o.items.forEach((l) => !seen.has(l.productId) && seen.set(l.productId, l.size)));
    return [...seen.entries()].map(([productId, size]) => ({ productId, size }));
  }, [orders]);

  const reviewed = reviews.length;

  return (
    <AccountLayout crumb="Account Review">
      <div className="ua-card">
        <h4 className="ua-card__title">Reviews</h4>
        <p className="ua-card__text">
          {products.length
            ? `You've reviewed ${reviewed} of ${products.length} products you've received.`
            : "Products from your delivered orders will appear here for you to review."}
        </p>

        {products.length === 0 ? (
          <EmptyState title="Nothing to review yet" />
        ) : (
          <div className="ua-review-list">
            {products.map(({ productId, size }) => (
              <ReviewRow key={productId} productId={productId} size={size} review={reviews.find((r) => r.productId === productId)} />
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
