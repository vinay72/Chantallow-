import React, { useState, useEffect } from "react";
import "./BlogCategory.css";
import footerImg from "../../assets/footer/footer.png";
import logo from "../../assets/logo.png";
import Header from "../../components/Header";

/* ------------------------------- SVG icons -------------------------------- */

const SearchIcon = ({ size = 20, stroke = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17.5 17.5L13.875 13.875" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowRight = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowUpRight = ({ size = 17 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 7H17V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* --------------------------------- Data ----------------------------------- */

/* Blog post images now point to the public/assets/blogpost-4 folder,
   using the 6 real Chantallow product photos (pic1.jpg – pic6.jpg). */
const POSTS = [
  { id: 1, date: "10 Sep 2023", title: "Trendsetter Chronicles: Unveiling the Latest in Fashion", img: "/assets/blogpost-4/pic1.jpg" },
  { id: 2, date: "10 Sep 2023", title: "Trendsetter Chronicles: Unveiling the Latest in Fashion", img: "/assets/blogpost-4/pic2.jpg" },
  { id: 3, date: "10 Sep 2023", title: "Trendsetter Chronicles: Unveiling the Latest in Fashion", img: "/assets/blogpost-4/pic3.jpg" },
  { id: 4, date: "10 Sep 2023", title: "Trendsetter Chronicles: Unveiling the Latest in Fashion", img: "/assets/blogpost-4/pic4.jpg" },
  { id: 5, date: "10 Sep 2023", title: "Trendsetter Chronicles: Unveiling the Latest in Fashion", img: "/assets/blogpost-4/pic5.jpg" },
  { id: 6, date: "10 Sep 2023", title: "Trendsetter Chronicles: Unveiling the Latest in Fashion", img: "/assets/blogpost-4/pic6.jpg" },
];

const CATEGORIES = [
  { name: "Skincare", count: "10" },
  { name: "Pain killer Balm", count: "10" },
  { name: "Limited Editions", count: "06" },
  { name: "Beauty Rewards", count: "22" },
];

const LATEST = [
  { date: "2 Apr, 2023", title: "Uncovering the Beauty Benefits of Plant-Based Skincare", img: "/assets/blogpost-4/pic1.jpg" },
  { date: "25 March, 2023", title: "Harness the Power of Plants for Healthy Glowing Skin", img: "/assets/blogpost-4/pic2.jpg" },
  { date: "7 Dec, 2023", title: "Embrace the Revitalizing Benefits of Plant-Based Product", img: "/assets/blogpost-4/pic3.jpg" },
];

const TAGS = ["Mascara", "Cosmetic", "Serum", "Primer", "Makeup", "Contour", "Blush", "Highlighter"];

const RECENT_POSTS = [
  { title: "Hydrated Supple Skin", date: "July 23, 2023", img: "/assets/shop/product/small/1.png" },
  { title: "Glowing Radiant Skin", date: "July 23, 2023", img: "/assets/shop/product/small/2.png" },
  { title: "Silky Soft Skin", date: "July 23, 2023", img: "/assets/shop/product/small/3.png" },
];

/* -------------------------------- Sidebar --------------------------------- */

function Sidebar() {
  return (
    <aside className="side-bar">
      <div className="widget">
        <h5 className="widget-title">Search</h5>
        <form className="search-bx" onSubmit={(e) => e.preventDefault()} role="search">
          <input type="text" placeholder="Search Here" aria-label="Search blog" />
          <button type="submit" aria-label="Search"><SearchIcon stroke="#fff" /></button>
        </form>
      </div>

      <div className="widget widget-categories">
        <h5 className="widget-title">Category</h5>
        <ul>
          {CATEGORIES.map((c) => (
            <li key={c.name}>
              <a href="#category">{c.name}</a> <span className="count">({c.count})</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="widget recent-posts">
        <h5 className="widget-title">Latest Post</h5>
        <div className="widget-post-bx">
          {LATEST.map((p) => (
            <div className="widget-post" key={p.title}>
              <a className="dz-media" href="#post">
                <img src={p.img} alt={p.title} />
                <span className="widget-post-btn"><ArrowUpRight size={15} /></span>
              </a>
              <div className="dz-info">
                <span className="post-date">{p.date}</span>
                <h6 className="title"><a href="#post">{p.title}</a></h6>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="widget image-box">
        <div className="dz-media"><img src="/assets/lady3.jpg" alt="Woman applying Chantallow skincare" /></div>
        <div className="dz-info">
          <h4 className="title">Do you Want To Work With Us?</h4>
          <p className="text">Explore exciting opportunities with us. Join our team and be part of the beauty revolution!</p>
          <a href="#contact" className="link">Contact Us <ArrowRight size={14} /></a>
        </div>
      </div>

      <div className="widget widget-tags">
        <h5 className="widget-title">Tags</h5>
        <div className="tagcloud">
          {TAGS.map((t) => <a href="#tag" key={t}>{t}</a>)}
        </div>
      </div>
    </aside>
  );
}

/* --------------------------------- Footer --------------------------------- */

const USEFUL_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about-us" },
  { label: "Returns", href: "#returns" },
  { label: "Terms & Conditions", href: "#terms" },
  { label: "Privacy-Policy", href: "#privacy" },
  { label: "Contact Us", href: "#contact" },
];

const SOCIAL_LINKS = ["Instagram", "Facebook", "YouTube", "Linkedin", "X.Com"];

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top container">
        <div>
          <div className="footer-logo">
            <img src={logo} alt="Chantallow" className="footer-logo-img" />
            </div>
          <p className="footer-contact">
            <strong>Address :</strong> 000 Wall Street, UK, London
          </p>
          <p className="footer-contact">
            <strong>E-mail :</strong> example@info.com
          </p>
          <p className="footer-contact">
            <strong>Phone :</strong> (000) 000-0000
          </p>
          <h6 className="footer-subtitle">Subscribe To Our Newsletter</h6>
          <form className="footer-newsletter" onSubmit={(event) => event.preventDefault()}>
            <input type="email" placeholder="Your Email Address" aria-label="Email address" />
            <button type="submit" aria-label="Subscribe">
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        <div>
          <h5 className="footer-title">Recent Posts</h5>
          {RECENT_POSTS.map((post) => (
            <div className="footer-post" key={post.title}>
              <div className="footer-post-thumb">
                <img src={post.img} alt={post.title} />
              </div>
              <div className="footer-post-body">
                <div className="footer-post-title">{post.title}</div>
                <div className="footer-post-date">{post.date}</div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h5 className="footer-title">Useful Links</h5>
          <div className="footer-links">
            {USEFUL_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="ctw-underline-link">
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h5 className="footer-title">Social Media</h5>
          <div className="footer-links social">
            {SOCIAL_LINKS.map((network) => (
              <a key={network} href="#home" className="ctw-underline-link">
                {network}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom container">
        <p>
          © 2026 <span className="footer-copyright-brand">Chantallow</span> Theme. All Rights Reserved.
        </p>
        <div className="footer-pay">
          <span>We Accept:</span>
          <img src={footerImg} alt="Accepted payment methods" />
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------ Main component ---------------------------- */

export default function BlogCategory() {
  const [scrolled, setScrolled] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visiblePosts = POSTS.slice(0, visibleCount);
  const hasMore = visibleCount < POSTS.length;

  return (
    <div className="page-wrapper">
      <Header />

      <main className="page-content">
        {/* Banner */}
        <section className="dz-banner">
          <div className="container banner-inner">
            <h1>Blog Category</h1>
            <nav className="breadcrumb">
              <a href="#index">Home</a>
              <span className="sep">◆</span>
              <span>Blog Category</span>
            </nav>
          </div>
        </section>

        {/* Content */}
        <section className="content-inner">
          <div className="container blog-grid">
            {/* Post list */}
            <div className="blog-main">
              <div className="search-info">
                <div className="title">
                  <p className="search-name">Category:</p>
                  <h2 className="search-result">Serum</h2>
                </div>
                <p className="found-posts">Found {POSTS.length} Posts</p>
              </div>

              <div className="post-list">
                {visiblePosts.map((post) => (
                  <article className="blog-half" key={post.id}>
                    <a className="dz-media" href="#post">
                      <img src={post.img} alt={post.title} />
                    </a>
                    <div className="dz-info">
                      <span className="post-date">{post.date}</span>
                      <h4 className="dz-title"><a href="#post">{post.title}</a></h4>
                      <a href="#post" className="read-btn">Read More <ChevronRight size={15} /></a>
                    </div>
                  </article>
                ))}
              </div>

              {hasMore && (
                <div className="load-more-wrap">
                  <button className="btn btn-outline btn-lg" onClick={() => setVisibleCount((c) => c + 3)}>
                    Load More
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <Sidebar />
          </div>
        </section>
      </main>

      <Footer />

      <button
        className={`scroltop${scrolled ? " show" : ""}`}
        aria-label="Scroll to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp />
      </button>
    </div>
  );
}