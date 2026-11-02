import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Heart,
  ArrowRight,
  ArrowUp,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import "./ShopList.css";
import "../../components/SiteFooter.css";

import logo from "../../assets/logo.png";

// Page banner background — commented out for now, uncomment once the asset is in place.
// import bannerBg from "../../assets/background/bg2.jpg";

// the whole range side by side, shown at the end of the page
import collectionLineup from "../../assets/shop/collection-lineup.jpg";

import recentPost1 from "../../assets/shop/product/small/1.png";
import recentPost2 from "../../assets/shop/product/small/2.png";
import recentPost3 from "../../assets/shop/product/small/3.png";
import footerImg from "../../assets/footer/footer.png";
import Header from "../../components/Header";
import { api } from "../../api/client";
import { useShop } from "../../context/ShopContext";
import { formatPrice, fromServerProduct, sizeKey } from "../../data/products";

// Size filter: value is what the cards use ("" = all sizes).
const SIZES = [
    { value: "2oz", label: "2 OZ" },
    { value: "4oz", label: "4 OZ" },
    { value: "", label: "all" },
];

// Price slider bounds for a product list (whole dollars, never a zero-width range).
const priceBounds = (products) => {
    if (!products.length) return { min: 0, max: 1 };
    const prices = products.map((p) => p.price);
    const min = Math.floor(Math.min(...prices));
    return { min, max: Math.max(min + 1, Math.ceil(Math.max(...prices))) };
};

export default function ShopList() {
    return (
        <div className="ctw-shop-page">
            <Header />
            <PageBanner />
            <ShopSection />
            <CollectionLineup />
            <Footer />
            <ScrollTop />
        </div>
    );
}

/* ------------------------------ Page Banner ------------------------------ */

