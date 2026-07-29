import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "./ProductDetail.css";
import malachiteFusionJar from "../../assets/beauty/malachite-fusion.jpg";
import obsidianInfusionJar from "../../assets/beauty/obsidian-infusion.jpg";
import sealRecycle from "../../assets/a.png";
import sealNatural from "../../assets/b.png";
import sealMadeWithLove from "../../assets/c.png";
import logo from "../../assets/logo.png";
import recentPost1 from "../../assets/shop/product/small/1.png";
import recentPost2 from "../../assets/shop/product/small/2.png";
import recentPost3 from "../../assets/shop/product/small/3.png";
import footerImg from "../../assets/footer/footer.png";

/**
 * Chantallow — Product Detail Page
 * Markup/logic here + styles in ProductDetail.css.
 * Includes scroll functionality:
 *  - Sticky product image (stays pinned while right content scrolls)
 *  - Scroll-to-top button that appears after scrolling down
 *  - Smooth scrolling behavior
 */

const THUMBNAILS = [
  { id: 1, alt: "Malachite Fusion jar - front view", src: malachiteFusionJar },
  { id: 2, alt: "Malachite Fusion jar - label detail", src: malachiteFusionJar },
  { id: 3, alt: "Malachite Fusion jar - side view", src: malachiteFusionJar },
];

const RELATED_PRODUCTS = [
  { id: "cleansing", name: "Cleansing Body Wash", price: 80, oldPrice: 89, image: obsidianInfusionJar },
  { id: "malachite", name: "Malachite Fusion", price: 80, oldPrice: 89, image: malachiteFusionJar },
  { id: "nourishing", name: "Nourishing Body Butter", price: 80, oldPrice: 89, image: malachiteFusionJar },
  { id: "exfoliating", name: "Exfoliating Body Scrub", price: 80, oldPrice: 89, image: malachiteFusionJar },
];

function StarRating({ rating = 3, outOf = 5 }) {
  return (
    <ul className="dz-rating" aria-label={`${rating} out of ${outOf} stars`}>
      {Array.from({ length: outOf }).map((_, i) => (
        <li key={i} className={i < rating ? "star-fill" : ""}>
          <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6.74805 0.234375L8.72301 4.51608L13.4054 5.07126L9.9436 8.27267L10.8625 12.8975L6.74805 10.5944L2.63355 12.8975L3.5525 8.27267L0.090651 5.07126L4.77309 4.51608L6.74805 0.234375Z"
              fill={i < rating ? "#FF8A00" : "#5E626F"}
              opacity={i < rating ? 1 : 0.2}
            />
          </svg>
        </li>
      ))}
    </ul>
  );
}

