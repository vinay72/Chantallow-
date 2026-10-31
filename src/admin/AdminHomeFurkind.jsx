// src/admin/AdminHomeFurkind.jsx
// /admin/home/furkind — the heading + paragraph shown in the "Furkind Pet
// Tallow" section on the home page. Left blank, the home page keeps its
// built-in copy.

import { useCallback, useEffect, useState } from 'react';
import { PawPrint } from 'lucide-react';
import { api } from './api';

const MAX_HEADING = 120;
const MAX_TEXT = 2000;

export default function AdminHomeFurkind() {
  const [saved, setSaved] = useState({ heading: '', text: '' });
  const [heading, setHeading] = useState('');
  const [text, setText] = useState('');
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
        setSaved(home.furkind_text);
        setHeading(home.furkind_text.heading);
        setText(home.furkind_text.text);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = heading.trim() !== saved.heading.trim() || text.trim() !== saved.text.trim();

  const save = async () => {
    setSaving(true);
    setError(null);
    setFlash(null);
    try {
      const res = await api.saveHome({ furkind_text: { heading: heading.trim(), text: text.trim() } });
      setSaved(res.furkind_text);
      setHeading(res.furkind_text.heading);
      setText(res.furkind_text.text);
      setFlash('Home page updated. The Furkind Pet Tallow section is live.');
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
        <h1>
          <PawPrint size={17} aria-hidden="true" /> Furkind Pet Tallow
        </h1>
        <a href="/#furkind" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
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
            <h2>Section text</h2>
            <p className="muted">
              The heading and paragraph shown in the "Furkind Pet Tallow" section on the home page. Both are required.
            </p>
          </div>
        </div>

        <label className="field">
          <span>Heading</span>
          <input
            type="text"
            value={heading}
            maxLength={MAX_HEADING}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="Furkind Pet Tallow"
          />
        </label>

        <label className="field">
          <span>Paragraph</span>
          <textarea
            rows={8}
            value={text}
            maxLength={MAX_TEXT}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe the product shown in this section…"
          />
        </label>

        <div className="launch-save">
          <button type="button" className="btn" disabled={!dirty || saving || !heading.trim() || !text.trim()} onClick={save}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {dirty && (
            <button
              type="button"
              className="btn btn-outline"
              disabled={saving}
              onClick={() => {
                setHeading(saved.heading);
                setText(saved.text);
              }}
            >
              Discard
            </button>
          )}
        </div>
      </section>
    </>
  );
}
