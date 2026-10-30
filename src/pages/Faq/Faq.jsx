// src/pages/Faq/Faq.jsx
// /faq — the published FAQs from Admin → Home → FAQs: search, filter by
// category, and open a question to read its answer (formatted in the admin's
// rich text editor; the server sanitises it before saving).

import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Search, X } from "lucide-react";
import Header from "../../components/Header";
import SiteFooter from "../../components/SiteFooter";
import "../../components/SiteFooter.css";
import { useCachedApi } from "../../api/useCachedApi";
import { toDisplayHtml } from "../../utils/richText";
import "../../styles/rich-text.css";
import "./Faq.css";

const ALL = "All";

// Text of an answer (for searching), without its HTML.
const plainText = (html) => String(html || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ");

function FaqItem({ faq, open, onToggle }) {
  const id = `faq-${faq.id}`;
  return (
    <li className={open ? "faqp-item is-open" : "faqp-item"}>
      <h3 className="faqp-q">
        <button type="button" aria-expanded={open} aria-controls={`${id}-a`} id={`${id}-q`} onClick={onToggle}>
          <span>{faq.question}</span>
          <ChevronDown className="faqp-chev" size={20} aria-hidden="true" />
        </button>
      </h3>
      <div id={`${id}-a`} role="region" aria-labelledby={`${id}-q`} className="faqp-a" hidden={!open}>
        {/* sanitised HTML from the server */}
        <div className="faqp-answer rich-text" dangerouslySetInnerHTML={{ __html: toDisplayHtml(faq.answer) }} />
      </div>
    </li>
  );
}

export default function Faq() {
  const { data, status } = useCachedApi("/faqs");
  const faqs = useMemo(() => data?.faqs || [], [data]);
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState(() => new Set());

  const categories = useMemo(() => [ALL, ...new Set(faqs.map((f) => f.category).filter(Boolean))], [faqs]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter(
      (f) =>
        (category === ALL || f.category === category) &&
        (!q || f.question.toLowerCase().includes(q) || plainText(f.answer).toLowerCase().includes(q))
    );
  }, [faqs, category, query]);

  // Group by category (in the admin's order) when showing everything.
  const groups = useMemo(() => {
    if (category !== ALL || query.trim()) return [{ title: null, items: visible }];
    const map = new Map();
    for (const f of visible) {
      const key = f.category || "General";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(f);
    }
    return [...map].map(([title, items]) => ({ title, items }));
  }, [visible, category, query]);

  // The first question starts open (until the visitor opens / closes anything).
  const [touched, setTouched] = useState(false);
  const isOpen = (id) => (touched ? openIds.has(id) : visible[0]?.id === id);
  const toggle = (id) => {
    setTouched(true);
    setOpenIds((prev) => {
      const next = new Set(touched ? prev : visible[0] ? [visible[0].id] : []);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="faqp-page">
      <Header />

      <div className="faqp-banner">
        <h1>Frequently Asked Questions</h1>
        <nav className="faqp-crumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">◆</span>
          <span aria-current="page">FAQ</span>
        </nav>
      </div>

      <main className="faqp-main">
        <p className="faqp-intro">
          Everything you need to know about our tallow skincare, orders, shipping and returns. Can't find what you're looking for?{" "}
          <Link to="/contactus">Contact us</Link>.
        </p>

        <div className="faqp-tools">
          <label className="faqp-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search questions"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search questions"
            />
            {query && (
              <button type="button" aria-label="Clear search" onClick={() => setQuery("")}>
                <X size={16} />
              </button>
            )}
          </label>

          {categories.length > 2 && (
            <div className="faqp-cats" role="group" aria-label="Filter by topic">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={category === c}
                  className={category === c ? "faqp-cat is-active" : "faqp-cat"}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {status === "loading" && (
          <ul className="faqp-list" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <li key={i} className="faqp-placeholder" />
            ))}
          </ul>
        )}

        {status === "error" && !data && (
          <div className="faqp-empty">
            <h2>Couldn't load the FAQs</h2>
            <p>Please check your connection and try again.</p>
            <button type="button" className="faqp-btn" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        )}

        {data && visible.length === 0 && (
          <div className="faqp-empty">
            <h2>{faqs.length ? "No questions match your search" : "No FAQs yet"}</h2>
            <p>{faqs.length ? "Try different words, or pick another topic." : "Check back soon."}</p>
          </div>
        )}

        {data &&
          groups.map((group) =>
            group.items.length ? (
              <section key={group.title || "results"} className="faqp-group">
                {group.title && <h2 className="faqp-group-title">{group.title}</h2>}
                <ul className="faqp-list">
                  {group.items.map((f) => (
                    <FaqItem key={f.id} faq={f} open={isOpen(f.id)} onToggle={() => toggle(f.id)} />
                  ))}
                </ul>
              </section>
            ) : null
          )}

        <aside className="faqp-contact">
          <div>
            <h2>Still have questions?</h2>
            <p>Our team is happy to help with anything about your order or our products.</p>
          </div>
          <Link to="/contactus" className="faqp-btn">
            Contact Us
          </Link>
        </aside>
      </main>

      <SiteFooter />
    </div>
  );
}