/** Scroll-to-top button — appears after the user scrolls down. */
function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // set initial state
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      className={`ct-scrolltop ${visible ? "is-visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 12L12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default function ProductDetail() {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("2oz");
  const [quantity, setQuantity] = useState(1);

  const decrementQty = () => setQuantity((q) => Math.max(1, q - 1));
  const incrementQty = () => setQuantity((q) => q + 1);

  /* Enable smooth scrolling for the whole page while this page is mounted
     (anchor links like "(5 customer reviews)" glide instead of jumping). */
  useEffect(() => {
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = prev;
    };
  }, []);

  /* -------- Pinned gallery scroll effect --------
     Three phases as you scroll:
       1. BEFORE  — image sits at the top of its column.
       2. PINNED  — the image is translated down by exactly the amount the
                    page has scrolled, so the two cancel out and the image
                    appears completely motionless on screen while the info
                    column and sidebar scroll past it.
       3. RELEASED— once the image reaches the bottom of its column, the
                    translate stops growing and it rides away with the page.

     Implemented with `transform: translate3d` rather than `position: fixed`
     or `position: sticky`, because:
       - `sticky` is silently broken by any ancestor with `overflow` set.
       - `fixed`  is silently broken by any ancestor with `transform`,
                  `filter`, `perspective`, `backdrop-filter` or `will-change`
                  (it then resolves against that ancestor, not the viewport).
       - `transform` on the element itself always works, in every case.

     `galleryWrapperRef` is a normal grid item that stretches to the full
     row height (see .ct-product in the CSS — it must NOT use align-items:
     start, or the wrapper collapses and there is no travel distance).
     `galleryInnerRef` is the element that actually gets translated. */
  const galleryWrapperRef = useRef(null);
  const galleryInnerRef = useRef(null);
  const productRef = useRef(null);

  useEffect(() => {
    const HEADER_OFFSET = 88; // height of the sticky header + breathing room

    const reset = () => {
      const inner = galleryInnerRef.current;
      if (!inner) return;
      inner.style.position = "";
      inner.style.top = "";
      inner.style.left = "";
      inner.style.bottom = "";
      inner.style.width = "";
      inner.style.transform = "";
      inner.style.zIndex = "";
    };

    const update = () => {
      const wrapper = galleryWrapperRef.current;
      const inner = galleryInnerRef.current;
      if (!wrapper || !inner) return;

      // On stacked mobile layout, don't pin at all.
      if (window.innerWidth <= 760) {
        reset();
        return;
      }

      const wrapperRect = wrapper.getBoundingClientRect();
      const innerHeight = inner.getBoundingClientRect().height;

      // Total distance the image is allowed to travel down its column
      // before it reaches the bottom and rides away with the page.
      const maxShift = wrapperRect.height - innerHeight;

      if (maxShift <= 0) {
        // Image is as tall as (or taller than) its column — nothing to pin.
        inner.style.transform = "";
        return;
      }

      // How far the top of the column has scrolled past the header line.
      const rawShift = HEADER_OFFSET - wrapperRect.top;

      // Clamp:
      //   0        -> phase 1, not reached yet (image at top of column)
      //   0..max   -> phase 2, pinned (translate cancels out the scroll,
      //               so the image appears completely motionless)
      //   maxShift -> phase 3, released (image rides away with the page)
      const shift = Math.min(Math.max(rawShift, 0), maxShift);

      // A transform is used rather than position:fixed because `fixed` is
      // silently broken by any ancestor with transform/filter/will-change,
      // whereas a transform on the element itself always works.
      inner.style.transform = `translate3d(0, ${shift}px, 0)`;
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          update();
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update(); // set correct position on mount / refresh mid-page

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      reset();
    };
  }, []);

  return (
    <div className="ct-page">
      {/* ---------------- Header ---------------- */}
      <header className="ct-header">
        <div className="ct-header__inner">
          <a href="/" className="ct-logo">
            <span className="ct-logo__mark" aria-hidden="true">
              ⚉
            </span>
            <span className="ct-logo__text">CHANTALLOW</span>
          </a>

          <nav className="ct-nav" aria-label="Primary">
            <a href="/">Home +</a>
            <a href="/about-us">About Us +</a>
            <a href="/shop-list">Shop +</a>
            <a href="/blog-category">Blog +</a>
            <a href="/contact-us">Contact US +</a>
          </nav>

          <div className="ct-header__actions">
            <a href="/registration" className="ct-login-link">
              Login /<br />Register
            </a>
            <button type="button" className="ct-icon-btn" aria-label="Search">
              <SearchIcon />
            </button>
            <button type="button" className="ct-icon-btn" aria-label="Wishlist">
              <HeartIcon />
            </button>
            <button type="button" className="ct-icon-btn" aria-label="Cart">
              <CartIcon />
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- Banner ---------------- */}
      <div className="ct-banner">
        <div className="ct-banner__inner">
          <h1>Products Details</h1>
          <nav aria-label="Breadcrumb" className="ct-breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true">◆</span>
            <span>Products Details</span>
          </nav>
        </div>
      </div>

      {/* ---------------- Product Detail ---------------- */}
      <main className="ct-container ct-product" ref={productRef}>
        {/* Gallery — JS-pinned: image is completely static in the
            viewport while the info column scrolls, released when the
            text/sidebar content ends */}
        <section className="ct-gallery" aria-label="Product images" ref={galleryWrapperRef}>
          <div className="ct-gallery__main" ref={galleryInnerRef}>
            <img
              className="ct-jar-photo"
              src={THUMBNAILS[activeImage].src}
              alt={THUMBNAILS[activeImage].alt}
            />
            <div className="ct-gallery__thumbs">
              {THUMBNAILS.map((thumb, i) => (
                <button
                  key={thumb.id}
                  type="button"
                  className={`ct-gallery__thumb ${i === activeImage ? "is-active" : ""}`}
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={i === activeImage}
                  style={{ backgroundImage: `url(${thumb.src})` }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Info */}
        <section className="ct-info" aria-label="Product information">
          <span className="ct-badge">SALE 20% OFF</span>
          <h2 className="ct-info__title">Malachite Fusion</h2>
          <p className="ct-info__subtitle">Malachite Fusion</p>

          <div className="ct-review-row">
            <StarRating rating={3} />
            <span className="ct-review-row__rating">4.7 Rating</span>
            <a href="#reviews" className="ct-review-row__count">
              (5 customer reviews)
            </a>
          </div>

          <div className="ct-copy-block">
            <h3>Description:</h3>
            <p>
              A rich, nourishing tallow crème made with grass-fed, grass-finished beef tallow and
              infused with botanical herbs to deeply moisturize and support soft, healthy-looking
              skin naturally.
            </p>
          </div>

          <div className="ct-copy-block">
            <h3>Ingredients:</h3>
            <p>Grass-Fed/Grass-Finished Beef Tallow infused with Moringa</p>
          </div>

          <div className="ct-copy-block">
            <h3>Directions:</h3>
            <p>
              Apply a small scoop and rub into skin. Use as needed for whole body skin care.
              External use only. Patch test first. <strong>Use within 1 year.</strong>
            </p>
          </div>

          <hr className="ct-divider" />

          <fieldset className="ct-size">
            <legend className="ct-label">Select Size</legend>
            <div className="ct-size__options">
              <label className={`ct-size__option ${selectedSize === "2oz" ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="size"
                  value="2oz"
                  checked={selectedSize === "2oz"}
                  onChange={() => setSelectedSize("2oz")}
                />
                2 .Oz
              </label>
              <label className={`ct-size__option ${selectedSize === "1.7oz" ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="size"
                  value="1.7oz"
                  checked={selectedSize === "1.7oz"}
                  onChange={() => setSelectedSize("1.7oz")}
                />
                1.7 .Oz
              </label>
            </div>
          </fieldset>

          <div className="ct-price-row">
            <span className="ct-label">Price</span>
            <div className="ct-price">
              <span className="ct-price__current">$000.00</span>
              <del className="ct-price__old">$000.00</del>
            </div>
          </div>

          <div className="ct-qty-row">
            <span className="ct-label">Quantity</span>
            <div className="ct-qty-stepper">
              <button type="button" onClick={decrementQty} aria-label="Decrease quantity">
                −
              </button>
              <input type="text" readOnly value={quantity} aria-label="Quantity" />
              <button type="button" onClick={incrementQty} aria-label="Increase quantity">
                +
              </button>
            </div>
          </div>

          <div className="ct-cta-row">
            <button type="button" className="ct-btn ct-btn--primary">
              ADD TO CART
            </button>
            <button type="button" className="ct-btn ct-btn--outline">
              <HeartIcon small /> Add To Wishlist
            </button>
          </div>

          <hr className="ct-divider" />

          <div className="ct-meta-row">
            <strong>SKU:</strong> <span>PRT584E63A</span>
          </div>

          <div className="ct-meta-row ct-share">
            <strong>Share:</strong>
            <a href="https://www.facebook.com/indiankoder" target="_blank" rel="noreferrer" aria-label="Share on Facebook">
              f
            </a>
            <a href="#" aria-label="Share on LinkedIn">
              in
            </a>
            <a href="#" aria-label="Share on Instagram">
              ig
            </a>
            <a href="#" aria-label="Share on X">
              x
            </a>
          </div>

          <p className="ct-tagline">Non-toxic. Handmade. Nourishing.</p>

          <div className="ct-seals">
            <img className="ct-seal" src={sealRecycle} alt="Recyclable packaging" />
            <img className="ct-seal" src={sealNatural} alt="Natural ingredients" />
            <img className="ct-seal" src={sealMadeWithLove} alt="Made with love" />
          </div>

          <p className="ct-fineprint">
            Made by a manufacturer exempt from Florida&rsquo;s cosmetic manufacturing permit
            requirements.
          </p>
        </section>

        {/* Sidebar */}
        <aside className="ct-sidebar" aria-label="Order summary">
          <button type="button" className="ct-btn ct-btn--outline ct-btn--block">
            Bank Offer 5% Cashback
          </button>

          <div className="ct-perk">
            <div className="ct-perk__icon" aria-hidden="true">
              🚚
            </div>
            <div>
              <span className="ct-perk__label">Easy Returns</span>
              <h4>30 Days</h4>
            </div>
          </div>

          <div className="ct-perk">
            <div className="ct-perk__icon" aria-hidden="true">
              📦
            </div>
            <div>
              <h4>Enjoy The Product</h4>
              <p>Lorem Ipsum is simply dummy text of the printing and typesetting</p>
            </div>
          </div>

          <div className="ct-savings">
            <CheckIcon /> You will save ₹504 on this order
          </div>

          <div className="ct-total-row">
            <span>Total</span>
            <strong>$125.75</strong>
          </div>

          <button type="button" className="ct-btn ct-btn--outline ct-btn--block">
            <HeartIcon small /> Add To Wishlist
          </button>
          <button type="button" className="ct-btn ct-btn--primary ct-btn--block">
            ADD TO CART
          </button>
        </aside>
      </main>

      {/* ---------------- Related Products ---------------- */}
      <section className="ct-container ct-related">
        <div className="ct-related__head">
          <h2>Related products</h2>
          <a href="/shop-list">See all products ›</a>
        </div>
        <div className="ct-related__grid">
          {RELATED_PRODUCTS.map((product) => (
            <div className="ct-product-card" key={product.id}>
              <div className="ct-product-card__media">
                {product.image ? (
                  <img className="ct-jar-photo ct-jar-photo--compact" src={product.image} alt={product.name} />
                ) : (
                  <JarIllustration compact />
                )}
                <button type="button" className="ct-product-card__wish" aria-label="Add to wishlist">
                  <HeartIcon small />
                </button>
              </div>
              <div className="ct-product-card__body">
                <h3>{product.name}</h3>
                <div className="ct-product-card__footer">
                  <span className="ct-product-card__price">
                    ${product.price} <del>${product.oldPrice}</del>
                  </span>
                  <button type="button" className="ct-product-card__cart" aria-label={`Add ${product.name} to cart`}>
                    <CartIcon small />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <Footer />

      {/* ---------------- Scroll-to-top ---------------- */}
      <ScrollTopButton />
    </div>
  );
}

/* ---------------- Inline icon components ---------------- */

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 17.5L13.875 13.875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeartIcon({ small }) {
  const size = small ? 16 : 20;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.3666 3.84172C16.941 3.41589 16.4356 3.0781 15.8794 2.84763C15.3232 2.61716 14.727 2.49854 14.1249 2.49854C13.5229 2.49854 12.9267 2.61716 12.3705 2.84763C11.8143 3.0781 11.3089 3.41589 10.8833 3.84172L9.99994 4.72506L9.1166 3.84172C8.25686 2.98198 7.0908 2.49898 5.87494 2.49898C4.65907 2.49898 3.49301 2.98198 2.63327 3.84172C1.77353 4.70147 1.29053 5.86753 1.29053 7.08339C1.29053 8.29925 1.77353 9.46531 2.63327 10.3251L3.5166 11.2084L9.99994 17.6917L16.4833 11.2084L17.3666 10.3251C17.7924 9.89943 18.1302 9.39407 18.3607 8.83785C18.5912 8.28164 18.7098 7.68546 18.7098 7.08339C18.7098 6.48132 18.5912 5.88514 18.3607 5.32893C18.1302 4.77271 17.7924 4.26735 17.3666 3.84172Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CartIcon({ small }) {
  const size = small ? 16 : 20;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.49984 18.3334C7.96007 18.3334 8.33317 17.9603 8.33317 17.5001C8.33317 17.0398 7.96007 16.6667 7.49984 16.6667C7.0396 16.6667 6.6665 17.0398 6.6665 17.5001C6.6665 17.9603 7.0396 18.3334 7.49984 18.3334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.6668 18.3334C17.1271 18.3334 17.5002 17.9603 17.5002 17.5001C17.5002 17.0398 17.1271 16.6667 16.6668 16.6667C16.2066 16.6667 15.8335 17.0398 15.8335 17.5001C15.8335 17.9603 16.2066 18.3334 16.6668 18.3334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M0.833496 0.833252H4.16683L6.40016 11.9916C6.47637 12.3752 6.68509 12.7199 6.98978 12.9652C7.29448 13.2104 7.67575 13.3407 8.06683 13.3333H16.1668C16.5579 13.3407 16.9392 13.2104 17.2439 12.9652C17.5486 12.7199 17.7573 12.3752 17.8335 11.9916L19.1668 4.99992H5.00016" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M18.3327 9.2415V9.99984C18.3317 11.8153 17.7438 13.5819 16.6562 15.0364C15.5686 16.4909 14.0403 17.5555 12.2988 18.0717C10.5572 18.5879 8.69569 18.5279 6.99098 17.9004C5.28627 17.273 3.82868 16.1124 2.83801 14.5912C1.84733 13.0701 1.37559 11.2698 1.49356 9.45778C1.61152 7.64575 2.31294 5.92137 3.49353 4.54122C4.67413 3.16106 6.27132 2.19883 8.04565 1.79539C9.81998 1.39194 11.6767 1.56876 13.3427 2.29984" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.3333 3.33325L10 11.6749L7.5 9.17492" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Placeholder jar illustration standing in for product photography (used for related products without a real photo). */
function JarIllustration({ compact }) {
  return (
    <svg
      className={`ct-jar-svg ${compact ? "ct-jar-svg--compact" : ""}`}
      viewBox="0 0 240 320"
      xmlns="http://www.w3.org/2000/svg"
      role="presentation"
    >
      <ellipse cx="120" cy="300" rx="70" ry="10" fill="#00000015" />
      <rect x="50" y="60" width="140" height="220" rx="14" fill="#f7f4ee" stroke="#2b2b28" strokeWidth="2" />
      <rect x="40" y="30" width="160" height="40" rx="10" fill="#1c1c1a" />
      <rect x="46" y="20" width="148" height="18" rx="8" fill="#2b2b28" />
      <circle cx="120" cy="150" r="34" fill="none" stroke="#8a6d3b" strokeWidth="2" />
      <path
        d="M104 150c4-14 12-22 16-22s12 8 16 22c-4 14-12 22-16 22s-12-8-16-22z"
        fill="none"
        stroke="#8a6d3b"
        strokeWidth="2"
      />
      <text x="120" y="205" textAnchor="middle" fontSize="14" fill="#2b2b28" fontFamily="serif">
        CHANTALLOW
      </text>
      <text x="120" y="230" textAnchor="middle" fontSize="11" fill="#8a6d3b" fontFamily="serif">
        Malachite Fusion
      </text>
    </svg>
  );
}

/* ---------------- Footer ---------------- */

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
                        <img src={logo} alt="Chantallow" style={{ height: 40, width: "auto", display: "block" }} />
                    </div>
                    <p style={{ fontSize: 13.5, fontFamily: 'Lufga', lineHeight: 2, color: "#5A5A52", margin: "0 0 6px" }}>
                        <strong style={{ color: "#1C1C1A" }}>Address :</strong> 000 Wall Street, UK, London
                    </p>
                    <p style={{ fontSize: 13.5, fontFamily: 'Lufga', lineHeight: 2, color: "#5A5A52", margin: "0 0 6px" }}>
                        <strong style={{ color: "#1C1C1A" }}>E-mail :</strong> example@info.com
                    </p>
                    <p style={{ fontSize: 13.5, fontFamily: 'Lufga', lineHeight: 2, color: "#5A5A52", margin: "0 0 24px" }}>
                        <strong style={{ color: "#1C1C1A" }}>Phone :</strong> (000) 000-0000
                    </p>
                    <h6 style={{ fontSize: 14.5, fontWeight: 700, margin: "0 0 12px" }}>
                        Subscribe To Our Newsletter
                    </h6>
                    <div
                        style={{
                            display: "flex",
                            background: "#EAF5EA",
                            borderRadius: 30,
                            overflow: "hidden",
                        }}
                    >
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
                    <h5
                        style={{
                            fontSize: 20, fontWeight: 700, color: "#1C1C1A",
                            margin: "0 0 22px",


                        }}
                    >
                        Recent Posts
                    </h5>
                    {[
                        { title: "Hydrated Supple Skin", img: recentPost1 },
                        { title: "Glowing Radiant Skin", img: recentPost2 },
                        { title: "Silky Soft Skin", img: recentPost3 },
                    ].map((t) => (
                        <div
                            key={t.title}
                            style={{
                                display: "flex",
                                gap: 16,
                                marginBottom: 20,
                                alignItems: "flex-start",
                            }}
                        >
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
                                <img
                                    src={t.img}
                                    alt=""
                                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                />
                            </div>
                            <div style={{ paddingTop: 6 }}>
                                <div
                                    style={{
                                        fontSize: 17,
                                        fontWeight: 700,
                                        color: "#1C1C1A",
                                        marginBottom: 6,
                                        fontFamily: "Lufga",
                                    }}
                                >
                                    {t.title}
                                </div>
                                <div style={{ fontSize: 14, color: "#9A9A90", fontFamily: "Lufga" }}>
                                    July 23, 2023
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div>
                    <h5 style={{ fontSize: 20, fontWeight: 700, color: "#1C1C1A", margin: "0 0 22px" }}>
                        Useful Links
                    </h5>
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
                    <h5 style={{ fontSize: 20, fontWeight: 700, color: "#1C1C1A", margin: "0 0 22px" }}>
                        Social Media
                    </h5>
                    {["Instagram", "Facebook", "YouTube", "Linkedin", "X.Com"].map((l) => (
                        <a
                            key={l}
                            href="#home"
                            className="ctw-underline-link"
                            style={{
                                display: "block",
                                fontSize: 14.5,
                                color: "#3A3A36",
                                marginBottom: 14,
                                textDecoration: "none",
                            }}
                        >
                            {l}
                        </a>
                    ))}
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
                <p style={{ fontFamily: 'Lufga', margin: 0 }}>
                    © 2026 <span style={{ color: "#41705B", fontWeight: 600 }}>Chantallow</span> Theme. All
                    Rights Reserved.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span>We Accept:</span>
                    <img src={footerImg} alt="Accepted payment methods" style={{ height: 24, display: "block" }} />
                </div>
            </div>
        </footer>
    );
}