import React, { useState, useMemo, useEffect } from "react";


const SearchIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17.5 17.5L13.875 13.875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

const TrashIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M9.42543 10.2537C9.83759 10.2125 10.2051 10.5132 10.2463 10.9254L10.7463 15.9254C10.7876 16.3375 10.4868 16.7051 10.0747 16.7463C9.66253 16.7875 9.29499 16.4868 9.25378 16.0746L8.75378 11.0746C8.71256 10.6625 9.01327 10.2949 9.42543 10.2537Z" fill="currentColor" />
    <path fillRule="evenodd" clipRule="evenodd" d="M14.5747 10.2537C14.9868 10.2949 15.2875 10.6625 15.2463 11.0746L14.7463 16.0746C14.7051 16.4868 14.3376 16.7875 13.9254 16.7463C13.5133 16.7051 13.2126 16.3375 13.2538 15.9254L13.7538 10.9254C13.795 10.5132 14.1625 10.2125 14.5747 10.2537Z" fill="currentColor" />
    <path fillRule="evenodd" clipRule="evenodd" d="M10.1238 1.25002H13.5053C13.7217 1.24988 13.9102 1.24976 14.0882 1.27819C14.7915 1.39049 15.4001 1.82915 15.729 2.46084C15.8123 2.62073 15.8718 2.79961 15.9401 3.00494L16.0517 3.33984C16.0706 3.39653 16.076 3.41258 16.0806 3.42522C16.2557 3.90933 16.7097 4.23659 17.2244 4.24964C17.2379 4.24998 17.2545 4.25004 17.3145 4.25004H20.3145C20.7288 4.25004 21.0645 4.58582 21.0645 5.00004C21.0645 5.41425 20.7288 5.75004 20.3145 5.75004H3.31445C2.90024 5.75004 2.56445 5.41425 2.56445 5.00004C2.56445 4.58582 2.90024 4.25004 3.31445 4.25004H6.31454C6.37458 4.25004 6.39115 4.24998 6.40469 4.24964C6.91934 4.23659 7.37336 3.90936 7.54848 3.42524C7.55308 3.41251 7.55838 3.39681 7.57737 3.33984L7.68897 3.00496C7.75727 2.79964 7.81678 2.62073 7.90004 2.46084C8.22898 1.82915 8.83758 1.39049 9.54088 1.27819C9.7189 1.24976 9.90742 1.24988 10.1238 1.25002ZM8.8226 4.25004C8.87411 4.14902 8.91976 4.04404 8.95903 3.93548C8.97095 3.90251 8.98265 3.86742 8.99767 3.82234L9.09748 3.52292C9.18865 3.24941 9.20964 3.19363 9.23046 3.15364C9.34011 2.94307 9.54298 2.79686 9.77741 2.75942C9.82194 2.75231 9.88148 2.75004 10.1698 2.75004H13.4593C13.7476 2.75004 13.8071 2.75231 13.8517 2.75942C14.0861 2.79686 14.289 2.94307 14.3986 3.15364C14.4194 3.19363 14.4404 3.2494 14.5316 3.52292L14.6313 3.82216L14.6701 3.9355C14.7093 4.04405 14.755 4.14902 14.8065 4.25004H8.8226Z" fill="currentColor" />
    <path fillRule="evenodd" clipRule="evenodd" d="M5.11616 7.75169C5.52945 7.72414 5.88683 8.03684 5.91439 8.45014L6.37433 15.3492C6.46418 16.6971 6.52821 17.6349 6.66878 18.3405C6.80513 19.025 6.99546 19.3873 7.26888 19.6431C7.54229 19.8988 7.91645 20.0647 8.60845 20.1552C9.32185 20.2485 10.2619 20.25 11.6127 20.25H12.3861C13.7369 20.25 14.6769 20.2485 15.3903 20.1552C16.0823 20.0647 16.4565 19.8988 16.7299 19.6431C17.0033 19.3873 17.1937 19.025 17.33 18.3405C17.4706 17.6349 17.5346 16.6971 17.6245 15.3492L18.0844 8.45014C18.1119 8.03684 18.4693 7.72414 18.8826 7.75169C19.2959 7.77924 19.6086 8.13662 19.5811 8.54992L19.1176 15.5016C19.0321 16.7844 18.9631 17.8205 18.8011 18.6336C18.6327 19.4789 18.3463 20.185 17.7547 20.7384C17.1631 21.2919 16.4395 21.5307 15.5849 21.6425C14.7628 21.75 13.7244 21.75 12.4388 21.75H11.56C10.2744 21.75 9.23593 21.75 8.41389 21.6425C7.55924 21.5307 6.83569 21.2919 6.2441 20.7384C5.6525 20.185 5.36608 19.4789 5.19769 18.6336C5.03571 17.8205 4.96665 16.7844 4.88116 15.5016L4.41771 8.54992C4.39015 8.13662 4.70286 7.77924 5.11616 7.75169Z" fill="currentColor" />
  </svg>
);

const ArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8.5 12.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShippingIcon = () => (
  <svg width="45" height="45" viewBox="0 0 45 45" fill="none">
    <path d="M35.16 7.73a2.1 2.1 0 0 1 2.11 2.11.7.7 0 1 0 1.4 0 3.52 3.52 0 0 0-3.51-3.52.7.7 0 1 0 0 1.41Z" fill="currentColor" />
    <path d="M8.97 10.55H4.22a2.2 2.2 0 0 0-2.05 1.59 2.2 2.2 0 0 0 1.05 2.37l13.42 7.23-5.68 5.68H4.22a2.2 2.2 0 0 0-2.03 1.55 2.2 2.2 0 0 0 .95 2.37l2.98 1.79a24.7 24.7 0 0 0-1.98 3.86l-.24.73-.54.54a3.4 3.4 0 0 0-.98 1.9l-.26 1.52a.7.7 0 0 0 .82.79l1.52-.26a3.4 3.4 0 0 0 1.89-.98l.54-.54.73-.24a24.7 24.7 0 0 0 4.26-2.01l1.79 2.98a2.2 2.2 0 0 0 2.4.95 2.2 2.2 0 0 0 1.55-2.03v-6.74l5.68-5.68 2.9 5.38a2.1 2.1 0 0 0-1.53 2.03v2.81a2.11 2.11 0 0 0 2.11 2.11h2.81a2.1 2.1 0 0 0 1.41-.54 2.1 2.1 0 0 0 1.41.54h8.44a2.11 2.11 0 0 0 2.11-2.11v-8.44a2.11 2.11 0 0 0-2.11-2.11h-8.44a2.11 2.11 0 0 0-2.11 2.11v3.64c-.22-.08-.46-.12-.7-.12h-.64l-4.6-8.54 8.75-8.75v9.55a.7.7 0 1 0 1.41 0v-.53l2.9-2.9a2.02 2.02 0 0 0 0-2.86 2.02 2.02 0 0 0-2.9-.08v-4.46l5.62-5.62a5.9 5.9 0 0 0 1.53-2.76l.66-3.29a1.72 1.72 0 0 0-2.02-2.02l-3.29.66a5.9 5.9 0 0 0-2.76 1.53l-5.62 5.62h-4.82a2.02 2.02 0 0 0-.08-2.9 2.02 2.02 0 0 0-2.86 0l-2.9 2.9h-2.12a2.02 2.02 0 0 0-.08-2.9 2.02 2.02 0 0 0-2.86 0l-2.9 2.9Z" fill="currentColor" />
  </svg>
);

/* -------------------------------- Data ------------------------------------ */

const INITIAL_CART = [
  { id: 1, name: "Amber Glow", img: "images/shop/shop-cart/pic1.jpg", price: 0, qty: 1, meta: ["Skin Type: Dry", "Item Form: Cream", "Used For: Dry skin"] },
  { id: 2, name: "Amethyst Relief", img: "images/shop/shop-cart/pic2.jpg", price: 6, qty: 1, meta: ["Skin Type: Dry", "Item Form: Cream", "Used For: Fairness Cream"] },
  { id: 3, name: "Jasper Revive", img: "images/shop/shop-cart/pic3.jpg", price: 0, qty: 1, meta: ["Skin Type: Dry", "Item Form: Cream", "Used For: Fairness Cream"] },
  { id: 4, name: "Malachite Fusion", img: "images/shop/shop-cart/pic1.jpg", price: 0, qty: 1, meta: ["Skin Type: Dry", "Item Form: Serum", "Used For: Fairness Cream"] },
  { id: 5, name: "Obsidian Infusion", img: "images/shop/shop-cart/pic5.jpg", price: 0, qty: 1, meta: ["Skin Type: Dry", "Item Form: Cream", "Used For: Fairness Cream"] },
  { id: 6, name: "Olivine Relief", img: "images/shop/shop-cart/pic5.jpg", price: 0, qty: 1, meta: ["Skin Type: Dry", "Item Form: Cream", "Used For: Balm"] },
];

