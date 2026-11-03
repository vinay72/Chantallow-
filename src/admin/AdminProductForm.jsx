// src/admin/AdminProductForm.jsx
// /admin/products/new (mode="create") and /admin/products/:id/edit (mode="edit"),
// including image/video uploads. The backend requires at least 4 images.

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api, mediaUrl } from './api';

const BLANK = {
  name: '',
  subname: '',
  description: '',
  ingredients: '',
  directions: '',
  price: '',
  compare_at_price: '',
  category: '',
  size: '',
  stock_status: 'in_stock',
};

export default function AdminProductForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const coverInput = useRef(null);
  const cover2ozInput = useRef(null);

  const [values, setValues] = useState(BLANK);
  const [meta, setMeta] = useState({ categories: [], sizes: [] });
  const [existing, setExisting] = useState([]); // media already saved: {url, type, keep}
  const [files, setFiles] = useState([]); // newly picked File objects
  const [savedCover, setSavedCover] = useState(null); // cover url already saved
  const [coverFile, setCoverFile] = useState(null); // newly picked cover File
  const [savedCover2oz, setSavedCover2oz] = useState(null); // optional 2 oz photo already saved
  const [cover2ozFile, setCover2ozFile] = useState(null); // newly picked 2 oz File
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(mode === 'edit');
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    api.meta().then(setMeta).catch(() => {});
  }, []);

  useEffect(() => {
    if (mode !== 'edit') return;
    api
      .getProduct(id)
      .then((res) => {
        const p = res.product;
        setValues({
          name: p.name || '',
          subname: p.subname || '',
          description: p.description || '',
          ingredients: p.ingredients || '',
          directions: p.directions || '',
          price: p.price ?? '',
          compare_at_price: p.compare_at_price ?? '',
          category: p.category || '',
          size: p.size || '',
          stock_status: p.stock_status || 'in_stock',
        });
        setSavedCover(p.main_image || null);
        setSavedCover2oz(p.main_image_2oz || null);
        setExisting((Array.isArray(p.images) ? p.images : []).map((m) => ({ ...m, keep: true })));
      })
      .catch((err) => setErrors([err.message]))
      .finally(() => setLoading(false));
  }, [mode, id]);

  const change = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  // Attach a stable object-URL preview to each picked file, once.
  const decorate = (fileList) =>
    Array.from(fileList).map((f) => {
      f._preview = URL.createObjectURL(f);
      f._previewKey = `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2)}`;
      return f;
    });

  const addFiles = (picked) => {
    const decorated = decorate(picked);
    if (decorated.length) setFiles((f) => [...f, ...decorated]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const toggleExisting = (url) =>
    setExisting((list) => list.map((m) => (m.url === url ? { ...m, keep: !m.keep } : m)));

  const dropNewFile = (idx) =>
    setFiles((f) =>
      f.filter((file, i) => {
        if (i === idx && file._preview) URL.revokeObjectURL(file._preview);
        return i !== idx;
      })
    );

  const pickCover = (file) => {
    if (!file) return;
    if (coverFile?._preview) URL.revokeObjectURL(coverFile._preview);
    file._preview = URL.createObjectURL(file);
    setCoverFile(file);
  };

  const removeCover = () => {
    if (coverFile) {
      URL.revokeObjectURL(coverFile._preview);
      setCoverFile(null);
    } else {
      setSavedCover(null);
    }
  };

  const pickCover2oz = (file) => {
    if (!file) return;
    if (cover2ozFile?._preview) URL.revokeObjectURL(cover2ozFile._preview);
    file._preview = URL.createObjectURL(file);
    setCover2ozFile(file);
  };

  const removeCover2oz = () => {
    if (cover2ozFile) {
      URL.revokeObjectURL(cover2ozFile._preview);
      setCover2ozFile(null);
    } else {
      setSavedCover2oz(null);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!coverFile && !savedCover) {
      setErrors(['Add a cover image.']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setBusy(true);
    setErrors([]);

    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, v));
    const kept = existing.filter((m) => m.keep);
    kept.forEach((m) => fd.append('keep_media', m.url));
    // Without any keep_media the backend keeps everything, so send an empty
    // one when every saved file was removed.
    if (mode === 'edit' && kept.length === 0) fd.append('keep_media', '');
    files.forEach((f) => fd.append('media', f));
    if (coverFile) fd.append('main_image', coverFile);
    else if (mode === 'edit' && !savedCover) fd.append('remove_main_image', '1');
    if (cover2ozFile) fd.append('main_image_2oz', cover2ozFile);
    else if (mode === 'edit' && !savedCover2oz) fd.append('remove_main_image_2oz', '1');

    try {
      if (mode === 'create') await api.createProduct(fd);
      else await api.updateProduct(id, fd);
      navigate('/admin/products');
    } catch (err) {
      setErrors(err.errors || [err.message]);
      setBusy(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="empty-state">Loading product…</div>;

  const keptImages =
    existing.filter((m) => m.keep && m.type === 'image').length +
    files.filter((f) => f.type.startsWith('image/')).length;
  const keptVideos =
    existing.filter((m) => m.keep && m.type === 'video').length +
    files.filter((f) => f.type.startsWith('video/')).length;

  return (
    <>
      <div className="page-head">
        <h1>{mode === 'create' ? 'Add Product' : 'Edit Product'}</h1>
        <Link to="/admin/products" className="btn btn-outline btn-sm">
          Back to products
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

      <form onSubmit={submit}>
        {/* Media */}
        <div className="form-card">
          <h2>Product media</h2>
          <p className="hint">
            Add multiple images and videos. Minimum 4 images. The first image
            becomes the listing cover.{' '}
            <strong>
              {keptImages} image{keptImages === 1 ? '' : 's'}, {keptVideos} video
              {keptVideos === 1 ? '' : 's'}
            </strong>
          </p>

          {existing.length > 0 && (
            <div className="media-grid">
              {existing.map((m) => (
                <div className={'media-item' + (m.keep ? '' : ' removing')} key={m.url}>
                  {m.type === 'video' ? (
                    <video src={mediaUrl(m.url)} muted />
                  ) : (
                    <img src={mediaUrl(m.url)} alt="" />
                  )}
                  <span className="kind">{m.type}</span>
                  <button
                    type="button"
                    className="drop"
                    onClick={() => toggleExisting(m.url)}
                    aria-label={m.keep ? 'Remove this file' : 'Undo remove'}
                  >
                    {m.keep ? '×' : '↺'}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div
            className={'dropzone' + (dragging ? ' drag' : '')}
            onClick={() => fileInput.current.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <strong>Choose images and videos</strong>
            <span>Select multiple files · JPG, PNG, WEBP, GIF, MP4, WEBM, MOV · up to 50MB each</span>
            <input
              ref={fileInput}
              type="file"
              multiple
              accept="image/*,video/*"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                // Copy the FileList to a real array BEFORE clearing the input —
                // clearing e.target.value invalidates e.target.files synchronously.
                const picked = Array.from(e.target.files);
                e.target.value = '';
                addFiles(picked);
              }}
            />
          </div>

          {files.length > 0 && (
            <div className="media-grid">
              {files.map((f, i) => (
                <div className="media-item" key={f._previewKey || i}>
                  {f.type.startsWith('video/') ? (
                    <video src={f._preview} muted />
                  ) : (
                    <img src={f._preview} alt="" />
                  )}
                  <span className="kind">new</span>
                  <button
                    type="button"
                    className="drop"
                    onClick={() => dropNewFile(i)}
                    aria-label="Remove this file"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cover image */}
        <div className="form-card">
          <h2>
            Cover image <span className="required">*</span>
          </h2>
          <p className="hint">Required. One image shown as the product's main picture.</p>

          {coverFile || savedCover ? (
            <div className="media-grid">
              <div className="media-item">
                <img src={coverFile ? coverFile._preview : mediaUrl(savedCover)} alt="" />
                <span className="kind">{coverFile ? 'new' : 'cover'}</span>
                <button
                  type="button"
                  className="drop"
                  onClick={removeCover}
                  aria-label="Remove cover image"
                >
                  ×
                </button>
              </div>
            </div>
          ) : null}
          <div className="dropzone" onClick={() => coverInput.current.click()}>
            <strong>{coverFile || savedCover ? 'Replace cover image' : 'Choose cover image'}</strong>
            <span>JPG, PNG, WEBP, GIF · up to 50MB</span>
            <input
              ref={coverInput}
              type="file"
              accept="image/*"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                const picked = e.target.files[0];
                e.target.value = '';
                pickCover(picked);
              }}
            />
          </div>
        </div>

        {/* 2 oz cover image */}
        <div className="form-card">
          <h2>
            2 oz cover image <span className="sub">— optional</span>
          </h2>
          <p className="hint">
            Upload the 2 oz jar photo and the shop shows a 2 oz tag next to the 4 oz one so
            customers can switch between the two photos.
          </p>

          {cover2ozFile || savedCover2oz ? (
            <div className="media-grid">
              <div className="media-item">
                <img src={cover2ozFile ? cover2ozFile._preview : mediaUrl(savedCover2oz)} alt="" />
                <span className="kind">{cover2ozFile ? 'new' : '2 oz'}</span>
                <button
                  type="button"
                  className="drop"
                  onClick={removeCover2oz}
                  aria-label="Remove 2 oz image"
                >
                  ×
                </button>
              </div>
            </div>
          ) : null}
          <div className="dropzone" onClick={() => cover2ozInput.current.click()}>
            <strong>{cover2ozFile || savedCover2oz ? 'Replace 2 oz image' : 'Choose 2 oz image'}</strong>
            <span>JPG, PNG, WEBP, GIF · up to 50MB</span>
            <input
              ref={cover2ozInput}
              type="file"
              accept="image/*"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                const picked = e.target.files[0];
                e.target.value = '';
                pickCover2oz(picked);
              }}
            />
          </div>
        </div>

        {/* Details */}
        <div className="form-card">
          <h2>Product details</h2>
          <p className="hint">This is what shows on the storefront listing.</p>

          <div className="field">
            <label htmlFor="name">Product name</label>
            <input
              id="name"
              type="text"
              placeholder="Malachite Fusion"
              value={values.name}
              onChange={change('name')}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="subname">
              Product subname <span className="sub">— the line under the title</span>
            </label>
            <input
              id="subname"
              type="text"
              placeholder="Moringa + Butterfly Pea Infused Tallow"
              value={values.subname}
              onChange={change('subname')}
            />
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="A rich, nourishing tallow crème made with grass-fed beef tallow…"
              value={values.description}
              onChange={change('description')}
            />
          </div>

          <div className="field">
            <label htmlFor="ingredients">Ingredients</label>
            <textarea
              id="ingredients"
              placeholder="Grass-Fed/Grass-Finished Beef Tallow, Raw Honduran Batana Oil, Organic: Rosemary Argan Oil…"
              value={values.ingredients}
              onChange={change('ingredients')}
            />
          </div>

          <div className="field">
            <label htmlFor="directions">Directions</label>
            <textarea
              id="directions"
              placeholder="Massage a generous amount onto the scalp and throughout the hair…"
              value={values.directions}
              onChange={change('directions')}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="form-card">
          <h2>Pricing &amp; availability</h2>
          <p className="hint">Compare-at price shows struck through next to the price.</p>

          <div className="three-col">
            <div className="field">
              <label htmlFor="price">Price (USD)</label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="66.00"
                value={values.price}
                onChange={change('price')}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="compare_at_price">
                Compare-at price <span className="sub">— optional</span>
              </label>
              <input
                id="compare_at_price"
                type="number"
                min="0"
                step="0.01"
                placeholder="89.00"
                value={values.compare_at_price ?? ''}
                onChange={change('compare_at_price')}
              />
            </div>
            <div className="field">
              <label htmlFor="size">Size</label>
              <select id="size" value={values.size} onChange={change('size')}>
                <option value="">Select size</option>
                {meta.sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" value={values.category} onChange={change('category')}>
              <option value="">Select category</option>
              {meta.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Availability</label>
            <div className="radio-row">
              {[
                ['in_stock', 'In stock'],
                ['out_of_stock', 'Out of stock'],
              ].map(([val, label]) => (
                <label className="radio-pill" key={val}>
                  <input
                    type="radio"
                    name="stock_status"
                    value={val}
                    checked={values.stock_status === val}
                    onChange={change('stock_status')}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="form-footer">
          <button type="submit" className="btn" disabled={busy}>
            {busy ? 'Saving…' : mode === 'create' ? 'Add Product' : 'Save changes'}
          </button>
          <Link to="/admin/products" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
