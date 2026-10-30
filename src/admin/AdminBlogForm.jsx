// src/admin/AdminBlogForm.jsx
// /admin/blog/new and /admin/blog/:id/edit — write a blog post: title, web
// address, cover image, summary, the post itself (RichTextEditor), category,
// tags, author, and whether it's a draft or published (optionally from a date).

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, mediaUrl } from './api';
import RichTextEditor from './RichTextEditor';

const EMPTY = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image: '',
  category: '',
  tags: '',
  author_name: '',
  status: 'draft',
  published_at: '',
};

// Same rules as the server's slugify, so the preview matches.
const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

// ISO date <-> the value an <input type="datetime-local"> uses (local time)
const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function AdminBlogForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const coverInput = useRef(null);
  const [values, setValues] = useState(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const jobs = [api.listPosts()];
    if (mode === 'edit') jobs.push(api.getPost(id));
    Promise.all(jobs)
      .then(([list, res]) => {
        setCategories([...new Set(list.posts.map((p) => p.category).filter(Boolean))]);
        if (res) {
          const p = res.post;
          setValues({
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt || '',
            content: p.content || '',
            cover_image: p.cover_image || '',
            category: p.category || '',
            tags: (p.tags || []).join(', '),
            author_name: p.author_name || '',
            status: p.status,
            published_at: toLocalInput(p.published_at),
          });
          setSlugTouched(true);
        }
      })
      .catch((err) => setErrors([err.message]))
      .finally(() => setLoading(false));
  }, [mode, id]);

  const set = (k, v) => setValues((p) => ({ ...p, [k]: v }));
  const slug = useMemo(() => slugify(slugTouched ? values.slug : values.title), [slugTouched, values.slug, values.title]);

  const uploadCover = async (file) => {
    if (!file) return;
    setUploading(true);
    setErrors([]);
    try {
      const { url } = await api.uploadHomeImage(file);
      set('cover_image', url);
    } catch (err) {
      setErrors([`Couldn't upload the cover: ${err.message}`]);
    } finally {
      setUploading(false);
    }
  };

  const save = async (status) => {
    const problems = [];
    if (!values.title.trim()) problems.push('Title is required.');
    if (problems.length) {
      setErrors(problems);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setBusy(true);
    setErrors([]);
    const body = {
      ...values,
      slug,
      status,
      tags: values.tags.split(',').map((t) => t.trim()).filter(Boolean),
      published_at: values.published_at ? new Date(values.published_at).toISOString() : null,
    };
    try {
      if (mode === 'create') await api.createPost(body);
      else await api.updatePost(id, body);
      navigate('/admin/blog');
    } catch (err) {
      setErrors(err.errors || [err.message]);
      setBusy(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="empty-state">Loading…</div>;

  const published = values.status === 'published';

  return (
    <>
      <div className="page-head">
        <h1>{mode === 'create' ? 'New Post' : 'Edit Post'}</h1>
        <Link to="/admin/blog" className="btn btn-outline btn-sm">
          Back to posts
        </Link>
      </div>

      {errors.length > 0 && (
        <div className="errors">
          <strong>Please fix the following:</strong>
          <ul>
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <form className="combo-form" onSubmit={(e) => e.preventDefault()}>
        <div className="combo-form-main">
          <div className="form-card">
            <div className="field">
              <label htmlFor="bp-title">
                Title <span className="required">*</span>
              </label>
              <input
                id="bp-title"
                className="post-title-input"
                value={values.title}
                maxLength={200}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Why Tallow Is So Good For Your Skin"
              />
            </div>
            <div className="field">
              <label htmlFor="bp-slug">
                Web address <span className="sub">chantallow.com/blog/…</span>
              </label>
              <input
                id="bp-slug"
                value={slugTouched ? values.slug : slug}
                maxLength={120}
                onChange={(e) => {
                  setSlugTouched(true);
                  set('slug', e.target.value);
                }}
              />
              <p className="hint" style={{ margin: '6px 0 0' }}>
                /blog/{slug || '…'}
                {slugTouched && mode === 'create' && (
                  <button type="button" className="link-btn" style={{ marginLeft: 10 }} onClick={() => setSlugTouched(false)}>
                    Use title
                  </button>
                )}
              </p>
            </div>
            <div className="field">
              <label htmlFor="bp-excerpt">
                Summary <span className="sub">shown in the blog list</span>
              </label>
              <textarea
                id="bp-excerpt"
                className="short-textarea"
                value={values.excerpt}
                maxLength={400}
                onChange={(e) => set('excerpt', e.target.value)}
                placeholder="One or two sentences about the post."
              />
            </div>
          </div>

          <div className="form-card">
            <h2>Post</h2>
            {/* key: mounts the editor once the post has loaded */}
            <RichTextEditor
              key={mode === 'edit' ? `post-${id}` : 'new'}
              value={values.content}
              onChange={(html) => set('content', html)}
              placeholder="Write your post…"
            />
          </div>
        </div>

        <aside className="combo-form-side">
          <div className="form-card">
            <h2>Publish</h2>
            <div className="radio-row" role="radiogroup" aria-label="Status">
              {[
                ['draft', 'Draft'],
                ['published', 'Published'],
              ].map(([v, label]) => (
                <label className="radio-pill" key={v}>
                  <input type="radio" name="status" value={v} checked={values.status === v} onChange={() => set('status', v)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <div className="field" style={{ marginTop: 16 }}>
              <label htmlFor="bp-date">
                Publish date <span className="sub">empty = when published</span>
              </label>
              <input
                id="bp-date"
                type="datetime-local"
                className="date-input"
                value={values.published_at}
                onChange={(e) => set('published_at', e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn" disabled={busy || uploading} onClick={() => save(values.status)}>
                {busy ? 'Saving…' : published ? (mode === 'create' ? 'Publish post' : 'Save & publish') : 'Save draft'}
              </button>
            </div>
          </div>

          <div className="form-card">
            <h2>Cover image</h2>
            <div className="post-cover">
              {values.cover_image ? <img src={mediaUrl(values.cover_image)} alt="" /> : <span className="muted">No cover yet</span>}
            </div>
            <div className="row-actions" style={{ justifyContent: 'flex-start', marginTop: 10 }}>
              <button type="button" className="btn btn-outline btn-sm" disabled={uploading} onClick={() => coverInput.current?.click()}>
                {uploading ? 'Uploading…' : values.cover_image ? 'Replace' : 'Upload'}
              </button>
              {values.cover_image && (
                <button type="button" className="btn btn-sm btn-danger" onClick={() => set('cover_image', '')}>
                  Remove
                </button>
              )}
            </div>
            <input
              ref={coverInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              hidden
              onChange={(e) => {
                uploadCover(e.target.files[0]);
                e.target.value = '';
              }}
            />
          </div>

          <div className="form-card">
            <h2>Details</h2>
            <div className="field">
              <label htmlFor="bp-category">Category</label>
              <input
                id="bp-category"
                value={values.category}
                maxLength={60}
                list="bp-categories"
                onChange={(e) => set('category', e.target.value)}
                placeholder="Skincare"
              />
              <datalist id="bp-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="field">
              <label htmlFor="bp-tags">
                Tags <span className="sub">comma separated</span>
              </label>
              <input id="bp-tags" value={values.tags} onChange={(e) => set('tags', e.target.value)} placeholder="Tallow, Skincare" />
            </div>
            <div className="field">
              <label htmlFor="bp-author">
                Author <span className="sub">empty = your name</span>
              </label>
              <input id="bp-author" value={values.author_name} maxLength={80} onChange={(e) => set('author_name', e.target.value)} />
            </div>
          </div>
        </aside>
      </form>
    </>
  );
}
