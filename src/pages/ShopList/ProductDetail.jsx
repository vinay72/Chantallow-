import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Ship, PackageCheck } from "lucide-react";
import "./ProductDetail.css";
import sealRecycle from "../../assets/a.png";
import sealNatural from "../../assets/b.png";
import sealMadeWithLove from "../../assets/c.png";
import SiteFooter from "../../components/SiteFooter";
import { useShop } from "../../context/ShopContext";
import { formatPrice, fromServerProduct, getProductMedia, sizeKey, DEFAULT_DIRECTIONS, DEFAULT_DIRECTIONS_NOTE } from "../../data/products";
import { api } from "../../api/client";
import Header from "../../components/Header";
import ProductReviews, { RatingSummary, useProductReviews } from "../../components/ProductReviews";

// "Bare Whipped Tallow" -> "bare-whipped-tallow", so older /product/<name> links still find the product
const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ---- Brand look (matches the original design) ---- */
const BRAND_GREEN = "#1B4D3E";
const LINE = "#D5E2DA";

// Font + colour overrides so this page matches the original design:
// Marcellus for titles, Lufga for all body text, green primary buttons.
export const PAGE_STYLES = `
  .ct-page, .ct-page p, .ct-page li, .ct-page span, .ct-page a,
  .ct-page button, .ct-page input, .ct-page label, .ct-page legend,
  .ct-page h3, .ct-page h4, .ct-page h5, .ct-page h6, .ct-page strong {
    font-family: 'Lufga', sans-serif;
  }
  .ct-page .ct-banner h1,
  .ct-page .ct-info__title,
  .ct-page .ct-related__head h2,
  .ct-page .ct-product-card__body h3 {
    font-family: 'Marcellus', serif;
    font-weight: 400;
  }
  .ct-page .ct-info__title { font-size: 34px; margin: 8px 0 6px; color: #2D2E2F; }
  .ct-page .ct-info__subtitle { font-size: 15px; color: #5A5A52; }

  /* Description / Ingredients / Directions — one consistent text style */
  .ct-page .ct-copy-block { margin-bottom: 26px; }
  .ct-page .ct-copy-block h3 {
    font-size: 15px; font-weight: 600; color: #2D2E2F; margin: 0 0 6px;
  }
  .ct-page .ct-copy-block p {
    font-size: 15px; line-height: 1.7; color: #5A5A52; margin: 0;
  }
  .ct-page .ct-copy-block p.ct-copy-note { color: #2D2E2F; font-weight: 600; }

  /* Buttons + radios in brand green */
  .ct-page .ct-btn--primary {
    background: ${BRAND_GREEN}; border-color: ${BRAND_GREEN}; color: #fff;
  }
  .ct-page .ct-btn--primary:hover { filter: brightness(1.12); }
  .ct-page .ct-size input[type="radio"] { accent-color: ${BRAND_GREEN}; }

  /* Related products: left-aligned names like the original */
  .ct-page .ct-product-card__body h3 { text-align: left; font-size: 20px; }

  /* Footer headings */
  .ct-page footer h5, .ct-page footer h6 { font-family: 'Lufga', sans-serif; color: ${BRAND_GREEN}; }

  /* ---------- Alignment ----------
     Horizontal: text is justified, so every line runs edge to edge
     (straight left AND right edges). The last line of each paragraph
     stays left-aligned so short last lines don't stretch.
     Vertical: the three columns start on the same top line, and every
     block / paragraph uses the same even spacing. */
  .ct-page .ct-product { align-items: stretch; }
  .ct-page .ct-info { padding-right: 8px; }
  .ct-page .ct-info > :first-child { margin-top: 0; }
  .ct-page .ct-badge { margin: 0 0 12px; }

  .ct-page .ct-copy-block,
  .ct-page .ct-divider { max-width: none; }

  .ct-page .ct-copy-block p,
  .ct-page .ct-fineprint,
  .ct-page .ct-sidebar p {
    text-align: justify;
    text-align-last: left;
    hyphens: auto;
    -webkit-hyphens: auto;
    word-spacing: normal;
  }
  /* even gap between description paragraphs */
  .ct-page .ct-copy-block p + p { margin-top: 10px; }
  /* even gap between Description / Ingredients / Directions */
  .ct-page .ct-copy-block { margin: 0 0 24px; }
  .ct-page .ct-copy-block:last-of-type { margin-bottom: 0; }
  .ct-page .ct-divider { margin: 24px 0; }

  .ct-page .ct-fineprint { max-width: none; }

  /* sidebar sits on the same top line as the image and text */
  .ct-page .ct-sidebar { margin-top: 0; }

  /* ---------- Gallery: square HD image + 4 thumbnails underneath ----------
     The product photos are square (2000x2000), so a square frame shows the
     whole photo at full sharpness — no stretching or cropping. */
  .ct-page .ct-gallery__main {
    height: auto; min-height: 0; max-height: none;
    display: block; background: transparent; box-shadow: none;
    border-radius: 0; overflow: visible;
  }
  .ct-page .ct-stage {
    position: relative; width: 100%; aspect-ratio: 1 / 1;
    border-radius: 14px; overflow: hidden; background: #fff;
    box-shadow: 0 10px 30px rgba(31, 35, 33, 0.08);
  }
  .ct-page .ct-stage__media {
    /* contain: the whole jar always shows (the 4 oz photos are a little taller than wide) */
    width: 100%; height: 100%; object-fit: contain; display: block;
    image-rendering: auto; user-select: none; -webkit-user-drag: none;
  }
  .ct-page .ct-stage__hint {
    position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%);
    padding: 6px 14px; border-radius: 20px; background: rgba(28, 28, 26, 0.72);
    color: #fff; font-size: 12px; letter-spacing: 0.04em; white-space: nowrap;
    pointer-events: none;
  }
  .ct-page .ct-gallery__thumbs {
    position: static; transform: none; left: auto; bottom: auto;
    display: flex; justify-content: center; gap: 10px; margin-top: 14px;
  }
  .ct-page .ct-gallery__thumb {
    position: relative; width: 74px; height: 74px; padding: 0;
    border: 2px solid transparent; border-radius: 6px; background-color: #fff;
    background-size: cover; background-position: center; box-shadow: 0 3px 10px rgba(0,0,0,0.12);
    cursor: pointer;
  }
  .ct-page .ct-gallery__thumb.is-active { border-color: ${BRAND_GREEN}; }
  .ct-page .ct-gallery__thumb-tag {
    position: absolute; left: 50%; bottom: 4px; transform: translateX(-50%);
    padding: 1px 6px; border-radius: 8px; background: ${BRAND_GREEN}; color: #fff;
    font-size: 10px; font-weight: 600; line-height: 1.5;
  }
`;