function PageBanner() {
    return (
        <div
            className="ctw-page-banner"
        // style={{ backgroundImage: `url(${bannerBg})` }}
        >
            <div className="ctw-page-banner-overlay" />
            <div className="ctw-page-banner-entry">
                <h1 className="ctw-page-banner-title">Products List</h1>
                <nav aria-label="breadcrumb">
                    <ul className="ctw-breadcrumb">
                        <li className="ctw-breadcrumb-item">
                            <Link to="/">Home</Link>
                        </li>
                        <li className="ctw-breadcrumb-sep" aria-hidden="true">✦</li>
                        <li className="ctw-breadcrumb-item" aria-current="page">Products List</li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}

/* --------------------------- Collection line-up --------------------------- */

// Full-width photo of the whole Chantallow range, after the product list.
function CollectionLineup() {
    return (
        <section className="ctw-lineup" aria-label="The Chantallow collection">
            <img
                src={collectionLineup}
                alt="The full Chantallow tallow collection: nine jars lined up on a stone ledge at sunset"
                loading="lazy"
                decoding="async"
            />
        </section>
    );
}

/* ------------------------------ Shop Section ------------------------------ */

function ShopSection() {
    // the search box is kept in the URL (?search=…), so the header search and
    // shared links open the shop already filtered
    const [params, setParams] = useSearchParams();
    const query = params.get("search") || "";
    const setQuery = (value) =>
        setParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                if (value) next.set("search", value);
                else next.delete("search");
                return next;
            },
            { replace: true }
        );

    // every product managed in Admin → Products
    const [products, setProducts] = useState(null);
    const [loadError, setLoadError] = useState(null);
    useEffect(() => {
        let cancelled = false;
        api("/products")
            .then((res) => !cancelled && setProducts(res.products.map(fromServerProduct)))
            .catch((err) => !cancelled && setLoadError(err.message));
        return () => {
            cancelled = true;
        };
    }, []);

    const { min: PRICE_MIN, max: PRICE_MAX } = useMemo(() => priceBounds(products || []), [products]);

    const [sizes, setSizes] = useState([]); // [] = all sizes
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(1);
    const [panelOpen, setPanelOpen] = useState(false); // filter panel on phones / tablets

    // once the products arrive, open the slider to their full price range
    useEffect(() => {
        setMinPrice(PRICE_MIN);
        setMaxPrice(PRICE_MAX);
    }, [PRICE_MIN, PRICE_MAX]);

    // ticking both sizes is the same as "all"
    const toggleSize = (value) => {
        if (!value) return setSizes([]);
        setSizes((prev) => {
            const next = prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value];
            return next.length === SIZES.length - 1 ? [] : next;
        });
    };

    const priceFiltered = minPrice > PRICE_MIN || maxPrice < PRICE_MAX;

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return (products || []).filter(
            (p) =>
                (!q || [p.name, p.subtitle, p.description, p.category].some((t) => String(t).toLowerCase().includes(q))) &&
                (!sizes.length || sizes.includes(sizeKey(p.size))) &&
                p.price >= minPrice &&
                p.price <= maxPrice
        );
    }, [products, query, sizes, minPrice, maxPrice]);

    const resetFilters = () => {
        setQuery("");
        setSizes([]);
        setMinPrice(PRICE_MIN);
        setMaxPrice(PRICE_MAX);
    };

    // chips for the filters in use (click to remove one)
    const chips = [
        query && { key: "search", label: `“${query}”`, clear: () => setQuery("") },
        ...sizes.map((size) => ({
            key: size,
            label: SIZES.find((s) => s.value === size).label,
            clear: () => toggleSize(size),
        })),
        priceFiltered && {
            key: "price",
            label: `$${minPrice} – $${maxPrice}`,
            clear: () => {
                setMinPrice(PRICE_MIN);
                setMaxPrice(PRICE_MAX);
            },
        },
    ].filter(Boolean);

    return (
        <section className="ctw-shop-section">
            <div className="ctw-shop-container">
                {/* SIDEBAR */}
                <aside id="shop-filters" className={panelOpen ? "ctw-shop-sidebar is-open" : "ctw-shop-sidebar"}>
                    <div className="ctw-filter-head">
                        <SlidersHorizontal size={20} strokeWidth={1.6} />
                        <h6>Filter</h6>
                    </div>

                    <div className="ctw-widget">
                        {/* filters as you type; the button just closes the panel on phones */}
                        <form
                            className="ctw-search-group"
                            role="search"
                            onSubmit={(e) => {
                                e.preventDefault();
                                setPanelOpen(false);
                            }}
                        >
                            <input
                                type="search"
                                placeholder="Search Product"
                                className="ctw-search-input"
                                aria-label="Search product"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button type="submit" className="ctw-search-submit" aria-label="Submit search">
                                <Search size={18} color="#fff" strokeWidth={1.6} />
                            </button>
                        </form>
                    </div>

                    <div className="ctw-widget">
                        <h6 className="ctw-widget-title">Select Size</h6>
                        <ul className="ctw-size-list">
                            {SIZES.map((size) => (
                                <li key={size.label}>
                                    <label className="ctw-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={size.value ? sizes.includes(size.value) : sizes.length === 0}
                                            onChange={() => toggleSize(size.value)}
                                        />
                                        {size.label}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="ctw-widget">
                        <h6 className="ctw-widget-title">Price</h6>
                        <PriceRange
                            lo={PRICE_MIN}
                            hi={PRICE_MAX}
                            min={minPrice}
                            max={maxPrice}
                            onMinChange={setMinPrice}
                            onMaxChange={setMaxPrice}
                        />
                        <div className="ctw-range-values">
                            <span>Min Price: ${minPrice}</span>
                            <span>Max Price: ${maxPrice}</span>
                        </div>
                    </div>

                    <button type="button" className="ctw-reset-btn" onClick={resetFilters}>
                        Reset All Filters
                    </button>
                </aside>

                {/* PRODUCT COLUMN */}
                <div>
                    <div className="ctw-filter-wrapper">
                        <div className="ctw-filter-left">
                            <span className="ctw-results-count" aria-live="polite">
                                {products ? `Showing ${visible.length} Of ${products.length} Results` : "Loading products…"}
                            </span>
                            {chips.length > 0 && (
                                <ul className="ctw-filter-tags">
                                    {chips.map((chip) => (
                                        <li key={chip.key}>
                                            <button
                                                type="button"
                                                className="ctw-tag-btn"
                                                onClick={chip.clear}
                                                aria-label={`Remove filter ${chip.label}`}
                                            >
                                                {chip.label}
                                                <X size={13} />
                                            </button>
                                        </li>
                                    ))}
                                    {chips.length > 1 && (
                                        <li>
                                            <button type="button" className="ctw-clear-btn" onClick={resetFilters}>
                                                Clear all
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>

                        <button
                            type="button"
                            className="ctw-panel-btn"
                            aria-expanded={panelOpen}
                            aria-controls="shop-filters"
                            onClick={() => setPanelOpen((v) => !v)}
                        >
                            <SlidersHorizontal size={16} />
                            {panelOpen ? "Hide Filters" : "Filter"}
                            {chips.length > 0 && <span className="ctw-panel-count">{chips.length}</span>}
                        </button>
                    </div>

                    {loadError ? (
                        <div className="ctw-no-results">
                            <h4>Couldn't load products</h4>
                            <p>{loadError}</p>
                        </div>
                    ) : !products ? (
                        <div className="ctw-no-results">
                            <p>Loading products…</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="ctw-no-results">
                            <h4>No products yet</h4>
                            <p>Check back soon.</p>
                        </div>
                    ) : visible.length === 0 ? (
                        <div className="ctw-no-results">
                            <h4>No products match</h4>
                            <p>Try a different search, size or price range.</p>
                            <button type="button" className="ctw-reset-btn" onClick={resetFilters}>
                                Reset All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="ctw-product-list">
                            {visible.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------ Price Range ------------------------------ */

function PriceRange({ lo, hi, min, max, onMinChange, onMaxChange }) {
    const range = hi - lo;
    const leftPct = ((min - lo) / range) * 100;
    const rightPct = ((max - lo) / range) * 100;

    return (
        <div className="ctw-range-wrap">
            <div className="ctw-range-track" />
            <div
                className="ctw-range-fill"
                style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
            />
            <input
                type="range"
                className="ctw-range-input"
                min={lo}
                max={hi}
                value={min}
                aria-label="Minimum price"
                onChange={(e) => onMinChange(Math.min(Number(e.target.value), max - 1))}
            />
            <input
                type="range"
                className="ctw-range-input"
                min={lo}
                max={hi}
                value={max}
                aria-label="Maximum price"
                onChange={(e) => onMaxChange(Math.max(Number(e.target.value), min + 1))}
            />
        </div>
    );
}

/* ------------------------------ Product Card ------------------------------ */

function ProductCard({ product }) {
    const { addToCart, toggleWishlist, isInWishlist, showToast } = useShop();
    const { id, name, subtitle, path, description, price, compareAtPrice, cardImage, size, inStock } = product;
    const liked = isInWishlist(id);

    const handleCart = () => {
        if (addToCart(id, 1, sizeKey(size), product)) showToast(`${name} added to cart`);
    };

    const handleWishlist = () => {
        if (!toggleWishlist(id, product)) return;
        showToast(liked ? `${name} removed from favourites` : `${name} added to favourites ♥`);
    };

    return (
        <article className="ctw-product-card">
            <div className="ctw-product-media">
                <Link to={path}>
                    <img className="ctw-product-photo" src={cardImage} alt={`Chantallow ${name}${size ? `, ${size}` : ""}`} />
                </Link>
            </div>

            <div>
                <div className="ctw-product-header">
                    <div>
                        <h4 className="ctw-product-title">
                            <Link to={path}>{name}</Link>
                        </h4>
                        {subtitle && (
                            <ul className="ctw-product-tags">
                                <li>
                                    <span>{subtitle}</span>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>

                {description && (
                    <p className="ctw-product-desc">
                        <strong>Description:</strong> {description}
                    </p>
                )}

                <div className="ctw-product-price">
                    {formatPrice(price)}
                    {compareAtPrice != null && <del>{formatPrice(compareAtPrice)}</del>}
                </div>

                {size && (
                    <div className="ctw-jar-sizes">
                        <span className="ctw-jar-size is-active">{size}</span>
                    </div>
                )}

                <div className="ctw-product-actions">
                    <button type="button" className="ctw-cart-btn" onClick={handleCart} disabled={!inStock}>
                        {inStock ? "Add To Cart" : "Out Of Stock"}
                    </button>
                    <button
                        type="button"
                        className={liked ? "ctw-bookmark-btn is-active" : "ctw-bookmark-btn"}
                        onClick={handleWishlist}
                        aria-pressed={liked}
                        aria-label={liked ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
                    >
                        <Heart size={18} strokeWidth={1.6} fill={liked ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>
        </article>
    );
}

/* -------------------------------- Footer -------------------------------- */

function Footer() {
    return (
        <footer className="ctw-footer">
            <div className="ctw-footer-grid">
                <div>
                    <div className="ctw-footer-logo">
                        <img src={logo} alt="Chantallow" />
                    </div>
                    <p className="ctw-footer-address-line">
                        <strong>Address :</strong> 000 Wall Street, UK, London
                    </p>
                    <p className="ctw-footer-address-line">
                        <strong>E-mail :</strong> example@info.com
                    </p>
                    <p className="ctw-footer-address-line">
                        <strong>Phone :</strong> (000) 000-0000
                    </p>
                    <h6 className="ctw-footer-newsletter-title">Subscribe To Our Newsletter</h6>
                    <div className="ctw-newsletter-form">
                        <input type="email" placeholder="Your Email Address" className="ctw-newsletter-input" />
                        <button aria-label="Subscribe" className="ctw-newsletter-submit">
                            <ArrowRight size={18} color="#1C1C1A" />
                        </button>
                    </div>
                </div>

                <div>
                    <h5 className="ctw-footer-heading">Recent Posts</h5>
                    {[
                        { title: "Hydrated Supple Skin", img: recentPost1 },
                        { title: "Glowing Radiant Skin", img: recentPost2 },
                        { title: "Silky Soft Skin", img: recentPost3 },
                    ].map((t) => (
                        <div key={t.title} className="ctw-footer-post">
                            <div className="ctw-footer-post-thumb">
                                <img src={t.img} alt="" />
                            </div>
                            <div className="ctw-footer-post-body">
                                <div className="ctw-footer-post-title">{t.title}</div>
                                <div className="ctw-footer-post-date">July 23, 2023</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div>
                    <h5 className="ctw-footer-heading">Useful Links</h5>
                    {[
                        { label: "Home", path: "/" },
                        { label: "About Us", path: "/aboutus" },
                        { label: "Returns", path: "#" },
                        { label: "Terms & Conditions", path: "/terms-and-conditions" },
                        { label: "Privacy-Policy", path: "/privacy-policy" },
                        { label: "Contact Us", path: "/contactus" },
                    ].map((l) => (
                        <Link key={l.label} to={l.path} className="ctw-underline-link ctw-footer-link">
                            {l.label}
                        </Link>
                    ))}
                </div>

                <div>
                    <h5 className="ctw-footer-heading">Social Media</h5>
                    {["Instagram", "Facebook", "YouTube", "Linkedin", "X.Com"].map((l) => (
                        <a key={l} href="#home" className="ctw-underline-link ctw-footer-social-link">
                            {l}
                        </a>
                    ))}
                </div>
            </div>

            <div className="ctw-footer-bottom">
                <p className="ctw-footer-copyright">
                    © 2026 <span className="ctw-footer-brand">Chantallow</span> Theme. All Rights Reserved.
                </p>
                <div className="ctw-footer-payments">
                    <span>We Accept:</span>
                    <img src={footerImg} alt="Accepted payment methods" />
                </div>
            </div>
        </footer>
    );
}

/* ------------------------------ Scroll To Top ------------------------------ */

function ScrollTop() {
    const [visible, setVisible] = useState(false);

    React.useEffect(() => {
        const handler = () => setVisible(window.scrollY > 400);
        window.addEventListener("scroll", handler);
        return () => window.removeEventListener("scroll", handler);
    }, []);

    if (!visible) return null;

    return (
        <button
            type="button"
            aria-label="Scroll to top"
            className="ctw-scroltop"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
            <ArrowUp size={18} />
        </button>
    );
}