const SIDEBAR_CART = [
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

const RECENT_POSTS = [
  { title: "Hydrated Supple Skin", date: "July 23, 2023", img: "images/shop/product/small/1.png" },
  { title: "Glowing Radiant Skin", date: "July 23, 2023", img: "images/shop/product/small/2.png" },
  { title: "Silky Soft Skin", date: "July 23, 2023", img: "images/shop/product/small/3.png" },
];

const NAV = ["Home", "About Us", "Shop", "Blog", "Contact US"];

/* --------------------------- Small building blocks ------------------------- */

function QtyInput({ value, onChange, small = false }) {
  return (
    <div className={`btn-quantity${small ? " quantity-sm" : ""}`}>
      <button type="button" aria-label="Decrease" onClick={() => onChange(Math.max(1, value - 1))}>&minus;</button>
      <input type="text" value={value} readOnly aria-label="Quantity" />
      <button type="button" aria-label="Increase" onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

/* --------------------------------- Header --------------------------------- */

function Header({ cartCount, wishCount, openSearch, openCart }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="main-bar container-fluid">
        <a className="logo" href="#index">
          <span className="logo-mark" aria-hidden="true">✦</span>
          <span className="logo-text">CHANTALLOW</span>
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
          <button className="icon-btn" aria-label="Search" onClick={openSearch}><SearchIcon /></button>
          <button className="icon-btn" aria-label="Wishlist" onClick={() => openCart("wishlist")}>
            <HeartIcon />
            {wishCount > 0 && <span className="count-badge">{wishCount}</span>}
          </button>
          <button className="icon-btn" aria-label="Cart" onClick={() => openCart("cart")}>
            <CartIcon />
            {cartCount > 0 && <span className="count-badge">{cartCount}</span>}
          </button>
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

/* ------------------------- Cart / Wishlist offcanvas ---------------------- */

function CartWidget({ item, onQty, onRemove, showQty }) {
  return (
    <li>
      <div className="cart-widget">
        <div className="dz-media"><img src={item.img} alt={item.name} /></div>
        <div className="cart-content">
          <h6 className="title"><a href="#product">{item.name}</a></h6>
          <div className="cart-row">
            {showQty && <QtyInput small value={item.qty} onChange={(v) => onQty(item.id, v)} />}
            <h6 className="dz-price">${item.price.toFixed(2)}</h6>
          </div>
        </div>
        <button className="dz-close" aria-label="Remove" onClick={() => onRemove(item.id)}>&times;</button>
      </div>
    </li>
  );
}

function SidebarCart({ open, tab, setTab, onClose, cart, setCart, wishlist, setWishlist }) {
  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const progress = Math.min(100, Math.round((subtotal / 400) * 100)) || 75;

  const setQty = (id, qty) => setCart((c) => c.map((i) => (i.id === id ? { ...i, qty } : i)));
  const removeCart = (id) => setCart((c) => c.filter((i) => i.id !== id));
  const removeWish = (id) => setWishlist((w) => w.filter((i) => i.id !== id));

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
              {cart.map((item) => (
                <CartWidget key={item.id} item={item} showQty onQty={setQty} onRemove={removeCart} />
              ))}
              {cart.length === 0 && <li className="empty">Your cart is empty.</li>}
            </ul>
            <div className="cart-total-row">
              <h5>Subtotal:</h5>
              <h5>{subtotal.toFixed(2)}$</h5>
            </div>
            <div className="shipping-time">
              <div className="dz-icon"><ShippingIcon /></div>
              <div className="shipping-content">
                <h6>Congratulations, you've got free shipping!</h6>
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
            <a href="#checkout" className="btn btn-outline btn-block">Checkout</a>
            <a href="#cart" className="btn btn-solid btn-block">View Cart</a>
          </div>
        ) : (
          <div className="shop-sidebar-cart">
            <ul className="sidebar-cart-list">
              {wishlist.map((item) => (
                <CartWidget key={item.id} item={item} showQty={false} onRemove={removeWish} />
              ))}
              {wishlist.length === 0 && <li className="empty">Your wishlist is empty.</li>}
            </ul>
            <a href="#wishlist" className="btn btn-solid btn-block">Check Your Favourite</a>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------- Contact side panel --------------------------- */

function ContactSidebar() {
  return (
    <aside className="contact-sidebar" aria-hidden="true">
      <div className="contact-box">
        <div className="logo-contact"><span className="logo-mark">✦</span> CHANTALLOW</div>
        <p className="text">Beauty is the whisper of the universe, an intricate dance of stardust and dreams, igniting the cosmos with its silent allure.</p>
        <h4 className="dz-title">Contact Us</h4>
        <ul className="contact-address">
          <li>785 15h Street, Office 478 Berlin, De 81566</li>
          <li>Demo@gmail.com</li>
          <li>+1012 3456 789</li>
        </ul>
      </div>
    </aside>
  );
}

/* --------------------------------- Footer --------------------------------- */

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top container">
        <div className="footer-col about">
          <div className="footer-logo"><span className="logo-mark">✦</span> CHANTALLOW</div>
          <ul className="widget-address">
            <li><span>Address</span> : 000 Wall Street, UK, London</li>
            <li><span>E-mail</span> : example@info.com</li>
            <li><span>Phone</span> : (000) 000-0000</li>
          </ul>
          <div className="subscribe-widget">
            <h6>Subscribe To Our Newsletter</h6>
            <form className="subscribe" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your Email Address" required aria-label="Email" />
              <button type="submit" aria-label="Subscribe"><ArrowRight /></button>
            </form>
          </div>
        </div>

        <div className="footer-col">
          <h5 className="footer-title">Recent Posts</h5>
          <ul className="posts">
            {RECENT_POSTS.map((p) => (
              <li key={p.title}>
                <div className="dz-media"><img src={p.img} alt={p.title} /></div>
                <div className="dz-content">
                  <h6><a href="#post">{p.title}</a></h6>
                  <span className="time">{p.date}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h5 className="footer-title">Useful Links</h5>
          <ul className="links">
            {["Home", "About Us", "Returns", "Terms & Conditions", "Privacy-Policy", "Contact Us"].map((l) => (
              <li key={l}><a href="#link">{l}</a></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h5 className="footer-title">Social Media</h5>
          <ul className="links">
            {["Instagram", "Facebook", "YouTube", "Linkedin", "X.Com"].map((l) => (
              <li key={l}><a href="#social">{l}</a></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom container">
        <p className="copyright">© <span>2026</span> <a href="#index">Chantallow</a> Theme. All Rights Reserved.</p>
        <div className="accept">
          <span>We Accept:</span>
          <div className="cards">
            {["visa", "mc", "amex", "disc", "paypal", "maestro"].map((c) => (
              <span className={`card ${c}`} key={c} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------ Main component ---------------------------- */

export default function ChantallowCart() {
  const [cart, setCart] = useState(INITIAL_CART);
  const [sidebarCart, setSidebarCart] = useState(SIDEBAR_CART);
  const [wishlist, setWishlist] = useState(WISHLIST);

  const [searchOpen, setSearchOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState("cart");
  const [scrolled, setScrolled] = useState(false);

  const anyOpen = searchOpen || panelOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [anyOpen]);

  const openCartPanel = (tab) => { setPanelTab(tab); setPanelOpen(true); };
  const closeAll = () => { setSearchOpen(false); setPanelOpen(false); };

  const setQty = (id, qty) =>
    setCart((c) => c.map((i) => (i.id === id ? { ...i, qty } : i)));
  const removeItem = (id) => setCart((c) => c.filter((i) => i.id !== id));

  const total = useMemo(
    () => cart.reduce((s, i) => s + i.price * i.qty, 0),
    [cart]
  );

  return (
    <div className="page-wrapper">
      <StyleBlock />

      <Header
        cartCount={sidebarCart.length}
        wishCount={wishlist.length}
        openSearch={() => setSearchOpen(true)}
        openCart={openCartPanel}
      />

      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
      <SidebarCart
        open={panelOpen}
        tab={panelTab}
        setTab={setPanelTab}
        onClose={() => setPanelOpen(false)}
        cart={sidebarCart}
        setCart={setSidebarCart}
        wishlist={wishlist}
        setWishlist={setWishlist}
      />
      {anyOpen && <div className="offcanvas-backdrop" onClick={closeAll} />}

      <ContactSidebar />

      <main className="page-content">
        {/* Banner */}
        <section className="dz-banner">
          <div className="container banner-inner">
            <h1>Cart</h1>
            <nav className="breadcrumb">
              <a href="#cart">Cart</a>
              <span className="sep">◆</span>
              <span>Wish List</span>
            </nav>
          </div>
        </section>

        {/* Cart content */}
        <section className="content-inner">
          <div className="container cart-grid">
            {/* Cart table */}
            <div className="cart-main">
              <div className="table-responsive">
                <table className="check-tbl">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.id}>
                        <td className="col-img"><img src={item.img} alt={item.name} /></td>
                        <td className="col-name">
                          <span className="p-name">{item.name}</span>
                          <ul className="product-item-list">
                            {item.meta.map((m) => <li key={m}>{m}</li>)}
                          </ul>
                        </td>
                        <td className="col-price">${item.price.toFixed(2).padStart(5, "0")}</td>
                        <td className="col-qty">
                          <QtyInput value={item.qty} onChange={(v) => setQty(item.id, v)} />
                        </td>
                        <td className="col-total">${(item.price * item.qty).toFixed(2).padStart(5, "0")}</td>
                        <td className="col-close">
                          <button className="trash-btn" aria-label={`Remove ${item.name}`} onClick={() => removeItem(item.id)}>
                            <TrashIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {cart.length === 0 && (
                      <tr><td colSpan={6} className="empty-row">Your cart is empty.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="shop-form">
                <form className="coupon-group" onSubmit={(e) => e.preventDefault()}>
                  <input type="text" placeholder="Coupon Code" aria-label="Coupon code" />
                  <button type="submit" className="btn coupon">Apply Coupon</button>
                </form>
                <button className="btn btn-outline btn-lg update-cart">UPDATE CART</button>
              </div>
            </div>

            {/* Cart total */}
            <aside className="cart-side">
              <h4 className="title">Cart Total</h4>
              <div className="cart-detail">
                <button className="btn btn-outline btn-lg w-100 offer">Bank Offer 0% Cashback</button>

                <div className="icon-bx-wraper">
                  <div className="icon-bx"><ShippingIcon /></div>
                  <div className="icon-content">
                    <span className="tag">FREE</span>
                    <h6>Shipping</h6>
                  </div>
                </div>

                <div className="icon-bx-wraper">
                  <div className="icon-bx product-box" aria-hidden="true">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                      <path d="M21 8l-9-5-9 5 9 5 9-5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                      <path d="M3 8v8l9 5 9-5V8" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                      <path d="M12 13v8" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  </div>
                  <div className="icon-content">
                    <h6>Enjoy The Product</h6>
                    <p>Lorem Ipsum is simply dummy text of the printing and typesetting</p>
                  </div>
                </div>

                <div className="save-text">
                  <CheckCircle />
                  <span>You will save $000 on this order</span>
                </div>

                <table className="total-table">
                  <tbody>
                    <tr>
                      <td><h6 className="title mb-0">Total Amount</h6></td>
                      <td className="price">${(125.75 + total).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                <a href="#checkout" className="btn btn-outline btn-lg w-100">PLACE ORDER</a>
              </div>
            </aside>
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

/* ------------------------------- Styles ----------------------------------- */

function StyleBlock() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Cormorant+Garamond:wght@400;500;600&family=Roboto:wght@300;400;500;700&display=swap');

      .page-wrapper *{box-sizing:border-box;}
      .page-wrapper{
        --sage:#e8f0e9;--sage-deep:#3a5245;--ink:#1f2a24;--muted:#7b877f;
        --line:#d7e0d8;--white:#fff;--accent:#3a5245;
        font-family:'DM Sans',sans-serif;color:var(--ink);background:var(--sage);
        margin:0;line-height:1.6;-webkit-font-smoothing:antialiased;
      }
      .page-wrapper a{color:inherit;text-decoration:none;}
      .page-wrapper img{max-width:100%;display:block;}
      .page-wrapper h1,.page-wrapper h4,.page-wrapper h5,.page-wrapper h6{margin:0;}
      .container{max-width:1240px;margin:0 auto;padding:0 24px;width:100%;}
      .container-fluid{max-width:1400px;margin:0 auto;padding:0 32px;width:100%;}
      .mb-0{margin-bottom:0!important;}

      /* Header */
      .site-header{background:var(--sage);position:sticky;top:0;z-index:40;}
      .main-bar{display:flex;align-items:center;gap:24px;padding:20px 32px;flex-wrap:wrap;}
      .logo{display:flex;align-items:center;gap:10px;margin-right:auto;}
      .logo-mark{font-size:22px;color:var(--sage-deep);}
      .logo-text{font-family:'Cormorant Garamond',serif;font-size:22px;letter-spacing:3px;font-weight:600;color:var(--ink);}
      .header-nav .nav{display:flex;gap:34px;list-style:none;margin:0;padding:0;}
      .header-nav .nav a{font-size:15px;font-weight:500;color:var(--ink);}
      .nav-plus{color:var(--muted);font-weight:400;}
      .header-right{display:flex;align-items:center;gap:22px;margin-left:24px;}
      .login-link{font-size:13px;line-height:1.3;text-align:right;text-decoration:underline;}
      .icon-btn{background:none;border:none;cursor:pointer;color:var(--ink);position:relative;padding:4px;display:flex;}
      .count-badge{position:absolute;top:-6px;right:-8px;background:var(--sage-deep);color:#fff;
        font-size:10px;min-width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;padding:0 3px;}
      .navbar-toggler{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:6px;}
      .navbar-toggler span{width:24px;height:2px;background:var(--ink);transition:.3s;}

      /* Banner */
      .dz-banner{
        background:linear-gradient(160deg,#4d6555,#243329);color:#fff;text-align:center;
        padding:110px 0 130px;position:relative;overflow:hidden;
      }
      .dz-banner:before{content:"";position:absolute;inset:0;
        background:radial-gradient(120% 90% at 50% 130%, rgba(255,255,255,.08), transparent 60%);}
      .banner-inner{position:relative;}
      .dz-banner h1{font-family:'Cormorant Garamond',serif;font-size:88px;font-weight:500;line-height:1;}
      .breadcrumb{display:flex;gap:12px;justify-content:center;align-items:center;margin-top:20px;font-size:15px;}
      .breadcrumb .sep{color:#bcd0c0;font-size:9px;}

      /* Cart layout */
      .content-inner{padding:70px 0 90px;}
      .cart-grid{display:grid;grid-template-columns:1fr 360px;gap:40px;align-items:start;}
      .table-responsive{overflow-x:auto;}
      .check-tbl{width:100%;border-collapse:collapse;}
      .check-tbl thead th{
        text-align:left;font-size:15px;font-weight:700;padding:0 12px 22px;
        border-bottom:1px solid var(--line);color:var(--ink);
      }
      .check-tbl tbody td{padding:26px 12px;border-bottom:1px solid var(--line);vertical-align:middle;}
      .col-img img{width:96px;height:110px;object-fit:cover;border-radius:4px;background:#fff;}
      .p-name{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:500;display:block;margin-bottom:8px;}
      .product-item-list{list-style:none;margin:0;padding:0;color:var(--muted);font-size:13px;line-height:1.7;}
      .col-price,.col-total{font-size:16px;font-weight:500;white-space:nowrap;}
      .trash-btn{background:var(--sage-deep);color:#fff;border:none;border-radius:6px;
        width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.2s;}
      .trash-btn:hover{background:#2c3f34;}
      .empty-row,.empty{text-align:center;color:var(--muted);padding:40px 0;font-size:15px;}

      /* Quantity control */
      .btn-quantity{display:inline-flex;align-items:center;border-radius:4px;overflow:hidden;}
      .btn-quantity button{width:34px;height:34px;border:none;background:var(--sage-deep);color:#fff;
        font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;}
      .btn-quantity button:hover{background:#2c3f34;}
      .btn-quantity input{width:40px;height:34px;border:1px solid var(--line);border-left:none;border-right:none;
        text-align:center;font-size:14px;background:#fff;color:var(--ink);}
      .btn-quantity.quantity-sm button{width:28px;height:28px;font-size:15px;}
      .btn-quantity.quantity-sm input{width:32px;height:28px;}

      /* Coupon row */
      .shop-form{display:flex;justify-content:space-between;align-items:center;gap:24px;margin-top:34px;flex-wrap:wrap;}
      .coupon-group{display:flex;flex:1;min-width:280px;max-width:420px;border:1px solid var(--line);border-radius:6px;overflow:hidden;background:#fff;}
      .coupon-group input{flex:1;border:none;padding:0 18px;font-size:14px;background:transparent;color:var(--ink);}
      .coupon-group input:focus{outline:none;}
      .btn.coupon{background:none;border:none;color:var(--sage-deep);font-weight:700;padding:0 22px;cursor:pointer;white-space:nowrap;}

      /* Buttons */
      .btn{display:inline-flex;align-items:center;justify-content:center;font-weight:600;cursor:pointer;
        border-radius:6px;font-size:14px;letter-spacing:.5px;transition:.2s;text-align:center;}
      .btn-lg{padding:15px 28px;}
      .btn-outline{border:1px solid var(--sage-deep);background:transparent;color:var(--sage-deep);}
      .btn-outline:hover{background:var(--sage-deep);color:#fff;}
      .btn-solid{background:var(--sage-deep);color:#fff;border:1px solid var(--sage-deep);}
      .btn-solid:hover{background:#2c3f34;}
      .btn-block{width:100%;padding:14px;margin-top:12px;}
      .w-100{width:100%;}

      /* Cart total card */
      .cart-side .title{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:600;margin-bottom:18px;}
      .cart-detail{border:1px solid var(--line);border-radius:8px;padding:26px;background:transparent;}
      .cart-detail .offer{margin-bottom:20px;}
      .icon-bx-wraper{display:flex;align-items:center;gap:16px;border:1px solid var(--line);border-radius:8px;padding:16px;margin-bottom:16px;background:#fff;}
      .icon-bx{color:var(--sage-deep);flex-shrink:0;}
      .icon-content .tag{font-size:12px;color:var(--muted);display:block;}
      .icon-content h6{font-size:17px;font-weight:600;}
      .icon-content p{font-size:13px;color:var(--muted);margin:4px 0 0;}
      .save-text{display:flex;align-items:center;gap:10px;color:var(--sage-deep);font-size:14px;margin:20px 0;}
      .total-table{width:100%;border-collapse:collapse;margin-bottom:22px;}
      .total-table td{padding:12px 0;border-top:1px solid var(--line);}
      .total-table .price{text-align:right;font-size:20px;font-weight:700;color:var(--sage-deep);}
      .total-table .title{font-size:16px;}

      /* Offcanvas */
      .offcanvas-backdrop{position:fixed;inset:0;background:rgba(20,30,24,.4);z-index:60;}
      .offcanvas{position:fixed;background:#f4faf5;z-index:70;transition:transform .35s ease;box-shadow:0 10px 40px rgba(0,0,0,.15);}
      .offcanvas .btn-close{position:absolute;top:16px;right:20px;background:none;border:none;font-size:28px;cursor:pointer;color:var(--ink);line-height:1;z-index:2;}
      .offcanvas-top{top:0;left:0;right:0;transform:translateY(-100%);padding:56px 0 40px;max-height:90vh;overflow:auto;}
      .offcanvas-top.show{transform:translateY(0);}
      .offcanvas-end{top:0;right:0;height:100%;width:400px;max-width:90vw;transform:translateX(100%);}
      .offcanvas-end.show{transform:translateX(0);}

      /* Search panel */
      .header-item-search .search-input{display:flex;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:#fff;margin-bottom:16px;}
      .default-select{border:none;border-right:1px solid var(--line);padding:0 16px;background:#fff;font-size:14px;color:var(--ink);max-width:180px;}
      .search-input input{flex:1;border:none;padding:14px 16px;font-size:15px;}
      .search-input input:focus,.default-select:focus{outline:none;}
      .search-go{border:none;background:none;padding:0 18px;cursor:pointer;color:var(--ink);}
      .recent-tag{display:flex;flex-wrap:wrap;gap:14px;list-style:none;padding:0;margin:0 0 30px;font-size:14px;}
      .recent-tag .label{color:var(--ink);font-weight:600;}
      .recent-tag a{color:var(--muted);}
      .recent-tag a:hover{color:var(--sage-deep);}
      .header-title{font-family:'Cormorant Garamond',serif;font-size:22px;margin-bottom:16px;}
      .you-may-like{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}
      .shop-card{text-align:center;}
      .shop-card .dz-media img{width:100%;height:150px;object-fit:cover;border-radius:8px;background:#fff;}
      .shop-card .title{font-size:15px;font-weight:600;margin:10px 0 4px;}
      .shop-card .price{color:var(--sage-deep);font-size:15px;}

      /* Sidebar cart */
      .offcanvas-body{padding:56px 24px 24px;height:100%;overflow:auto;}
      .dz-tabs{display:flex;list-style:none;padding:0;margin:0 0 20px;border-bottom:1px solid var(--line);}
      .dz-tabs li{flex:1;}
      .dz-tabs button{width:100%;background:none;border:none;padding:14px 4px;font-size:15px;font-weight:600;
        color:var(--muted);cursor:pointer;border-bottom:2px solid transparent;}
      .dz-tabs button.active{color:var(--ink);border-color:var(--sage-deep);}
      .dz-tabs .badge{background:var(--sage-deep);color:#fff;font-size:11px;border-radius:20px;padding:2px 8px;margin-left:6px;}
      .sidebar-cart-list{list-style:none;padding:0;margin:0;}
      .cart-widget{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid var(--line);position:relative;}
      .cart-widget .dz-media img{width:64px;height:64px;object-fit:cover;border-radius:6px;background:#fff;}
      .cart-content{flex:1;}
      .cart-content .title{font-size:15px;font-weight:600;margin-bottom:8px;}
      .cart-row{display:flex;align-items:center;gap:14px;}
      .dz-price{color:var(--sage-deep);font-size:15px;font-weight:600;}
      .dz-close{position:absolute;top:14px;right:0;background:none;border:none;font-size:18px;color:var(--muted);cursor:pointer;line-height:1;}
      .dz-close:hover{color:var(--sage-deep);}
      .cart-total-row{display:flex;justify-content:space-between;padding:18px 0;border-bottom:1px solid var(--line);}
      .shipping-time{display:flex;gap:14px;align-items:center;margin:20px 0;}
      .shipping-time .dz-icon{color:var(--sage-deep);flex-shrink:0;}
      .shipping-content h6{font-size:14px;font-weight:600;margin-bottom:8px;}
      .progress{height:6px;background:var(--line);border-radius:20px;overflow:hidden;}
      .progress-bar{height:100%;background:var(--sage-deep);border-radius:20px;transition:width .4s;}

      /* Contact sidebar (hidden panel, kept for parity) */
      .contact-sidebar{display:none;}

      /* Footer */
      .site-footer{background:#fff;padding-top:70px;}
      .footer-top{display:grid;grid-template-columns:1.4fr 1.2fr 1fr 1fr;gap:40px;padding-bottom:50px;}
      .footer-logo,.logo-contact{display:flex;align-items:center;gap:8px;font-family:'Cormorant Garamond',serif;
        font-size:20px;letter-spacing:2px;font-weight:600;margin-bottom:22px;}
      .widget-address{list-style:none;padding:0;margin:0 0 26px;font-size:14px;color:var(--muted);line-height:2.2;}
      .widget-address span{color:var(--ink);font-weight:600;}
      .subscribe-widget h6{font-size:15px;font-weight:600;margin-bottom:14px;}
      .subscribe{display:flex;border-bottom:1px solid var(--line);}
      .subscribe input{flex:1;border:none;padding:10px 0;font-size:14px;background:transparent;}
      .subscribe input:focus{outline:none;}
      .subscribe button{background:none;border:none;cursor:pointer;color:var(--ink);padding:0 6px;}
      .footer-title{font-size:18px;font-weight:700;margin-bottom:22px;}
      .footer-col .links,.footer-col .posts{list-style:none;padding:0;margin:0;}
      .footer-col .links li{margin-bottom:14px;}
      .footer-col .links a{font-size:14px;color:var(--muted);}
      .footer-col .links a:hover{color:var(--sage-deep);}
      .posts li{display:flex;gap:14px;margin-bottom:18px;align-items:center;}
      .posts .dz-media img{width:54px;height:54px;object-fit:cover;border-radius:8px;background:var(--sage);}
      .posts h6{font-size:14px;font-weight:600;}
      .posts .time{font-size:12px;color:var(--muted);}
      .footer-bottom{display:flex;justify-content:space-between;align-items:center;gap:20px;
        padding:24px;border-top:1px solid var(--line);flex-wrap:wrap;}
      .copyright{font-size:14px;color:var(--muted);margin:0;}
      .copyright span,.copyright a{color:var(--sage-deep);}
      .accept{display:flex;align-items:center;gap:12px;font-size:14px;color:var(--muted);}
      .accept .cards{display:flex;gap:6px;}
      .accept .card{width:34px;height:22px;border-radius:3px;background:#e3e9e4;display:inline-block;}
      .accept .card.visa{background:#1a1f71;}
      .accept .card.mc{background:#eb611f;}
      .accept .card.amex{background:#2e77bb;}
      .accept .card.disc{background:#f2f2f2;border:1px solid var(--line);}
      .accept .card.paypal{background:#003087;}
      .accept .card.maestro{background:#cc2131;}

      /* Scroll to top */
      .scroltop{position:fixed;right:22px;bottom:22px;width:42px;height:42px;border-radius:8px;
        background:var(--sage-deep);color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
        opacity:0;pointer-events:none;transform:translateY(10px);transition:.3s;z-index:50;}
      .scroltop.show{opacity:1;pointer-events:auto;transform:translateY(0);}

      /* Focus visibility */
      .page-wrapper a:focus-visible,.page-wrapper button:focus-visible,
      .page-wrapper input:focus-visible,.page-wrapper select:focus-visible{
        outline:2px solid var(--sage-deep);outline-offset:2px;}

      @media (max-width:1024px){
        .cart-grid{grid-template-columns:1fr;}
        .cart-side{max-width:420px;}
        .footer-top{grid-template-columns:1fr 1fr;}
        .you-may-like{grid-template-columns:repeat(3,1fr);}
      }
      @media (max-width:880px){
        .navbar-toggler{display:flex;order:3;}
        .header-nav{flex-basis:100%;order:4;max-height:0;overflow:hidden;transition:max-height .3s;}
        .header-nav.show{max-height:400px;margin-top:12px;}
        .header-nav .nav{flex-direction:column;gap:14px;}
        .header-right{margin-left:auto;}
        .dz-banner h1{font-size:60px;}
      }
      @media (max-width:640px){
        .you-may-like{grid-template-columns:repeat(2,1fr);}
        .footer-top{grid-template-columns:1fr;}
        .footer-bottom{flex-direction:column;text-align:center;}
        .offcanvas-end{width:100%;}
        .check-tbl thead{display:none;}
        .check-tbl,.check-tbl tbody,.check-tbl tr,.check-tbl td{display:block;width:100%;}
        .check-tbl tr{border:1px solid var(--line);border-radius:8px;margin-bottom:16px;padding:12px;position:relative;}
        .check-tbl td{border:none;padding:8px 0;}
        .col-close{position:absolute;top:12px;right:12px;}
        .dz-banner h1{font-size:48px;}
      }
    `}</style>
  );
}