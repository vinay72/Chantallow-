// src/admin/AdminHome.jsx
// Home page sections filled by picking products:
//   /admin/home/launches      <AdminHome section="new_launches" />  hero cards next to "Shop Now"
//   /admin/home/best-sellers  <AdminHome section="best_sellers" />  "Our Best Sellers" row
//   /admin/home/featured      <AdminHome section="featured" />      "Nourish Your Skin, Naturally" pair
//   /admin/home/tattoo        <AdminHome section="tattoo" />        "Pure Care for Every Tattoo" pair
//   /admin/home/bridge        <AdminHome section="bridge" />        "We Bridge The Gap..." circles
// Pick products, order them, and save. With none picked the home page shows its
// built-in products. A brand-new product is created under Products first.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, Award, Droplet, Leaf, Plus, Sparkles, Trash2 } from 'lucide-react';
import { api, mediaUrl } from './api';
import { money } from './orderMeta';

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

// One entry per section; `key` is the field name in GET/PUT /api/home.
const SECTIONS = {
  new_launches: {
    key: 'new_launches',
    title: 'New Launches',
    Icon: Sparkles,
    max: 4,
    help: 'Shown in the home page hero, next to “Shop Now”.',
    empty: 'No new launches picked. The home page shows its default products (Amber Glow and Amethyst Relief).',
    saved: 'Home page updated. The new launches are live.',
    addHint: 'Launching something new? Create it first, then add it here.',
    // the hero heading/subtitle + right-side portrait, above these picks
    textKey: 'hero_text',
    bannerKey: 'hero_banner',
    bannerLabel: 'Portrait photo',
  },
  best_sellers: {
    key: 'best_sellers',
    title: 'Best Sellers',
    Icon: Award,
    max: 8,
    help: 'Shown in “Our Best Sellers” on the home page, 4 to a row.',
    empty:
      'No best sellers picked. The home page shows its default four (Olivine Relief, Malachite Fusion, Taluma Hair Care and Bare Whipped Tallow).',
    saved: 'Home page updated. The best sellers are live.',
    addHint: "Pick the products you sell most. A product that isn't listed yet can be created first.",
  },
  featured: {
    key: 'featured',
    title: 'Nourish Your Skin',
    Icon: Leaf,
    max: 2,
    help: 'The two cards in “Nourish Your Skin, Naturally” on the home page. Each can have a short sale line.',
    empty: 'No products picked. The home page shows its default pair (Jasper Revive and Obsidian Infusion).',
    saved: 'Home page updated. The Nourish Your Skin cards are live.',
    addHint: 'Edit a product’s photo, name or price under Products; it updates here too.',
    // the heading/subtitle + right-side portrait, above the product picks
    textKey: 'featured_text',
    bannerKey: 'featured_banner',
    bannerLabel: 'Portrait photo',
  },
  tattoo: {
    key: 'tattoo',
    title: 'Pure Care for Every Tattoo',
    Icon: Droplet,
    max: 2,
    help: 'The two cards in “Pure Care for Every Tattoo” on the home page. Each can have a star badge and its own card photo.',
    empty: 'No products picked. The home page shows its default pair (Malachite Fusion and Amethyst Relief).',
    saved: 'Home page updated. The tattoo care cards are live.',
    addHint: 'Name, subtitle and prices come from the product (edit them under Products).',
    // the heading/subtitle + right-side photo (with its own caption), above the product picks
    textKey: 'tattoo_text',
    bannerKey: 'tattoo_banner',
    bannerLabel: 'Banner photo',
    captionKey: 'tattoo_caption',
  },
  bridge: {
    key: 'bridge',
    title: 'We Bridge The Gap',
    Icon: Sparkles,
    max: 8,
    help:
      'The circular product photos in “We Bridge The Gap Between Ancient Wisdom And Modern Skincare” on the home page. Each name can have its own colour.',
    empty: 'No products picked. The home page shows its default 8 products.',
    saved: 'Home page updated. The circles are live.',
    addHint: 'Pick up to 8 products to show as circles.',
  },
};

const STAR_CLIP =
  'polygon(50% 0%, 59% 18%, 79% 10%, 76% 31%, 97% 33%, 83% 50%, 97% 67%, 76% 69%, 79% 90%, 59% 82%, 50% 100%, 41% 82%, 21% 90%, 24% 69%, 3% 67%, 17% 50%, 3% 33%, 24% 31%, 21% 10%, 41% 18%)';

