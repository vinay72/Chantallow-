import React, { useState, useEffect, useMemo } from "react";
import "./BlogCategory.css";
import footerImg from "../../assets/footer/footer.png";
import logo from "../../assets/logo.png";

/* ------------------------------- SVG icons -------------------------------- */

const SearchIcon = ({ size = 20, stroke = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17.5 17.5L13.875 13.875" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HeartIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M17.3666 3.84172C16.941 3.41589 16.4356 3.0781 15.8794 2.84763C15.3232 2.61716 14.727 2.49854 14.1249 2.49854C13.5229 2.49854 12.9267 2.61716 12.3705 2.84763C11.8143 3.0781 11.3089 3.41589 10.8833 3.84172L9.99994 4.72506L9.1166 3.84172C8.25686 2.98198 7.0908 2.49898 5.87494 2.49898C4.65907 2.49898 3.49301 2.98198 2.63327 3.84172C1.77353 4.70147 1.29053 5.86753 1.29053 7.08339C1.29053 8.29925 1.77353 9.46531 2.63327 10.3251L3.5166 11.2084L9.99994 17.6917L16.4833 11.2084L17.3666 10.3251C17.7924 9.89943 18.1302 9.39407 18.3607 8.83785C18.5912 8.28164 18.7098 7.68546 18.7098 7.08339C18.7098 6.48132 18.5912 5.88514 18.3607 5.32893C18.1302 4.77271 17.7924 4.26735 17.3666 3.84172Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CartIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M7.49984 18.3334C7.96007 18.3334 8.33317 17.9603 8.33317 17.5001C8.33317 17.0398 7.96007 16.6667 7.49984 16.6667C7.0396 16.6667 6.6665 17.0398 6.6665 17.5001C6.6665 17.9603 7.0396 18.3334 7.49984 18.3334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16.6668 18.3334C17.1271 18.3334 17.5002 17.9603 17.5002 17.5001C17.5002 17.0398 17.1271 16.6667 16.6668 16.6667C16.2066 16.6667 15.8335 17.0398 15.8335 17.5001C15.8335 17.9603 16.2066 18.3334 16.6668 18.3334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M0.833496 0.833252H4.16683L6.40016 11.9916C6.47637 12.3752 6.68509 12.7199 6.98978 12.9652C7.29448 13.2104 7.67575 13.3407 8.06683 13.3333H16.1668C16.5579 13.3407 16.9392 13.2104 17.2439 12.9652C17.5486 12.7199 17.7573 12.3752 17.8335 11.9916L19.1668 4.99992H5.00016" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

const NAV = ["Home", "About Us", "Shop", "Blog", "Contact US"];

/* Blog post images now point to the local assets/blogpost-4 folder,
   using the 6 real Chantallow product photos (pic1.jpg – pic6.jpg). */
const POSTS = [
  { id: 1, date: "10 Sep 2023", title: "Trendsetter Chronicles: Unveiling the Latest in Fashion", img: "src/assets/blogpost-4/pic1.jpg" },
  { id: 2, date: "10 Sep 2023", title: "Trendsetter Chronicles: Unveiling the Latest in Fashion", img: "src/assets/blogpost-4/pic2.jpg" },
  { id: 3, date: "10 Sep 2023", title: "Trendsetter Chronicles: Unveiling the Latest in Fashion", img: "src/assets/blogpost-4/pic3.jpg" },
  { id: 4, date: "10 Sep 2023", title: "Trendsetter Chronicles: Unveiling the Latest in Fashion", img: "src/assets/blogpost-4/pic4.jpg" },
  { id: 5, date: "10 Sep 2023", title: "Trendsetter Chronicles: Unveiling the Latest in Fashion", img: "src/assets/blogpost-4/pic5.jpg" },
  { id: 6, date: "10 Sep 2023", title: "Trendsetter Chronicles: Unveiling the Latest in Fashion", img: "src/assets/blogpost-4/pic6.jpg" },
];

const CATEGORIES = [
  { name: "Skincare", count: "10" },
  { name: "Pain killer Balm", count: "10" },
  { name: "Limited Editions", count: "06" },
  { name: "Beauty Rewards", count: "22" },
];

const LATEST = [
  { date: "2 Apr, 2023", title: "Uncovering the Beauty Benefits of Plant-Based Skincare", img: "src/assets/blogpost-4/pic1.jpg" },
  { date: "25 March, 2023", title: "Harness the Power of Plants for Healthy Glowing Skin", img: "src/assets/blogpost-4/pic2.jpg" },
  { date: "7 Dec, 2023", title: "Embrace the Revitalizing Benefits of Plant-Based Product", img: "src/assets/blogpost-4/pic3.jpg" },
];

const TAGS = ["Mascara", "Cosmetic", "Serum", "Primer", "Makeup", "Contour", "Blush", "Highlighter"];

const YOU_MAY_LIKE = [
  { name: "Jewel Tone Nail Polish", price: 40, img: "images/cosmetic/1.png" },
  { name: "Balancing Body Cream", price: 30, img: "images/cosmetic/2.png" },
  { name: "Smoothing Body Butter", price: 35, img: "images/cosmetic/3.png" },
  { name: "Repairing Body Gel", price: 20, img: "images/cosmetic/4.png" },
  { name: "Skin Product", price: 70, img: "images/cosmetic/5.png" },
  { name: "Skin Product", price: 45, img: "images/cosmetic/6.png" },
  { name: "Skin Product", price: 40, img: "images/cosmetic/7.png" },
  { name: "Calming Body Lotion", price: 60, img: "images/cosmetic/1.png" },
];

const CART_ITEMS = [
  { id: 1, name: "Soothing Body Cream", img: "images/shop/shop-cart/pic1.jpg", price: 50, qty: 1 },
  { id: 2, name: "Body Toner", img: "images/shop/shop-cart/pic2.jpg", price: 40, qty: 1 },
  { id: 3, name: "Brightening Serum", img: "images/shop/shop-cart/pic3.jpg", price: 65, qty: 1 },
  { id: 4, name: "Soothing Body Cream", img: "images/shop/shop-cart/pic1.jpg", price: 50, qty: 1 },
];

const WISHLIST = [
  { id: 1, name: "Soothing Body Cream", img: "images/shop/shop-cart/pic1.jpg", price: 50 },
  { id: 2, name: "Body Toner", img: "images/shop/shop-cart/pic2.jpg", price: 40 },
  { id: 3, name: "Brightening Body Serum", img: "images/shop/shop-cart/pic3.jpg", price: 65 },
];

const RECENT_POSTS = [
  { title: "Hydrated Supple Skin", date: "July 23, 2023", img: "src/assets/shop/product/small/1.png" },
  { title: "Glowing Radiant Skin", date: "July 23, 2023", img: "src/assets/shop/product/small/2.png" },
  { title: "Silky Soft Skin", date: "July 23, 2023", img: "src/assets/shop/product/small/3.png" },
];

/* --------------------------------- Header --------------------------------- */

function Header({ onSearch, onCart }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="main-bar container-fluid">
        <a className="logo" href="#index">

          <img src={logo} alt="Chantallow" className="logo-img" />
        </a>

        <button
          className={`navbar-toggler${menuOpen ? " open" : ""}`}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>

        <nav className={`header-nav${menuOpen ? " show" : ""}`}>
          <ul className="nav">
            {NAV.map((item) => (
              <li key={item}>
                <a href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}>
                  {item} <span className="nav-plus">+</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-right">
          <a className="login-link" href="#register">Login /<br />Register</a>
          <button className="icon-btn" aria-label="Search" onClick={onSearch}><SearchIcon /></button>
          <button className="icon-btn" aria-label="Wishlist" onClick={() => onCart("wishlist")}><HeartIcon /></button>
          <button className="icon-btn" aria-label="Cart" onClick={() => onCart("cart")}><CartIcon /></button>
        </div>
      </div>
    </header>
  );
}

/* ----------------------------- Search offcanvas --------------------------- */

function SearchPanel({ open, onClose }) {
  return (
    <div className={`offcanvas offcanvas-top${open ? " show" : ""}`} role="dialog" aria-hidden={!open}>
      <button className="btn-close" aria-label="Close" onClick={onClose}>&times;</button>
      <div className="container">
        <form className="header-item-search" onSubmit={(e) => e.preventDefault()}>
          <div className="search-input">
            <select className="default-select" aria-label="Category">
              {["Malachite Fusion", "Jasper Revive", "Amber Glow", "Amethyst Relief", "Obsidian Infusion", "Olivine Relief"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <input type="search" placeholder="Search Product" aria-label="Search product" />
            <button className="search-go" type="button" aria-label="Search"><SearchIcon /></button>
          </div>
          <ul className="recent-tag">
            <li className="label">Quick Search :</li>
            {["Skin Product", "Body Products", "Daily Products", "Cream Products"].map((t) => (
              <li key={t}><a href="#shop">{t}</a></li>
            ))}
          </ul>
        </form>

        <h5 className="header-title">You May Also Like</h5>
        <div className="you-may-like">
          {YOU_MAY_LIKE.map((p, i) => (
            <div className="shop-card" key={i}>
              <div className="dz-media"><img src={p.img} alt={p.name} /></div>
              <div className="dz-content">
                <h6 className="title"><a href="#shop">{p.name}</a></h6>
                <h6 className="price">${p.price.toFixed(2)}</h6>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Cart / Wishlist drawer ----------------------- */

function CartDrawer({ open, tab, setTab, onClose, cart, setCart, wishlist, setWishlist }) {
  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const progress = Math.min(100, Math.round((subtotal / 400) * 100)) || 75;

  const setQty = (id, qty) => setCart((c) => c.map((i) => (i.id === id ? { ...i, qty } : i)));
  const removeCart = (id) => setCart((c) => c.filter((i) => i.id !== id));
  const removeWish = (id) => setWishlist((w) => w.filter((i) => i.id !== id));

  const Item = ({ item, showQty, onRemove }) => (
    <li>
      <div className="cart-widget">
        <div className="dz-media"><img src={item.img} alt={item.name} /></div>
        <div className="cart-content">
          <h6 className="title"><a href="#product">{item.name}</a></h6>
          <div className="cart-row">
            {showQty && (
              <div className="btn-quantity quantity-sm">
                <button type="button" aria-label="Decrease" onClick={() => setQty(item.id, Math.max(1, item.qty - 1))}>&minus;</button>
                <input value={item.qty} readOnly aria-label="Quantity" />
                <button type="button" aria-label="Increase" onClick={() => setQty(item.id, item.qty + 1)}>+</button>
              </div>
            )}
            <h6 className="dz-price">${item.price.toFixed(2)}</h6>
          </div>
        </div>
        <button className="dz-close" aria-label="Remove" onClick={() => onRemove(item.id)}>&times;</button>
      </div>
    </li>
  );

  return (
    <div className={`offcanvas offcanvas-end${open ? " show" : ""}`} role="dialog" aria-hidden={!open}>
      <button className="btn-close" aria-label="Close" onClick={onClose}>&times;</button>
      <div className="offcanvas-body">
        <ul className="dz-tabs">
          <li>
            <button className={tab === "cart" ? "active" : ""} onClick={() => setTab("cart")}>
              Shopping Cart <span className="badge">{cart.length}</span>
            </button>
          </li>
          <li>
            <button className={tab === "wishlist" ? "active" : ""} onClick={() => setTab("wishlist")}>
              Wishlist <span className="badge">{wishlist.length}</span>
            </button>
          </li>
        </ul>

        {tab === "cart" ? (
          <div className="shop-sidebar-cart">
            <ul className="sidebar-cart-list">
              {cart.map((item) => <Item key={item.id} item={item} showQty onRemove={removeCart} />)}
              {cart.length === 0 && <li className="empty">Your cart is empty.</li>}
            </ul>
            <div className="cart-total-row">
              <h5>Subtotal:</h5>
              <h5>{subtotal.toFixed(2)}$</h5>
            </div>
            <div className="shipping-time">
              <div className="shipping-content">
                <h6>Congratulations, you've got free shipping!</h6>
                <div className="progress"><div className="progress-bar" style={{ width: `${progress}%` }} /></div>
              </div>
            </div>
            <a href="#checkout" className="btn btn-outline btn-block">Checkout</a>
            <a href="#cart" className="btn btn-solid btn-block">View Cart</a>
          </div>
        ) : (
          <div className="shop-sidebar-cart">
            <ul className="sidebar-cart-list">
              {wishlist.map((item) => <Item key={item.id} item={item} showQty={false} onRemove={removeWish} />)}
              {wishlist.length === 0 && <li className="empty">Your wishlist is empty.</li>}
            </ul>
            <a href="#wishlist" className="btn btn-solid btn-block">Check Your Favourite</a>
          </div>
        )}
      </div>
    </div>
  );
}

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
        <div className="dz-media"><img src="src/assets/lady3.jpg" alt="Woman applying Chantallow skincare" /></div>
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
  const [cart, setCart] = useState(CART_ITEMS);
  const [wishlist, setWishlist] = useState(WISHLIST);

  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState("cart");
  const [scrolled, setScrolled] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  const anyOpen = searchOpen || drawerOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [anyOpen]);

  const openDrawer = (tab) => { setDrawerTab(tab); setDrawerOpen(true); };
  const closeAll = () => { setSearchOpen(false); setDrawerOpen(false); };

  const visiblePosts = POSTS.slice(0, visibleCount);
  const hasMore = visibleCount < POSTS.length;

  return (
    <div className="page-wrapper">
      <Header onSearch={() => setSearchOpen(true)} onCart={openDrawer} />

      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer
        open={drawerOpen}
        tab={drawerTab}
        setTab={setDrawerTab}
        onClose={() => setDrawerOpen(false)}
        cart={cart}
        setCart={setCart}
        wishlist={wishlist}
        setWishlist={setWishlist}
      />
      {anyOpen && <div className="offcanvas-backdrop" onClick={closeAll} />}

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