export const sb = {
  box: { border: `1px solid ${LINE}`, padding: "28px 26px", alignSelf: "start", background: "transparent" },
  outlineBtn: {
    width: "100%",
    background: "transparent",
    border: "1px solid #2D2E2F",
    color: "#1C1C1A",
    padding: "13px 16px",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  perk: {
    border: `1px solid ${LINE}`,
    padding: "18px 18px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 14,
    textAlign: "left",
  },
  perkSmall: { display: "block", fontSize: 13, color: "#5A5A52", marginBottom: 2 },
  perkTitle: { margin: 0, fontSize: 16, fontWeight: 600, color: "#1C1C1A" },
  perkDesc: { margin: "6px 0 0", fontSize: 13.5, lineHeight: 1.6, color: "#5A5A52" },
  save: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "18px 0",
    borderBottom: `1px solid ${LINE}`,
    fontSize: 15,
    fontWeight: 500,
    color: "#1C1C1A",
  },
  total: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 0" },
  primaryBtn: {
    width: "100%",
    background: BRAND_GREEN,
    color: "#fff",
    border: "none",
    padding: "16px",
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    cursor: "pointer",
    marginTop: 14,
  },
};

/**
 * Chantallow — Product Detail Page
 * Route: /product/:slug   e.g. /product/11, or /product/bare-whipped-tallow
 * The product comes from Admin → Products (GET /api/products).
 */