// How a "Pure Care for Every Tattoo" card will look: white card, jar photo,
// mint name/price box, optional green star badge.
function TattooPreview({ product, label, image }) {
  const url = image || coverOf(product);
  const compare = product.compare_at_price != null ? Number(product.compare_at_price) : null;
  return (
    <div className="tattoo-preview-card">
      <div className="tattoo-preview-img">{url ? <img src={mediaUrl(url)} alt="" /> : <span className="muted">No image</span>}</div>
      <div className="tattoo-preview-info">
        <div>
          <div className="tattoo-preview-name">{product.name}</div>
          {product.subname && <div className="tattoo-preview-sub">{product.subname}</div>}
        </div>
        <div className="tattoo-preview-price">
          {money(product.price)}
          {compare != null && compare > Number(product.price) && <del>{money(compare)}</del>}
        </div>
      </div>
      {label && (
        <span className="tattoo-preview-star" style={{ clipPath: STAR_CLIP }}>
          {label}
        </span>
      )}
    </div>
  );
}

// How a "Nourish Your Skin" card will look: cream photo box, sale line, name, price.
function FeaturedPreview({ product, label }) {
  const url = coverOf(product);
  const compare = product.compare_at_price != null ? Number(product.compare_at_price) : null;
  return (
    <div className="featured-preview-card">
      <div className="featured-preview-img">{url ? <img src={mediaUrl(url)} alt="" /> : <span className="muted">No image</span>}</div>
      <div className="featured-preview-row">
        <div>
          {label && <div className="featured-preview-sale">{label}</div>}
          <div className="featured-preview-name">{product.name}</div>
        </div>
        <div className="featured-preview-price">
          {money(product.price)}
          {compare != null && compare > Number(product.price) && <del>{money(compare)}</del>}
        </div>
      </div>
    </div>
  );
}

const coverOf = (p) => p.main_image || p.images?.find((m) => m.type === 'image')?.url || null;

function Thumb({ product, size = 56 }) {
  const url = coverOf(product);
  return (
    <span className="launch-thumb" style={{ width: size, height: size }}>
      {url ? <img src={mediaUrl(url)} alt="" /> : <span>No image</span>}
    </span>
  );
}

// How a best seller will look in "Our Best Sellers": arched image + name.
// 'photo': the photo already has the backdrop, shown as is. 'scene': a plain
// product photo, drawn on the arched backdrop + stand (same as Home.css).
function BestSellerPreview({ product, style }) {
  const url = coverOf(product);
  if (style === 'photo' || !url) {
    return (
      <div className="best-preview-card">
        <div className="best-preview-img">{url ? <img src={mediaUrl(url)} alt="" /> : <span className="muted">No image</span>}</div>
        <div className="best-preview-name">{product.name}</div>
      </div>
    );
  }
  return (
    <div className="best-preview-card">
      <div className="best-preview-scene">
        <span className="best-preview-stand" aria-hidden="true" />
        <img className="best-preview-jar" src={mediaUrl(url)} alt="" />
      </div>
      <div className="best-preview-name">{product.name}</div>
    </div>
  );
}

