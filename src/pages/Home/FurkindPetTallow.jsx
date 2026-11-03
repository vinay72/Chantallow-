// Furkind Pet Tallow detail page — same design as the other product pages
// (ProductDetail.jsx / ProductDetail.css), with the Furkind copy and photos.
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ship, PackageCheck } from "lucide-react";
import "../ShopList/ProductDetail.css";
import sealRecycle from "../../assets/a.png";
import sealNatural from "../../assets/b.png";
import sealMadeWithLove from "../../assets/c.png";
import front2oz from "../../assets/productdetailimages/Furkind/front 2oz.jpg";
import front4oz from "../../assets/productdetailimages/Furkind/front 4oz.png";
import ingredientsLabel from "../../assets/productdetailimages/Furkind/furkind ing.jpg";
import descriptionLabel from "../../assets/productdetailimages/Furkind/furkind Des.jpg";
import Header from "../../components/Header";
import SiteFooter from "../../components/SiteFooter";
import { useShop } from "../../context/ShopContext";
import ProductReviews, { RatingSummary, useProductReviews } from "../../components/ProductReviews";
import { api } from "../../api/client";
import { formatPrice, fromServerProduct, getProductBySlug } from "../../data/products";
import { PAGE_STYLES, sb, RelatedCard, HeartIcon, CheckIcon, ScrollTopButton } from "../ShopList/ProductDetail";

const PRODUCT = getProductBySlug("furkind-pet-tallow");

// 2 oz is the jar photo shown first; the 4 oz photo follows the size switch
const VIEWS = [
  { key: "2oz", label: "2 oz", src: front2oz },
  { key: "4oz", label: "4 oz", src: front4oz },
  { key: "ingredients", label: "Ingredients", src: ingredientsLabel },
  { key: "description", label: "Description", src: descriptionLabel },
];

const SIZES = [
  { key: "2oz", label: "2 Oz" },
  { key: "4oz", label: "4 Oz" },
];