export function ScrollTopButton() {
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

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToWishlist, isInWishlist } = useShop();

  // The whole catalogue: the product itself (by id, or by name for older
  // /product/<name> links) plus the related products below it.
  const [catalogue, setCatalogue] = useState(null);
  const [loadError, setLoadError] = useState(null);
  useEffect(() => {
    let cancelled = false;
    api("/products")
      .then((res) => !cancelled && setCatalogue(res.products.map(fromServerProduct)))
      .catch((err) => !cancelled && setLoadError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);
  const product =
    catalogue &&
    (catalogue.find((p) => String(p.dbId) === String(slug)) || catalogue.find((p) => slugify(p.name) === slug));

  // ratings + reviews are keyed by the product's database id
  const reviews = useProductReviews(product ? String(product.dbId) : null);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("4oz");
  const [quantity, setQuantity] = useState(1);

  const decrementQty = () => setQuantity((q) => Math.max(1, q - 1));
  const incrementQty = () => setQuantity((q) => q + 1);

  // Reset selections and jump to top whenever a different product is opened
  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  // the cart's size is the product's own size from the admin panel
  useEffect(() => {
    if (product) setSelectedSize(sizeKey(product.size));
  }, [product]);

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

  /* -------- Loading / unknown product -------- */
  if (!product) {
    return (
      <div className="ct-page">
        <Header />
        <main className="ct-container" style={{ padding: "120px 24px", textAlign: "center" }}>
          {!catalogue && !loadError ? (
            <p>Loading product…</p>
          ) : (
            <>
              <h2>{loadError ? "Couldn't load this product" : "Product not found"}</h2>
              <p>{loadError || "We couldn't find that product."}</p>
              <Link to="/shop-list" className="ct-btn ct-btn--primary">Back to shop</Link>
            </>
          )}
        </main>
        <SiteFooter />
      </div>
    );
  }

  const liked = isInWishlist(product.id);
  const descriptionParas = String(product.description || "").split(/\n\s*\n/).filter(Boolean);
  const directions = product.directions || DEFAULT_DIRECTIONS;
  const directionsNote = product.directions ? null : DEFAULT_DIRECTIONS_NOTE;
  // Front (the admin cover) → back labels (ingredients, description) → 360° turn.
  // A product with no back-label photos falls back to its admin gallery photos.
  const cover = product.cardImage;
  const media = getProductMedia(product.name);
  const backs = [
    media.ingredients && { role: "ingredients", label: "Ingredients", type: "image", src: media.ingredients },
    media.description && { role: "description", label: "Description", type: "image", src: media.description },
  ].filter(Boolean);
  const extras = backs.length
    ? backs
    : product.gallery.filter((src) => src !== cover).map((src, i) => ({ role: `photo-${i}`, label: `Photo ${i + 2}`, type: "image", src }));
  const views = [
    { role: "front", label: "Front", type: "image", src: cover },
    ...extras,
    media.spin
      ? { role: "spin", label: "360°", ...media.spin }
      : { role: "spin", label: "360°", type: "turntable", front: cover, back: backs[0]?.src || extras[0]?.src || cover },
  ];
  const safeIndex = Math.min(activeImage, Math.max(0, views.length - 1));
  const current = views[safeIndex] || { role: "photo-0", label: "Photo", type: "image", src: cover };
  const related = (catalogue || []).filter((p) => p.id !== product.id).slice(0, 4);
  const lineTotal = product.price * quantity;
  const lineSavings = Math.max(0, (product.oldPrice || product.price) - product.price) * quantity;

  const handleAddToCart = () => {
    if (addToCart(product.id, quantity, selectedSize, product)) navigate("/cart");
  };

  const handleWishlist = () => {
    if (addToWishlist(product.id, product)) navigate("/wishlist");
  };

  return (
    <div className="ct-page">
      <style>{PAGE_STYLES}</style>
      <Header />

      {/* ---------------- Banner ---------------- */}
      <div className="ct-banner">
        <div className="ct-banner__inner">
          <h1>{product.name}</h1>
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
            <div className="ct-stage">
              {current.role === "spin" ? (
                <Spin360 view={current} poster={cover} alt={`${product.name} 360° view`} />
              ) : (
                <img
                  className="ct-stage__media"
                  src={current.src}
                  alt={`${product.name} — ${current.label}`}
                  decoding="async"
                  fetchpriority={safeIndex === 0 ? "high" : "auto"}
                />
              )}
            </div>

            {views.length > 1 && (
              <div className="ct-gallery__thumbs">
                {views.map((v, i) => (
                  <button
                    key={v.role}
                    type="button"
                    className={`ct-gallery__thumb ${i === safeIndex ? "is-active" : ""}`}
                    onClick={() => setActiveImage(i)}
                    aria-label={`Show ${v.label}`}
                    aria-pressed={i === safeIndex}
                    title={v.label}
                    style={{
                      backgroundImage: `url(${v.type === "frames" ? v.frames[0] : v.type === "video" || v.type === "turntable" ? cover : v.src})`,
                    }}
                  >
                    {v.role === "spin" && <span className="ct-gallery__thumb-tag">360°</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="ct-info" aria-label="Product information">
          {product.badge && <span className="ct-badge">{product.badge}</span>}
          <h2 className="ct-info__title">{product.name}</h2>
          {product.subtitle && <p className="ct-info__subtitle">{product.subtitle}</p>}
          <RatingSummary reviews={reviews} />

          {descriptionParas.length > 0 && (
            <div className="ct-copy-block">
              <h3>Description:</h3>
              {descriptionParas.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}

          {product.ingredients && (
            <div className="ct-copy-block">
              <h3>Ingredients:</h3>
              <p>{product.ingredients}</p>
            </div>
          )}

          <div className="ct-copy-block">
            <h3>Directions:</h3>
            {/* Same text style as Description — numbered lines, not a big list */}
            {Array.isArray(directions) ? (
              directions.map((step, i) => (
                <p key={i}>
                  {i + 1}. {step}
                </p>
              ))
            ) : (
              <p>{directions}</p>
            )}
            {directionsNote && <p className="ct-copy-note">{directionsNote}</p>}
          </div>

          <hr className="ct-divider" />

          {product.size && (
            <fieldset className="ct-size">
              <legend className="ct-label">Size</legend>
              <div className="ct-size__options">
                <span className="ct-size__option is-selected">{product.size}</span>
              </div>
            </fieldset>
          )}

          <div className="ct-price-row">
            <span className="ct-label">Price</span>
            <div className="ct-price">
              <span className="ct-price__current">{formatPrice(product.price)}</span>
              {product.oldPrice != null && <del className="ct-price__old">{formatPrice(product.oldPrice)}</del>}
            </div>
          </div>
          {!product.inStock && <p className="ct-copy-note">Out of stock</p>}

          <div className="ct-qty-row">
            <span className="ct-label">Quantity</span>
            <div className="ct-qty-stepper">
              <button type="button" onClick={decrementQty} aria-label="Decrease quantity">−</button>
              <input type="text" readOnly value={quantity} aria-label="Quantity" />
              <button type="button" onClick={incrementQty} aria-label="Increase quantity">+</button>
            </div>
          </div>

          <div className="ct-cta-row">
            <button type="button" className="ct-btn ct-btn--primary" onClick={handleAddToCart} disabled={!product.inStock}>
              ADD TO CART
            </button>
            <button type="button" className="ct-btn ct-btn--outline" onClick={handleWishlist}>
              <HeartIcon small filled={liked} /> {liked ? "In Your Wishlist" : "Add To Wishlist"}
            </button>
          </div>

          <hr className="ct-divider" />

          <div className="ct-meta-row">
            <strong>SKU:</strong> <span>CT-{String(product.dbId).padStart(4, "0")}</span>
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

        <aside className="ct-sidebar" aria-label="Order summary" style={sb.box}>
          <button type="button" style={{ ...sb.outlineBtn, marginBottom: 18 }}>
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
          <button type="button" style={sb.primaryBtn} onClick={handleAddToCart} disabled={!product.inStock}>
            Add To Cart
          </button>
        </aside>
      </main>

      {/* ---------------- Ratings & Reviews ---------------- */}
      <ProductReviews productKey={String(product.dbId)} reviews={reviews} />

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

/* ---------------- 360° view ----------------
   Works with: a video (.mp4/.webm) that rotates the jar, a .gif,
   or a folder of frames (drag left/right to turn the jar). */
function Spin360({ view, poster, alt }) {
  if (view.type === "turntable") return <Turntable front={view.front} back={view.back} alt={alt} />;
  if (view.type === "frames") return <SpinFrames frames={view.frames} alt={alt} />;
  if (view.type === "video") {
    return (
      <>
        <video className="ct-stage__media" src={view.src} poster={poster} autoPlay muted loop playsInline />
        <span className="ct-stage__hint">360° view</span>
      </>
    );
  }
  return (
    <>
      <img className="ct-stage__media" src={view.src} alt={alt} decoding="async" />
      <span className="ct-stage__hint">360° view</span>
    </>
  );
}

/* 360° made from the front photo: the jar turns all the way round, showing the
   front label and then the back (ingredients) label. Spins by itself; drag to turn it. */
function Turntable({ front, back, alt }) {
  const [angle, setAngle] = useState(0);
  const auto = useRef(true);
  const drag = useRef(null);

  useEffect(() => {
    let raf;
    let last = performance.now();
    const tick = (now) => {
      if (auto.current) setAngle((a) => (a + (now - last) * 0.045) % 360); // ~8s per turn
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onDown = (e) => {
    auto.current = false;
    drag.current = { x: e.clientX, start: angle };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    if (!drag.current) return;
    setAngle(drag.current.start + (e.clientX - drag.current.x) * 0.6);
  };
  const onUp = () => {
    drag.current = null;
  };

  const face = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    userSelect: "none",
  };

  return (
    <div
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{ width: "100%", height: "100%", perspective: 1400, cursor: "grab", touchAction: "pan-y" }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transform: `rotateY(${angle}deg)`,
        }}
      >
        <img src={front} alt={alt} draggable={false} style={face} />
        <img src={back} alt="" aria-hidden="true" draggable={false} style={{ ...face, transform: "rotateY(180deg)" }} />
      </div>
      <span className="ct-stage__hint">⟲ 360° — drag to turn</span>
    </div>
  );
}

function SpinFrames({ frames, alt }) {
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const drag = useRef(null);
  const n = frames.length;

  // preload every frame so turning is smooth
  useEffect(() => {
    frames.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [frames]);

  // slow automatic spin until the visitor grabs it
  useEffect(() => {
    if (!auto) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), 100);
    return () => clearInterval(t);
  }, [auto, n]);

  const onDown = (e) => {
    setAuto(false);
    drag.current = { x: e.clientX, start: index };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    if (!drag.current) return;
    const steps = Math.round((e.clientX - drag.current.x) / 8);
    setIndex((((drag.current.start - steps) % n) + n) % n);
  };
  const onUp = () => {
    drag.current = null;
  };

  return (
    <div
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{ width: "100%", height: "100%", cursor: "grab", touchAction: "pan-y" }}
    >
      <img className="ct-stage__media" src={frames[index]} alt={alt} draggable={false} />
      <span className="ct-stage__hint">⟲ Drag to rotate 360°</span>
    </div>
  );
}

export function RelatedCard({ product }) {
  const navigate = useNavigate();
  const { addToCart, addToWishlist, isInWishlist } = useShop();
  const liked = isInWishlist(product.id);

  return (
    <div className="ct-product-card">
      <div
        className="ct-product-card__media"
        onClick={() => navigate(product.path)}
        style={{ cursor: "pointer" }}
      >
        <img className="ct-jar-photo ct-jar-photo--compact" src={product.cardImage} alt={product.name} />
        <button
          type="button"
          className="ct-product-card__wish"
          aria-label={`Add ${product.name} to wishlist`}
          onClick={(e) => {
            e.stopPropagation();
            if (addToWishlist(product.id, product)) navigate("/wishlist");
          }}
        >
          <HeartIcon small filled={liked} />
        </button>
      </div>
      <div className="ct-product-card__body">
        <h3>
          <Link to={product.path} style={{ color: "inherit", textDecoration: "none" }}>
            {product.name}
          </Link>
        </h3>
        <div className="ct-product-card__footer">
          <span className="ct-product-card__price">
            {formatPrice(product.price)} {product.oldPrice != null && <del>{formatPrice(product.oldPrice)}</del>}
          </span>
          <button
            type="button"
            className="ct-product-card__cart"
            aria-label={`Add ${product.name} to cart`}
            disabled={!product.inStock}
            onClick={() => {
              if (addToCart(product.id, 1, sizeKey(product.size), product)) navigate("/cart");
            }}
          >
            <CartIcon small />
          </button>
        </div>
      </div>
    </div>
  );
}

export function HeartIcon({ small, filled }) {
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

export function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M18.3327 9.2415V9.99984C18.3317 11.8153 17.7438 13.5819 16.6562 15.0364C15.5686 16.4909 14.0403 17.5555 12.2988 18.0717C10.5572 18.5879 8.69569 18.5279 6.99098 17.9004C5.28627 17.273 3.82868 16.1124 2.83801 14.5912C1.84733 13.0701 1.37559 11.2698 1.49356 9.45778C1.61152 7.64575 2.31294 5.92137 3.49353 4.54122C4.67413 3.16106 6.27132 2.19883 8.04565 1.79539C9.81998 1.39194 11.6767 1.56876 13.3427 2.29984" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.3333 3.33325L10 11.6749L7.5 9.17492" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}