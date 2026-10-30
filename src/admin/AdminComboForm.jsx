// src/admin/AdminComboForm.jsx
// /admin/home/combos/new and /admin/home/combos/:id/edit — create or edit a
// combo: image, name, badge, card colour, price, the products inside it,
// description, position and whether it's live. A preview shows the home card.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { api, mediaUrl } from './api';
import { money } from './orderMeta';

const SIZES = ['2 oz', '4 oz', '8 oz', '16 oz'];
const EMPTY_ITEM = { product_id: '', name: '', size: '4 oz', qty: 1 };
const EMPTY = {
  name: '',
  tag: '',
  accent: '#3B1941',
  price: '',
  compare_at_price: '',
  description: '',
  position: '',
  is_active: true,
};

// The home page card, as it will look with the current values.
function CardPreview({ values, imageUrl }) {
  const price = Number(values.price);
  const compare = values.compare_at_price === '' ? null : Number(values.compare_at_price);
  return (
    <div className="combo-preview">
      <div className="combo-preview-media" style={{ '--accent': values.accent || '#3B1941' }}>
        {imageUrl ? <img src={imageUrl} alt="" /> : <span className="muted">Image preview</span>}
        {values.tag && <span className="combo-tag">{values.tag}</span>}
        <span className="combo-preview-heart" aria-hidden="true">
          <Heart size={13} />
        </span>
        <span className="combo-preview-qv">Quick View</span>
        <span className="combo-preview-bag" aria-hidden="true">
          <ShoppingBag size={14} />
        </span>
      </div>
      <div className="combo-preview-body">
        <div className="combo-preview-name">{values.name || 'Combo name'}</div>
        <div className="combo-preview-price">
          {money(Number.isFinite(price) ? price : 0)}
          {compare != null && Number.isFinite(compare) && compare > price && <del>{money(compare)}</del>}
        </div>
      </div>
    </div>
  );
}