export default function FurkindPetTallow() {
  const navigate = useNavigate();
  const { addToCart, addToWishlist, isInWishlist } = useShop();

  const reviews = useProductReviews(PRODUCT.slug);

  const [activeView, setActiveView] = useState(0);
  const [size, setSize] = useState("2oz");
  const [quantity, setQuantity] = useState(1);

  // related products come from Admin → Products, like the other detail pages
  const [related, setRelated] = useState([]);
  useEffect(() => {
    let cancelled = false;
    api("/products")
      .then((res) => !cancelled && setRelated(res.products.map(fromServerProduct).slice(0, 4)))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // choosing a size shows that size's jar photo
  const chooseSize = (key) => {
    setSize(key);
    const i = VIEWS.findIndex((v) => v.key === key);
    if (i >= 0) setActiveView(i);
  };

  /* -------- Pinned gallery scroll effect (same as ProductDetail) -------- */
  const galleryWrapperRef = useRef(null);
  const galleryInnerRef = useRef(null);
  useEffect(() => {
    const HEADER_OFFSET = 88;
    const reset = () => {
      if (galleryInnerRef.current) galleryInnerRef.current.style.transform = "";
    };
    const update = () => {
      const wrapper = galleryWrapperRef.current;
      const inner = galleryInnerRef.current;
      if (!wrapper || !inner) return;
      if (window.innerWidth <= 768) return reset();
      const wrapperRect = wrapper.getBoundingClientRect();
      const maxShift = wrapperRect.height - inner.getBoundingClientRect().height;
      if (maxShift <= 0) return reset();
      const shift = Math.min(Math.max(HEADER_OFFSET - wrapperRect.top, 0), maxShift);
      inner.style.transform = `translate3d(0, ${shift}px, 0)`;
    };
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
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

  const liked = isInWishlist(PRODUCT.id);
  const current = VIEWS[activeView] || VIEWS[0];
  const lineTotal = PRODUCT.price * quantity;
  const lineSavings = Math.max(0, PRODUCT.oldPrice - PRODUCT.price) * quantity;

  const handleAddToCart = () => {
    if (addToCart(PRODUCT.id, quantity, size, PRODUCT)) navigate("/cart");
  };
  const handleWishlist = () => {
    if (addToWishlist(PRODUCT.id, PRODUCT)) navigate("/wishlist");
  };

  return (
    <div className="ct-page">
      <style>{PAGE_STYLES}</style>
      <Header />

      {/* ---------------- Banner ---------------- */}
      <div className="ct-banner">
        <div className="ct-banner__inner">
          <h1>{PRODUCT.name}</h1>
          <nav aria-label="Breadcrumb" className="ct-breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">◆</span>
            <span>{PRODUCT.name}</span>
          </nav>
        </div>
      </div>

      {/* ---------------- Product Detail ---------------- */}
      <main className="ct-container ct-product">
        <section className="ct-gallery" aria-label="Product images" ref={galleryWrapperRef}>
          <div className="ct-gallery__main" ref={galleryInnerRef}>
            <div className="ct-stage">
              <img
                className="ct-stage__media"
                src={current.src}
                alt={`${PRODUCT.name} — ${current.label}`}
                decoding="async"
                fetchpriority="high"
              />
            </div>
            <div className="ct-gallery__thumbs">
              {VIEWS.map((v, i) => (
                <button
                  key={v.key}
                  type="button"
                  className={`ct-gallery__thumb ${i === activeView ? "is-active" : ""}`}
                  onClick={() => setActiveView(i)}
                  aria-label={`Show ${v.label}`}
                  aria-pressed={i === activeView}
                  title={v.label}
                  style={{ backgroundImage: `url(${v.src})` }}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="ct-info" aria-label="Product information">
          <span className="ct-badge">{PRODUCT.badge}</span>
          <h2 className="ct-info__title">{PRODUCT.name}</h2>
          <p className="ct-info__subtitle">{PRODUCT.subtitle}</p>
          <RatingSummary reviews={reviews} />

          <div className="ct-copy-block">
            <h3>Description:</h3>
            <p>{PRODUCT.description}</p>
          </div>

          <div className="ct-copy-block">
            <h3>Ingredients:</h3>
            <p>{PRODUCT.ingredients}</p>
          </div>

          <div className="ct-copy-block">
            <h3>Directions:</h3>
            <p>
              Using clean fingertips, apply a small amount of balm directly to your pet's paws, nose, elbows, or other
              areas of dry or irritated skin. Gently massage until absorbed. Use daily for routine maintenance or as
              needed to provide extra hydration and protection. For best results, apply after outdoor activities,
              bathing, or whenever skin appears dry. For external use only. Perform a patch test before first use.
              Store in a cool, dry place away from direct sunlight.
            </p>
            <p className="ct-copy-note">Use within 12 months of opening.</p>
          </div>

          <hr className="ct-divider" />

          <fieldset className="ct-size">
            <legend className="ct-label">Select Size</legend>
            <div className="ct-size__options">
              {SIZES.map((s) => (
                <label key={s.key} className={`ct-size__option ${size === s.key ? "is-selected" : ""}`}>
                  <input type="radio" name="size" checked={size === s.key} onChange={() => chooseSize(s.key)} />
                  {s.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="ct-price-row">
            <span className="ct-label">Price</span>
            <div className="ct-price">
              <span className="ct-price__current">{formatPrice(PRODUCT.price)}</span>
              <del className="ct-price__old">{formatPrice(PRODUCT.oldPrice)}</del>
            </div>
          </div>

          <div className="ct-qty-row">
            <span className="ct-label">Quantity</span>
            <div className="ct-qty-stepper">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
              <input type="text" readOnly value={quantity} aria-label="Quantity" />
              <button type="button" onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity">+</button>
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
            <strong>SKU:</strong> <span>CT-FURKIND</span>
          </div>

          <div className="ct-meta-row ct-share">
            <strong>Share:</strong>
            <a href="https://www.facebook.com/sharer/sharer.php" target="_blank" rel="noreferrer" aria-label="Share on Facebook">f</a>
            <a href="https://www.linkedin.com/sharing/share-offsite/" target="_blank" rel="noreferrer" aria-label="Share on LinkedIn">in</a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Share on Instagram">ig</a>
            <a href="https://twitter.com/intent/tweet" target="_blank" rel="noreferrer" aria-label="Share on X">x</a>
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

        <aside className="ct-sidebar" aria-label="Order summary" style={sb.box}>
          <button type="button" style={{ ...sb.outlineBtn, marginBottom: 18 }} onClick={() => navigate("/shop-list")}>
            Bank Offer 5% Cashback
          </button>

          <div style={sb.perk}>
            <Ship size={38} strokeWidth={1.2} color="#1C1C1A" aria-hidden="true" style={{ flexShrink: 0 }} />
            <div>
              <span style={sb.perkSmall}>Easy Returns</span>
              <h4 style={sb.perkTitle}>30 Days</h4>
            </div>
          </div>

          <div style={sb.perk}>
            <PackageCheck size={38} strokeWidth={1.2} color="#1C1C1A" aria-hidden="true" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={sb.perkTitle}>Enjoy The Product</h4>
              <p style={sb.perkDesc}>Lorem Ipsum is simply dummy text of the printing and typesetting</p>
            </div>
          </div>

          <div style={sb.save}>
            <CheckIcon /> You will save {formatPrice(lineSavings)} on this order
          </div>

          <div style={sb.total}>
            <span style={{ fontSize: 15, color: "#5A5A52" }}>Total</span>
            <strong style={{ fontSize: 24, fontWeight: 600, color: "#1C1C1A" }}>{formatPrice(lineTotal)}</strong>
          </div>

          <button type="button" style={sb.outlineBtn} onClick={handleWishlist}>
            <HeartIcon small filled={liked} /> {liked ? "In Your Wishlist" : "Add To Wishlist"}
          </button>
          <button type="button" style={sb.primaryBtn} onClick={handleAddToCart}>
            Add To Cart
          </button>
        </aside>
      </main>

      {/* ---------------- Ratings & Reviews ---------------- */}
      <ProductReviews productKey={PRODUCT.slug} reviews={reviews} />

      {/* ---------------- Related Products ---------------- */}
      <section className="ct-container ct-related">
        <div className="ct-related__head">
          <h2>Related Products</h2>
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
