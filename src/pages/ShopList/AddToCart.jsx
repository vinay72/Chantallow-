import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import "./AddToCart.css";
import cartBanner from "../../assets/background/bg1.jpg";
import shopcartimg1 from "../../assets/shop/shopcart/pic1.jpg";
import shopcartimg2 from "../../assets/shop/shopcart/pic2.jpg";
import shopcartimg3 from "../../assets/shop/shopcart/pic3.jpg";
import shopcartimg4 from "../../assets/shop/shopcart/pic4.jpg";
import shopcartimg5 from "../../assets/shop/shopcart/pic5.jpg";
import logo from "../../assets/logo.png";
import recentPost1 from "../../assets/shop/product/small/1.png";
import recentPost2 from "../../assets/shop/product/small/2.png";
import recentPost3 from "../../assets/shop/product/small/3.png";
import footerImg from "../../assets/footer/footer.png";

// ---- Static assets ----
// Anything under src/assets must be imported (as above) so the bundler
// resolves and hashes it correctly — a plain string path only works for
// files placed in /public.
const IMG = {
  logo,
  cartBanner,
  pic1: shopcartimg1,
  pic2: shopcartimg2,
  pic3: shopcartimg3,
  pic4: shopcartimg4,
  pic5: shopcartimg5,
  paymentIcons: footerImg,
};

// ---- Initial cart data ----
const INITIAL_ITEMS = [
  {
    id: 1,
    name: "Amber Glow",
    image: IMG.pic1,
    price: 25.0,
    qty: 1,
    attributes: ["Skin Type: Dry", "Item Form: Cream", "Used For: Dry skin"],
  },
  {
    id: 2,
    name: "Amethyst Relief",
    image: IMG.pic2,
    price: 18.5,
    qty: 1,
    attributes: ["Skin Type: Dry", "Item Form: Cream", "Used For: Fairness Cream"],
  },
  {
    id: 3,
    name: "Jasper Revive",
    image: IMG.pic3,
    price: 22.0,
    qty: 1,
    attributes: ["Skin Type: Dry", "Item Form: Cream", "Used For: Fairness Cream"],
  },
  {
    id: 4,
    name: "Malachite Fusion",
    image: IMG.pic4,
    price: 20.25,
    qty: 1,
    attributes: ["Skin Type: Dry", "Item Form: Serum", "Used For: Fairness Cream"],
  },
  {
    id: 5,
    name: "Obsidian Infusion",
    image: IMG.pic5,
    price: 19.0,
    qty: 1,
    attributes: ["Skin Type: Dry", "Item Form: Cream", "Used For: Fairness Cream"],
  },
  {
    id: 6,
    name: "Olivine Relief",
    image: IMG.pic5,
    price: 21.0,
    qty: 1,
    attributes: ["Skin Type: Dry", "Item Form: Cream", "Used For: Balm"],
  },
];

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "Shop", href: "/shop-list" },
  { label: "Blog", href: "/blog-category" },
  { label: "Contact US", href: "/contact-us" },
];

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

// ---- Icons ----
const Sparkle = () => (
  <svg className="sc-sparkle" width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
    <path
      d="M6 0c.35 3.05 2.95 5.65 6 6-3.05.35-5.65 2.95-6 6-.35-3.05-2.95-5.65-6-6 3.05-.35 5.65-2.95 6-6Z"
      fill="currentColor"
    />
  </svg>
);