export default function AdminComboForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInput = useRef(null);

  const [values, setValues] = useState(EMPTY);
  const [items, setItems] = useState([{ ...EMPTY_ITEM }, { ...EMPTY_ITEM, size: '2 oz' }]);
  const [products, setProducts] = useState([]);
  const [savedImage, setSavedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const jobs = [api.listProducts()];
    if (mode === 'edit') jobs.push(api.getCombo(id));
    Promise.all(jobs)
      .then(([list, res]) => {
        setProducts(list.products);
        if (res) {
          const c = res.combo;
          setValues({
            name: c.name,
            tag: c.tag || '',
            accent: c.accent || '#3B1941',
            price: String(c.price),
            compare_at_price: c.compare_at_price == null ? '' : String(c.compare_at_price),
            description: c.description || '',
            position: String(c.position),
            is_active: c.is_active,
          });
          setItems(c.items.map((it) => ({ ...it, product_id: it.product_id ? String(it.product_id) : '' })));
          setSavedImage(c.image);
        }
      })
      .catch((err) => setErrors([err.message]))
      .finally(() => setLoading(false));
  }, [mode, id]);

  // Object URL for the picked file, released when it changes.
  const fileUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : null), [imageFile]);
  useEffect(() => () => fileUrl && URL.revokeObjectURL(fileUrl), [fileUrl]);
  const imageUrl = fileUrl || (savedImage ? mediaUrl(savedImage) : null);

  const set = (k, v) => setValues((p) => ({ ...p, [k]: v }));
  const setItem = (i, patch) => setItems((list) => list.map((it, j) => (j === i ? { ...it, ...patch } : it)));

  // Picking a product fills in its name and size; "Custom" leaves them editable.
  const pickProduct = (i, productId) => {
    const p = products.find((x) => String(x.id) === productId);
    setItem(i, p ? { product_id: productId, name: p.name, size: SIZES.includes(p.size) ? p.size : items[i].size } : { product_id: '' });
  };

  const submit = async (e) => {
    e.preventDefault();
    const problems = [];
    if (!values.name.trim()) problems.push('Combo name is required.');
    if (values.price === '' || Number(values.price) < 0) problems.push('Price must be a number of 0 or more.');
    if (!items.length) problems.push('Add at least one product to the combo.');
    if (items.some((it) => !it.name.trim())) problems.push('Every product in the combo needs a name.');
    if (!imageFile && !savedImage) problems.push('Add a combo image.');
    if (problems.length) {
      setErrors(problems);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setBusy(true);
    setErrors([]);
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, typeof v === 'string' ? v.trim() : String(v)));
    fd.append(
      'items',
      JSON.stringify(items.map((it) => ({ ...it, name: it.name.trim(), product_id: it.product_id || null, qty: Number(it.qty) })))
    );
    if (imageFile) fd.append('image', imageFile);

    try {
      const res = mode === 'create' ? await api.createCombo(fd) : await api.updateCombo(id, fd);
      navigate(`/admin/home/combos/${res.combo.id}`);
    } catch (err) {
      setErrors(err.errors || [err.message]);
      setBusy(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="empty-state">Loading…</div>;

  return (
    <>
      <div className="page-head">
        <h1>{mode === 'create' ? 'New Combo' : 'Edit Combo'}</h1>
        <Link to={mode === 'edit' ? `/admin/home/combos/${id}` : '/admin/home/combos'} className="btn btn-outline btn-sm">
          Cancel
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

      <form onSubmit={submit} className="combo-form">
        <div className="combo-form-main">
          <div className="form-card">
            <h2>
              Combo image <span className="required">*</span>
            </h2>
            <p className="hint">One photo of the products together, shown on the home page card. Square works best.</p>
            <div className="combo-image-row">
              <div className="combo-image-box">
                {imageUrl ? <img src={imageUrl} alt="" /> : <span className="muted">No image yet</span>}
              </div>
              <div>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => fileInput.current.click()}>
                  {imageUrl ? 'Replace image' : 'Choose image'}
                </button>
                {imageFile && (
                  <button type="button" className="btn btn-sm btn-danger" style={{ marginLeft: 8 }} onClick={() => setImageFile(null)}>
                    Undo
                  </button>
                )}
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  hidden
                  onChange={(e) => {
                    if (e.target.files[0]) setImageFile(e.target.files[0]);
                    e.target.value = '';
                  }}
                />
                {imageFile && <p className="hint" style={{ marginTop: 8 }}>{imageFile.name}</p>}
              </div>
            </div>
          </div>

          <div className="form-card">
            <h2>Details</h2>
            <div className="field">
              <label htmlFor="cb-name">
                Combo name <span className="required">*</span>
              </label>
              <input
                id="cb-name"
                value={values.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Malachite Fusion (4oz) + Amethyst Relief (2oz)"
              />
            </div>
            <div className="three-col">
              <div className="field">
                <label htmlFor="cb-price">
                  Price ($) <span className="required">*</span>
                </label>
                <input id="cb-price" type="number" min="0" step="0.01" value={values.price} onChange={(e) => set('price', e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="cb-compare">
                  Compare-at price ($) <span className="sub">optional, shown crossed out</span>
                </label>
                <input
                  id="cb-compare"
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.compare_at_price}
                  onChange={(e) => set('compare_at_price', e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="cb-tag">
                  Badge <span className="sub">optional</span>
                </label>
                <input id="cb-tag" maxLength={40} value={values.tag} onChange={(e) => set('tag', e.target.value)} placeholder="Get 20% Off" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="cb-desc">
                Description <span className="sub">shown on the combo page</span>
              </label>
              <textarea id="cb-desc" value={values.description} onChange={(e) => set('description', e.target.value)} />
            </div>
          </div>

          <div className="form-card">
            <h2>
              Products in this combo <span className="required">*</span>
            </h2>
            <p className="hint">Pick a product from your catalogue, or choose “Custom” and type a name.</p>
            <div className="combo-items">
              {items.map((it, i) => (
                <div key={i} className="combo-item-row">
                  <div className="field">
                    <label htmlFor={`cb-prod-${i}`}>Product</label>
                    <select id={`cb-prod-${i}`} value={it.product_id} onChange={(e) => pickProduct(i, e.target.value)}>
                      <option value="">Custom</option>
                      {products.map((p) => (
                        <option key={p.id} value={String(p.id)}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor={`cb-name-${i}`}>Name</label>
                    <input
                      id={`cb-name-${i}`}
                      value={it.name}
                      disabled={Boolean(it.product_id)}
                      onChange={(e) => setItem(i, { name: e.target.value })}
                      placeholder="Amethyst Relief"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`cb-size-${i}`}>Size</label>
                    <select id={`cb-size-${i}`} value={it.size} onChange={(e) => setItem(i, { size: e.target.value })}>
                      {SIZES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor={`cb-qty-${i}`}>Qty</label>
                    <input
                      id={`cb-qty-${i}`}
                      type="number"
                      min="1"
                      max="99"
                      value={it.qty}
                      onChange={(e) => setItem(i, { qty: e.target.value })}
                    />
                  </div>
                  <button
                    type="button"
                    className="icon-btn danger"
                    aria-label={`Remove product ${i + 1}`}
                    disabled={items.length === 1}
                    onClick={() => setItems((list) => list.filter((_, j) => j !== i))}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm btn-icon"
              disabled={items.length >= 10}
              onClick={() => setItems((list) => [...list, { ...EMPTY_ITEM }])}
            >
              <Plus size={14} aria-hidden="true" /> Add product
            </button>
          </div>
        </div>

        <aside className="combo-form-side">
          <div className="form-card">
            <h2>Home page card</h2>
            <CardPreview values={values} imageUrl={imageUrl} />
            <div className="field" style={{ marginTop: 18 }}>
              <label htmlFor="cb-accent">Card colour</label>
              <div className="color-row">
                <input id="cb-accent" type="color" value={values.accent} onChange={(e) => set('accent', e.target.value)} />
                <span className="muted">{values.accent}</span>
              </div>
            </div>
            <div className="field">
              <label htmlFor="cb-position">
                Position <span className="sub">lower shows first</span>
              </label>
              <input
                id="cb-position"
                type="number"
                min="0"
                step="1"
                value={values.position}
                onChange={(e) => set('position', e.target.value)}
                placeholder="0"
              />
            </div>
            <label className="check-row">
              <input type="checkbox" checked={values.is_active} onChange={(e) => set('is_active', e.target.checked)} />
              Show on the home page
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn" disabled={busy}>
              {busy ? 'Saving…' : mode === 'create' ? 'Create combo' : 'Save changes'}
            </button>
          </div>
        </aside>
      </form>
    </>
  );
}
