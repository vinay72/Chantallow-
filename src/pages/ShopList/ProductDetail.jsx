import React, { useState, useEffect, useRef } from "react";
import "./ProductDetail.css";
import malachiteFusionJar from "../../assets/beauty/malachite-fusion.jpg";
import obsidianInfusionJar from "../../assets/beauty/obsidian-infusion.jpg";

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

const RECENT_POSTS = [
  { id: 1, title: "Hydrated Supple Skin", date: "July 23, 2023" },
  { id: 2, title: "Glowing Radiant Skin", date: "July 23, 2023" },
  { id: 3, title: "Silky Soft Skin", date: "July 23, 2023" },
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

  /* -------- Pinned gallery scroll effect (JS-driven "sticky") --------
     As you scroll, the text/sidebar columns move up while the image stays
     pinned in view. When you reach the end of the text, the image is
     released and everything scrolls away together.
     Implemented with a transform instead of position:sticky so it keeps
     working even if a parent element has `overflow` set (which silently
     breaks CSS sticky). */
  const galleryRef = useRef(null);
  const productRef = useRef(null);

  useEffect(() => {
    const HEADER_OFFSET = 88; // height of the sticky header + breathing room
    let ticking = false;

    const update = () => {
      ticking = false;
      const gallery = galleryRef.current;
      const container = productRef.current;
      if (!gallery || !container) return;

      // On stacked mobile layout, don't pin — just clear any transform.
      if (window.innerWidth <= 760) {
        gallery.style.transform = "";
        return;
      }

      // How far the gallery is allowed to travel: the difference between
      // the full product-section height and the gallery's own height.
      const maxShift = container.offsetHeight - gallery.offsetHeight;
      if (maxShift <= 0) {
        gallery.style.transform = "";
        return;
      }

      // How far the top of the product section has scrolled past the header.
      const containerTop = container.getBoundingClientRect().top + window.scrollY;
      const rawShift = window.scrollY + HEADER_OFFSET - containerTop;

      // Clamp: 0 (not yet reached) … maxShift (text has ended — release).
      const shift = Math.min(Math.max(rawShift, 0), maxShift);
      gallery.style.transform = `translateY(${shift}px)`;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update(); // set correct position on mount / refresh mid-page

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
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
        {/* Gallery — JS-pinned: image stays fixed in view while the info
            column scrolls, released when the text ends */}
        <section className="ct-gallery" aria-label="Product images" ref={galleryRef}>
          <div className="ct-gallery__main">
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

          <div className="ct-seals" aria-hidden="true">
            <span className="ct-seal">♻</span>
            <span className="ct-seal">❁</span>
            <span className="ct-seal">✿</span>
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
      <footer className="ct-footer">
        <div className="ct-container ct-footer__grid">
          <div className="ct-footer__col">
            <div className="ct-logo ct-logo--footer">
              <span className="ct-logo__mark" aria-hidden="true">
                ⚉
              </span>
              <span className="ct-logo__text">CHANTALLOW</span>
            </div>
            <ul className="ct-footer__address">
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
            <div className="ct-newsletter">
              <h4>Subscribe To Our Newsletter</h4>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="ct-newsletter__form"
              >
                <input type="email" required placeholder="Your Email Address" />
                <button type="submit" aria-label="Subscribe">
                  →
                </button>
              </form>
            </div>
          </div>

          <div className="ct-footer__col">
            <h4>Recent Posts</h4>
            <ul className="ct-footer__posts">
              {RECENT_POSTS.map((post) => (
                <li key={post.id}>
                  <div className="ct-footer__post-thumb" aria-hidden="true" />
                  <div>
                    <a href="#">{post.title}</a>
                    <span>{post.date}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="ct-footer__col">
            <h4>Useful Links</h4>
            <ul className="ct-footer__links">
              <li><a href="/">Home</a></li>
              <li><a href="/about-us">About Us</a></li>
              <li><a href="/returns">Returns</a></li>
              <li><a href="/terms">Terms &amp; Conditions</a></li>
              <li><a href="/privacy-policy">Privacy-Policy</a></li>
              <li><a href="/contact-us">Contact Us</a></li>
            </ul>
          </div>

          <div className="ct-footer__col">
            <h4>Social Media</h4>
            <ul className="ct-footer__links">
              <li><a href="#">Instagram</a></li>
              <li><a href="https://www.facebook.com/indiankoder">Facebook</a></li>
              <li><a href="#">YouTube</a></li>
              <li><a href="#">Linkedin</a></li>
              <li><a href="#">X.Com</a></li>
            </ul>
          </div>
        </div>

        <div className="ct-footer__bottom">
          <div className="ct-container ct-footer__bottom-inner">
            <p>© {new Date().getFullYear()} <span className="ct-footer__brand">Chantallow</span> Theme. All Rights Reserved.</p>
            <p className="ct-footer__accept">We Accept: VISA · MC · AMEX · DISC</p>
          </div>
        </div>
      </footer>

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