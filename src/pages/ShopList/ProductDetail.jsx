import React, { useState } from "react";
import "./ProductDetail.css";
import malachiteFusionJar from "../../assets/beauty/malachite-fusion.jpg";
import obsidianInfusionJar from "../../assets/beauty/obsidian-infusion.jpg";

/**
 * Chantallow — Product Detail Page
 * Converted from static HTML/CSS template to a single-file React component.
 * Split out into ProductDetail.jsx (markup/logic) + ProductDetail.css (styles).
 */

const THUMBNAILS = [
  { id: 1, alt: "Malachite Fusion jar - front view", src: malachiteFusionJar },
  { id: 2, alt: "Malachite Fusion jar - label detail", src: malachiteFusionJar },
  { id: 3, alt: "Malachite Fusion jar - side view", src: malachiteFusionJar },
];

const RELATED_PRODUCTS = [
  { id: "obsidian", name: "Obsidian Infusion", price: 0, oldPrice: 0, image: obsidianInfusionJar },
  { id: "malachite", name: "Malachite Fusion", price: 0, oldPrice: 0, image: malachiteFusionJar },
  { id: "amethyst", name: "Amethyst Relief", price: 0, oldPrice: 0 },
  { id: "amber", name: "Amber Glow", price: 0, oldPrice: 0 },
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

export default function ProductDetail() {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("4oz");
  const [quantity, setQuantity] = useState(1);

  const decrementQty = () => setQuantity((q) => Math.max(1, q - 1));
  const incrementQty = () => setQuantity((q) => q + 1);

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
            <a href="/">Home</a>
            <a href="/about-us">About Us</a>
            <a href="/shop-list">Shop</a>
            <a href="/blog-category">Blog</a>
            <a href="/contact-us">Contact US</a>
          </nav>

          <div className="ct-header__actions">
            <a href="/registration" className="ct-login-link">
              Login / Register
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
          <h1>Malachite Fusion</h1>
          <nav aria-label="Breadcrumb" className="ct-breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true">›</span>
            <span>Malachite Fusion</span>
          </nav>
        </div>
      </div>

      {/* ---------------- Product Detail ---------------- */}
      <main className="ct-container ct-product">
        {/* Gallery */}
        <section className="ct-gallery" aria-label="Product images">
          <div className="ct-gallery__main">
            <img
              className="ct-jar-photo"
              src={THUMBNAILS[activeImage].src}
              alt={THUMBNAILS[activeImage].alt}
            />
          </div>
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
        </section>

        {/* Info */}
        <section className="ct-info" aria-label="Product information">
          <span className="ct-badge">SALE 10% OFF</span>
          <h2 className="ct-info__title">Malachite Fusion</h2>
          <p className="ct-info__subtitle">Moringa + Butterfly Pea Infused Tallow</p>

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
              A luxurious botanical tallow crème crafted with grass-fed, grass-finished beef tallow
              infused with nutrient-rich moringa and butterfly pea flower to deeply nourish, moisturize,
              and support healthy-looking skin. Rich in naturally occurring fatty acids and skin-loving
              nutrients, this blend helps soften dry skin, improve the appearance of texture, and
              promote a radiant, refreshed complexion.
            </p>
          </div>

          <div className="ct-copy-block">
            <h3>Ingredients:</h3>
            <p>
              Moringa is celebrated for its naturally occurring Vitamins A, C, and E, known for
              supporting hydration, antioxidant protection, and smoother, healthier-looking skin.
              Butterfly pea flower contributes beneficial antioxidants and flavonoids that help
              support skin vitality and a balanced complexion, while rosemary, frankincense, and myrrh
              provide botanical nourishment and calming skin support.
            </p>
          </div>

          <div className="ct-copy-block">
            <h3>Directions:</h3>
            <p>
              Specially suited for tattoo care, this rich crème helps keep tattooed skin moisturized,
              supple, and vibrant-looking. Its deeply conditioning formula supports skin comfort,
              hydration, and healthy-looking skin during everyday tattoo maintenance and care.
            </p>
          </div>

          <hr className="ct-divider" />

          <fieldset className="ct-size">
            <legend className="ct-label">Select Size</legend>
            <div className="ct-size__options">
              <label className={`ct-size__option ${selectedSize === "4oz" ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="size"
                  value="4oz"
                  checked={selectedSize === "4oz"}
                  onChange={() => setSelectedSize("4oz")}
                />
                4 .Oz
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
              <span className="ct-price__current">$00.00</span>
              <del className="ct-price__old">$00.00</del>
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
              <p>Crafted in small batches for freshness and consistent quality.</p>
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
          <a href="/shop-list">See all products →</a>
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
              <h4>Subscribe to our newsletter</h4>
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
              <li><a href="/privacy-policy">Privacy Policy</a></li>
              <li><a href="/contact-us">Contact Us</a></li>
            </ul>
          </div>

          <div className="ct-footer__col">
            <h4>Social Media</h4>
            <ul className="ct-footer__links">
              <li><a href="#">Instagram</a></li>
              <li><a href="https://www.facebook.com/indiankoder">Facebook</a></li>
              <li><a href="#">YouTube</a></li>
              <li><a href="#">LinkedIn</a></li>
              <li><a href="#">X.com</a></li>
            </ul>
          </div>
        </div>

        <div className="ct-footer__bottom">
          <div className="ct-container ct-footer__bottom-inner">
            <p>© {new Date().getFullYear()} Chantallow Theme. All Rights Reserved.</p>
            <p className="ct-footer__accept">We Accept: VISA · MC · AMEX · DISC</p>
          </div>
        </div>
      </footer>
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
      <path d="M17.5 9.99992V10.8333C17.4989 12.7503 16.8763 14.6153 15.7264 16.1494C14.5766 17.6836 12.9614 18.8038 11.1216 19.3423C9.28173 19.8809 7.31596 19.808 5.5216 19.1348C3.72724 18.4617 2.19967 17.2246 1.16702 15.6089C0.134362 13.9932 -0.343895 12.086 -0.211691 10.1735C-0.0794874 8.26098 0.657165 6.43978 1.90178 4.98232C3.1464 3.52486 4.83046 2.51101 6.70197 2.09055C8.57347 1.67009 10.5306 1.86563 12.2833 2.64159" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 3.33325L10 10.8408L7.5 8.34075" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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