const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.4" />
    <path d="M19.5 19.5 15.2 15.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const HeartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path
      d="M11 18.5S3.2 13.9 3.2 8.6a4.2 4.2 0 0 1 7.8-2.2 4.2 4.2 0 0 1 7.8 2.2c0 5.3-7.8 9.9-7.8 9.9Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path
      d="M4.2 6.2h13.6l-1.1 11a1.6 1.6 0 0 1-1.6 1.4H6.9a1.6 1.6 0 0 1-1.6-1.4l-1.1-11Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="M8.1 8.6V5.9a2.9 2.9 0 0 1 5.8 0v2.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M9.43 10.25 9.93 15.25M14.57 10.25 14.07 15.25M4.5 6h15M10 3h4a1.5 1.5 0 0 1 1.5 1.5V6h-7V4.5A1.5 1.5 0 0 1 10 3ZM5.5 6l.9 12.02A2.5 2.5 0 0 0 8.89 20.5h6.22a2.5 2.5 0 0 0 2.49-2.48L18.5 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ShippingIcon = () => (
  <svg width="34" height="34" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4.5 32.5c6-1 15-2 18-8 2-4 1-9-2-11-3-2-8-1-11 2-3 3-4 8-3 12l1 5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M4.5 32.5h34M9 32.5v3M15 32.5v3M21 32.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path
      d="M13 20l6-6 5 2-4 4M18 27l7-7 6 3-6 6"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EnjoyProductIcon = () => (
  <svg width="34" height="34" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.5 4.5 39 13.5v18L22.5 40.5 6 31.5v-18L22.5 4.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M6 13.5 22.5 22.5 39 13.5M22.5 22.5V40.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <circle cx="30" cy="30" r="6.5" fill="var(--sc-bg, #eaf3ec)" stroke="currentColor" strokeWidth="1.4" />
    <path d="m27.3 30 1.8 1.8 3.6-3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="m8.5 12.5 2.3 2.3L15.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Footer() {
  return (
    <footer style={{ background: "#FFFFFF", color: "#1C1C1A", padding: "72px 24px 24px", borderTop: "1px solid #F0EEE4" }}>
      <div
        style={{
          maxWidth: 1360,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: `repeat(${window.innerWidth > 900 ? 4 : window.innerWidth > 560 ? 2 : 1}, 1fr)`,
          gap: 40,
          marginBottom: 48,
          textAlign: "left",
        }}
      >
        <div>
          <div style={{ marginBottom: 24 }}>
            <img src={IMG.logo} alt="Chantallow" style={{ height: 40, width: "auto", display: "block" }} />
          </div>
          <p style={{ fontSize: 13.5, fontFamily: "Lufga", lineHeight: 2, color: "#5A5A52", margin: "0 0 6px" }}>
            <strong style={{ color: "#1C1C1A" }}>Address :</strong> 000 Wall Street, UK, London
          </p>
          <p style={{ fontSize: 13.5, fontFamily: "Lufga", lineHeight: 2, color: "#5A5A52", margin: "0 0 6px" }}>
            <strong style={{ color: "#1C1C1A" }}>E-mail :</strong> example@info.com
          </p>
          <p style={{ fontSize: 13.5, fontFamily: "Lufga", lineHeight: 2, color: "#5A5A52", margin: "0 0 24px" }}>
            <strong style={{ color: "#1C1C1A" }}>Phone :</strong> (000) 000-0000
          </p>
          <h6 style={{ fontSize: 14.5, fontWeight: 700, margin: "0 0 12px" }}>Subscribe To Our Newsletter</h6>
          <div style={{ display: "flex", background: "#EAF5EA", borderRadius: 30, overflow: "hidden" }}>
            <input
              type="email"
              placeholder="Your Email Address"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                padding: "14px 20px",
                color: "#1C1C1A",
                fontSize: 13.5,
                outline: "none",
              }}
            />
            <button
              aria-label="Subscribe"
              style={{
                background: "transparent",
                border: "none",
                width: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <ArrowRight size={18} color="#1C1C1A" />
            </button>
          </div>
        </div>

        <div>
          <h5 style={{ fontSize: 20, fontWeight: 700, color: "#1C1C1A", margin: "0 0 22px" }}>Recent Posts</h5>
          {[
            { title: "Hydrated Supple Skin", img: recentPost1 },
            { title: "Glowing Radiant Skin", img: recentPost2 },
            { title: "Silky Soft Skin", img: recentPost3 },
          ].map((t) => (
            <div key={t.title} style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 4,
                  background: "#F4F1E6",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                <img src={t.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              <div style={{ paddingTop: 6 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#1C1C1A", marginBottom: 6, fontFamily: "Lufga" }}>
                  {t.title}
                </div>
                <div style={{ fontSize: 14, color: "#9A9A90", fontFamily: "Lufga" }}>July 23, 2023</div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h5 style={{ fontSize: 20, fontWeight: 700, color: "#1C1C1A", margin: "0 0 22px" }}>Useful Links</h5>
          {[
            { label: "Home", path: "/" },
            { label: "About Us", path: "/aboutus" },
            { label: "Returns", path: "#" },
            { label: "Terms & Conditions", path: "/terms-and-conditions" },
            { label: "Privacy-Policy", path: "/privacy-policy" },
            { label: "Contact Us", path: "/contactus" },
          ].map((l) => (
            <Link
              key={l.label}
              to={l.path}
              className="ctw-underline-link"
              style={{
                display: "block",
                fontSize: 15,
                fontFamily: "Lufga, sans-serif",
                color: "#2D2E2F",
                transition: "all 0.8s ease",
                marginBottom: 14,
                textDecoration: "none",
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div>
          <h5 style={{ fontSize: 20, fontWeight: 700, color: "#1C1C1A", margin: "0 0 22px" }}>Social Media</h5>
          {/* {["Instagram", "Facebook", "YouTube", "Linkedin", "X.Com"].map((l) => (
            <a
              key={l}
              href="#home"
              className="ctw-underline-link"
              style={{ display: "block", fontSize: 14.5, color: "#3A3A36", marginBottom: 14, textDecoration: "none" }}
            >
              {l}
            </a>
          ))} */}
        </div>
      </div>

      <div
        style={{
          maxWidth: 1360,
          margin: "0 auto",
          paddingTop: 24,
          borderTop: "1px solid #F0EEE4",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          fontSize: 13.5,
          color: "#5A5A52",
        }}
      >
        <p style={{ fontFamily: "Lufga", margin: 0 }}>
          © 2026 <span style={{ color: "#41705B", fontWeight: 600 }}>Chantallow</span> Theme. All Rights Reserved.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>We Accept:</span>
          <img src={IMG.paymentIcons} alt="Accepted payment methods" style={{ height: 24, display: "block" }} />
        </div>
      </div>
    </footer>
  );
}

export default function AddToCart() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  const updateQty = (id, delta) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item))
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const applyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setCouponMessage("Enter a coupon code first.");
      return;
    }
    setCouponMessage(`"${couponCode}" applied.`);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const savings = items.length ? subtotal * 0.08 : 0;
  const total = subtotal - savings;

  return (
    <div className="sc-page">
      {/* Header */}
      <header className="sc-header">
        <div className="sc-header__bar">
          <a href="/" className="sc-logo">
            <img src={IMG.logo} alt="Chantallow" className="sc-logo__img" />
          </a>

          <nav className="sc-nav">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
                <Sparkle />
              </a>
            ))}
          </nav>

          <div className="sc-header__actions">
            <a href="/registration" className="sc-login-link">
              Login /<br />
              Register
            </a>
            <button className="sc-icon-btn" aria-label="Search">
              <SearchIcon />
            </button>
            <button className="sc-icon-btn" aria-label="Wishlist">
              <HeartIcon />
            </button>
            <button className="sc-icon-btn" aria-label="Cart">
              <CartIcon />
              {items.length > 0 && <span className="sc-badge">{items.length}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Banner — background image is passed to CSS as a custom property so the
          overlay/tint layers can sit on top of it */}
      <div className="sc-banner" style={{ "--sc-banner-img": `url(${IMG.cartBanner})` }}>
        <div className="sc-banner__inner">
          <h1>Cart</h1>
          <nav className="sc-breadcrumb" aria-label="breadcrumb">
            <span>Cart</span>
            <span className="sc-breadcrumb__sep">
              <Sparkle />
            </span>
            <span>Wish List</span>
          </nav>
        </div>
      </div>

      {/* Cart content */}
      <section className="sc-content">
        <div className="sc-content__grid">
          <div className="sc-cart-col">
            <div className="sc-table-wrap">
              <table className="sc-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th aria-label="Remove" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="sc-td-img">
                        <img src={item.image} alt={item.name} />
                      </td>
                      <td className="sc-td-name">
                        <span className="sc-item-title">{item.name}</span>
                        <ul className="sc-item-attrs">
                          {item.attributes.map((attr) => (
                            <li key={attr}>{attr}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="sc-td-price">{formatPrice(item.price)}</td>
                      <td className="sc-td-qty">
                        <div className="sc-quantity">
                          <button type="button" onClick={() => updateQty(item.id, -1)} aria-label={`Decrease quantity of ${item.name}`}>
                            &minus;
                          </button>
                          <input type="text" value={item.qty} readOnly aria-label={`Quantity of ${item.name}`} />
                          <button type="button" onClick={() => updateQty(item.id, 1)} aria-label={`Increase quantity of ${item.name}`}>
                            +
                          </button>
                        </div>
                      </td>
                      <td className="sc-td-subtotal">{formatPrice(item.price * item.qty)}</td>
                      <td className="sc-td-remove">
                        <button
                          type="button"
                          className="sc-remove-btn"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="sc-empty-row">
                        Your cart is empty.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="sc-cart-actions">
              <form className="sc-coupon" onSubmit={applyCoupon}>
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button type="submit">Apply Coupon</button>
              </form>
              {couponMessage && <p className="sc-coupon-msg">{couponMessage}</p>}

              <button type="button" className="sc-update-cart-btn">
                Update Cart
              </button>
            </div>
          </div>

          <aside className="sc-summary-col">
            <h4 className="sc-summary-title">Cart Total</h4>
            <div className="sc-summary-card">
              <button type="button" className="sc-bank-offer">
                Bank Offer 0% Cashback
              </button>

              <div className="sc-perk">
                <div className="sc-perk__icon">
                  <ShippingIcon />
                </div>
                <div>
                  <span className="sc-perk__eyebrow">Free</span>
                  <h6 className="sc-perk__title">Shipping</h6>
                </div>
              </div>

              <div className="sc-perk">
                <div className="sc-perk__icon">
                  <EnjoyProductIcon />
                </div>
                <div>
                  <h6 className="sc-perk__title">Enjoy The Product</h6>
                  <p className="sc-perk__desc">
                    Lorem Ipsum is simply dummy text of the printing and typesetting.
                  </p>
                </div>
              </div>

              <p className="sc-save-line">
                <CheckIcon />
                <span>You will save {formatPrice(savings)} on this order</span>
              </p>

              <div className="sc-total-row">
                <span>Total Amount</span>
                <span className="sc-total-amount">{formatPrice(total)}</span>
              </div>

              <button type="button" className="sc-place-order-btn" disabled={items.length === 0}>
                Place Order
              </button>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
}