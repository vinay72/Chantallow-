// src/admin/AdminBlog.jsx
// /admin/blog — every blog post (published and drafts): open, edit, delete,
// or view it on the website.

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { api, mediaUrl } from './api';
import { formatDate } from './orderMeta';

const TABS = [
  ['', 'All'],
  ['published', 'Published'],
  ['draft', 'Drafts'],
];

export default function AdminBlog() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    api
      .listPosts()
      .then((res) => setPosts(res.posts))
      .catch((err) => setError(err.message));
  }, []);

  const remove = async (post) => {
    if (!confirm(`Delete "${post.title}"? This can't be undone.`)) return;
    setDeletingId(post.id);
    setError(null);
    try {
      await api.deletePost(post.id);
      setPosts((list) => list.filter((p) => p.id !== post.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (posts || []).filter(
      (p) =>
        (!status || p.status === status) &&
        (!q || p.title.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q))
    );
  }, [posts, status, query]);

  const count = (key) => (posts || []).filter((p) => !key || p.status === key).length;
  const isScheduled = (p) => p.status === 'published' && p.published_at && new Date(p.published_at) > new Date();

  return (
    <>
      <div className="page-head">
        <h1>Blog</h1>
        <Link to="/admin/blog/new" className="btn btn-icon">
          <Plus size={15} aria-hidden="true" /> New post
        </Link>
      </div>

      {error && (
        <div className="errors">
          <strong>Something went wrong:</strong>
          <ul>
            <li>{error}</li>
          </ul>
        </div>
      )}

      {posts && posts.length > 0 && (
        <div className="toolbar">
          <div className="tab-row" role="tablist" aria-label="Filter by status">
            {TABS.map(([key, label]) => (
              <button
                key={key || 'all'}
                type="button"
                role="tab"
                aria-selected={status === key}
                className={status === key ? 'tab is-active' : 'tab'}
                onClick={() => setStatus(key)}
              >
                {label}
                <span className="tab-count">{count(key)}</span>
              </button>
            ))}
          </div>
          <div className="search-box">
            <input
              type="search"
              placeholder="Search title or category"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search posts"
            />
          </div>
        </div>
      )}

      {!posts && !error && <div className="empty-state">Loading posts…</div>}

      {posts && posts.length === 0 && (
        <div className="empty-state">
          <h3>No posts yet</h3>
          Write your first post and publish it to the blog.
          <p style={{ marginTop: 16 }}>
            <Link to="/admin/blog/new" className="btn btn-sm">
              Write a post
            </Link>
          </p>
        </div>
      )}

      {posts && posts.length > 0 && shown.length === 0 && <div className="empty-state">No posts match.</div>}

      {shown.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Post</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id}>
                  <td data-label="Post">
                    <div className="post-cell">
                      <span className="post-thumb">{p.cover_image && <img src={mediaUrl(p.cover_image)} alt="" />}</span>
                      <div>
                        <Link to={`/admin/blog/${p.id}/edit`} className="cell-main post-title">
                          {p.title}
                        </Link>
                        <div className="cell-sub">
                          /blog/{p.slug} · {p.reading_minutes} min read
                        </div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Category">{p.category || <span className="muted">—</span>}</td>
                  <td data-label="Status">
                    {isScheduled(p) ? (
                      <span className="pill neutral-pill">Scheduled</span>
                    ) : (
                      <span className={p.status === 'published' ? 'pill in' : 'pill out'}>{p.status === 'published' ? 'Published' : 'Draft'}</span>
                    )}
                  </td>
                  <td data-label="Date">{formatDate(p.published_at || p.updated_at)}</td>
                  <td className="num">
                    <div className="row-actions">
                      {p.status === 'published' && !isScheduled(p) && (
                        <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                          View
                        </a>
                      )}
                      <Link to={`/admin/blog/${p.id}/edit`} className="btn btn-outline btn-sm">
                        Edit
                      </Link>
                      <button type="button" className="btn btn-sm btn-danger" disabled={deletingId === p.id} onClick={() => remove(p)}>
                        {deletingId === p.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