// How a "We Bridge The Gap" circle will look: round photo + name below in its colour.
function BridgePreview({ product, color }) {
  const url = coverOf(product);
  return (
    <div className="bridge-preview-card">
      <div className="bridge-preview-img">{url ? <img src={mediaUrl(url)} alt="" /> : <span className="muted">No image</span>}</div>
      <div className="bridge-preview-name" style={{ color: color || '#2D2E2F' }}>
        {product.name}
      </div>
    </div>
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

// Self-contained panel for a section's heading/subtitle, right-side banner
// photo, and (tattoo only) the caption shown over that photo. Loads and
// saves independently of the product picks below it.
function SectionTextPanel({ cfg }) {
  const [saved, setSaved] = useState({ heading: '', subtitle: '' });
  const [heading, setHeading] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [savedBanner, setSavedBanner] = useState(null);
  const [banner, setBanner] = useState(null);
  const [savedCaption, setSavedCaption] = useState({ heading: '', subtitle: '' });
  const [captionHeading, setCaptionHeading] = useState('');
  const [captionSubtitle, setCaptionSubtitle] = useState('');
  const [uploading, setUploading] = useState(false);
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
        const text = home[cfg.textKey];
        setSaved(text);
        setHeading(text.heading);
        setSubtitle(text.subtitle);
        setSavedBanner(home[cfg.bannerKey] || null);
        setBanner(home[cfg.bannerKey] || null);
        if (cfg.captionKey) {
          const caption = home[cfg.captionKey];
          setSavedCaption(caption);
          setCaptionHeading(caption.heading);
          setCaptionSubtitle(caption.subtitle);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [cfg.textKey, cfg.bannerKey, cfg.captionKey]);

  useEffect(() => {
    load();
  }, [load]);

  const dirty =
    heading.trim() !== saved.heading.trim() ||
    subtitle.trim() !== saved.subtitle.trim() ||
    banner !== savedBanner ||
    (cfg.captionKey && (captionHeading.trim() !== savedCaption.heading.trim() || captionSubtitle.trim() !== savedCaption.subtitle.trim()));

  const uploadBanner = async (file) => {
    setUploading(true);
    setError(null);
    try {
      const { url } = await api.uploadHomeImage(file);
      setBanner(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setFlash(null);
    try {
      const body = {
        [cfg.textKey]: { heading: heading.trim(), subtitle: subtitle.trim() },
        [cfg.bannerKey]: banner,
      };
      if (cfg.captionKey) body[cfg.captionKey] = { heading: captionHeading.trim(), subtitle: captionSubtitle.trim() };
      const res = await api.saveHome(body);
      const text = res[cfg.textKey];
      setSaved(text);
      setHeading(text.heading);
      setSubtitle(text.subtitle);
      setSavedBanner(res[cfg.bannerKey] || null);
      setBanner(res[cfg.bannerKey] || null);
      if (cfg.captionKey) {
        const caption = res[cfg.captionKey];
        setSavedCaption(caption);
        setCaptionHeading(caption.heading);
        setCaptionSubtitle(caption.subtitle);
      }
      setFlash('Home page updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setHeading(saved.heading);
    setSubtitle(saved.subtitle);
    setBanner(savedBanner);
    setCaptionHeading(savedCaption.heading);
    setCaptionSubtitle(savedCaption.subtitle);
  };

  if (loading) return null;

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Heading &amp; banner</h2>
          <p className="muted">The heading, subtitle and right-side photo shown above the picks below.</p>
        </div>
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

      <label className="field">
        <span>Heading{cfg.textKey === 'hero_text' && ' (a line break starts a new line)'}</span>
        <textarea rows={2} value={heading} maxLength={120} onChange={(e) => setHeading(e.target.value)} />
      </label>
      <label className="field">
        <span>Subtitle</span>
        <textarea rows={2} value={subtitle} maxLength={300} onChange={(e) => setSubtitle(e.target.value)} />
      </label>

      <div className="card-photo" style={{ marginBottom: 16 }}>
        <span className="card-photo-thumb">{banner && <img src={mediaUrl(banner)} alt="" />}</span>
        <label className={uploading ? 'btn btn-outline btn-sm is-busy' : 'btn btn-outline btn-sm'}>
          {uploading ? 'Uploading…' : banner ? `Replace ${cfg.bannerLabel.toLowerCase()}` : `Upload ${cfg.bannerLabel.toLowerCase()}`}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            disabled={uploading}
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

      {cfg.captionKey && (
        <>
          <label className="field">
            <span>Caption heading (shown over the photo)</span>
            <input type="text" value={captionHeading} maxLength={80} onChange={(e) => setCaptionHeading(e.target.value)} />
          </label>
          <label className="field">
            <span>Caption subtitle</span>
            <textarea rows={2} value={captionSubtitle} maxLength={200} onChange={(e) => setCaptionSubtitle(e.target.value)} />
          </label>
        </>
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
    </section>
  );
}

export default function AdminHome({ section = 'new_launches' }) {
  const cfg = SECTIONS[section];
  const MAX = cfg.max;
  const [products, setProducts] = useState([]);
  const [saved, setSaved] = useState([]); // ids as stored on the server
  const [picked, setPicked] = useState([]); // ids being edited
  // Best sellers only: id -> 'photo' when its photo already has the backdrop
  const [savedStyles, setSavedStyles] = useState({});
  const [styles, setStyles] = useState({});
  // Nourish Your Skin only: id -> sale line shown on the card
  const [savedLabels, setSavedLabels] = useState({});
  const [labels, setLabels] = useState({});
  // Tattoo care only: id -> card photo used instead of the product's own
  const [savedImages, setSavedImages] = useState({});
  const [images, setImages] = useState({});
  // Bridge the gap only: id -> the product name's text colour
  const [savedColors, setSavedColors] = useState({});
  const [colors, setColors] = useState({});
  const [uploadingId, setUploadingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [stale, setStale] = useState(false); // someone saved newer picks since this page loaded
  const [flash, setFlash] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    setLoadFailed(false);
    setStale(false);
    return Promise.all([api.getHome(), api.listProducts()])
      .then(([home, list]) => {
        const ids = home[cfg.key].map((p) => p.id);
        const loadedStyles = Object.fromEntries(home[cfg.key].map((p) => [p.id, p.home_style || 'scene']));
        const loadedLabels = Object.fromEntries(home[cfg.key].map((p) => [p.id, p.home_label || '']));
        const loadedImages = Object.fromEntries(home[cfg.key].map((p) => [p.id, p.home_image || '']));
        const loadedColors = Object.fromEntries(home[cfg.key].map((p) => [p.id, p.home_color || '']));
        setSaved(ids);
        setPicked(ids);
        setSavedStyles(loadedStyles);
        setStyles(loadedStyles);
        setSavedLabels(loadedLabels);
        setLabels(loadedLabels);
        setSavedImages(loadedImages);
        setImages(loadedImages);
        setSavedColors(loadedColors);
        setColors(loadedColors);
        setProducts(list.products);
      })
      .catch((err) => {
        setError(err.message);
        setLoadFailed(true);
      })
      .finally(() => setLoading(false));
  }, [cfg.key]);

  useEffect(() => {
    load();
  }, [load]);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const pickedProducts = picked.map((id) => byId.get(id)).filter(Boolean);
  const styleOf = (id) => (styles[id] === 'photo' ? 'photo' : 'scene');
  const labelOf = (id) => (labels[id] || '').trim();
  const colorOf = (id) => (HEX_COLOR.test(colors[id] || '') ? colors[id] : '');
  const dirty =
    picked.join(',') !== saved.join(',') ||
    picked.some((id) => styleOf(id) !== (savedStyles[id] === 'photo' ? 'photo' : 'scene')) ||
    picked.some((id) => labelOf(id) !== (savedLabels[id] || '').trim()) ||
    picked.some((id) => (images[id] || '') !== (savedImages[id] || '')) ||
    picked.some((id) => colorOf(id) !== (savedColors[id] || ''));
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

  // Uploads a card photo for one pick (saved with the picks on "Save changes").
  const uploadCardPhoto = async (id, file) => {
    setUploadingId(id);
    setError(null);
    try {
      const { url } = await api.uploadHomeImage(file);
      setImages((m) => ({ ...m, [id]: url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingId(null);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setFlash(null);
    try {
      // `expected` lets the server refuse the save if these picks changed since loading
      // a plain id, or { id, style?, label? } when the pick has extras
      const picks = picked.map((id) => {
        const pick = { id };
        if (styleOf(id) === 'photo') pick.style = 'photo';
        if (labelOf(id)) pick.label = labelOf(id);
        if (images[id]) pick.image = images[id];
        if (colorOf(id)) pick.color = colorOf(id);
        return Object.keys(pick).length > 1 ? pick : id;
      });
      const res = await api.saveHome({ [cfg.key]: picks, expected: { [cfg.key]: saved } });
      const ids = res[cfg.key].map((p) => p.id);
      const savedNow = Object.fromEntries(res[cfg.key].map((p) => [p.id, p.home_style || 'scene']));
      const savedLabelsNow = Object.fromEntries(res[cfg.key].map((p) => [p.id, p.home_label || '']));
      const savedImagesNow = Object.fromEntries(res[cfg.key].map((p) => [p.id, p.home_image || '']));
      const savedColorsNow = Object.fromEntries(res[cfg.key].map((p) => [p.id, p.home_color || '']));
      setSaved(ids);
      setPicked(ids);
      setSavedStyles(savedNow);
      setStyles(savedNow);
      setSavedLabels(savedLabelsNow);
      setLabels(savedLabelsNow);
      setSavedImages(savedImagesNow);
      setImages(savedImagesNow);
      setSavedColors(savedColorsNow);
      setColors(savedColorsNow);
      setFlash(cfg.saved);
    } catch (err) {
      setError(err.message);
      setStale(err.status === 409);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="empty-state">Loading home page settings…</div>;

  return (
    <>
      <div className="page-head">
        <h1>{cfg.title}</h1>
        <a href="/" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
          View home page
        </a>
      </div>

      {flash && <div className="flash">{flash}</div>}
      {error && (
        <div className="errors">
          <strong>{loadFailed ? `Couldn't load the ${cfg.title.toLowerCase()}:` : "Couldn't save:"}</strong>
          <ul>
            <li>{error}</li>
          </ul>
          <div className="row-actions" style={{ justifyContent: 'flex-start', marginTop: 10 }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={loadFailed || stale ? load : save} disabled={saving}>
              {stale ? 'Reload latest' : 'Try again'}
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {cfg.textKey && <SectionTextPanel cfg={cfg} />}

      {loadFailed ? null : (
        <div className="home-grid">
          {/* ---------- Current picks ---------- */}
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>
                  <cfg.Icon size={17} aria-hidden="true" /> {cfg.title}
                </h2>
                <p className="muted">
                  {cfg.help} Pick up to {MAX}; they appear in this order (use the arrows to change it).
                </p>
              </div>
              <span className="muted">
                {picked.length}/{MAX}
              </span>
            </div>

            {pickedProducts.length === 0 ? (
              <div className="launch-empty">
                {cfg.empty}
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
                      {section === 'best_sellers' && (
                        <label className="style-check">
                          <input
                            type="checkbox"
                            checked={styleOf(p.id) === 'photo'}
                            onChange={(e) => setStyles((m) => ({ ...m, [p.id]: e.target.checked ? 'photo' : 'scene' }))}
                          />
                          Photo already has the arch backdrop
                        </label>
                      )}
                      {section === 'tattoo' && (
                        <div className="card-photo-row">
                          <input
                            className="label-input"
                            value={labels[p.id] || ''}
                            maxLength={60}
                            placeholder="Star badge, e.g. 20% Sale (empty = none)"
                            aria-label={`Star badge for ${p.name}`}
                            onChange={(e) => setLabels((m) => ({ ...m, [p.id]: e.target.value }))}
                          />
                          <div className="card-photo">
                            <span className="card-photo-thumb">
                              {(images[p.id] || coverOf(p)) && <img src={mediaUrl(images[p.id] || coverOf(p))} alt="" />}
                            </span>
                            <label className={uploadingId === p.id ? 'btn btn-outline btn-sm is-busy' : 'btn btn-outline btn-sm'}>
                              {uploadingId === p.id ? 'Uploading…' : images[p.id] ? 'Replace card photo' : 'Upload card photo'}
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                hidden
                                disabled={uploadingId === p.id}
                                onChange={(e) => {
                                  if (e.target.files[0]) uploadCardPhoto(p.id, e.target.files[0]);
                                  e.target.value = '';
                                }}
                              />
                            </label>
                            {images[p.id] && (
                              <button type="button" className="link-btn" onClick={() => setImages((m) => ({ ...m, [p.id]: '' }))}>
                                Use product photo
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      {section === 'featured' && (
                        <input
                          className="label-input"
                          value={labels[p.id] || ''}
                          maxLength={60}
                          placeholder="Sale line, e.g. Up To 10% Off"
                          aria-label={`Sale line for ${p.name}`}
                          onChange={(e) => setLabels((m) => ({ ...m, [p.id]: e.target.value }))}
                        />
                      )}
                      {section === 'bridge' && (
                        <label className="color-pick">
                          Name colour
                          <input
                            type="color"
                            value={HEX_COLOR.test(colors[p.id] || '') ? colors[p.id] : '#2D2E2F'}
                            aria-label={`Name colour for ${p.name}`}
                            onChange={(e) => setColors((m) => ({ ...m, [p.id]: e.target.value }))}
                          />
                        </label>
                      )}
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
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={saving}
                  onClick={() => {
                    setPicked(saved);
                    setStyles(savedStyles);
                    setLabels(savedLabels);
                    setImages(savedImages);
                    setColors(savedColors);
                  }}
                >
                  Discard
                </button>
              )}
            </div>

            {pickedProducts.length > 0 && (
              <>
                <h3 className="preview-title">Preview</h3>
                <div
                  className={
                    section === 'best_sellers'
                      ? 'launch-preview best-preview'
                      : section === 'featured' || section === 'tattoo'
                      ? 'launch-preview featured-preview'
                      : section === 'bridge'
                      ? 'launch-preview bridge-preview'
                      : 'launch-preview'
                  }
                >
                  {pickedProducts.map((p) =>
                    section === 'best_sellers' ? (
                      <BestSellerPreview key={p.id} product={p} style={styleOf(p.id)} />
                    ) : section === 'featured' ? (
                      <FeaturedPreview key={p.id} product={p} label={labelOf(p.id)} />
                    ) : section === 'tattoo' ? (
                      <TattooPreview key={p.id} product={p} label={labelOf(p.id)} image={images[p.id]} />
                    ) : section === 'bridge' ? (
                      <BridgePreview key={p.id} product={p} color={colorOf(p.id)} />
                    ) : (
                      <PreviewCard key={p.id} product={p} />
                    )
                  )}
                </div>
              </>
            )}
          </section>

          {/* ---------- Pick a product ---------- */}
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>Add a product</h2>
                <p className="muted">{cfg.addHint}</p>
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
