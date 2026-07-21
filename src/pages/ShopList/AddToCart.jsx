import React, { useState } from "react";
import "./AddToCart.css";

// ---- Static assets (replace with your own image paths / imports) ----
const IMG = {
  logo: "images/logo.png",
  cartBanner: "images/background/bg1.jpg",
  pic1: "images/shop/shop-cart/pic1.jpg",
  pic2: "images/shop/shop-cart/pic2.jpg",
  pic3: "images/shop/shop-cart/pic3.jpg",
  pic5: "images/shop/shop-cart/pic5.jpg",
  enjoyIcon: "images/shop/shop-cart/icon-box/pic2.png",
  post1: "images/shop/product/small/1.png",
  post2: "images/shop/product/small/2.png",
  post3: "images/shop/product/small/3.png",
  paymentIcons: "images/footer-img.png",
};

// ---- Initial cart data (mirrors the products in the original template) ----
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
    image: IMG.pic1,
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

const RECENT_POSTS = [
  { id: 1, title: "Hydrated Supple Skin", date: "July 23, 2023", image: IMG.post1 },
  { id: 2, title: "Glowing Radiant Skin", date: "July 23, 2023", image: IMG.post2 },
  { id: 3, title: "Silky Soft Skin", date: "July 23, 2023", image: IMG.post3 },
];

const USEFUL_LINKS = ["Home", "About Us", "Returns", "Terms & Conditions", "Privacy Policy", "Contact Us"];
const SOCIAL_LINKS = ["Instagram", "Facebook", "YouTube", "Linkedin", "X.com"];

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

// ---- Small reusable icons (inline SVG, no external deps) ----
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M9.17 15.83a6.67 6.67 0 1 0 0-13.33 6.67 6.67 0 0 0 0 13.33Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17.5 17.5 13.88 13.88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M17.37 3.84a5 5 0 0 0-7.24 0l-.13.13-.13-.13a5 5 0 0 0-7.24 6.75l.88.88L10 17.7l6.5-6.5.88-.88a5 5 0 0 0 0-6.48Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="7.5" cy="17.5" r="0.83" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="16.67" cy="17.5" r="0.83" stroke="currentColor" strokeWidth="1.5" />
    <path d="M.83.83h3.34l2.23 11.16a1.67 1.67 0 0 0 1.66 1.34h8.1a1.67 1.67 0 0 0 1.67-1.34l1.33-6.99H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M9.43 10.25 9.93 15.25M14.57 10.25 14.07 15.25M4.5 6h15M10 3h4a1.5 1.5 0 0 1 1.5 1.5V6h-7V4.5A1.5 1.5 0 0 1 10 3ZM5.5 6l.9 12.02A2.5 2.5 0 0 0 8.89 20.5h6.22a2.5 2.5 0 0 0 2.49-2.48L18.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShippingIcon = () => (
  <svg width="34" height="34" viewBox="0 0 45 45" fill="none">
    <path d="M4 34c8-2 14-8 17-16M27 22c6-6 12-9 17-9M17 30c4-1 8-3 11-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="m8.5 12.5 2.3 2.3L15.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function AddToCart() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  const updateQty = (id, delta) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
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
  const savings = items.length ? subtotal * 0.08 : 0; // sample 8% savings, purely illustrative
  const total = subtotal - savings;

  return (
    <div className="sc-page">
      {/* Header */}
      <header className="sc-header">
        <div className="sc-header__bar">
          <a href="/" className="sc-logo">
            Chantallow
          </a>

          <nav className="sc-nav">
            <a href="/">Home</a>
            <a href="/about-us">About Us</a>
            <a href="/shop-list">Shop</a>
            <a href="/blog-category">Blog</a>
            <a href="/contact-us">Contact Us</a>
          </nav>

          <div className="sc-header__actions">
            <a href="/registration" className="sc-login-link">
              Login / Register
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

      {/* Banner */}
      <div className="sc-banner" style={{ backgroundImage: `url(${IMG.cartBanner})` }}>
        <div className="sc-banner__inner">
          <h1>Cart</h1>
          <nav className="sc-breadcrumb" aria-label="breadcrumb">
            <span>Cart</span>
            <span className="sc-breadcrumb__sep">&middot;</span>
            <span>Wish List</span>
          </nav>
        </div>
      </div>

      {/* Cart content */}
      <section className="sc-content">
        <div className="sc-content__grid">
          {/* Cart table */}
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
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, -1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            &minus;
                          </button>
                          <input type="text" value={item.qty} readOnly aria-label={`Quantity of ${item.name}`} />
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                          >
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

          {/* Cart total sidebar */}
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
                  <img src={IMG.enjoyIcon} alt="" />
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

      {/* Footer */}
      <footer className="sc-footer">
        <div className="sc-footer__top">
          <div className="sc-footer__col">
            <a href="/" className="sc-logo sc-logo--footer">
              Chantallow
            </a>
            <ul className="sc-address">
              <li>
                <span>Address</span> : 000 Wall Street, UK, London
              </li>
              <li>
                <span>E-mail</span> : example@info.com
              </li>
              <li>
                <span>Phone</span> : (000) 000-0000
              </li>
            </ul>
            <div className="sc-subscribe">
              <h6>Subscribe To Our Newsletter</h6>
              <form className="sc-subscribe__form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Your Email Address" required />
                <button type="submit" aria-label="Subscribe">
                  &rarr;
                </button>
              </form>
            </div>
          </div>

          <div className="sc-footer__col">
            <h5>Recent Posts</h5>
            <ul className="sc-posts">
              {RECENT_POSTS.map((post) => (
                <li key={post.id}>
                  <img src={post.image} alt={post.title} />
                  <div>
                    <h6>{post.title}</h6>
                    <span>{post.date}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="sc-footer__col">
            <h5>Useful Links</h5>
            <ul className="sc-links">
              {USEFUL_LINKS.map((link) => (
                <li key={link}>
                  <a href="/">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="sc-footer__col">
            <h5>Social Media</h5>
            <ul className="sc-links">
              {SOCIAL_LINKS.map((link) => (
                <li key={link}>
                  <a href="/">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="sc-footer__bottom">
          <p>
            &copy; <span>{new Date().getFullYear()}</span> Chantallow Theme. All Rights Reserved.
          </p>
          <div className="sc-payment">
            <span>We Accept:</span>
            <img src={IMG.paymentIcons} alt="Accepted payment methods" />
          </div>
        </div>
      </footer>
    </div>
  );
}