// Ratings + reviews for a product page. Anyone can read them; signed-in
// shoppers can leave (or edit) one review per product — a star rating, a
// description, an optional title, their name and up to 3 photos — and mark other
// reviews "Helpful". The admin's reply (Admin → Reviews) shows under the review.
//
//   const reviews = useProductReviews(key);          // key: the product's id, or its slug
//   <RatingSummary reviews={reviews} />              // "★★★★☆ 4.7 Rating (5 customer reviews)"
//   <ProductReviews productKey={key} reviews={reviews} />

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Camera, ThumbsUp, X } from "lucide-react";
import { api, mediaUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";
import "./ProductReviews.css";

const MAX_PHOTOS = 3;

// rating -> the word shown next to it
const PICK_LABEL = { 1: "Very bad", 2: "Bad", 3: "Good", 4: "Very good", 5: "Excellent" };
const SHOWN_LABEL = { 1: "Very Bad", 2: "Bad", 3: "Good", 4: "Very Good", 5: "Terrific" };
const toneOf = (rating) => (rating >= 4 ? "good" : rating === 3 ? "ok" : "bad");

export function useProductReviews(productKey) {
  const [data, setData] = useState({ eligible: false, count: 0, average: 0, counts: [0, 0, 0, 0, 0], reviews: [], loaded: false });
  const reload = useCallback(() => {
    if (!productKey) return Promise.resolve();
    return api(`/reviews?product=${encodeURIComponent(productKey)}`)
      .then((res) => setData({ ...res, loaded: true }))
      .catch(() => setData((d) => ({ ...d, loaded: true })));
  }, [productKey]);
  useEffect(() => {
    reload();
  }, [reload]);
  return { ...data, reload };
}

function Stars({ value, size = 16, onChange, tone }) {
  const [hover, setHover] = useState(0);
  const shown = hover || Math.round(value);
  const on = tone === "good" ? "#188A3C" : tone === "ok" ? "#E8A93B" : tone === "bad" ? "#D9531E" : "#E8A93B";
  return (
    <span className="ct-stars" onMouseLeave={() => setHover(0)} role={onChange ? "radiogroup" : "img"} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const star = (
          <svg width={size} height={size} viewBox="0 0 14 13" aria-hidden="true">
            <path
              d="M6.74805 0.234375L8.72301 4.51608L13.4054 5.07126L9.9436 8.27267L10.8625 12.8975L6.74805 10.5944L2.63355 12.8975L3.5525 8.27267L0.090651 5.07126L4.77309 4.51608L6.74805 0.234375Z"
              fill={n <= shown ? on : "#C9D2CC"}
            />
          </svg>
        );
        return onChange ? (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(n)}
          >
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
    </span>
  );
}

export function RatingSummary({ reviews }) {
  // only shoppers who bought the product see ratings & reviews
  if (!reviews.loaded || !reviews.eligible) return null;
  return (
    <div className="ct-rating-row">
      <Stars value={reviews.average} />
      {reviews.count > 0 ? (
        <>
          <span className="ct-rating-row__score">{reviews.average.toFixed(1)} Rating</span>
          <a href="#reviews">
            ({reviews.count} customer review{reviews.count === 1 ? "" : "s"})
          </a>
        </>
      ) : (
        <a href="#reviews">No reviews yet — be the first</a>
      )}
    </div>
  );
}

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

/* ------------------------------ write a review ------------------------------ */

export function ReviewForm({ productKey, existing, onDone, onCancel }) {
  const { user } = useAuth();
  const fileInput = useRef(null);
  const [rating, setRating] = useState(existing?.rating || 0);
  const [text, setText] = useState(existing?.body || "");
  const [title, setTitle] = useState(existing?.title || "");
  const [name, setName] = useState(existing?.author_name || user?.name || "");
  const [kept, setKept] = useState(existing?.images || []); // saved photo urls still attached
  const [files, setFiles] = useState([]); // new photos: { file, preview }
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => () => files.forEach((f) => URL.revokeObjectURL(f.preview)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const addFiles = (picked) => {
    const room = MAX_PHOTOS - kept.length - files.length;
    const next = Array.from(picked)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, Math.max(0, room))
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));
    if (next.length) setFiles((list) => [...list, ...next]);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return setError("Please rate this product.");
    if (!text.trim()) return setError("Please write a description.");
    setBusy(true);
    setError("");
    const fd = new FormData();
    fd.append("product", productKey);
    fd.append("rating", rating);
    fd.append("title", title.trim());
    fd.append("text", text.trim());
    fd.append("name", name.trim());
    fd.append("keep_photos", ""); // present even when empty, so removed photos are dropped
    kept.forEach((url) => fd.append("keep_photos", url));
    files.forEach((f) => fd.append("photos", f.file));
    try {
      await api("/reviews", { method: "POST", body: fd });
      await onDone();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const photoCount = kept.length + files.length;

  return (
    <div className="ct-rw">
      <aside className="ct-rw__tips">
        <h3>What makes a good review</h3>
        <h4>Have you used this product?</h4>
        <p>Your review should be about your experience with the product.</p>
        <h4>Why review a product?</h4>
        <p>Your valuable feedback will help fellow shoppers decide!</p>
        <h4>How to review a product?</h4>
        <p>Your review should include facts. An honest opinion is always appreciated.</p>
      </aside>

      <form className="ct-rw__form" onSubmit={submit}>
        <div className="ct-rw__rate">
          <h3>Rate this product</h3>
          <div className="ct-rw__stars">
            <Stars value={rating} size={34} onChange={setRating} />
            {rating > 0 && <span className={`ct-rw__label ct-rw__label--${toneOf(rating)}`}>{PICK_LABEL[rating]}</span>}
          </div>
        </div>

        <div className="ct-rw__body">
          <h3>Review this product</h3>
          <div className="ct-rw__box">
            <label>
              <span>Description</span>
              <textarea value={text} maxLength={2000} rows={5} placeholder="Description..." onChange={(e) => setText(e.target.value)} />
            </label>
            <label>
              <span>Title (optional)</span>
              <input type="text" value={title} maxLength={120} placeholder="Review title..." onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label>
              <span>Name</span>
              <input type="text" value={name} maxLength={80} placeholder="Your name" onChange={(e) => setName(e.target.value)} />
            </label>
          </div>

          <div className="ct-rw__photos">
            {kept.map((url) => (
              <div className="ct-rw__photo" key={url}>
                <img src={mediaUrl(url)} alt="Your photo" />
                <button type="button" aria-label="Remove photo" onClick={() => setKept((l) => l.filter((u) => u !== url))}>
                  <X size={14} />
                </button>
              </div>
            ))}
            {files.map((f) => (
              <div className="ct-rw__photo" key={f.preview}>
                <img src={f.preview} alt="New photo" />
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => {
                    URL.revokeObjectURL(f.preview);
                    setFiles((l) => l.filter((x) => x !== f));
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {photoCount < MAX_PHOTOS && (
              <button type="button" className="ct-rw__add" onClick={() => fileInput.current.click()} aria-label="Add photos">
                <Camera size={22} />
                <span>Add photo</span>
              </button>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                const picked = Array.from(e.target.files);
                e.target.value = "";
                addFiles(picked);
              }}
            />
          </div>

          {error && <p className="ct-rw__error" role="alert">{error}</p>}

          <div className="ct-rw__actions">
            {existing && (
              <button type="button" className="rv-btn" onClick={onCancel}>
                Cancel
              </button>
            )}
            <button type="submit" className="rv-btn rv-btn--primary ct-rw__submit" disabled={busy}>
              {busy ? "Submitting…" : "Submit"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------ a posted review ------------------------------ */

export function ReviewCard({ review, mine, onHelpful }) {
  return (
    <li className="ct-review">
      <div className="ct-review__rating">
        <Stars value={review.rating} size={16} tone={toneOf(review.rating)} />
        <strong className={`ct-review__score ct-review__score--${toneOf(review.rating)}`}>{review.rating.toFixed(1)}</strong>
        <span aria-hidden="true">•</span>
        <span className="ct-review__word">{SHOWN_LABEL[review.rating]}</span>
      </div>
      {review.title && <h4>{review.title}</h4>}
      <p>{review.body}</p>

      {review.images?.length > 0 && (
        <div className="ct-review__photos">
          {review.images.map((url) => (
            <a key={url} href={mediaUrl(url)} target="_blank" rel="noreferrer">
              <img src={mediaUrl(url)} alt={`Photo from ${review.author_name}`} loading="lazy" />
            </a>
          ))}
        </div>
      )}

      <div className="ct-review__by">
        {review.author_name} · <time dateTime={review.created_at}>{formatDate(review.created_at)}</time>
        {mine && <em> · Your review</em>}
      </div>

      {!mine && (
        <button
          type="button"
          className={review.helpful_by_me ? "ct-helpful is-active" : "ct-helpful"}
          aria-pressed={review.helpful_by_me}
          onClick={() => onHelpful(review)}
        >
          <ThumbsUp size={16} />
          Helpful{review.helpful_count > 0 ? ` for ${review.helpful_count}` : ""}
        </button>
      )}
      {mine && review.helpful_count > 0 && (
        <span className="ct-helpful ct-helpful--static">
          <ThumbsUp size={16} /> Helpful for {review.helpful_count}
        </span>
      )}

      {review.admin_reply && (
        <div className="ct-review__reply">
          <strong>Reply from Chantallow</strong>
          <p>{review.admin_reply}</p>
        </div>
      )}
    </li>
  );
}

/* ------------------------------ the section ------------------------------ */

export default function ProductReviews({ productKey, reviews }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const mine = user ? reviews.reviews.find((r) => r.user_id === user.id) : null;
  const redirect = encodeURIComponent(location.pathname + location.search + "#reviews");

  const [editing, setEditing] = useState(false);
  const [thanks, setThanks] = useState(false);
  const [error, setError] = useState("");

  const done = async () => {
    await reviews.reload();
    setEditing(false);
    setThanks(true);
    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const remove = async () => {
    if (!mine || !window.confirm("Delete your review?")) return;
    try {
      await api(`/reviews/${mine.id}`, { method: "DELETE" });
      setThanks(false);
      await reviews.reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const helpful = async (review) => {
    if (!user) return navigate(`/login?redirect=${redirect}`);
    try {
      await api(`/reviews/${review.id}/helpful`, { method: "POST" });
      await reviews.reload();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!reviews.loaded || !reviews.eligible) return null;

  return (
    <section id="reviews" className="ct-container ct-reviews" aria-label="Ratings and reviews">
      <h2 className="ct-reviews__title">Ratings &amp; Reviews</h2>

      <div className="ct-reviews__layout">
        <div className="ct-reviews__summary">
          <div className="ct-reviews__avg">{reviews.count ? reviews.average.toFixed(1) : "–"}</div>
          <Stars value={reviews.average} size={20} />
          <p>
            {reviews.count} review{reviews.count === 1 ? "" : "s"}
          </p>
          <ul className="ct-reviews__bars">
            {[5, 4, 3, 2, 1].map((n) => {
              const c = reviews.counts[n - 1] || 0;
              return (
                <li key={n}>
                  <span>{n} ★</span>
                  <div>
                    <i style={{ width: `${reviews.count ? (c / reviews.count) * 100 : 0}%` }} />
                  </div>
                  <span>{c}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="ct-reviews__main">
          {user && (!mine || editing) ? (
            <ReviewForm productKey={productKey} existing={mine} onDone={done} onCancel={() => setEditing(false)} />
          ) : user ? (
            <div className="ct-review-note">
              {thanks && <strong className="ct-review-note__thanks">Thank you! Your review has been posted.</strong>}
              <span>
                You reviewed this product.{" "}
                <button type="button" className="ct-link-btn" onClick={() => setEditing(true)}>Edit</button> ·{" "}
                <button type="button" className="ct-link-btn" onClick={remove}>Delete</button>
              </span>
            </div>
          ) : (
            <p className="ct-review-note">
              <Link to={`/login?redirect=${redirect}`}>Log in</Link> to rate and review this product.
            </p>
          )}

          {error && <p className="ct-rw__error" role="alert">{error}</p>}

          {!reviews.loaded ? (
            <p className="ct-review-note">Loading reviews…</p>
          ) : reviews.reviews.length === 0 ? (
            <p className="ct-review-note">No reviews yet.</p>
          ) : (
            <ul className="ct-review-list">
              {reviews.reviews.map((r) => (
                <ReviewCard key={r.id} review={r} mine={Boolean(user && r.user_id === user.id)} onHelpful={helpful} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
