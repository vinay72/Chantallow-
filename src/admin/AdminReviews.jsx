// src/admin/AdminReviews.jsx
// /admin/reviews — every customer rating + review. Reply to a review (the reply
// shows under it on the product page), edit or remove a reply, or delete a review.

import { useEffect, useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { api, mediaUrl } from './api';

const when = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

function Stars({ value }) {
  return (
    <span className="rv-stars" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={15} fill={n <= value ? '#E8A93B' : 'none'} color={n <= value ? '#E8A93B' : '#B9C3BD'} />
      ))}
    </span>
  );
}

function ReviewCard({ review, onChanged, onDeleted }) {
  const [reply, setReply] = useState(review.admin_reply || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dirty = reply.trim() !== (review.admin_reply || '');

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await api.replyToReview(review.id, reply.trim());
      onChanged({ ...review, ...res.review });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this review? This cannot be undone.')) return;
    try {
      await api.deleteReview(review.id);
      onDeleted(review.id);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="form-card rv-card">
      <div className="rv-head">
        <div>
          <strong>{review.author_name}</strong> <Stars value={review.rating} />
          <div className="rv-meta">
            {review.product_name || (review.product_key.startsWith('legacy-') ? 'Older catalogue product' : `Product ${review.product_key}`)} · {when(review.created_at)}
          </div>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={remove} aria-label="Delete review">
          <Trash2 size={15} /> Delete
        </button>
      </div>
      {review.title && <h3 className="rv-title">{review.title}</h3>}
      <p className="rv-body">{review.body}</p>
      {review.images?.length > 0 && (
        <div className="rv-photos">
          {review.images.map((url) => (
            <a key={url} href={mediaUrl(url)} target="_blank" rel="noreferrer">
              <img src={mediaUrl(url)} alt="Customer photo" />
            </a>
          ))}
        </div>
      )}

      <div className="field">
        <label htmlFor={`reply-${review.id}`}>
          Your reply {review.replied_at && <span className="sub">sent {when(review.replied_at)}</span>}
        </label>
        <textarea
          id={`reply-${review.id}`}
          value={reply}
          maxLength={2000}
          placeholder="Write a reply — it appears under this review on the product page."
          onChange={(e) => setReply(e.target.value)}
        />
      </div>
      {error && <p className="rv-error" role="alert">{error}</p>}
      <div className="rv-actions">
        <button type="button" className="btn btn-sm" disabled={busy || !dirty} onClick={save}>
          {busy ? 'Saving…' : review.admin_reply ? (reply.trim() ? 'Update reply' : 'Remove reply') : 'Send reply'}
        </button>
      </div>
    </div>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all | unanswered

  useEffect(() => {
    api
      .listReviews()
      .then((res) => setReviews(res.reviews))
      .catch((err) => setError(err.message));
  }, []);

  if (error && !reviews) return <div className="errors">{error}</div>;
  if (!reviews) return <div className="empty-state">Loading reviews…</div>;

  const shown = filter === 'unanswered' ? reviews.filter((r) => !r.admin_reply) : reviews;
  const unanswered = reviews.filter((r) => !r.admin_reply).length;

  return (
    <>
      <div className="page-head">
        <h1>Reviews</h1>
        <div className="rv-filter">
          <button type="button" className={filter === 'all' ? 'btn btn-sm' : 'btn btn-outline btn-sm'} onClick={() => setFilter('all')}>
            All ({reviews.length})
          </button>
          <button type="button" className={filter === 'unanswered' ? 'btn btn-sm' : 'btn btn-outline btn-sm'} onClick={() => setFilter('unanswered')}>
            Needs a reply ({unanswered})
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="empty-state">{reviews.length ? 'Every review has a reply.' : 'No reviews yet.'}</div>
      ) : (
        shown.map((r) => (
          <ReviewCard
            key={r.id}
            review={r}
            onChanged={(next) => setReviews((list) => list.map((x) => (x.id === next.id ? next : x)))}
            onDeleted={(id) => setReviews((list) => list.filter((x) => x.id !== id))}
          />
        ))
      )}
    </>
  );
}
