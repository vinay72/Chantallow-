// src/admin/AdminComboDetail.jsx
// /admin/home/combos/:id — everything about one combo, with edit / delete
// and a link to its page on the website.

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, mediaUrl } from './api';
import { formatDate, money } from './orderMeta';

export default function AdminComboDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getCombo(id)
      .then((res) => !cancelled && setCombo(res.combo))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const remove = async () => {
    if (!confirm(`Delete "${combo.name}"? This can't be undone.`)) return;
    setDeleting(true);
    try {
      await api.deleteCombo(combo.id);
      navigate('/admin/home/combos');
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  if (loading) return <div className="empty-state">Loading combo…</div>;

  if (!combo) {
    return (
      <div className="empty-state">
        <h3>Combo not found</h3>
        {error}
        <p style={{ marginTop: 16 }}>
          <Link to="/admin/home/combos" className="btn btn-outline btn-sm">
            Back to combos
          </Link>
        </p>
      </div>
    );
  }

  const saving = combo.compare_at_price != null && combo.compare_at_price > combo.price ? combo.compare_at_price - combo.price : 0;

  return (
    <>
      <div className="page-head">
        <div>
          <Link to="/admin/home/combos" className="back-link">
            ← All combos
          </Link>
          <h1>{combo.name}</h1>
          <div className="head-meta">
            {combo.is_active ? <span className="pill in">Live on the home page</span> : <span className="pill out">Hidden</span>}
            {' · '}Position {combo.position}
          </div>
        </div>
        <div className="row-actions">
          {combo.is_active && (
            <a href={`/combo/${combo.id}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
              View on site
            </a>
          )}
          <Link to={`/admin/home/combos/${combo.id}/edit`} className="btn btn-sm">
            Edit
          </Link>
          <button type="button" className="btn btn-sm btn-danger" disabled={deleting} onClick={remove}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      {error && (
        <div className="errors">
          <strong>Something went wrong:</strong>
          <ul>
            <li>{error}</li>
          </ul>
        </div>
      )}

      <div className="combo-detail">
        <div className="combo-media combo-media--lg" style={{ '--accent': combo.accent || '#3B1941' }}>
          {combo.image ? <img src={mediaUrl(combo.image)} alt={combo.name} /> : <span className="muted">No image</span>}
          {combo.tag && <span className="combo-tag">{combo.tag}</span>}
        </div>

        <div>
          <section className="panel">
            <h2>Pricing</h2>
            <dl className="kv">
              <dt>Price</dt>
              <dd className="strong">{money(combo.price)}</dd>
              <dt>Compare-at</dt>
              <dd>{combo.compare_at_price != null ? money(combo.compare_at_price) : '—'}</dd>
              {saving > 0 && (
                <>
                  <dt>Customer saves</dt>
                  <dd>
                    {money(saving)} ({Math.round((saving / combo.compare_at_price) * 100)}%)
                  </dd>
                </>
              )}
              <dt>Badge</dt>
              <dd>{combo.tag || '—'}</dd>
              <dt>Card colour</dt>
              <dd>
                <span className="swatch" style={{ background: combo.accent || '#3B1941' }} /> {combo.accent || '—'}
              </dd>
            </dl>
          </section>

          <section className="panel">
            <h2>What's inside</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size</th>
                  <th className="num">Qty</th>
                </tr>
              </thead>
              <tbody>
                {combo.items.map((it, i) => (
                  <tr key={i}>
                    <td>
                      {it.product_id ? <Link to={`/admin/products/${it.product_id}`}>{it.name}</Link> : it.name}
                      {!it.product_id && <span className="cell-sub"> · custom</span>}
                    </td>
                    <td>{it.size}</td>
                    <td className="num">{it.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="panel">
            <h2>Description</h2>
            <p className={combo.description ? 'notes' : 'muted'}>{combo.description || 'No description.'}</p>
            <p className="cell-sub" style={{ marginTop: 14 }}>
              Created {formatDate(combo.created_at, true)} · Updated {formatDate(combo.updated_at, true)}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
