import React, { useState } from "react";
import {
    Search, Heart, ShoppingCart, Menu, ArrowRight, ArrowUp, X, SlidersHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./ShopList.css";

import logo from "../../assets/logo.png";

// Page banner background — commented out for now, uncomment once the asset is in place.
// import bannerBg from "../../assets/background/bg2.jpg";

import product1 from "../../assets/shop/product/1.png"; // Amber Glow
import product2 from "../../assets/shop/product/2.png"; // Amethyst Relief
import product3 from "../../assets/shop/product/3.png"; // Jasper Revive
import malachiteFusionJar from "../../assets/beauty/malachite-fusion.jpg";
import obsidianInfusionJar from "../../assets/beauty/obsidian-infusion.jpg";
import olivineReliefJar from "../../assets/beauty/olivine-relief.jpg";


import recentPost1 from "../../assets/shop/product/small/1.png";
import recentPost2 from "../../assets/shop/product/small/2.png";
import recentPost3 from "../../assets/shop/product/small/3.png";
import footerImg from "../../assets/footer/footer.png";

const NAV_LINKS = [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/aboutus" },
    { label: "Shop", path: "/shopcart" },
    { label: "Blog", path: "/blog" },
    { label: "Contact Us", path: "/contactus" },
];

const SIZES = ["4 OZ", "1.7 OZ", "all"];

const PRODUCTS = [
    {
        id: 1,
        name: "Malachite Fusion",
        tag: "Moringa + Butterfly Pea Infused Tallow",
        path: "/product/malachite-fusion",
        rating: 3,
        reviews: 370,
        description:
            "A rich, nourishing tallow crème made with grass-fed, grass-finished beef tallow and infused with botanical herbs to deeply moisturize and support soft, healthy-looking skin naturally.",
        price: "$66",
        was: "$89",
        img: malachiteFusionJar,
    },
    {
        id: 2,
        name: "Jasper Revive",
        tag: "Coffee Infused Tallow",
        path: "/product/jasper-revive",
        rating: 3,
        reviews: 255,
        description:
            "A rich and moisturizing tallow crème infused with organic whole bean Colombian coffee to help soften, hydrate, and refresh the skin naturally. This handcrafted blend delivers deep nourishment with a smooth feel and warm coffee essence for everyday skincare.",
        price: "$00",
        was: "$00",
        img: product3,
    },
    {
        id: 3,
        name: "Amber Glow",
        tag: "1122+ MGO Manuka + Lavender Infused Tallow",
        path: "/product/amber-glow",
        rating: 5,
        reviews: 455,
        description:
            "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
        price: "$80",
        was: "$89",
        img: product1,
    },
    {
        id: 4,
        name: "Amethyst Relief",
        tag: "Lavender Infused & Whipped Tallow",
        path: "/product/amethyst-relief",
        rating: 5,
        reviews: 370,
        description:
            "Our Lavender Infused Tallow is a rich, handcrafted moisturizer designed to soften and refresh your skin naturally. By combining the deep nourishment of grass-fed tallow with the soothing essence of organic lavender, this crème provides a smooth feel and a peaceful aroma for your everyday skincare routine.",
        price: "$00",
        was: "$00",
        img: product2,
    },
    {
        id: 5,
        name: "Obsidian Infusion",
        tag: "Cacao Infused Tallow",
        path: "/product/obsidian-infusion",
        rating: 5,
        reviews: 370,
        description:
            "A rich and moisturizing tallow crème infused with organic cacao and hazelnut coffee to help soften, hydrate, and refresh the skin naturally. This handcrafted blend delivers deep nourishment with a smooth feel and a warm, comforting scent for everyday skincare.",
        price: "$00",
        was: "$00",
        img: obsidianInfusionJar,
    },
    {
        id: 6,
        name: "Oilivine Relief",
        tag: "Zechstein Magnesium + Arnica",
        path: "/product/olivine-relief",
        rating: 5,
        reviews: 370,
        description:
            "A powerful and restorative tallow balm designed to soothe sore muscles, calm the skin, and provide natural anti-inflammatory relief. Handcrafted with magnesium, arnica, and willow bark, this deeply nourishing crème helps reduce swelling and bruising while leaving your skin feeling hydrated and refreshed.",
        price: "$00",
        was: "$00",
        img: olivineReliefJar,
    },
];

const PRICE_MIN = 0;
const PRICE_MAX = 500;

export default function ShopList() {
    return (
        <div className="ctw-shop-page">
            <Header />
            <PageBanner />
            <ShopSection />
            <Footer />
            <ScrollTop />
        </div>
    );
}

/* -------------------------------- Header -------------------------------- */

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="ctw-header">
            <div className="ctw-header-inner">
                <Link to="/" className="ctw-header-logo">
                    <img src={logo} alt="Chantallow" />
                </Link>

                <nav className={menuOpen ? "ctw-nav is-open" : "ctw-nav"}>
                    {NAV_LINKS.map((link) => (
                        <Link key={link.label} to={link.path} className="ctw-nav-link">
                            {link.label} <span className="ctw-nav-plus">+</span>
                        </Link>
                    ))}
                </nav>

                <div className="ctw-header-actions">
                    <Link to="/registration" className="ctw-login-link">
                        Login /<br />Register
                    </Link>
                    <button aria-label="Search" className="ctw-icon-btn">
                        <Search size={20} strokeWidth={1.5} color="#000" />
                    </button>
                    <button aria-label="Wishlist" className="ctw-icon-btn">
                        <Heart size={20} strokeWidth={1.5} color="#000" />
                    </button>
                    <button aria-label="Cart" className="ctw-icon-btn">
                        <ShoppingCart size={20} strokeWidth={1.5} color="#000" />
                    </button>
                    <button
                        aria-label="Toggle menu"
                        onClick={() => setMenuOpen((v) => !v)}
                        className="ctw-icon-btn ctw-menu-btn"
                    >
                        <Menu size={22} />
                    </button>
                </div>
            </div>
        </header>
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

/* ------------------------------ Shop Section ------------------------------ */

function ShopSection() {
    const [sizes, setSizes] = useState([]);
    const [minPrice, setMinPrice] = useState(19);
    const [maxPrice, setMaxPrice] = useState(346);
    const [tags, setTags] = useState(["Tallow"]);

    const toggleSize = (size) =>
        setSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));

    const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));

    const resetFilters = () => {
        setSizes([]);
        setMinPrice(19);
        setMaxPrice(346);
        setTags(["Tallow"]);
    };

    return (
        <section className="ctw-shop-section">
            <div className="ctw-shop-container">
                {/* SIDEBAR */}
                <aside className="ctw-shop-sidebar">
                    <div className="ctw-filter-head">
                        <SlidersHorizontal size={20} strokeWidth={1.6} />
                        <h6>Filter</h6>
                    </div>

                    <div className="ctw-widget">
                        <div className="ctw-search-group">
                            <input
                                type="search"
                                placeholder="Search Product"
                                className="ctw-search-input"
                                aria-label="Search product"
                            />
                            <button className="ctw-search-submit" aria-label="Submit search">
                                <Search size={18} color="#fff" strokeWidth={1.6} />
                            </button>
                        </div>
                    </div>

                    <div className="ctw-widget">
                        <h6 className="ctw-widget-title">Select Size</h6>
                        <ul className="ctw-size-list">
                            {SIZES.map((size) => (
                                <li key={size}>
                                    <label className="ctw-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={sizes.includes(size)}
                                            onChange={() => toggleSize(size)}
                                        />
                                        {size}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="ctw-widget">
                        <h6 className="ctw-widget-title">Price</h6>
                        <PriceRange
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
                            <span className="ctw-results-count">
                                Showing 1–{PRODUCTS.length} Of {PRODUCTS.length} Results
                            </span>
                            <ul className="ctw-filter-tags">
                                {tags.map((tag) => (
                                    <li key={tag}>
                                        <button
                                            type="button"
                                            className="ctw-tag-btn"
                                            onClick={() => removeTag(tag)}
                                        >
                                            {tag}
                                            <X size={13} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button type="button" className="ctw-panel-btn">
                            <SlidersHorizontal size={16} />
                            Filter
                        </button>
                    </div>

                    <div className="ctw-product-list">
                        {PRODUCTS.map((p) => (
                            <ProductCard key={p.id} {...p} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ------------------------------ Price Range ------------------------------ */

function PriceRange({ min, max, onMinChange, onMaxChange }) {
    const range = PRICE_MAX - PRICE_MIN;
    const leftPct = ((min - PRICE_MIN) / range) * 100;
    const rightPct = ((max - PRICE_MIN) / range) * 100;

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
                min={PRICE_MIN}
                max={PRICE_MAX}
                value={min}
                aria-label="Minimum price"
                onChange={(e) => onMinChange(Math.min(Number(e.target.value), max - 1))}
            />
            <input
                type="range"
                className="ctw-range-input"
                min={PRICE_MIN}
                max={PRICE_MAX}
                value={max}
                aria-label="Maximum price"
                onChange={(e) => onMaxChange(Math.max(Number(e.target.value), min + 1))}
            />
        </div>
    );
}

/* ------------------------------ Product Card ------------------------------ */

function ProductCard({ name, tag, path, rating, reviews, description, price, was, img }) {
    const [saved, setSaved] = useState(false);

    return (
        <article className="ctw-product-card">
            <div className="ctw-product-media">
                <img src={img} alt={`Chantallow ${name} tallow skincare jar`} />
            </div>

            <div>
                <div className="ctw-product-header">
                    <div>
                        <h4 className="ctw-product-title">
                            <Link to={path}>{name}</Link>
                        </h4>
                        <ul className="ctw-product-tags">
                            <li>
                                <a href="#tag">{tag}</a>
                            </li>
                        </ul>
                    </div>

                    <div className="ctw-review-num">
                        <ul className="ctw-rating">
                            {Array.from({ length: 5 }, (_, i) => (
                                <li key={i}>
                                    <StarIcon filled={i < rating} />
                                </li>
                            ))}
                        </ul>
                        <span className="ctw-review-count">
                            <a href="#reviews">{reviews} Review</a>
                        </span>
                    </div>
                </div>

                <p className="ctw-product-desc">
                    <strong>Description:</strong> {description}
                </p>

                <div className="ctw-product-price">
                    {price}
                    <del>{was}</del>
                </div>

                <div className="ctw-product-actions">
                    <Link to="/shopcart" className="ctw-cart-btn">
                        Add To Cart
                    </Link>
                    <button
                        type="button"
                        className={saved ? "ctw-bookmark-btn is-active" : "ctw-bookmark-btn"}
                        onClick={() => setSaved((v) => !v)}
                        aria-pressed={saved}
                        aria-label={saved ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
                    >
                        <Heart size={18} strokeWidth={1.6} fill={saved ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>
        </article>
    );
}

/* --------------------------------- Icons --------------------------------- */

function StarIcon({ filled }) {
    return (
        <svg width="15" height="15" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M7.24805 0.734375L9.22301 5.01608L13.9054 5.57126L10.4436 8.77267L11.3625 13.3975L7.24805 11.0944L3.13355 13.3975L4.0525 8.77267L0.590651 5.57126L5.27309 5.01608L7.24805 0.734375Z"
                fill={filled ? "#1C1C1A" : "#D4D2C6"}
            />
        </svg>
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