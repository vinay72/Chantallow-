// src/pages/BlogPost/BlogPost.jsx
// /blog/:slug — one published post from Admin → Blog: cover, title, date,
// author, the post (rich text from the admin editor; the server sanitises it),
// tags, previous / next post and more posts.

import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, Clock, UserRound } from "lucide-react";
import Header from "../../components/Header";
import SiteFooter from "../../components/SiteFooter";
import "../../components/SiteFooter.css";
import { useCachedApi } from "../../api/useCachedApi";
import { mediaUrl } from "../../api/client";
import { toDisplayHtml } from "../../utils/richText";
import "../../styles/rich-text.css";
import "./BlogPost.css";

const formatDate = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default function BlogPost() {
  const { slug } = useParams();
  // key by slug so moving to another post loads it fresh
  return <PostView key={slug} slug={slug} />;
}

function PostView({ slug }) {
  const { data, status } = useCachedApi(`/blog/${encodeURIComponent(slug)}`);
  const post = data?.post;

  return (
    <div className="bp-page">
      <Header />

      <div className="bp-banner">
        <nav className="bp-crumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">◆</span>
          <Link to="/blog">Blog</Link>
          {post?.category && (
            <>
              <span aria-hidden="true">◆</span>
              <span>{post.category}</span>
            </>
          )}
        </nav>
        {post ? <h1>{post.title}</h1> : <h1>{status === "error" ? "Post not found" : "Loading…"}</h1>}
        {post && (
          <div className="bp-meta">
            <span>
              <CalendarDays size={15} aria-hidden="true" /> {formatDate(post.published_at)}
            </span>
            {post.author_name && (
              <span>
                <UserRound size={15} aria-hidden="true" /> {post.author_name}
              </span>
            )}
            <span>
              <Clock size={15} aria-hidden="true" /> {post.reading_minutes} min read
            </span>
          </div>
        )}
      </div>

      <main className="bp-main">
        {status === "loading" && (
          <div aria-hidden="true">
            <div className="bp-placeholder bp-placeholder--cover" />
            <div className="bp-placeholder" />
            <div className="bp-placeholder" />
            <div className="bp-placeholder bp-placeholder--short" />
          </div>
        )}

        {status === "error" && !post && (
          <div className="bp-empty">
            <p>This post isn't available. It may have been moved or unpublished.</p>
            <Link to="/blog" className="bp-btn">
              Back to the blog
            </Link>
          </div>
        )}

        {post && (
          <article>
            {post.cover_image && (
              <div className="bp-cover">
                <img src={mediaUrl(post.cover_image)} alt="" />
              </div>
            )}

            {post.excerpt && <p className="bp-lead">{post.excerpt}</p>}

            {/* sanitised HTML from the server */}
            <div className="bp-content rich-text" dangerouslySetInnerHTML={{ __html: toDisplayHtml(post.content) }} />

            {post.tags?.length > 0 && (
              <div className="bp-tags">
                <span>Tags:</span>
                {post.tags.map((t) => (
                  <span key={t} className="bp-tag">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {(data.previous || data.next) && (
              <nav className="bp-pager" aria-label="More posts">
                {data.previous ? (
                  <Link to={`/blog/${data.previous.slug}`} className="bp-pager-link">
                    <span>
                      <ArrowLeft size={15} aria-hidden="true" /> Previous post
                    </span>
                    <strong>{data.previous.title}</strong>
                  </Link>
                ) : (
                  <span />
                )}
                {data.next && (
                  <Link to={`/blog/${data.next.slug}`} className="bp-pager-link bp-pager-link--next">
                    <span>
                      Next post <ArrowRight size={15} aria-hidden="true" />
                    </span>
                    <strong>{data.next.title}</strong>
                  </Link>
                )}
              </nav>
            )}
          </article>
        )}

        {data?.more?.length > 0 && (
          <section className="bp-more">
            <h2>More from the blog</h2>
            <div className="bp-more-grid">
              {data.more.map((p) => (
                <Link key={p.slug} to={`/blog/${p.slug}`} className="bp-card">
                  <span className="bp-card-img">{p.cover_image && <img src={mediaUrl(p.cover_image)} alt="" />}</span>
                  <span className="bp-card-date">{formatDate(p.published_at)}</span>
                  <strong>{p.title}</strong>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
