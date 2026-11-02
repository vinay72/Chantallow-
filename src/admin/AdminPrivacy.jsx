// src/admin/AdminPrivacy.jsx
// /admin/privacy — the Privacy Policy page: the banner intro paragraph, plus
// the whole policy text as a single block (shown on the page as one flowing
// paragraph, see server.js's PRIVACY_DEFAULT).

import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { api } from './api';

export default function AdminPrivacy() {
  const [saved, setSaved] = useState(null);
  const [intro, setIntro] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState([]);
  const [flash, setFlash] = useState(null);

  const applyFromServer = (privacy) => {
    setIntro(privacy.intro);
    setBody(privacy.body);
    setSaved({ intro: privacy.intro, body: privacy.body });
  };

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    return api
      .getPrivacy()
      .then((res) => applyFromServer(res.privacy))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = saved && JSON.stringify({ intro, body }) !== JSON.stringify(saved);

  const save = async () => {
    setSaving(true);
    setError(null);
    setErrors([]);
    setFlash(null);
    try {
      const res = await api.savePrivacy({ intro, body });
      applyFromServer(res.privacy);
      setFlash('Privacy Policy page updated.');
    } catch (err) {
      setError(err.message);
      setErrors(err.errors || []);
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setIntro(saved.intro);
    setBody(saved.body);
  };

  if (loading) return <div className="empty-state">Loading Privacy Policy page…</div>;

  return (
    <>
      <div className="page-head">
        <h1>
          <ShieldCheck size={18} aria-hidden="true" /> Privacy Policy
        </h1>
        <a href="/privacy-policy" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
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
            <p className="muted">The opening line, shown in the banner at the top of the page.</p>
          </div>
        </div>
        <label className="field">
          <span>Intro paragraph</span>
          <textarea rows={3} value={intro} maxLength={600} onChange={(e) => setIntro(e.target.value)} />
        </label>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Policy text</h2>
            <p className="muted">Shown on the page as one paragraph below the banner.</p>
          </div>
        </div>
        <label className="field">
          <span>Policy text</span>
          <textarea rows={14} value={body} maxLength={6000} onChange={(e) => setBody(e.target.value)} />
        </label>
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
    </>
  );
}
