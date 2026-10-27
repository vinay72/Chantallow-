// src/admin/AdminProducts.jsx
// /admin/products — product list with search / category / size / price filters.

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, mediaUrl } from './api';

const EMPTY = { search: '', category: '', size: '', min_price: '', max_price: '' };

function Thumb({ product }) {
  const media = Array.isArray(product.images) ? product.images : [];
  // The cover image leads; older products without one fall back to the first gallery image.
  const cover = product.main_image
    ? { url: product.main_image, type: 'image' }
    : media.find((m) => m.type === 'image') || media[0];
  const extra = product.main_image ? media.length : media.length - 1;

  if (!cover) {
    return (
      <div className="product-thumb">
        <span className="no-media">No image</span>
      </div>
    );
  }

  return (
    <div className="product-thumb">
      {cover.type === 'video' ? (
        <video src={mediaUrl(cover.url)} muted playsInline />
      ) : (
        <img src={mediaUrl(cover.url)} alt={product.name} />
      )}
      {extra > 0 && <span className="count">+{extra}</span>}
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ categories: [], sizes: [] });
  const [form, setForm] = useState(EMPTY);
  const [applied, setApplied] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    api.meta().then((m) => setMeta(m)).catch(() => {});
  }, []);

  const load = useCallback(async (filters) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listProducts(filters);
      setProducts(res.products);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(applied);
  }, [applied, load]);

  const change = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    setApplied(form);
  };

  const clear = () => {
    setForm(EMPTY);
    setApplied(EMPTY);
  };

  const remove = async (p) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api.deleteProduct(p.id);
      setFlash('Product deleted');
      load(applied);
    } catch (err) {
      alert(err.message);
    }
  };

  const activeChips = Object.entries(applied).filter(([, v]) => v !== '');

  return (
    <>
      <div className="page-head">
        <h1>Products</h1>
        <Link to="/admin/products/new" className="btn">
          Add Product
        </Link>
      </div>

      {flash && <div className="flash">{flash}</div>}

      <form className="filters" onSubmit={submit}>
        <div className="grid">
          <div>
            <label htmlFor="search">Search product</label>
            <input
              id="search"
              type="text"
              placeholder="Name, subtitle or description"
              value={form.search}
              onChange={change('search')}
            />
          </div>
          <div>
            <label htmlFor="category">Category</label>
            <select id="category" value={form.category} onChange={change('category')}>
              <option value="">All categories</option>
              {meta.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="size">Size</label>
            <select id="size" value={form.size} onChange={change('size')}>
              <option value="">All sizes</option>
              {meta.sizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="min_price">Min price</label>
            <input
              id="min_price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.min_price}
              onChange={change('min_price')}
            />
          </div>
          <div>
            <label htmlFor="max_price">Max price</label>
            <input
              id="max_price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Any"
              value={form.max_price}
              onChange={change('max_price')}
            />
          </div>
          <div className="actions">
            <button type="submit" className="btn btn-sm">
              Filter
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={clear}>
              Clear
            </button>
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="chip-row">
            {activeChips.map(([k, v]) => (
              <span className="chip" key={k}>
                {k.replace('_', ' ')}: {v}
              </span>
            ))}
          </div>
        )}
      </form>

      {loading && <div className="empty-state">Loading products…</div>}

      {!loading && error && (
        <div className="empty-state">
          <h3>Couldn’t load products</h3>
          <p>{error}</p>
          <button className="btn btn-sm" onClick={() => load(applied)}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="empty-state">
          <h3>No products yet</h3>
          <p>
            {activeChips.length
              ? 'Nothing matches those filters.'
              : 'Add your first product to see it here.'}
          </p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="product-list">
          {products.map((p) => (
            <div className="product-row" key={p.id}>
              <Link to={`/admin/products/${p.id}`}>
                <Thumb product={p} />
              </Link>

              <div>
                <h3 className="product-name">
                  <Link to={`/admin/products/${p.id}`}>{p.name}</Link>
                </h3>
                {p.subname && <p className="product-sub">{p.subname}</p>}
                {p.description && <p className="product-desc">{p.description}</p>}
                <span className={'pill ' + (p.stock_status === 'in_stock' ? 'in' : 'out')}>
                  {p.stock_status === 'in_stock' ? 'In stock' : 'Out of stock'}
                </span>
              </div>

              <div className="meta-size">{p.size || '—'}</div>

              <div>
                <span className="price-tag">${p.price}</span>
                {p.compare_at_price && <del className="price-was">${p.compare_at_price}</del>}
              </div>

              <div className="row-actions">
                <Link to={`/admin/products/${p.id}/edit`} className="btn btn-outline btn-sm">
                  Edit
                </Link>
                <button className="btn btn-danger btn-sm" onClick={() => remove(p)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
