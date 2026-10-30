// src/admin/AdminCombos.jsx
// /admin/home/combos — the combo products shown in "The Chantallow Duos" on
// the home page. Lower position shows first; hidden combos stay off the site.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { api, mediaUrl } from './api';
import { money } from './orderMeta';
import { comboItemsLabel } from '../data/products';

export default function AdminCombos() {
  const [combos, setCombos] = useState(null);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    api
      .listCombos()
      .then((res) => setCombos(res.combos))
      .catch((err) => setError(err.message));
  }, []);

  const remove = async (combo) => {
    if (!confirm(`Delete "${combo.name}"? This can't be undone.`)) return;
    setDeletingId(combo.id);
    setError(null);
    try {
      await api.deleteCombo(combo.id);
      setCombos((list) => list.filter((c) => c.id !== combo.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const live = combos ? combos.filter((c) => c.is_active).length : 0;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Combo Products</h1>
          {combos && (
            <p className="muted head-sub">
              {live} live on the home page{combos.length > live && ` · ${combos.length - live} hidden`}
            </p>
          )}
        </div>
        <Link to="/admin/home/combos/new" className="btn btn-icon">
          <Plus size={15} aria-hidden="true" /> New combo
        </Link>
      </div>

      {error && (
        <div className="errors">
          <strong>Something went wrong:</strong>
          <ul>
            <li>{error}</li>
          </ul>
        </div>
      )}

      {!combos && !error && <div className="empty-state">Loading combos…</div>}

      {combos && combos.length === 0 && (
        <div className="empty-state">
          <h3>No combos yet</h3>
          Until you add one, the home page shows its built-in combos.
          <p style={{ marginTop: 16 }}>
            <Link to="/admin/home/combos/new" className="btn btn-sm">
              Create the first combo
            </Link>
          </p>
        </div>
      )}

      {combos && combos.length > 0 && (
        <div className="combo-grid">
          {combos.map((c) => (
            <article key={c.id} className={c.is_active ? 'combo-card' : 'combo-card is-hidden'}>
              <Link
                to={`/admin/home/combos/${c.id}`}
                className="combo-media"
                style={{ '--accent': c.accent || '#3B1941' }}
                aria-label={`View ${c.name}`}
              >
                {c.image ? <img src={mediaUrl(c.image)} alt="" /> : <span className="muted">No image</span>}
                {c.tag && <span className="combo-tag">{c.tag}</span>}
                <span className="combo-pos">#{c.position}</span>
              </Link>
              <div className="combo-body">
                <Link to={`/admin/home/combos/${c.id}`} className="combo-name">
                  {c.name}
                </Link>
                <div className="cell-sub">{comboItemsLabel(c.items)}</div>
                <div className="combo-price">
                  {money(c.price)}
                  {c.compare_at_price != null && <del>{money(c.compare_at_price)}</del>}
                  {!c.is_active && <span className="pill out">Hidden</span>}
                </div>
                <div className="row-actions">
                  <Link to={`/admin/home/combos/${c.id}`} className="btn btn-outline btn-sm">
                    View
                  </Link>
                  <Link to={`/admin/home/combos/${c.id}/edit`} className="btn btn-outline btn-sm">
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    disabled={deletingId === c.id}
                    onClick={() => remove(c)}
                  >
                    {deletingId === c.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
