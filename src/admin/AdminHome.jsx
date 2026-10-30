// src/admin/AdminHome.jsx
// /admin/home/launches — the home page's new launches. "New launches" are the
// small product cards in the hero (next to Shop Now): pick up to 4 products,
// order them, and save. With none picked the home page shows its default two.
// A brand-new product is created under Products first, then added here.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, Plus, Sparkles, Trash2 } from 'lucide-react';
import { api, mediaUrl } from './api';
import { money } from './orderMeta';

const MAX = 4;

const coverOf = (p) => p.main_image || p.images?.find((m) => m.type === 'image')?.url || null;

function Thumb({ product, size = 56 }) {
  const url = coverOf(product);
  return (
    <span className="launch-thumb" style={{ width: size, height: size }}>
      {url ? <img src={mediaUrl(url)} alt="" /> : <span>No image</span>}
    </span>
  );
}

// How the card will look in the home page hero.
function PreviewCard({ product }) {
  const compare = product.compare_at_price != null ? Number(product.compare_at_price) : null;
  return (
    <div className="launch-preview-card">
      <div className="launch-preview-img">
        <Thumb product={product} size={96} />
        <span className="launch-preview-plus" aria-hidden="true">
          <Plus size={14} strokeWidth={2.6} />
        </span>
      </div>
      <div>
        <div className="launch-preview-name">{product.name}</div>
        <div className="launch-preview-price">
          <span>{money(product.price)}</span>
          {compare != null && compare > Number(product.price) && <del>{money(compare)}</del>}
        </div>
        {product.size && <span className="launch-preview-size">{product.size}</span>}
      </div>
    </div>
  );
}

export default function AdminHome() {
  const [products, setProducts] = useState([]);
  const [saved, setSaved] = useState([]); // ids as stored on the server
  const [picked, setPicked] = useState([]); // ids being edited
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [flash, setFlash] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    setLoadFailed(false);
    return Promise.all([api.getHome(), api.listProducts()])
      .then(([home, list]) => {
        const ids = home.new_launches.map((p) => p.id);
        setSaved(ids);
        setPicked(ids);
        setProducts(list.products);
      })
      .catch((err) => {
        setError(err.message);
        setLoadFailed(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const pickedProducts = picked.map((id) => byId.get(id)).filter(Boolean);
  const dirty = picked.join(',') !== saved.join(',');
  const full = picked.length >= MAX;

  const available = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        !picked.includes(p.id) &&
        (!q || p.name.toLowerCase().includes(q) || (p.subname || '').toLowerCase().includes(q))
    );
  }, [products, picked, search]);

  const add = (id) => !full && setPicked((list) => [...list, id]);
  const remove = (id) => setPicked((list) => list.filter((x) => x !== id));
  const move = (index, delta) =>
    setPicked((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index + delta, 0, item);
      return next;
    });

  const save = async () => {
    setSaving(true);
    setError(null);
    setFlash(null);
    try {
      const res = await api.saveHome(picked);
      const ids = res.new_launches.map((p) => p.id);
      setSaved(ids);
      setPicked(ids);
      setFlash('Home page updated. The new launches are live.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="empty-state">Loading home page settings…</div>;

  return (
    <>
      <div className="page-head">
        <h1>New Launches</h1>
        <a href="/" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
          View home page
        </a>
      </div>

      {flash && <div className="flash">{flash}</div>}
      {error && (
        <div className="errors">
          <strong>{loadFailed ? "Couldn't load the new launches:" : "Couldn't save:"}</strong>
          <ul>
            <li>{error}</li>
          </ul>
          <div className="row-actions" style={{ justifyContent: 'flex-start', marginTop: 10 }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={loadFailed ? load : save} disabled={saving}>
              Try again
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {loadFailed ? null : (
        <div className="home-grid">
          {/* ---------- Current new launches ---------- */}
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>
                  <Sparkles size={17} aria-hidden="true" /> New launches
                </h2>
                <p className="muted">
                  Shown in the home page hero, next to “Shop Now”. Pick up to {MAX}; they appear in this order (use the arrows to change it).
                </p>
              </div>
              <span className="muted">
                {picked.length}/{MAX}
              </span>
            </div>

            {pickedProducts.length === 0 ? (
              <div className="launch-empty">
                No new launches picked. The home page shows its default products (Amber Glow and Amethyst Relief).
              </div>
            ) : (
              <ol className="launch-list">
                {pickedProducts.map((p, i) => (
                  <li key={p.id}>
                    <span className="launch-pos">{i + 1}</span>
                    <Thumb product={p} />
                    <div className="launch-info">
                      <Link to={`/admin/products/${p.id}`} className="cell-main">
                        {p.name}
                      </Link>
                      <div className="cell-sub">
                        {money(p.price)}
                        {p.size && ` · ${p.size}`}
                        {p.stock_status === 'out_of_stock' && <span className="sold-out"> · Out of stock</span>}
                      </div>
                    </div>
                    <div className="launch-actions">
                      <button type="button" className="icon-btn" aria-label={`Move ${p.name} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={`Move ${p.name} down`}
                        disabled={i === pickedProducts.length - 1}
                        onClick={() => move(i, 1)}
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button type="button" className="icon-btn danger" aria-label={`Remove ${p.name}`} onClick={() => remove(p.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            <div className="launch-save">
              <button type="button" className="btn" disabled={!dirty || saving} onClick={save}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              {dirty && (
                <button type="button" className="btn btn-outline" disabled={saving} onClick={() => setPicked(saved)}>
                  Discard
                </button>
              )}
            </div>

            {pickedProducts.length > 0 && (
              <>
                <h3 className="preview-title">Preview</h3>
                <div className="launch-preview">
                  {pickedProducts.map((p) => (
                    <PreviewCard key={p.id} product={p} />
                  ))}
                </div>
              </>
            )}
          </section>

          {/* ---------- Pick a product ---------- */}
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>Add a product</h2>
                <p className="muted">Launching something new? Create it first, then add it here.</p>
              </div>
              <Link to="/admin/products/new" className="btn btn-sm">
                <Plus size={14} aria-hidden="true" /> New product
              </Link>
            </div>

            <input
              type="search"
              className="launch-search"
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
            />

            {full && <p className="muted">You've picked {MAX} — remove one to add another.</p>}

            {available.length === 0 ? (
              <div className="launch-empty">
                {products.length === 0 ? 'No products yet. Create one under Products.' : 'No other products match.'}
              </div>
            ) : (
              <ul className="pick-list">
                {available.map((p) => (
                  <li key={p.id}>
                    <Thumb product={p} size={44} />
                    <div className="launch-info">
                      <div className="cell-main">{p.name}</div>
                      <div className="cell-sub">
                        {money(p.price)}
                        {p.size && ` · ${p.size}`}
                        {p.stock_status === 'out_of_stock' && <span className="sold-out"> · Out of stock</span>}
                      </div>
                    </div>
                    <button type="button" className="btn btn-outline btn-sm" disabled={full} onClick={() => add(p.id)}>
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}
