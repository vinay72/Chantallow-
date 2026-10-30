// src/admin/AdminFaqs.jsx
// /admin/home/faqs — frequently asked questions: add, edit in place,
// publish / unpublish, reorder with the arrows, delete. Answers are plain text:
// a blank line starts a new paragraph.

import { useEffect, useId, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from './api';

// An answer saved with formatting (from when FAQs had a rich text editor) as
// plain text for the text box: paragraphs and line breaks are kept.
function answerText(value) {
  const text = String(value || '');
  if (!/<[a-z][\s\S]*>/i.test(text)) return text;
  const doc = new DOMParser().parseFromString(
    text.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|h[1-6]|li|blockquote|div)>/gi, '\n\n'),
    'text/html'
  );
  return (doc.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
}

const EMPTY = { question: '', answer: '', category: '', is_published: true };

function FaqForm({ initial = EMPTY, categories, busy, onSave, onCancel, submitLabel }) {
  const [faq, setFaq] = useState(() => ({ ...initial, answer: answerText(initial.answer) }));
  const set = (k, v) => setFaq((p) => ({ ...p, [k]: v }));
  const uid = useId();
  return (
    <form
      className="faq-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...faq, question: faq.question.trim(), answer: faq.answer.trim(), category: faq.category.trim() });
      }}
    >
      <div className="field">
        <label htmlFor={`${uid}-q`}>
          Question <span className="required">*</span>
        </label>
        <input id={`${uid}-q`} value={faq.question} onChange={(e) => set('question', e.target.value)} maxLength={500} required autoFocus />
      </div>
      <div className="field">
        {/* the editor isn't a form control, so clicking the label focuses it by hand */}
        <label htmlFor={`${uid}-a`}>
          Answer <span className="required">*</span> <span className="sub">a blank line starts a new paragraph</span>
        </label>
        <textarea
          id={`${uid}-a`}
          value={faq.answer}
          onChange={(e) => set('answer', e.target.value)}
          // no Shift+Enter line breaks in answers (Enter still starts a new line)
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.shiftKey) e.preventDefault();
          }}
          maxLength={5000}
          required
        />
      </div>
      <div className="faq-form-row">
        <div className="field">
          <label htmlFor={`${uid}-c`}>
            Category <span className="sub">optional</span>
          </label>
          <input
            id={`${uid}-c`}
            value={faq.category}
            onChange={(e) => set('category', e.target.value)}
            maxLength={80}
            list={`${uid}-cats`}
            placeholder="Products"
          />
          <datalist id={`${uid}-cats`}>
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <label className="check-row">
          <input type="checkbox" checked={faq.is_published} onChange={(e) => set('is_published', e.target.checked)} />
          Published
        </label>
      </div>
      <div className="row-actions faq-form-actions">
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className="btn btn-sm" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function AdminFaqs() {
  const [faqs, setFaqs] = useState(null);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .listFaqs()
      .then((res) => setFaqs(res.faqs))
      .catch((err) => setError(err.message));
  }, []);

  const categories = [...new Set((faqs || []).map((f) => f.category).filter(Boolean))];

  // Runs an API call with the shared busy / error handling.
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

  const create = (faq) =>
    run(async () => {
      const res = await api.createFaq(faq);
      setFaqs((list) => [...list, res.faq]);
      setAdding(false);
    });

  const update = (id, faq) =>
    run(async () => {
      const res = await api.updateFaq(id, faq);
      setFaqs((list) => list.map((f) => (f.id === id ? res.faq : f)));
      setEditingId(null);
    });

  const togglePublished = (f) => update(f.id, { ...f, is_published: !f.is_published });

  const remove = (f) => {
    if (!confirm(`Delete this FAQ?\n\n“${f.question}”`)) return;
    run(async () => {
      await api.deleteFaq(f.id);
      setFaqs((list) => list.filter((x) => x.id !== f.id));
    });
  };

  const move = (index, delta) => {
    const next = [...faqs];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    setFaqs(next); // show it straight away; put it back if saving fails
    run(async () => {
      const res = await api.reorderFaqs(next.map((f) => f.id));
      setFaqs(res.faqs);
    }).then((ok) => !ok && setFaqs(faqs));
  };

  const published = faqs ? faqs.filter((f) => f.is_published).length : 0;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>FAQs</h1>
          {faqs && (
            <p className="muted head-sub">
              {published} published{faqs.length > published && ` · ${faqs.length - published} draft`}
            </p>
          )}
        </div>
        {!adding && (
          <button
            type="button"
            className="btn btn-icon"
            onClick={() => {
              setAdding(true);
              setEditingId(null);
            }}
          >
            <Plus size={15} aria-hidden="true" /> Add FAQ
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

      {adding && (
        <section className="panel">
          <h2>New FAQ</h2>
          <FaqForm categories={categories} busy={busy} onSave={create} onCancel={() => setAdding(false)} submitLabel="Add FAQ" />
        </section>
      )}

      {!faqs && !error && <div className="empty-state">Loading FAQs…</div>}

      {faqs && faqs.length === 0 && !adding && (
        <div className="empty-state">
          <h3>No FAQs yet</h3>
          Add the questions customers ask most often.
        </div>
      )}

      {faqs && faqs.length > 0 && (
        <ol className="faq-list">
          {faqs.map((f, i) => (
            <li key={f.id} className={f.is_published ? 'faq-item' : 'faq-item is-draft'}>
              {editingId === f.id ? (
                <FaqForm
                  initial={{ question: f.question, answer: f.answer, category: f.category || '', is_published: f.is_published }}
                  categories={categories}
                  busy={busy}
                  onSave={(faq) => update(f.id, faq)}
                  onCancel={() => setEditingId(null)}
                  submitLabel="Save"
                />
              ) : (
                <>
                  <div className="faq-row">
                    <button
                      type="button"
                      className="faq-q"
                      aria-expanded={openId === f.id}
                      onClick={() => setOpenId((v) => (v === f.id ? null : f.id))}
                    >
                      <span className="launch-pos">{i + 1}</span>
                      <span className="faq-q-text">{f.question}</span>
                      <ChevronDown size={17} className={openId === f.id ? 'chev is-open' : 'chev'} aria-hidden="true" />
                    </button>
                    <div className="faq-meta">
                      {f.category && <span className="faq-cat">{f.category}</span>}
                      <button
                        type="button"
                        className={f.is_published ? 'pill in pill-btn' : 'pill out pill-btn'}
                        disabled={busy}
                        onClick={() => togglePublished(f)}
                        title={f.is_published ? 'Click to unpublish' : 'Click to publish'}
                      >
                        {f.is_published ? 'Published' : 'Draft'}
                      </button>
                    </div>
                    <div className="launch-actions">
                      <button type="button" className="icon-btn" aria-label="Move up" disabled={busy || i === 0} onClick={() => move(i, -1)}>
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label="Move down"
                        disabled={busy || i === faqs.length - 1}
                        onClick={() => move(i, 1)}
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label="Edit"
                        disabled={busy}
                        onClick={() => {
                          setEditingId(f.id);
                          setAdding(false);
                        }}
                      >
                        <Pencil size={15} />
                      </button>
                      <button type="button" className="icon-btn danger" aria-label="Delete" disabled={busy} onClick={() => remove(f)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {openId === f.id && <p className="faq-a">{answerText(f.answer)}</p>}
                </>
              )}
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
