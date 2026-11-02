// src/admin/AdminTerms.jsx
// /admin/terms — the Terms & Conditions page: the intro paragraph plus each
// named section's title and text. Sections are fixed (see server.js's
// TERMS_DEFAULT) — only their copy is editable here, not added/removed/reordered.

import { useCallback, useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { api } from './api';

export default function AdminTerms() {
  const [saved, setSaved] = useState(null);
  const [intro, setIntro] = useState('');
  const [sections, setSections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState([]);
  const [flash, setFlash] = useState(null);

  const applyFromServer = (terms) => {
    setIntro(terms.intro);
    setSections(terms.sections);
    setSaved({ intro: terms.intro, sections: terms.sections });
  };

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    return api
      .getTerms()
      .then((res) => applyFromServer(res.terms))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = saved && JSON.stringify({ intro, sections }) !== JSON.stringify(saved);

  const updateSection = (id, field, value) =>
    setSections((list) => list.map((s) => (s.id === id ? { ...s, [field]: value } : s)));

  const save = async () => {
    setSaving(true);
    setError(null);
    setErrors([]);
    setFlash(null);
    try {
      const res = await api.saveTerms({ intro, sections });
      applyFromServer(res.terms);
      setFlash('Terms & Conditions page updated.');
    } catch (err) {
      setError(err.message);
      setErrors(err.errors || []);
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setIntro(saved.intro);
    setSections(saved.sections);
  };

  if (loading || !sections) return <div className="empty-state">Loading Terms & Conditions page…</div>;

  return (
    <>
      <div className="page-head">
        <h1>
          <FileText size={18} aria-hidden="true" /> Terms & Conditions
        </h1>
        <a href="/terms-conditions" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
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
            <h2>Intro</h2>
            <p className="muted">The opening paragraph, shown above the sections.</p>
          </div>
        </div>
        <label className="field">
          <span>Intro paragraph</span>
          <textarea rows={3} value={intro} maxLength={600} onChange={(e) => setIntro(e.target.value)} />
        </label>
      </section>

      {sections.map((s) => (
        <section className="panel" key={s.id}>
          <div className="panel-head">
            <div>
              <h2>{s.title || s.id}</h2>
            </div>
          </div>
          <label className="field">
            <span>Section title</span>
            <input type="text" value={s.title} maxLength={100} onChange={(e) => updateSection(s.id, 'title', e.target.value)} />
          </label>
          <label className="field">
            <span>Section text</span>
            <textarea rows={4} value={s.text} maxLength={2000} onChange={(e) => updateSection(s.id, 'text', e.target.value)} />
          </label>
        </section>
      ))}

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
    </>
  );
}
