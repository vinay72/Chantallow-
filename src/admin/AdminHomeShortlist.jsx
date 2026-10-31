// src/admin/AdminHomeShortlist.jsx
// /admin/home/shortlist — the "Soothe Sore Muscles, Naturally" banner at the
// bottom of the home page: a left-side photo + heading/subtitle, and one
// featured product on the right (with its own optional photo).

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { api, mediaUrl } from './api';
import { money } from './orderMeta';

const coverOf = (p) => p.main_image || p.images?.find((m) => m.type === 'image')?.url || null;

function Thumb({ product, size = 56 }) {
  const url = coverOf(product);
  return (
    <span className="launch-thumb" style={{ width: size, height: size }}>
      {url ? <img src={mediaUrl(url)} alt="" /> : <span>No image</span>}
    </span>
  );
}

export default function AdminHomeShortlist() {
  const [products, setProducts] = useState([]);
  const [savedId, setSavedId] = useState(null);
  const [pickedId, setPickedId] = useState(null);
  const [savedPickImage, setSavedPickImage] = useState('');
  const [pickImage, setPickImage] = useState('');
  const [savedBanner, setSavedBanner] = useState(null);
  const [banner, setBanner] = useState(null);
  const [savedHeading, setSavedHeading] = useState('');
  const [heading, setHeading] = useState('');
  const [savedSubtitle, setSavedSubtitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(null); // 'banner' | 'product' | null
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [flash, setFlash] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    return Promise.all([api.getHome(), api.listProducts()])
      .then(([home, list]) => {
        const pick = home.shortlist[0] || null;
        setSavedId(pick?.id ?? null);
        setPickedId(pick?.id ?? null);
        setSavedPickImage(pick?.home_image || '');
        setPickImage(pick?.home_image || '');
        setSavedBanner(home.shortlist_banner || null);
        setBanner(home.shortlist_banner || null);
        setSavedHeading(home.shortlist_text.heading);
        setHeading(home.shortlist_text.heading);
        setSavedSubtitle(home.shortlist_text.subtitle);
        setSubtitle(home.shortlist_text.subtitle);
        setProducts(list.products);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const picked = pickedId ? byId.get(pickedId) : null;

  const dirty =
    pickedId !== savedId ||
    pickImage !== savedPickImage ||
    banner !== savedBanner ||
    heading.trim() !== savedHeading.trim() ||
    subtitle.trim() !== savedSubtitle.trim();

  const available = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => p.id !== pickedId && (!q || p.name.toLowerCase().includes(q)));
  }, [products, pickedId, search]);

  const uploadBanner = async (file) => {
    setUploading('banner');
    setError(null);
    try {
      const { url } = await api.uploadHomeImage(file);
      setBanner(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(null);
    }
  };

  const uploadProductPhoto = async (file) => {
    setUploading('product');
    setError(null);
    try {
      const { url } = await api.uploadHomeImage(file);
      setPickImage(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setFlash(null);
    try {
      const pick = pickedId ? (pickImage ? { id: pickedId, image: pickImage } : pickedId) : null;
      const res = await api.saveHome({
        shortlist: pick ? [pick] : [],
        shortlist_banner: banner,
        shortlist_text: { heading: heading.trim(), subtitle: subtitle.trim() },
      });
      const resPick = res.shortlist[0] || null;
      setSavedId(resPick?.id ?? null);
      setPickedId(resPick?.id ?? null);
      setSavedPickImage(resPick?.home_image || '');
      setPickImage(resPick?.home_image || '');
      setSavedBanner(res.shortlist_banner || null);
      setBanner(res.shortlist_banner || null);
      setSavedHeading(res.shortlist_text.heading);
      setHeading(res.shortlist_text.heading);
      setSavedSubtitle(res.shortlist_text.subtitle);
      setSubtitle(res.shortlist_text.subtitle);
      setFlash('Home page updated. The Soothe Sore Muscles section is live.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setPickedId(savedId);
    setPickImage(savedPickImage);
    setBanner(savedBanner);
    setHeading(savedHeading);
    setSubtitle(savedSubtitle);
  };

  if (loading) return <div className="empty-state">Loading home page settings…</div>;

  return (
    <>
      <div className="page-head">
        <h1>Soothe Sore Muscles, Naturally</h1>
        <a href="/" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
          View home page
        </a>
      </div>

      {flash && <div className="flash">{flash}</div>}
      {error && (
        <div className="errors">
          <strong>Couldn't save:</strong>
          <ul>
            <li>{error}</li>
          </ul>
        </div>
      )}

      <div className="home-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Banner &amp; text</h2>
              <p className="muted">The left-side photo, heading and subtitle for this section. Leave blank to keep the defaults.</p>
            </div>
          </div>

          <div className="card-photo" style={{ marginBottom: 16 }}>
            <span className="card-photo-thumb">{banner && <img src={mediaUrl(banner)} alt="" />}</span>
            <label className={uploading === 'banner' ? 'btn btn-outline btn-sm is-busy' : 'btn btn-outline btn-sm'}>
              {uploading === 'banner' ? 'Uploading…' : banner ? 'Replace banner photo' : 'Upload banner photo'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                hidden
                disabled={uploading === 'banner'}
                onChange={(e) => {
                  if (e.target.files[0]) uploadBanner(e.target.files[0]);
                  e.target.value = '';
                }}
              />
            </label>
            {banner && (
              <button type="button" className="link-btn" onClick={() => setBanner(null)}>
                Remove
              </button>
            )}
          </div>

          <label className="field">
            <span>Heading</span>
            <textarea rows={2} value={heading} maxLength={160} onChange={(e) => setHeading(e.target.value)} placeholder="Soothe Sore Muscles,&#10;Naturally" />
          </label>

          <label className="field">
            <span>Subtitle</span>
            <textarea rows={3} value={subtitle} maxLength={300} onChange={(e) => setSubtitle(e.target.value)} placeholder="Describe the product shown here…" />
          </label>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Featured product</h2>
              <p className="muted">The product shown on the right, with its name, price and a Buy Now button. Pick one, or none to keep the default (Olivine Relief).</p>
            </div>
          </div>

          {picked ? (
            <ol className="launch-list">
              <li>
                <Thumb product={picked} />
                <div className="launch-info">
                  <span className="cell-main">{picked.name}</span>
                  <div className="cell-sub">{money(picked.price)}</div>
                  <div className="card-photo-row">
                    <div className="card-photo">
                      <span className="card-photo-thumb">
                        {(pickImage || coverOf(picked)) && <img src={mediaUrl(pickImage || coverOf(picked))} alt="" />}
                      </span>
                      <label className={uploading === 'product' ? 'btn btn-outline btn-sm is-busy' : 'btn btn-outline btn-sm'}>
                        {uploading === 'product' ? 'Uploading…' : pickImage ? 'Replace photo' : 'Upload a styled photo'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          hidden
                          disabled={uploading === 'product'}
                          onChange={(e) => {
                            if (e.target.files[0]) uploadProductPhoto(e.target.files[0]);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      {pickImage && (
                        <button type="button" className="link-btn" onClick={() => setPickImage('')}>
                          Use product photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="launch-actions">
                  <button
                    type="button"
                    className="icon-btn danger"
                    aria-label={`Remove ${picked.name}`}
                    onClick={() => {
                      setPickedId(null);
                      setPickImage('');
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </li>
            </ol>
          ) : (
            <div className="launch-empty">No product picked. The home page shows its default (Olivine Relief).</div>
          )}

          <div className="launch-save">
            <button type="button" className="btn" disabled={!dirty || saving} onClick={save}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {dirty && (
              <button type="button" className="btn btn-outline" disabled={saving} onClick={discard}>
                Discard
              </button>
            )}
          </div>

          {!picked && (
            <>
              <input
                type="search"
                className="launch-search"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search products"
              />
              {available.length === 0 ? (
                <div className="launch-empty">{products.length === 0 ? 'No products yet. Create one under Products.' : 'No other products match.'}</div>
              ) : (
                <ul className="pick-list">
                  {available.map((p) => (
                    <li key={p.id}>
                      <Thumb product={p} size={44} />
                      <div className="launch-info">
                        <div className="cell-main">{p.name}</div>
                        <div className="cell-sub">{money(p.price)}</div>
                      </div>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setPickedId(p.id)}>
                        Add
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {picked && (
            <>
              <h3 className="preview-title">
                <ImageIcon size={14} aria-hidden="true" /> Preview
              </h3>
              <div className="offer-preview-card" style={{ aspectRatio: '4 / 3', backgroundImage: `url(${mediaUrl(pickImage || coverOf(picked))})` }} />
            </>
          )}
        </section>
      </div>
    </>
  );
}
