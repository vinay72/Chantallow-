import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./ProductDetail.css";
import sealRecycle from "../../assets/a.png";
import sealNatural from "../../assets/b.png";
import sealMadeWithLove from "../../assets/c.png";
import SiteFooter from "../../components/SiteFooter";
import { useShop } from "../../context/ShopContext";
import { PRODUCTS, getProductBySlug, formatPrice } from "../../data/products";

/**
 * Chantallow — Product Detail Page (dynamic)
 * Route: /product/:slug   e.g. /product/malachite-fusion
 * The product is looked up from src/data/products.js by its slug.
 */

const countBadge = {
  position: "absolute",
  top: -4,
  right: -6,
  minWidth: 18,
  height: 18,
  padding: "0 5px",
  borderRadius: 9,
  background: "#41705B",
  color: "#fff",
  fontSize: 11,
  lineHeight: "18px",
  textAlign: "center",
};

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
      className={`ct-scrolltop ${visible ? "is-visible" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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

function PageHeader() {
  const { cartCount, wishlistCount } = useShop();
  return (
    <header className="ct-header">
      <div className="ct-header__inner">
        <Link to="/" className="ct-logo">
          <span className="ct-logo__mark" aria-hidden="true">⚉</span>
          <span className="ct-logo__text">CHANTALLOW</span>
        </Link>

        <nav className="ct-nav" aria-label="Primary">
          <Link to="/">Home +</Link>
          <Link to="/aboutus">About Us +</Link>
          <Link to="/shop-list">Shop +</Link>
          <Link to="/blog">Blog +</Link>
          <Link to="/contactus">Contact US +</Link>
        </nav>

        <div className="ct-header__actions">
          <Link to="/registration" className="ct-login-link">
            Login /<br />Register
          </Link>
          <button type="button" className="ct-icon-btn" aria-label="Search">
            <SearchIcon />
          </button>
          <Link to="/wishlist" className="ct-icon-btn" aria-label="Favourites" style={{ position: "relative" }}>
            <HeartIcon />
            {wishlistCount > 0 && <span style={countBadge}>{wishlistCount}</span>}
          </Link>
          <Link to="/cart" className="ct-icon-btn" aria-label="Cart" style={{ position: "relative" }}>
            <CartIcon />
            {cartCount > 0 && <span style={countBadge}>{cartCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const product = getProductBySlug(slug);
  const { addToCart, addToWishlist, isInWishlist } = useShop();

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("2oz");
  const [quantity, setQuantity] = useState(1);

  const decrementQty = () => setQuantity((q) => Math.max(1, q - 1));
  const incrementQty = () => setQuantity((q) => q + 1);

  // Reset selections and jump to top whenever a different product is opened
  useEffect(() => {
    setActiveImage(0);
    setSelectedSize("2oz");
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  useEffect(() => {
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = prev;
    };
  }, []);

  /* -------- Pinned gallery scroll effect (unchanged logic) -------- */
  const galleryWrapperRef = useRef(null);
  const galleryInnerRef = useRef(null);

  useEffect(() => {
    const HEADER_OFFSET = 88;

    const reset = () => {
      const inner = galleryInnerRef.current;
      if (inner) inner.style.transform = "";
    };

    const update = () => {
      const wrapper = galleryWrapperRef.current;
      const inner = galleryInnerRef.current;
      if (!wrapper || !inner) return;

      if (window.innerWidth <= 760) {
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
        requestAnimationFrame(() => {
          ticking = false;
          update();
        });
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
  }, [slug]);

  /* -------- Unknown slug -------- */
  if (!product) {
    return (
      <div className="ct-page">
        <PageHeader />
        <main className="ct-container" style={{ padding: "120px 24px", textAlign: "center" }}>
          <h2>Product not found</h2>
          <p>We couldn't find that product.</p>
          <Link to="/shop-list" className="ct-btn ct-btn--primary">Back to shop</Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const liked = isInWishlist(product.id);
  const gallery = product.gallery.map((src, i) => ({ id: i, src, alt: `${product.name} - image ${i + 1}` }));
  const related = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);
  const lineTotal = product.price * quantity;
  const lineSavings = Math.max(0, product.oldPrice - product.price) * quantity;

  const handleAddToCart = () => {
    addToCart(product.id, quantity, selectedSize);
    navigate("/cart");
  };

  const handleWishlist = () => {
    addToWishlist(product.id);
    navigate("/wishlist");
  };

  return (
    <div className="ct-page">
      <PageHeader />

      {/* ---------------- Banner ---------------- */}
      <div className="ct-banner">
        <div className="ct-banner__inner">
          <h1>Products Details</h1>
          <nav aria-label="Breadcrumb" className="ct-breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">◆</span>
            <span>{product.name}</span>
          </nav>
        </div>
      </div>

      {/* ---------------- Product Detail ---------------- */}
      <main className="ct-container ct-product">
        <section className="ct-gallery" aria-label="Product images" ref={galleryWrapperRef}>
          <div className="ct-gallery__main" ref={galleryInnerRef}>
            <img className="ct-jar-photo" src={gallery[activeImage].src} alt={gallery[activeImage].alt} />
            <div className="ct-gallery__thumbs">
              {gallery.map((thumb, i) => (
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

        <section className="ct-info" aria-label="Product information">
          {product.badge && <span className="ct-badge">{product.badge}</span>}
          <h2 className="ct-info__title">{product.name}</h2>
          <p className="ct-info__subtitle">{product.subtitle}</p>

          <div className="ct-review-row">
            <StarRating rating={3} />
            <span className="ct-review-row__rating">4.7 Rating</span>
            <a href="#reviews" className="ct-review-row__count">(5 customer reviews)</a>
          </div>

          <div className="ct-copy-block">
            <h3>Description:</h3>
            <p>{product.description}</p>
          </div>

          <div className="ct-copy-block">
            <h3>Ingredients:</h3>
            <p>{product.ingredients}</p>
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
              {[
                { value: "2oz", label: "2 .Oz" },
                { value: "1.7oz", label: "1.7 .Oz" },
              ].map((s) => (
                <label key={s.value} className={`ct-size__option ${selectedSize === s.value ? "is-selected" : ""}`}>
                  <input
                    type="radio"
                    name="size"
                    value={s.value}
                    checked={selectedSize === s.value}
                    onChange={() => setSelectedSize(s.value)}
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="ct-price-row">
            <span className="ct-label">Price</span>
            <div className="ct-price">
              <span className="ct-price__current">{formatPrice(product.price)}</span>
              <del className="ct-price__old">{formatPrice(product.oldPrice)}</del>
            </div>
          </div>

          <div className="ct-qty-row">
            <span className="ct-label">Quantity</span>
            <div className="ct-qty-stepper">
              <button type="button" onClick={decrementQty} aria-label="Decrease quantity">−</button>
              <input type="text" readOnly value={quantity} aria-label="Quantity" />
              <button type="button" onClick={incrementQty} aria-label="Increase quantity">+</button>
            </div>
          </div>

          <div className="ct-cta-row">
            <button type="button" className="ct-btn ct-btn--primary" onClick={handleAddToCart}>
              ADD TO CART
            </button>
            <button type="button" className="ct-btn ct-btn--outline" onClick={handleWishlist}>
              <HeartIcon small filled={liked} /> {liked ? "In Your Wishlist" : "Add To Wishlist"}
            </button>
          </div>

          <hr className="ct-divider" />

          <div className="ct-meta-row">
            <strong>SKU:</strong> <span>CT-{String(product.id).padStart(4, "0")}</span>
          </div>

          <div className="ct-meta-row ct-share">
            <strong>Share:</strong>
            <a href="https://www.facebook.com/indiankoder" target="_blank" rel="noreferrer" aria-label="Share on Facebook">f</a>
            <a href="#" aria-label="Share on LinkedIn">in</a>
            <a href="#" aria-label="Share on Instagram">ig</a>
            <a href="#" aria-label="Share on X">x</a>
          </div>

          <p className="ct-tagline">Non-toxic. Handmade. Nourishing.</p>

          <div className="ct-seals">
            <img className="ct-seal" src={sealRecycle} alt="Recyclable packaging" />
            <img className="ct-seal" src={sealNatural} alt="Natural ingredients" />
            <img className="ct-seal" src={sealMadeWithLove} alt="Made with love" />
          </div>

          <p className="ct-fineprint">
            Made by a manufacturer exempt from Florida&rsquo;s cosmetic manufacturing permit requirements.
          </p>
        </section>

        <aside className="ct-sidebar" aria-label="Order summary">
          <button type="button" className="ct-btn ct-btn--outline ct-btn--block">Bank Offer 5% Cashback</button>

          <div className="ct-perk">
            <div className="ct-perk__icon" aria-hidden="true">🚚</div>
            <div>
              <span className="ct-perk__label">Easy Returns</span>
              <h4>30 Days</h4>
            </div>
          </div>

          <div className="ct-perk">
            <div className="ct-perk__icon" aria-hidden="true">📦</div>
            <div>
              <h4>Enjoy The Product</h4>
              <p>Lorem Ipsum is simply dummy text of the printing and typesetting</p>
            </div>
          </div>

          <div className="ct-savings">
            <CheckIcon /> You will save {formatPrice(lineSavings)} on this order
          </div>

          <div className="ct-total-row">
            <span>Total</span>
            <strong>{formatPrice(lineTotal)}</strong>
          </div>

          <button type="button" className="ct-btn ct-btn--outline ct-btn--block" onClick={handleWishlist}>
            <HeartIcon small filled={liked} /> {liked ? "In Your Wishlist" : "Add To Wishlist"}
          </button>
          <button type="button" className="ct-btn ct-btn--primary ct-btn--block" onClick={handleAddToCart}>
            ADD TO CART
          </button>
        </aside>
      </main>

      {/* ---------------- Related Products ---------------- */}
      <section className="ct-container ct-related">
        <div className="ct-related__head">
          <h2>Related products</h2>
          <Link to="/shop-list">See all products ›</Link>
        </div>
        <div className="ct-related__grid">
          {related.map((p) => (
            <RelatedCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <SiteFooter />
      <ScrollTopButton />
    </div>
  );
}

function RelatedCard({ product }) {
  const navigate = useNavigate();
  const { addToCart, addToWishlist, isInWishlist } = useShop();
  const liked = isInWishlist(product.id);

  return (
    <div className="ct-product-card">
      <div
        className="ct-product-card__media"
        onClick={() => navigate(`/product/${product.slug}`)}
        style={{ cursor: "pointer" }}
      >
        <img className="ct-jar-photo ct-jar-photo--compact" src={product.gallery[0]} alt={product.name} />
        <button
          type="button"
          className="ct-product-card__wish"
          aria-label={`Add ${product.name} to wishlist`}
          onClick={(e) => {
            e.stopPropagation();
            addToWishlist(product.id);
            navigate("/wishlist");
          }}
        >
          <HeartIcon small filled={liked} />
        </button>
      </div>
      <div className="ct-product-card__body">
        <h3>
          <Link to={`/product/${product.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
            {product.name}
          </Link>
        </h3>
        <div className="ct-product-card__footer">
          <span className="ct-product-card__price">
            {formatPrice(product.price)} <del>{formatPrice(product.oldPrice)}</del>
          </span>
          <button
            type="button"
            className="ct-product-card__cart"
            aria-label={`Add ${product.name} to cart`}
            onClick={() => {
              addToCart(product.id, 1);
              navigate("/cart");
            }}
          >
            <CartIcon small />
          </button>
        </div>
      </div>
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

function HeartIcon({ small, filled }) {
  const size = small ? 16 : 20;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={filled ? "#7A0000" : "none"} xmlns="http://www.w3.org/2000/svg">
      <path d="M17.3666 3.84172C16.941 3.41589 16.4356 3.0781 15.8794 2.84763C15.3232 2.61716 14.727 2.49854 14.1249 2.49854C13.5229 2.49854 12.9267 2.61716 12.3705 2.84763C11.8143 3.0781 11.3089 3.41589 10.8833 3.84172L9.99994 4.72506L9.1166 3.84172C8.25686 2.98198 7.0908 2.49898 5.87494 2.49898C4.65907 2.49898 3.49301 2.98198 2.63327 3.84172C1.77353 4.70147 1.29053 5.86753 1.29053 7.08339C1.29053 8.29925 1.77353 9.46531 2.63327 10.3251L3.5166 11.2084L9.99994 17.6917L16.4833 11.2084L17.3666 10.3251C17.7924 9.89943 18.1302 9.39407 18.3607 8.83785C18.5912 8.28164 18.7098 7.68546 18.7098 7.08339C18.7098 6.48132 18.5912 5.88514 18.3607 5.32893C18.1302 4.77271 17.7924 4.26735 17.3666 3.84172Z" stroke={filled ? "#7A0000" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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