import React, { useState } from "react";
import "./FurkindPetTallow.css";

const relatedProducts = [
  { name: "Obsidian Infusion", subtitle: "CACAO INFUSED TALLOW", price: "$00", old: "$00" },
  { name: "Malachite Fusion", subtitle: "MORINGA-BUTTERFLY PEA INFUSED TALLOW", price: "$00", old: "$00" },
  { name: "Amethyst Relief", subtitle: "LEVENDER WHIPPED TALLOW", price: "$00", old: "$00" },
  { name: "Amber Glow", subtitle: "TALLOW MANUKA -LAVENDER INFUSED TALLOW", price: "$00", old: "$00" },
];

const recentPosts = [
  { title: "Hydrated Supple Skin", date: "July 23, 2023" },
  { title: "Glowing Radiant Skin", date: "July 23, 2023" },
  { title: "Silky Soft Skin", date: "July 23, 2023" },
];

const usefulLinks = ["Home", "About Us", "Returns", "Terms & Conditions", "Privacy-Policy", "Contact Us"];
const socialLinks = ["Instagram", "Facebook", "YouTube", "Linkedin", "X.Com"];

export default function FurkindPetTallow() {
  const [size, setSize] = useState("4oz");
  const [qty, setQty] = useState(1);

  const dec = () => setQty((q) => (q > 1 ? q - 1 : 1));
  const inc = () => setQty((q) => q + 1);

  return (
    <div className="fpt">
      {/* ===== Header ===== */}
      <header className="fpt-header">
        <div className="fpt-header-inner">
          <a className="fpt-logo" href="#">
            <span className="fpt-logo-mark">
              <svg viewBox="0 0 48 48" width="34" height="34" aria-hidden="true">
                <ellipse cx="24" cy="26" rx="9" ry="11" fill="none" stroke="#7d8a6a" strokeWidth="1.3" />
                <path d="M9 15c-2 5 2 10 6 11M39 15c2 5-2 10-6 11" fill="none" stroke="#7d8a6a" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M24 14v-6" stroke="#7d8a6a" strokeWidth="1.3" />
                <circle cx="20.5" cy="24" r="1.1" fill="#7d8a6a" />
                <circle cx="27.5" cy="24" r="1.1" fill="#7d8a6a" />
              </svg>
            </span>
            <span className="fpt-logo-text">CHANTALLOW</span>
          </a>

          <nav className="fpt-nav" aria-label="Primary">
            <a href="#">Home <span className="plus">✦</span></a>
            <a href="#">About Us <span className="plus">✦</span></a>
            <a href="#">Shop <span className="plus">✦</span></a>
            <a href="#">Blog <span className="plus">✦</span></a>
            <a href="#">Contact US <span className="plus">✦</span></a>
          </nav>

          <div className="fpt-header-right">
            <a className="fpt-login" href="#">Login /<br />Register</a>
            <button className="icon-btn" aria-label="Search">
              <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" /><line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="1.6" /></svg>
            </button>
            <button className="icon-btn" aria-label="Wishlist">
              <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.5 12 20 12 20z" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
            </button>
            <button className="icon-btn" aria-label="Cart">
              <svg viewBox="0 0 24 24" width="20" height="20"><path d="M6 6h15l-1.5 9h-12z" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="9" cy="20" r="1.4" fill="currentColor" /><circle cx="18" cy="20" r="1.4" fill="currentColor" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* ===== Banner ===== */}
      <section className="fpt-banner">
        <h1 className="fpt-banner-title">Furkind Pet Tallow</h1>
        <div className="fpt-crumb">
          <a href="#">Home</a>
          <span className="dot">◆</span>
          <span>Furkind Pet Tallow</span>
        </div>
      </section>

      {/* ===== Product ===== */}
      <section className="fpt-product">
        {/* Left: gallery */}
        <div className="fpt-gallery">
          <div className="fpt-main-img">
            <div className="jar">
              <div className="jar-lid" />
              <div className="jar-body">
                <span className="jar-brand">CHANTALLOW</span>
                <span className="jar-face">
                  <svg viewBox="0 0 40 40" width="46" height="46"><ellipse cx="20" cy="23" rx="7" ry="8" fill="none" stroke="#7a6a55" strokeWidth="1" /><path d="M10 14c-1 3 1 6 3 6M30 14c1 3-1 6-3 6" fill="none" stroke="#7a6a55" strokeWidth="1" /><circle cx="17" cy="22" r="1" fill="#7a6a55" /><circle cx="23" cy="22" r="1" fill="#7a6a55" /></svg>
                </span>
              </div>
              <div className="jar-thumbs">
                <span /><span /><span />
              </div>
            </div>
          </div>
        </div>

        {/* Middle: details */}
        <div className="fpt-info">
          <span className="fpt-sale">SALE 10% OFF</span>
          <h2 className="fpt-title">Furkind Pet Tallow</h2>
          <p className="fpt-subtitle">Grass-Fed/Grass-Finished Beef Tallow, Organic Raw Unrefined Coconut Oil</p>

          <div className="fpt-rating">
            <span className="stars">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={i <= 3 ? "star filled" : "star"}>★</span>
              ))}
            </span>
            <strong>4.7 Rating</strong>
            <span className="muted">(5 customer reviews)</span>
          </div>

          <h4 className="fpt-h">Description:</h4>
          <p className="fpt-desc">
            Our nutrient-rich Pet Balm combines the nourishing power of grass-fed, grass-finished beef
            tallow with organic raw unrefined coconut oil to help soothe, protect, and restore dry, rough,
            or irritated skin and paws. Beef tallow is a natural source of Vitamin A, which supports skin
            renewal and healthy tissue maintenance; Vitamin D, which helps support skin barrier function;
            Vitamin E, a powerful antioxidant that helps protect against environmental stressors and supports
            moisture retention; and Vitamin K, which contributes to overall skin health. The naturally
            occurring fatty acids in tallow closely resemble the oils found in healthy skin, making it highly
            absorbable and deeply moisturizing. Organic raw unrefined coconut oil provides additional
            hydration and contains lauric acid, caprylic acid, and capric acid, which help condition the skin
            and support a clean, healthy environment on your pet’s skin surface. Together, these ingredients
            help soften rough paws, reduce dryness and cracking, calm irritation, and create a protective
            moisture barrier to keep your pet's skin and paws healthy, smooth, and comfortable.
          </p>

          <h4 className="fpt-h">Ingredients:</h4>
          <p className="fpt-desc">Grass-Fed/Grass-Finished Beef Tallow, Organic Raw Unrefined Coconut Oil</p>

          <h4 className="fpt-h">Directions:</h4>
          <p className="fpt-desc">
            Using clean fingertips, apply a small amount of balm directly to your pet's paws, nose, elbows,
            or other areas of dry or irritated skin. Gently massage until absorbed. Use daily for routine
            maintenance or as needed to provide extra hydration and protection. For best results, apply after
            outdoor activities, bathing, or whenever skin appears dry. For external use only. Perform a patch
            test before first use. Store in a cool, dry place away from direct sunlight.{" "}
            <strong>Use within 12 months of opening.</strong>
          </p>

          <hr className="fpt-rule" />

          <h4 className="fpt-h">Select Size</h4>
          <div className="fpt-sizes">
            <label className="fpt-radio">
              <input type="radio" name="size" checked={size === "4oz"} onChange={() => setSize("4oz")} />
              <span>4 .Oz</span>
            </label>
            <label className="fpt-radio">
              <input type="radio" name="size" checked={size === "1.7oz"} onChange={() => setSize("1.7oz")} />
              <span>1.7 .Oz</span>
            </label>
          </div>

          <h4 className="fpt-h">Price</h4>
          <p className="fpt-price">
            $00.00 <span className="fpt-price-old">$00.00</span>
          </p>

          <h4 className="fpt-h">Quantity</h4>
          <div className="fpt-qty">
            <button onClick={dec} aria-label="Decrease">−</button>
            <input type="text" value={qty} readOnly />
            <button onClick={inc} aria-label="Increase">+</button>
          </div>

          <div className="fpt-actions">
            <button className="btn-dark">ADD TO CART</button>
            <button className="btn-outline">
              <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.5 12 20 12 20z" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
              Add To Wishlist
            </button>
          </div>

          <hr className="fpt-rule" />

          <p className="fpt-sku"><strong>SKU:</strong> PRT584E63A</p>

          <div className="fpt-share">
            <strong>Share:</strong>
            <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M14 8h2V5h-2c-2 0-3 1-3 3v2H9v3h2v6h3v-6h2l1-3h-3V8c0-.5.3-1 1-1z" fill="currentColor" /></svg></a>
            <a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 9v9H4V9h2zM5 4a1.2 1.2 0 1 0 0 2.4A1.2 1.2 0 0 0 5 4zm4 5h2v1.3c.5-.9 1.5-1.5 2.7-1.5 2 0 3.3 1.3 3.3 3.7V18h-2v-4.9c0-1.2-.5-2-1.6-2s-1.7.8-1.7 2V18H9V9z" fill="currentColor" /></svg></a>
            <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" width="16" height="16"><rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="17" cy="7" r="1" fill="currentColor" /></svg></a>
            <a href="#" aria-label="X"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.6" /></svg></a>
          </div>

          <p className="fpt-tagline">Non-toxic. Handmade. Nourishing.</p>

          <div className="fpt-badges">
            <span className="badge" aria-label="Recyclable"><svg viewBox="0 0 24 24" width="26" height="26"><path d="M7 8l2-3 2 3M17 10l1 3-3 1M7 16l-2-3 3-1" fill="none" stroke="#4c4c4c" strokeWidth="1.4" strokeLinecap="round" /></svg></span>
            <span className="badge" aria-label="Natural"><svg viewBox="0 0 24 24" width="26" height="26"><circle cx="12" cy="12" r="9" fill="none" stroke="#4c4c4c" strokeWidth="1" /><path d="M12 8c-2 2-2 5 0 7 2-2 2-5 0-7z" fill="none" stroke="#4c4c4c" strokeWidth="1.2" /></svg></span>
            <span className="badge" aria-label="Handmade"><svg viewBox="0 0 24 24" width="26" height="26"><circle cx="12" cy="12" r="9" fill="none" stroke="#4c4c4c" strokeWidth="1" /><path d="M8 13c1-2 3-3 4-1s3 1 4-1" fill="none" stroke="#4c4c4c" strokeWidth="1.2" /></svg></span>
          </div>

          <p className="fpt-exempt">
            Made by a manufacturer exempt from Florida's cosmetic manufacturing permit requirements.
          </p>
        </div>

        {/* Right: purchase card */}
        <aside className="fpt-buybox">
          <div className="buy-card">
            <div className="buy-row buy-offer">Bank Offer 5% Cashback</div>

            <div className="buy-row buy-feature">
              <span className="buy-ico">
                <svg viewBox="0 0 24 24" width="24" height="24"><path d="M3 15h18l-2 4H5zM6 15V8h9l4 4v3M9 8V5h3v3" fill="none" stroke="#5a5a5a" strokeWidth="1.3" /></svg>
              </span>
              <span><strong>Easy Returns</strong><br />30 Days</span>
            </div>

            <div className="buy-row buy-feature">
              <span className="buy-ico">
                <svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 3l8 4v8l-8 4-8-4V7z" fill="none" stroke="#5a5a5a" strokeWidth="1.3" /><path d="M4 7l8 4 8-4M12 11v9" fill="none" stroke="#5a5a5a" strokeWidth="1.3" /></svg>
              </span>
              <span><strong>Enjoy The Product</strong><br />
                <span className="muted">Lorem Ipsum is simply dummy text of the printing and typesetting</span>
              </span>
            </div>

            <p className="buy-save">
              <span className="check">◎</span> You will save ₹504 on this order
            </p>

            <div className="buy-total">
              <span>Total</span>
              <strong>$125.75</strong>
            </div>

            <button className="btn-outline full">
              <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.5 12 20 12 20z" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
              Add To Wishlist
            </button>
            <button className="btn-dark full">ADD TO CART</button>
          </div>
        </aside>

        {/* Vertical social rail */}
        <div className="fpt-social-rail">
          <span>INSTAGRAM</span>
          <span>FACEBOOK</span>
          <span>TWITTER</span>
        </div>
      </section>

      {/* ===== Related products ===== */}
      <section className="fpt-related">
        <div className="related-head">
          <h3>Related Products</h3>
          <a href="#" className="see-all">See all products <span>›</span></a>
        </div>

        <div className="related-grid">
          {relatedProducts.map((p, i) => (
            <div className="rel-card" key={i}>
              <button className="rel-wish" aria-label="Wishlist">
                <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.5 12 20 12 20z" fill="none" stroke="#9aa79a" strokeWidth="1.6" /></svg>
              </button>
              <div className="rel-img">
                <div className="jar sm">
                  <div className="jar-lid" />
                  <div className="jar-body">
                    <span className="jar-brand">CHANTALLOW</span>
                    <span className="jar-face">
                      <svg viewBox="0 0 40 40" width="30" height="30"><ellipse cx="20" cy="23" rx="7" ry="8" fill="none" stroke="#7a6a55" strokeWidth="1" /><path d="M10 14c-1 3 1 6 3 6M30 14c1 3-1 6-3 6" fill="none" stroke="#7a6a55" strokeWidth="1" /></svg>
                    </span>
                    <span className="jar-sub">{p.name}</span>
                    <span className="jar-sub2">{p.subtitle}</span>
                  </div>
                </div>
              </div>
              <div className="rel-body">
                <h4>{p.name}</h4>
                <p className="rel-price">{p.price} <span>{p.old}</span></p>
                <button className="rel-cart" aria-label="Add to cart">
                  <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6h15l-1.5 9h-12z" fill="none" stroke="#fff" strokeWidth="1.6" /><circle cx="9" cy="20" r="1.3" fill="#fff" /><circle cx="18" cy="20" r="1.3" fill="#fff" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="fpt-footer">
        <div className="footer-grid">
          <div className="footer-col">
            <a className="fpt-logo dark" href="#">
              <span className="fpt-logo-mark">
                <svg viewBox="0 0 48 48" width="30" height="30"><ellipse cx="24" cy="26" rx="9" ry="11" fill="none" stroke="#7d8a6a" strokeWidth="1.3" /><path d="M9 15c-2 5 2 10 6 11M39 15c2 5-2 10-6 11" fill="none" stroke="#7d8a6a" strokeWidth="1.3" strokeLinecap="round" /></svg>
              </span>
              <span className="fpt-logo-text sm">CHANTALLOW</span>
            </a>
            <p className="foot-line"><strong>Address :</strong> 000 Wall Street, UK, London</p>
            <p className="foot-line"><strong>E-mail :</strong> example@info.com</p>
            <p className="foot-line"><strong>Phone :</strong> (000) 000-0000</p>
            <p className="foot-sub">Subscribe To Our Newsletter</p>
            <div className="newsletter">
              <input type="email" placeholder="Your Email Address" />
              <button aria-label="Subscribe">→</button>
            </div>
          </div>

          <div className="footer-col">
            <h5>Recent Posts</h5>
            {recentPosts.map((post, i) => (
              <div className="foot-post" key={i}>
                <span className="foot-thumb" />
                <span>
                  <strong>{post.title}</strong>
                  <small>{post.date}</small>
                </span>
              </div>
            ))}
          </div>

          <div className="footer-col">
            <h5>Useful Links</h5>
            <ul className="foot-links">
              {usefulLinks.map((l) => <li key={l}><a href="#">{l}</a></li>)}
            </ul>
          </div>

          <div className="footer-col">
            <h5>Social Media</h5>
            <ul className="foot-links">
              {socialLinks.map((l) => <li key={l}><a href="#">{l}</a></li>)}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 <span>Chantallow</span> Theme. All Rights Reserved.</p>
          <div className="pay">
            <span>We Accept :</span>
            <span className="pay-badge">VISA</span>
            <span className="pay-badge">●●</span>
            <span className="pay-badge">DISC</span>
            <span className="pay-badge">AMEX</span>
            <span className="pay-badge">MC</span>
          </div>
        </div>
      </footer>
    </div>
  );
}