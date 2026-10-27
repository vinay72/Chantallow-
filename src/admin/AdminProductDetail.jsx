// src/admin/AdminProductDetail.jsx
// /admin/products/:id — read-only product view with gallery, hover zoom and lightbox.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api, mediaUrl } from './api';
import './AdminProductDetail.css';

const CATEGORY_LABEL = {
  in_stock: 'In stock',
  out_of_stock: 'Out of stock',
};

export default function AdminProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  // Hover-zoom lens on the main stage image.
  const [hoverZoom, setHoverZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const handleStageMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  };

  // Click-to-open lightbox with its own zoom + pan, shared by every image on the page.
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [lbScale, setLbScale] = useState(1);
  const [lbOffset, setLbOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, offX: 0, offY: 0 });

  useEffect(() => {
    setLoading(true);
    api
      .getProduct(id)
      .then((res) => {
        setProduct(res.product);
        setActiveIdx(0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Cover image leads the thumbnail rail (and opens on the stage); gallery images/videos follow.
  const media = useMemo(() => {
    if (!product) return [];
    const gallery = Array.isArray(product.images) ? product.images : [];
    const main = product.main_image ? [{ url: product.main_image, type: 'image', isMain: true }] : [];
    const rest = gallery.filter((m) => m.url !== product.main_image);
    return [...main, ...rest];
  }, [product]);

  const active = media[activeIdx] || null;

  const findMediaIndex = (url) => {
    const i = media.findIndex((m) => m.url === url);
    return i === -1 ? 0 : i;
  };

  const openLightbox = (idx) => {
    setLightboxIdx(idx);
    setLbScale(1);
    setLbOffset({ x: 0, y: 0 });
  };

  const closeLightbox = () => {
    setLightboxIdx(null);
    setLbScale(1);
    setLbOffset({ x: 0, y: 0 });
  };

  const lbStep = (dir) => {
    if (lightboxIdx === null || media.length === 0) return;
    const next = (lightboxIdx + dir + media.length) % media.length;
    setLightboxIdx(next);
    setLbScale(1);
    setLbOffset({ x: 0, y: 0 });
  };

  // Click toggles between 1x and 2.5x, zooming toward the click point.
  const toggleLbZoom = (e) => {
    if (lbScale > 1) {
      setLbScale(1);
      setLbOffset({ x: 0, y: 0 });
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setLbScale(2.5);
    setLbOffset({ x: -px * rect.width, y: -py * rect.height });
  };

  const onLbWheel = (e) => {
    e.preventDefault();
    setLbScale((s) => Math.min(4, Math.max(1, s - e.deltaY * 0.0015)));
  };

  const onLbPointerDown = (e) => {
    if (lbScale <= 1) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, offX: lbOffset.x, offY: lbOffset.y };
  };

  const onLbPointerMove = (e) => {
    if (!dragging) return;
    setLbOffset({
      x: dragStart.current.offX + (e.clientX - dragStart.current.x),
      y: dragStart.current.offY + (e.clientY - dragStart.current.y),
    });
  };

  const onLbPointerUp = () => setDragging(false);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') lbStep(1);
      if (e.key === 'ArrowLeft') lbStep(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIdx]);

  const remove = async () => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.deleteProduct(id);
      navigate('/admin/products');
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  if (loading) return <div className="empty-state">Loading product…</div>;

  if (error) {
    return (
      <>
        <div className="page-head">
          <h1>Product</h1>
          <Link to="/admin/products" className="btn btn-outline btn-sm">
            Back to products
          </Link>
        </div>
        <div className="errors">
          <strong>Couldn't load this product:</strong>
          <ul>
            <li>{error}</li>
          </ul>
        </div>
      </>
    );
  }

  if (!product) return null;

  const images = (Array.isArray(product.images) ? product.images : []).filter(
    (m) => m.type === 'image'
  );
  const videos = (Array.isArray(product.images) ? product.images : []).filter(
    (m) => m.type === 'video'
  );

  const price = Number(product.price);
  const comparePrice =
    product.compare_at_price !== null && product.compare_at_price !== undefined
      ? Number(product.compare_at_price)
      : null;

  return (
    <div className="pd-page">
      <div className="page-head">
        <h1>{product.name}</h1>
        <Link to="/admin/products" className="btn btn-outline btn-sm">
          Back to products
        </Link>
      </div>

      {/* Gallery + summary — vertical thumbnails | large image | info card */}
      <div className="pd-gallery-section">
        <div className="pd-thumb-rail">
          {media.map((m, i) => (
            <button
              type="button"
              key={m.url + i}
              className={'pd-thumb' + (i === activeIdx ? ' active' : '')}
              onClick={() => setActiveIdx(i)}
              aria-label={`Show media ${i + 1}`}
            >
              {m.type === 'video' ? (
                <video src={mediaUrl(m.url)} muted />
              ) : (
                <img src={mediaUrl(m.url)} alt="" />
              )}
              {m.isMain && <span className="pd-tag">Cover</span>}
              {m.type !== 'video' && (
                <span
                  className="pd-thumb-zoom"
                  role="button"
                  tabIndex={0}
                  aria-label="Zoom this image"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(i);
                  }}
                >
                  🔍
                </span>
              )}
            </button>
          ))}
        </div>

        <div
          className="pd-stage"
          onMouseEnter={() => active?.type !== 'video' && setHoverZoom(true)}
          onMouseLeave={() => setHoverZoom(false)}
          onMouseMove={active?.type !== 'video' ? handleStageMouseMove : undefined}
          onClick={() => active && active.type !== 'video' && openLightbox(activeIdx)}
        >
          {active ? (
            active.type === 'video' ? (
              <video src={mediaUrl(active.url)} controls />
            ) : (
              <>
                <img
                  className={'pd-stage-img' + (hoverZoom ? ' hidden' : '')}
                  src={mediaUrl(active.url)}
                  alt={product.name}
                />
                {hoverZoom && (
                  <div
                    className="pd-zoom-pane"
                    style={{
                      backgroundImage: `url(${mediaUrl(active.url)})`,
                      backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                    }}
                  />
                )}
                <span className="pd-zoom-hint">🔍 Hover to zoom · click to enlarge</span>
              </>
            )
          ) : (
            <span className="pd-empty">No media uploaded</span>
          )}
        </div>

        <div className="pd-info-card">
          {product.category && <span className="pd-category-pill">{product.category}</span>}
          <h2 className="pd-name">{product.name}</h2>
          {product.subname && <p className="pd-subname">{product.subname}</p>}
          {product.sku && <p className="pd-sku">SKU: {product.sku}</p>}

          <div className="pd-price-row">
            <span className="pd-price">${price.toFixed(2)}</span>
            {comparePrice !== null && <span className="pd-compare">${comparePrice.toFixed(2)}</span>}
          </div>

          <div className="pd-badge-row">
            <span className={'pd-badge ' + (product.stock_status === 'in_stock' ? 'in' : 'out')}>
              {CATEGORY_LABEL[product.stock_status] || product.stock_status}
            </span>
            {product.size && <span className="pd-badge neutral">{product.size}</span>}
          </div>

          <hr className="pd-divider" />

          {product.description && (
            <div className="pd-block">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
          )}

          {product.ingredients && (
            <div className="pd-block">
              <h3>Ingredients</h3>
              <p>{product.ingredients}</p>
            </div>
          )}

          {product.directions && (
            <div className="pd-block">
              <h3>Directions</h3>
              <p>{product.directions}</p>
            </div>
          )}

          <hr className="pd-divider" />

          <ul className="pd-specs">
            <li>
              <span>Category</span>
              <span>{product.category || '—'}</span>
            </li>
            <li>
              <span>Size</span>
              <span>{product.size || '—'}</span>
            </li>
            <li>
              <span>Product ID</span>
              <span>#{product.id}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Full media grid — kept so nothing already shown is lost, mirrors original layout */}
      <div className="pd-section">
        <h2>Product media</h2>

        {product.main_image ? (
          <>
            <p className="hint">Cover image</p>
            <div className="media-grid">
              <div
                className="media-item pd-zoomable"
                onClick={() => openLightbox(findMediaIndex(product.main_image))}
              >
                <img src={mediaUrl(product.main_image)} alt={product.name} />
                <span className="kind">cover</span>
              </div>
            </div>
          </>
        ) : (
          <p className="hint">No cover image set.</p>
        )}

        {(images.length > 0 || videos.length > 0) && (
          <>
            <p className="hint" style={{ marginTop: '1.5rem' }}>
              Gallery — {images.length} image{images.length === 1 ? '' : 's'},{' '}
              {videos.length} video{videos.length === 1 ? '' : 's'}
            </p>
            <div className="media-grid">
              {images.map((m) => (
                <div
                  className="media-item pd-zoomable"
                  key={m.url}
                  onClick={() => openLightbox(findMediaIndex(m.url))}
                >
                  <img src={mediaUrl(m.url)} alt="" />
                  <span className="kind">{m.type}</span>
                </div>
              ))}
              {videos.map((m) => (
                <div className="media-item" key={m.url}>
                  <video src={mediaUrl(m.url)} muted controls />
                  <span className="kind">{m.type}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Details */}
      <div className="pd-section">
        <h2>Product details</h2>

        <div className="field">
          <label>Product name</label>
          <p>{product.name}</p>
        </div>

        {product.subname && (
          <div className="field">
            <label>Product subname</label>
            <p>{product.subname}</p>
          </div>
        )}

        {product.sku && (
          <div className="field">
            <label>SKU</label>
            <p>{product.sku}</p>
          </div>
        )}

        {product.description && (
          <div className="field">
            <label>Description</label>
            <p style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>
          </div>
        )}

        {product.ingredients && (
          <div className="field">
            <label>Ingredients</label>
            <p style={{ whiteSpace: 'pre-wrap' }}>{product.ingredients}</p>
          </div>
        )}

        {product.directions && (
          <div className="field">
            <label>Directions</label>
            <p style={{ whiteSpace: 'pre-wrap' }}>{product.directions}</p>
          </div>
        )}
      </div>

      {/* Pricing & availability */}
      <div className="pd-section">
        <h2>Pricing &amp; availability</h2>

        <div className="three-col">
          <div className="field">
            <label>Price</label>
            <p>
              <strong>${price.toFixed(2)}</strong>
              {comparePrice !== null && (
                <span className="sub" style={{ marginLeft: '0.5rem', textDecoration: 'line-through' }}>
                  ${comparePrice.toFixed(2)}
                </span>
              )}
            </p>
          </div>
          <div className="field">
            <label>Size</label>
            <p>{product.size || '—'}</p>
          </div>
          <div className="field">
            <label>Category</label>
            <p>{product.category || '—'}</p>
          </div>
        </div>

        <div className="field">
          <label>Availability</label>
          <p>
            <span
              className={
                'stock-badge ' + (product.stock_status === 'in_stock' ? 'in-stock' : 'out-of-stock')
              }
            >
              {CATEGORY_LABEL[product.stock_status] || product.stock_status}
            </span>
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="pd-section">
        <h2>Meta</h2>
        <div className="three-col">
          <div className="field">
            <label>Product ID</label>
            <p>{product.id}</p>
          </div>
          {product.created_at && (
            <div className="field">
              <label>Created</label>
              <p>{new Date(product.created_at).toLocaleString()}</p>
            </div>
          )}
          {product.updated_at && (
            <div className="field">
              <label>Last updated</label>
              <p>{new Date(product.updated_at).toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className="pd-actions">
          <Link to={`/admin/products/${product.id}/edit`} className="btn btn-sm">
            Edit
          </Link>
          <button
            type="button"
            className="btn btn-outline btn-sm pd-danger"
            onClick={remove}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      {lightboxIdx !== null && media[lightboxIdx] && (
        <div className="pd-lightbox" onClick={closeLightbox}>
          <button type="button" className="pd-lb-close" onClick={closeLightbox} aria-label="Close">
            ×
          </button>

          {media.length > 1 && (
            <button
              type="button"
              className="pd-lb-nav pd-lb-prev"
              onClick={(e) => {
                e.stopPropagation();
                lbStep(-1);
              }}
              aria-label="Previous image"
            >
              ‹
            </button>
          )}

          <div
            className="pd-lb-stage"
            onClick={(e) => e.stopPropagation()}
            onWheel={onLbWheel}
            onPointerDown={onLbPointerDown}
            onPointerMove={onLbPointerMove}
            onPointerUp={onLbPointerUp}
            onPointerLeave={onLbPointerUp}
          >
            {media[lightboxIdx].type === 'video' ? (
              <video src={mediaUrl(media[lightboxIdx].url)} controls autoPlay />
            ) : (
              <img
                src={mediaUrl(media[lightboxIdx].url)}
                alt={product.name}
                className={'pd-lb-img' + (lbScale > 1 ? ' zoomed' : '')}
                style={{
                  transform: `translate(${lbOffset.x}px, ${lbOffset.y}px) scale(${lbScale})`,
                  cursor: lbScale > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in',
                }}
                onClick={toggleLbZoom}
                draggable={false}
              />
            )}
          </div>

          {media.length > 1 && (
            <button
              type="button"
              className="pd-lb-nav pd-lb-next"
              onClick={(e) => {
                e.stopPropagation();
                lbStep(1);
              }}
              aria-label="Next image"
            >
              ›
            </button>
          )}

          <span className="pd-lb-counter">
            {lightboxIdx + 1} / {media.length}
          </span>
        </div>
      )}
    </div>
  );
}
