import React, { useState, useEffect, useRef } from "react";
import "./FurkindPetTallow.css";
import productMain from "../../assets/product1.png";
import thumb1 from "../../assets/products/product-detail2/1.png";
import thumb2 from "../../assets/products/product-detail2/2.png";
import thumb3 from "../../assets/products/product-detail2/3.png";
import sealRecycle from "../../assets/a.png";
import sealNatural from "../../assets/b.png";
import sealMadeWithLove from "../../assets/c.png";
import recentPost1 from "../../assets/shop/product/small/1.png";
import recentPost2 from "../../assets/shop/product/small/2.png";
import recentPost3 from "../../assets/shop/product/small/3.png";
import footerImg from "../../assets/footer/footer.png";

const GALLERY_IMAGES = [productMain, productMain, productMain];
const THUMBNAILS = [thumb1, thumb2, thumb3];

const RELATED_PRODUCTS = [
  { id: "jasper", name: "Jasper Revive", price: "$00", oldPrice: "$00" },
  { id: "obsidian", name: "Obsidian Infusion", price: "$00", oldPrice: "$00" },
  { id: "malachite", name: "Malachite Fusion", price: "$00", oldPrice: "$00" },
  { id: "amethyst", name: "Amethyst Relief", price: "$00", oldPrice: "$00" },
];

function StarRating({ rating = 3, outOf = 5 }) {
  return (
    <ul className="fpt-rating-list" aria-label={`${rating} out of ${outOf} stars`}>
      {Array.from({ length: outOf }).map((_, i) => (
        <li key={i}>
          <svg width="14" height="13" viewBox="0 0 14 13" fill="none">
            <path
              d="M6.74805 0.234375L8.72301 4.51608L13.4054 5.07126L9.9436 8.27267L10.8625 12.8975L6.74805 10.5944L2.63355 12.8975L3.5525 8.27267L0.090651 5.07126L4.77309 4.51608L6.74805 0.234375Z"
              fill={i < rating ? "#1c1c1a" : "#5E626F"}
              opacity={i < rating ? 1 : 0.25}
            />
          </svg>
        </li>
      ))}
    </ul>
  );
}

function ScrollTopButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      type="button"
      className={`fpt-scrolltop ${visible ? "is-visible" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 12L12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default function FurkindPetTallow() {
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState("4oz");
  const [qty, setQty] = useState(1);

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => q + 1);

  useEffect(() => {
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";
    return () => { document.documentElement.style.scrollBehavior = prev; };
  }, []);

  const galleryWrapperRef = useRef(null);
  const galleryInnerRef = useRef(null);

  useEffect(() => {
    const HEADER_OFFSET = 88;

    const reset = () => {
      const inner = galleryInnerRef.current;
      if (!inner) return;
      inner.style.transform = "";
    };

    const update = () => {
      const wrapper = galleryWrapperRef.current;
      const inner = galleryInnerRef.current;
      if (!wrapper || !inner) return;

      if (window.innerWidth <= 768) {
        reset();
        return;
      }

      const wrapperRect = wrapper.getBoundingClientRect();
      const innerHeight = inner.getBoundingClientRect().height;
      const maxShift = wrapperRect.height - innerHeight;

      if (maxShift <= 0) {
        inner.style.transform = "";
        return;
      }

      const rawShift = HEADER_OFFSET - wrapperRect.top;
      const shift = Math.min(Math.max(rawShift, 0), maxShift);
      inner.style.transform = `translate3d(0, ${shift}px, 0)`;
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => { ticking = false; update(); });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      reset();
    };
  }, []);

  return (
    <div className="fpt">
      {/* ===== Header ===== */}
      <header className="fpt-header">
        <div className="fpt-header-inner">
          <a className="fpt-logo" href="#">
            <span className="fpt-logo-mark">
              <svg viewBox="0 0 48 48" width="30" height="30" aria-hidden="true">
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
            <a href="#">Home +</a>
            <a href="#">About Us +</a>
            <a href="#">Shop +</a>
            <a href="#">Blog +</a>
            <a href="#">Contact US +</a>
          </nav>

          <div className="fpt-header-right">
            <a className="fpt-login" href="#">Login /<br />Register</a>
            <button className="icon-btn" aria-label="Search">
              <svg viewBox="0 0 20 20" width="20" height="20"><circle cx="9.2" cy="9.2" r="6.7" fill="none" stroke="currentColor" strokeWidth="1.5" /><line x1="17.5" y1="17.5" x2="13.9" y2="13.9" stroke="currentColor" strokeWidth="1.5" /></svg>
            </button>
            <button className="icon-btn" aria-label="Wishlist">
              <svg viewBox="0 0 20 20" width="20" height="20"><path d="M17.4 3.8a5.6 5.6 0 0 0-7.4.9 5.6 5.6 0 0 0-7.4-.9 5.9 5.9 0 0 0-.6 8.5L10 18l7.4-5.6a5.9 5.9 0 0 0 0-8.5z" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
            </button>
            <button className="icon-btn" aria-label="Cart">
              <svg viewBox="0 0 20 20" width="20" height="20"><path d="M.8.8h3.4l2.2 11.2c.2.7.9 1.2 1.6 1.2h8.1c.7 0 1.3-.5 1.5-1.2l1.3-7H5" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="7.5" cy="18.3" r="1.1" fill="currentColor" /><circle cx="16.7" cy="18.3" r="1.1" fill="currentColor" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* ===== Banner ===== */}
      <div className="fpt-banner">
        <div className="fpt-banner-inner">
          <h1>Furkind Pet Tallow</h1>
          <nav aria-label="Breadcrumb" className="fpt-crumb">
            <a href="#">Home</a>
            <span aria-hidden="true">◆</span>
            <span>Furkind Pet Tallow</span>
          </nav>
        </div>
      </div>

      {/* ===== Product ===== */}
      <main className="fpt-product">
        {/* Gallery — pinned image + thumbnails */}
        <section className="fpt-gallery" aria-label="Product images" ref={galleryWrapperRef}>
          <div className="fpt-gallery-main" ref={galleryInnerRef}>
            <div className="fpt-photo-stage">
              <img
                className="fpt-product-photo"
                src={GALLERY_IMAGES[activeImage]}
                alt="Furkind Pet Tallow jar"
              />
            </div>
            <div className="fpt-gallery-thumbs">
              {THUMBNAILS.map((thumb, i) => (
                <button
                  key={i}
                  type="button"
                  className={`fpt-gallery-thumb ${i === activeImage ? "is-active" : ""}`}
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={i === activeImage}
                >
                  <img src={thumb} alt="" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Info */}
        <section className="fpt-info" aria-label="Product information">
          <span className="fpt-badge">SALE 10% OFF</span>
          <h2 className="fpt-title">Furkind Pet Tallow</h2>
          <p className="fpt-subtitle">Grass-Fed/Grass-Finished Beef Tallow, Organic Raw Unrefined Coconut Oil</p>

          <div className="fpt-review-row">
            <StarRating rating={3} />
            <span className="fpt-review-rating">4.7 Rating</span>
            <a href="#reviews" className="fpt-review-count">(5 customer reviews)</a>
          </div>

          <div className="fpt-copy-block">
            <h3>Description:</h3>
            <p>
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
          </div>

          <div className="fpt-copy-block">
            <h3>Ingredients:</h3>
            <p>Grass-Fed/Grass-Finished Beef Tallow, Organic Raw Unrefined Coconut Oil</p>
          </div>

          <div className="fpt-copy-block">
            <h3>Directions:</h3>
            <p>
              Using clean fingertips, apply a small amount of balm directly to your pet's paws, nose, elbows,
              or other areas of dry or irritated skin. Gently massage until absorbed. Use daily for routine
              maintenance or as needed to provide extra hydration and protection. For best results, apply
              after outdoor activities, bathing, or whenever skin appears dry. For external use only. Perform
              a patch test before first use. Store in a cool, dry place away from direct sunlight.{" "}
              <strong>Use within 12 months of opening.</strong>
            </p>
          </div>

          <hr className="fpt-divider" />

          <fieldset className="fpt-size">
            <legend className="fpt-label">Select Size</legend>
            <div className="fpt-size-options">
              <label className={`fpt-size-option ${size === "4oz" ? "is-selected" : ""}`}>
                <input type="radio" name="size" checked={size === "4oz"} onChange={() => setSize("4oz")} />
                4 .Oz
              </label>
              <label className={`fpt-size-option ${size === "1.7oz" ? "is-selected" : ""}`}>
                <input type="radio" name="size" checked={size === "1.7oz"} onChange={() => setSize("1.7oz")} />
                1.7 .Oz
              </label>
            </div>
          </fieldset>

          <div className="fpt-price-row">
            <span className="fpt-label">Price</span>
            <div className="fpt-price">
              <span className="fpt-price-current">$00.00</span>
              <del className="fpt-price-old">$00.00</del>
            </div>
          </div>

          <div className="fpt-qty-row">
            <span className="fpt-label">Quantity</span>
            <div className="fpt-qty-stepper">
              <button type="button" onClick={dec} aria-label="Decrease quantity">−</button>
              <input type="text" readOnly value={qty} aria-label="Quantity" />
              <button type="button" onClick={inc} aria-label="Increase quantity">+</button>
            </div>
          </div>

          <div className="fpt-cta-row">
            <button type="button" className="fpt-btn fpt-btn-primary">ADD TO CART</button>
            <button type="button" className="fpt-btn fpt-btn-outline">
              <HeartIcon small /> Add To Wishlist
            </button>
          </div>

          <hr className="fpt-divider" />

          <div className="fpt-meta-row">
            <strong>SKU:</strong> <span>PRT584E63A</span>
          </div>

          <div className="fpt-meta-row fpt-share">
            <strong>Share:</strong>
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="LinkedIn">in</a>
            <a href="#" aria-label="Instagram">ig</a>
            <a href="#" aria-label="X">x</a>
          </div>

          <p className="fpt-tagline">Non-toxic. Handmade. Nourishing.</p>

          <div className="fpt-seals">
            <span className="fpt-seal" aria-label="Recyclable">
              <img src={sealRecycle} alt="Recyclable packaging" />
            </span>
            <span className="fpt-seal" aria-label="Natural">
              <img src={sealNatural} alt="Natural ingredients" />
            </span>
            <span className="fpt-seal" aria-label="Made with love">
              <img src={sealMadeWithLove} alt="Made with love" />
            </span>
          </div>

          <p className="fpt-fineprint">
            Made by a manufacturer exempt from Florida's cosmetic manufacturing permit requirements.
          </p>
        </section>

        {/* Sidebar */}
        <aside className="fpt-sidebar" aria-label="Order summary">
          <button type="button" className="fpt-btn fpt-btn-outline fpt-btn-block">
            Bank Offer 5% Cashback
          </button>

          <div className="fpt-perk">
            <div className="fpt-perk-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="24" height="24"><path d="M3 15h18l-2 4H5zM6 15V8h9l4 4v3M9 8V5h3v3" fill="none" stroke="#3a3a3a" strokeWidth="1.3" /></svg>
            </div>
            <div>
              <span className="fpt-perk-label">Easy Returns</span>
              <h4>30 Days</h4>
            </div>
          </div>

          <div className="fpt-perk">
            <div className="fpt-perk-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 3l8 4v8l-8 4-8-4V7z" fill="none" stroke="#3a3a3a" strokeWidth="1.3" /><path d="M4 7l8 4 8-4M12 11v9" fill="none" stroke="#3a3a3a" strokeWidth="1.3" /></svg>
            </div>
            <div>
              <h4>Enjoy The Product</h4>
              <p>Lorem Ipsum is simply dummy text of the printing and typesetting</p>
            </div>
          </div>

          <div className="fpt-savings">
            <CheckIcon /> You will save ₹504 on this order
          </div>

          <div className="fpt-total-row">
            <span>Total</span>
            <strong>$125.75</strong>
          </div>

          <button type="button" className="fpt-btn fpt-btn-outline fpt-btn-block">
            <HeartIcon small /> Add To Wishlist
          </button>
          <button type="button" className="fpt-btn fpt-btn-primary fpt-btn-block">
            ADD TO CART
          </button>
        </aside>
      </main>

      {/* ===== Related Products ===== */}
      <section className="fpt-container fpt-related">
        <div className="fpt-related-head">
          <h2>Related products</h2>
          <a href="#">See all products ›</a>
        </div>
        <div className="fpt-related-grid">
          {RELATED_PRODUCTS.map((product) => (
            <div className="fpt-product-card" key={product.id}>
              <div className="fpt-product-card-media">
                <div className="jar sm">
                  <div className="jar-lid" />
                  <div className="jar-body">
                    <span className="jar-brand">CHANTALLOW</span>
                    <span className="jar-face">
                      <svg viewBox="0 0 40 40" width="32" height="32"><ellipse cx="20" cy="23" rx="7" ry="8" fill="none" stroke="#7a6a55" strokeWidth="1" /><path d="M10 14c-1 3 1 6 3 6M30 14c1 3-1 6-3 6" fill="none" stroke="#7a6a55" strokeWidth="1" /></svg>
                    </span>
                  </div>
                </div>
                <button type="button" className="fpt-product-card-wish" aria-label="Add to wishlist">
                  <HeartIcon small />
                </button>
              </div>
              <div className="fpt-product-card-body">
                <h3>{product.name}</h3>
                <div className="fpt-product-card-footer">
                  <span className="fpt-product-card-price">
                    {product.price} <del>{product.oldPrice}</del>
                  </span>
                  <button type="button" className="fpt-product-card-cart" aria-label={`Add ${product.name} to cart`}>
                    <CartIcon small />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Footer ===== */}
      <Footer />

      <ScrollTopButton />
    </div>
  );
}

function HeartIcon({ small }) {
  const size = small ? 16 : 20;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M17.4 3.8a5.6 5.6 0 0 0-7.4.9 5.6 5.6 0 0 0-7.4-.9 5.9 5.9 0 0 0-.6 8.5L10 18l7.4-5.6a5.9 5.9 0 0 0 0-8.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CartIcon({ small }) {
  const size = small ? 16 : 20;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M7.5 18.3a.83.83 0 1 0 0-1.67.83.83 0 0 0 0 1.67zM16.7 18.3a.83.83 0 1 0 0-1.67.83.83 0 0 0 0 1.67zM.8.8h3.4l2.2 11.2c.2.7.9 1.2 1.6 1.2h8.1c.7 0 1.3-.5 1.5-1.2l1.3-7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M18.3 9.2V10a8.33 8.33 0 1 1-4.9-7.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.3 3.3L10 11.7 7.5 9.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Footer() {
  return (
    <footer className="fpt-footer">
      <div className="fpt-footer-grid">
        <div className="fpt-footer-col">
          <a className="fpt-logo dark" href="#">
            <span className="fpt-logo-mark">
              <svg viewBox="0 0 48 48" width="28" height="28"><ellipse cx="24" cy="26" rx="9" ry="11" fill="none" stroke="#7d8a6a" strokeWidth="1.3" /><path d="M9 15c-2 5 2 10 6 11M39 15c2 5-2 10-6 11" fill="none" stroke="#7d8a6a" strokeWidth="1.3" strokeLinecap="round" /></svg>
            </span>
            <span className="fpt-logo-text sm">CHANTALLOW</span>
          </a>
          <p className="foot-line"><strong>Address :</strong> 000 Wall Street, UK, London</p>
          <p className="foot-line"><strong>E-mail :</strong> example@info.com</p>
          <p className="foot-line"><strong>Phone :</strong> (000) 000-0000</p>
          <p className="foot-sub">Subscribe To Our Newsletter</p>
          <div className="fpt-newsletter">
            <input type="email" placeholder="Your Email Address" />
            <button aria-label="Subscribe">→</button>
          </div>
        </div>

        <div className="fpt-footer-col">
          <h5>Recent Posts</h5>
          {[
            { title: "Hydrated Supple Skin", date: "July 23, 2023", image: recentPost1 },
            { title: "Glowing Radiant Skin", date: "July 23, 2023", image: recentPost2 },
            { title: "Silky Soft Skin", date: "July 23, 2023", image: recentPost3 },
          ].map((post) => (
            <div className="foot-post" key={post.title}>
              <span className="foot-thumb">
                <img src={post.image} alt={post.title} />
              </span>
              <span>
                <strong>{post.title}</strong>
                <small>{post.date}</small>
              </span>
            </div>
          ))}
        </div>

        <div className="fpt-footer-col">
          <h5>Useful Links</h5>
          <ul className="foot-links">
            {["Home", "About Us", "Returns", "Terms & Conditions", "Privacy-Policy", "Contact Us"].map((l) => (
              <li key={l}><a href="#">{l}</a></li>
            ))}
          </ul>
        </div>

        <div className="fpt-footer-col">
          <h5>Social Media</h5>
          <ul className="foot-links">
            {["Instagram", "Facebook", "YouTube", "Linkedin", "X.Com"].map((l) => (
              <li key={l}><a href="#">{l}</a></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="fpt-footer-bottom">
        <p>© 2026 <span>Chantallow</span> Theme. All Rights Reserved.</p>
        <div className="fpt-pay">
          <span>We Accept :</span>
          <img src={footerImg} alt="Accepted payment methods" className="weacceptimage" />
        </div>
      </div>
    </footer>
  );
}