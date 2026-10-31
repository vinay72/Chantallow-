// src/admin/AdminHomeOffers.jsx
// /admin/home/offers — the "Featured Offer For You" carousel on the home
// page: a list of banner photos, each with its own label/title and an
// optional year or badge line. With none saved, the home page keeps its
// built-in banners.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Image as ImageIcon, Plus, Tag, Trash2 } from 'lucide-react';
import { api, mediaUrl } from './api';

const MAX_OFFERS = 10;
const emptyOffer = () => ({
  key: Math.random().toString(36).slice(2),
  image: '',
  label: '',
  title: '',
  year: '',
  bgTitle: '',
  lightText: true,
});

// Strips the client-only `key` before comparing/saving.
const forCompare = (list) => JSON.stringify(list.map(({ key: _key, ...o }) => o));

function OfferPreview({ offer }) {
  return (
    <div
      className="offer-preview-card"
      style={{ backgroundImage: offer.image ? `url(${mediaUrl(offer.image)})` : undefined }}
    >
      <div className="offer-preview-body">
        {offer.label && <span className="offer-preview-label">{offer.label}</span>}
        {offer.title && <h4 style={{ color: offer.lightText ? '#fff' : '#0B0B0B' }}>{offer.title}</h4>}
        {offer.year && <div style={{ color: offer.lightText ? '#fff' : '#3A3A38' }}>{offer.year}</div>}
        {offer.bgTitle && <div style={{ color: offer.lightText ? '#fff' : '#3A3A38' }}>{offer.bgTitle}</div>}
      </div>
    </div>
  );
}

export default function AdminHomeOffers() {
  const [saved, setSaved] = useState([]);
  const [offers, setOffers] = useState([]);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [flash, setFlash] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    return api
      .getHome()
      .then((home) => {
        const withKeys = (home.offers || []).map((o) => ({ ...emptyOffer(), ...o }));
        setSaved(withKeys);
        setOffers(withKeys);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = useMemo(() => forCompare(offers) !== forCompare(saved), [offers, saved]);
  const full = offers.length >= MAX_OFFERS;
  const incomplete = offers.some((o) => !o.image || !o.label.trim() || !o.title.trim());

  const update = (key, patch) => setOffers((list) => list.map((o) => (o.key === key ? { ...o, ...patch } : o)));
  const remove = (key) => setOffers((list) => list.filter((o) => o.key !== key));
  const add = () => !full && setOffers((list) => [...list, emptyOffer()]);
  const move = (index, delta) =>
    setOffers((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index + delta, 0, item);
      return next;
    });

  const uploadBanner = async (key, file) => {
    setUploadingKey(key);
    setError(null);
    try {
      const { url } = await api.uploadHomeImage(file);
      update(key, { image: url });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingKey(null);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setFlash(null);
    try {
      const body = offers.map(({ key: _key, ...o }) => ({ ...o, label: o.label.trim(), title: o.title.trim() }));
      const res = await api.saveHome({ offers: body });
      const withKeys = (res.offers || []).map((o) => ({ ...emptyOffer(), ...o }));
      setSaved(withKeys);
      setOffers(withKeys);
      setFlash('Home page updated. The featured offer carousel is live.');
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
        <h1>Featured Offer For You</h1>
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

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>
              <Tag size={17} aria-hidden="true" /> Banners
            </h2>
            <p className="muted">
              Each banner needs a photo, a label (e.g. “Sale Up To 10% Off”) and a title (e.g. “Summer”). The year or a
              second badge line are optional. Shown on the home page as a scrolling carousel, in this order. Leave this
              empty to use the home page's built-in banners.
            </p>
          </div>
          <span className="muted">
            {offers.length}/{MAX_OFFERS}
          </span>
        </div>

        {offers.length === 0 ? (
          <div className="launch-empty">No banners added. The home page shows its default carousel.</div>
        ) : (
          <ol className="launch-list">
            {offers.map((o, i) => (
              <li key={o.key}>
                <span className="launch-pos">{i + 1}</span>
                <span className="launch-thumb" style={{ width: 56, height: 56 }}>
                  {o.image ? <img src={mediaUrl(o.image)} alt="" /> : <span>No image</span>}
                </span>
                <div className="launch-info">
                  <div className="card-photo-row">
                    <label className={uploadingKey === o.key ? 'btn btn-outline btn-sm is-busy' : 'btn btn-outline btn-sm'}>
                      {uploadingKey === o.key ? 'Uploading…' : o.image ? 'Replace photo' : 'Upload photo'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        hidden
                        disabled={uploadingKey === o.key}
                        onChange={(e) => {
                          if (e.target.files[0]) uploadBanner(o.key, e.target.files[0]);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                  <input
                    className="label-input"
                    value={o.label}
                    maxLength={60}
                    placeholder="Label, e.g. Sale Up To 10% Off"
                    aria-label={`Label for banner ${i + 1}`}
                    onChange={(e) => update(o.key, { label: e.target.value })}
                  />
                  <input
                    className="label-input"
                    value={o.title}
                    maxLength={40}
                    placeholder="Title, e.g. Summer"
                    aria-label={`Title for banner ${i + 1}`}
                    onChange={(e) => update(o.key, { title: e.target.value })}
                  />
                  <input
                    className="label-input"
                    value={o.year}
                    maxLength={10}
                    placeholder="Year (optional), e.g. 2026"
                    aria-label={`Year for banner ${i + 1}`}
                    onChange={(e) => update(o.key, { year: e.target.value })}
                  />
                  <input
                    className="label-input"
                    value={o.bgTitle}
                    maxLength={20}
                    placeholder="Second badge line (optional), e.g. Sale"
                    aria-label={`Badge line for banner ${i + 1}`}
                    onChange={(e) => update(o.key, { bgTitle: e.target.value })}
                  />
                  <label className="style-check">
                    <input type="checkbox" checked={o.lightText} onChange={(e) => update(o.key, { lightText: e.target.checked })} />
                    Light (white) text — for a dark photo
                  </label>
                </div>
                <div className="launch-actions">
                  <button type="button" className="icon-btn" aria-label={`Move banner ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Move banner ${i + 1} down`}
                    disabled={i === offers.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button type="button" className="icon-btn danger" aria-label={`Remove banner ${i + 1}`} onClick={() => remove(o.key)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}

        <div className="launch-save">
          <button type="button" className="btn btn-outline" disabled={full} onClick={add}>
            <Plus size={14} aria-hidden="true" /> Add banner
          </button>
          <button type="button" className="btn" disabled={!dirty || saving || incomplete} onClick={save}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {dirty && (
            <button type="button" className="btn btn-outline" disabled={saving} onClick={() => setOffers(saved)}>
              Discard
            </button>
          )}
        </div>
        {incomplete && offers.length > 0 && (
          <p className="muted">Every banner needs a photo, a label and a title before you can save.</p>
        )}

        {offers.length > 0 && (
          <>
            <h3 className="preview-title">
              <ImageIcon size={14} aria-hidden="true" /> Preview
            </h3>
            <div className="launch-preview featured-preview">
              {offers.filter((o) => o.image).map((o) => (
                <OfferPreview key={o.key} offer={o} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
