// src/admin/AdminAboutUs.jsx
// /admin/about — the whole About Us page: the founder section, the "Get In
// Touch" strip, and the "Illuminate Beauty" section with its collage photos.
// Saved as one object; see server.js's ABOUT_DEFAULT for the shape.
//
// The product highlights list is its own thing: real rows in the
// `about_highlights` table (see HighlightsPanel below), added/edited/removed
// immediately — not bundled into the "Save changes" button above.

import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { api, mediaUrl } from './api';

function ImageField({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const upload = async (file) => {
    setUploading(true);
    setError(null);
    try {
      const { url } = await api.uploadHomeImage(file);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="card-photo" style={{ marginBottom: 16 }}>
      <span className="card-photo-thumb">{value && <img src={mediaUrl(value)} alt="" />}</span>
      <label className={uploading ? 'btn btn-outline btn-sm is-busy' : 'btn btn-outline btn-sm'}>
        {uploading ? 'Uploading…' : value ? `Replace ${label.toLowerCase()}` : `Upload ${label.toLowerCase()}`}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          disabled={uploading}
          onChange={(e) => {
            if (e.target.files[0]) upload(e.target.files[0]);
            e.target.value = '';
          }}
        />
      </label>
      {value && (
        <button type="button" className="link-btn" onClick={() => onChange(null)}>
          Remove (use default)
        </button>
      )}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

const EMPTY_HIGHLIGHT = { name: '', desc: '' };
const MAX_HIGHLIGHTS = 20;

function HighlightForm({ initial = EMPTY_HIGHLIGHT, busy, onSave, onCancel, submitLabel }) {
  const [name, setName] = useState(initial.name);
  const [desc, setDesc] = useState(initial.desc);
  return (
    <form
      className="card-photo-row"
      style={{ flexWrap: 'wrap', marginBottom: 14 }}
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ name: name.trim(), desc: desc.trim() });
      }}
    >
      <input
        className="label-input"
        value={name}
        maxLength={90}
        placeholder="Title, e.g. Malachite Fusion – Moringa & Butterfly Pea"
        aria-label="Highlight name"
        onChange={(e) => setName(e.target.value)}
        autoFocus
        required
      />
      <textarea
        className="label-input"
        rows={4}
        value={desc}
        maxLength={700}
        placeholder="Description paragraph"
        aria-label="Highlight description"
        onChange={(e) => setDesc(e.target.value)}
        required
      />
      <button type="submit" className="btn btn-sm" disabled={busy}>
        {busy ? 'Saving…' : submitLabel}
      </button>
      {onCancel && (
        <button type="button" className="btn btn-outline btn-sm" disabled={busy} onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}

// The "Illuminate Beauty" product highlights — its own table (about_highlights),
// so add/edit/delete/reorder save immediately, same as Admin → FAQs.
function HighlightsPanel() {
  const [highlights, setHighlights] = useState(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .listHighlights()
      .then((res) => setHighlights(res.highlights))
      .catch((err) => setError(err.message));
  }, []);

  const run = async (fn) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      return true;
    } catch (err) {
      setError(err.errors ? err.errors.join(' ') : err.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const create = (highlight) =>
    run(async () => {
      const res = await api.createHighlight(highlight);
      setHighlights((list) => [...list, res.highlight]);
      setAdding(false);
    });

  const update = (id, highlight) =>
    run(async () => {
      const res = await api.updateHighlight(id, highlight);
      setHighlights((list) => list.map((h) => (h.id === id ? res.highlight : h)));
      setEditingId(null);
    });

  const remove = (h) => {
    if (!confirm(`Delete this highlight?\n\n“${h.name}”`)) return;
    run(async () => {
      await api.deleteHighlight(h.id);
      setHighlights((list) => list.filter((x) => x.id !== h.id));
    });
  };

  const move = (index, delta) => {
    const next = [...highlights];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    setHighlights(next); // show it straight away; put it back if saving fails
    run(async () => {
      const res = await api.reorderHighlights(next.map((h) => h.id));
      setHighlights(res.highlights);
    }).then((ok) => !ok && setHighlights(highlights));
  };

  return (
    <>
      <div className="panel-head">
        <div>
          <h3 className="preview-title">Product highlights {highlights && `(${highlights.length}/${MAX_HIGHLIGHTS})`}</h3>
          <p className="muted">The bulleted list on the Illuminate Beauty section. Saved immediately, separate from the rest of this page.</p>
        </div>
        {!adding && highlights && highlights.length < MAX_HIGHLIGHTS && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setAdding(true);
              setEditingId(null);
            }}
          >
            <Plus size={14} aria-hidden="true" /> Add highlight
          </button>
        )}
      </div>

      {error && (
        <div className="errors">
          <strong>Something went wrong:</strong>
          <ul>
            <li>{error}</li>
          </ul>
        </div>
      )}

      {adding && <HighlightForm busy={busy} onSave={create} onCancel={() => setAdding(false)} submitLabel="Add" />}

      {!highlights && !error && <div className="empty-state">Loading highlights…</div>}

      {highlights && highlights.length === 0 && !adding && <div className="launch-empty">No highlights yet.</div>}

      {highlights && highlights.length > 0 && (
        <ol className="launch-list">
          {highlights.map((h, i) =>
            editingId === h.id ? (
              <li key={h.id}>
                <HighlightForm initial={h} busy={busy} onSave={(v) => update(h.id, v)} onCancel={() => setEditingId(null)} submitLabel="Save" />
              </li>
            ) : (
              <li key={h.id}>
                <span className="launch-pos">{i + 1}</span>
                <div className="launch-info">
                  <span className="cell-main">{h.name}</span>
                  <div className="cell-sub">{h.description}</div>
                </div>
                <div className="launch-actions">
                  <button type="button" className="icon-btn" aria-label="Move up" disabled={busy || i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp size={16} />
                  </button>
                  <button type="button" className="icon-btn" aria-label="Move down" disabled={busy || i === highlights.length - 1} onClick={() => move(i, 1)}>
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="Edit"
                    disabled={busy}
                    onClick={() => {
                      setEditingId(h.id);
                      setAdding(false);
                    }}
                  >
                    <Pencil size={15} />
                  </button>
                  <button type="button" className="icon-btn danger" aria-label="Delete" disabled={busy} onClick={() => remove(h)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            )
          )}
        </ol>
      )}
    </>
  );
}

export default function AdminAboutUs() {
  const [saved, setSaved] = useState(null);
  const [founder, setFounder] = useState(null);
  const [cta, setCta] = useState(null);
  const [illuminate, setIlluminate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState([]);
  const [flash, setFlash] = useState(null);

  const applyFromServer = (about) => {
    // `items` (the highlights) are shown and saved separately by HighlightsPanel
    const { items: _items, ...illuminateRest } = about.illuminate;
    setFounder(about.founder);
    setCta(about.cta);
    setIlluminate(illuminateRest);
    setSaved({ founder: about.founder, cta: about.cta, illuminate: illuminateRest });
  };

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    return api
      .getAbout()
      .then((res) => applyFromServer(res.about))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = saved && JSON.stringify({ founder, cta, illuminate }) !== JSON.stringify(saved);

  const save = async () => {
    setSaving(true);
    setError(null);
    setErrors([]);
    setFlash(null);
    try {
      const res = await api.saveAbout({ founder, cta, illuminate });
      applyFromServer(res.about);
      setFlash('About Us page updated.');
    } catch (err) {
      setError(err.message);
      setErrors(err.errors || []);
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setFounder(saved.founder);
    setCta(saved.cta);
    setIlluminate(saved.illuminate);
  };

  if (loading || !founder) return <div className="empty-state">Loading About Us page…</div>;

  return (
    <>
      <div className="page-head">
        <h1>
          <Users size={18} aria-hidden="true" /> About Us
        </h1>
        <a href="/aboutus" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
          View page
        </a>
      </div>

      {flash && <div className="flash">{flash}</div>}
      {error && (
        <div className="errors">
          <strong>Couldn't save:</strong>
          <ul>{errors.length ? errors.map((e, i) => <li key={i}>{e}</li>) : <li>{error}</li>}</ul>
        </div>
      )}

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Founder's Vision</h2>
            <p className="muted">The photo, heading, two paragraphs and founder badge/name/role.</p>
          </div>
        </div>

        <ImageField label="Founder photo" value={founder.photo} onChange={(photo) => setFounder((f) => ({ ...f, photo }))} />

        <label className="field">
          <span>Heading</span>
          <input type="text" value={founder.heading} maxLength={160} onChange={(e) => setFounder((f) => ({ ...f, heading: e.target.value }))} />
        </label>
        <label className="field">
          <span>Paragraph 1</span>
          <textarea rows={4} value={founder.paragraph1} maxLength={1200} onChange={(e) => setFounder((f) => ({ ...f, paragraph1: e.target.value }))} />
        </label>
        <label className="field">
          <span>Paragraph 2</span>
          <textarea rows={4} value={founder.paragraph2} maxLength={1200} onChange={(e) => setFounder((f) => ({ ...f, paragraph2: e.target.value }))} />
        </label>

        <ImageField label="Founder badge" value={founder.badge} onChange={(badge) => setFounder((f) => ({ ...f, badge }))} />

        <label className="field">
          <span>Founder name</span>
          <input type="text" value={founder.name} maxLength={80} onChange={(e) => setFounder((f) => ({ ...f, name: e.target.value }))} />
        </label>
        <label className="field">
          <span>Founder role</span>
          <input type="text" value={founder.role} maxLength={80} onChange={(e) => setFounder((f) => ({ ...f, role: e.target.value }))} />
        </label>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>"Get In Touch" strip</h2>
            <p className="muted">The dark banner just below the founder section.</p>
          </div>
        </div>

        <label className="field">
          <span>Heading</span>
          <input type="text" value={cta.heading} maxLength={60} onChange={(e) => setCta((c) => ({ ...c, heading: e.target.value }))} />
        </label>
        <label className="field">
          <span>Text</span>
          <input type="text" value={cta.text} maxLength={200} onChange={(e) => setCta((c) => ({ ...c, text: e.target.value }))} />
        </label>
        <label className="field">
          <span>Button label</span>
          <input type="text" value={cta.buttonLabel} maxLength={40} onChange={(e) => setCta((c) => ({ ...c, buttonLabel: e.target.value }))} />
        </label>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Illuminate Beauty</h2>
            <p className="muted">The heading, intro paragraph, and the three collage photos. The highlights list below is edited separately.</p>
          </div>
        </div>

        <label className="field">
          <span>Heading</span>
          <input type="text" value={illuminate.heading} maxLength={100} onChange={(e) => setIlluminate((i) => ({ ...i, heading: e.target.value }))} />
        </label>
        <label className="field">
          <span>Paragraph</span>
          <textarea rows={3} value={illuminate.paragraph} maxLength={600} onChange={(e) => setIlluminate((i) => ({ ...i, paragraph: e.target.value }))} />
        </label>

        <ImageField label="Main collage photo" value={illuminate.mainImage} onChange={(mainImage) => setIlluminate((i) => ({ ...i, mainImage }))} />
        <ImageField label="Tag collage photo" value={illuminate.tagImage} onChange={(tagImage) => setIlluminate((i) => ({ ...i, tagImage }))} />

        <label className="field">
          <span>Tag eyebrow</span>
          <input type="text" value={illuminate.tagEyebrow} maxLength={40} onChange={(e) => setIlluminate((i) => ({ ...i, tagEyebrow: e.target.value }))} />
        </label>
        <label className="field">
          <span>Tag heading</span>
          <input type="text" value={illuminate.tagHeading} maxLength={60} onChange={(e) => setIlluminate((i) => ({ ...i, tagHeading: e.target.value }))} />
        </label>

        <ImageField label="Small collage photo" value={illuminate.smallImage} onChange={(smallImage) => setIlluminate((i) => ({ ...i, smallImage }))} />
      </section>

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

      <section className="panel">
        <HighlightsPanel />
      </section>
    </>
  );
}
