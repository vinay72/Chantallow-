import React, { useState } from "react";
import {
    Search, Heart, ShoppingBag, ShoppingCart, X, Plus, ChevronRight, ChevronLeft,
    ArrowLeft, ArrowRight, ArrowUpRight, Menu, Star, ArrowUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./header.css";
import logo from "../../assets/logo.png";
import logo2 from "../../assets/logo2.jpg";   // adjust path to where you place it

import bannerMedia1 from "../../assets/banner-media1.png";
import pic1 from "../../assets/pic1.png";
import pic2 from "../../assets/pic2.png";
import lavender from "../../assets/lavender.png";


import completeCareBg from "../../assets/about/bg1.png";
import lineSvg from "../../assets/line.svg";   // adjust path to where you place it


import moringaLeaf from "../../assets/collection/2.png";   // moringa
import lavenderSprig from "../../assets/collection/3.png"; // lavender

// MORE COLLECTIONS IMAGES

import missionPortrait from "../../assets/about/abut.png";
import moreCollection1 from "../../assets/banner/about2.png"; // Amethyst Relife
import moreCollection2 from "../../assets/banner/about3.png"; // Malachite Fusion
import moreCollection3 from "../../assets/banner/about4.png"; // Jasper Revive
import moreCollection4 from "../../assets/banner/about4.png"; // Jasper Revive

// SIMILAR PROFILES IMAGES

import similarPortrait from "../../assets/about/pic12.jpg";
import similarImg1 from "../../assets/shop/product/1.png"; // Olivine Relief
import similarImg2 from "../../assets/shop/product/2.png"; // Malachite Fusion
import similarImg3 from "../../assets/shop/product/3.png"; // Obsidian Infusion

// SAVING SECTION IMAGES

import savingImg1 from "../../assets/product/3.png"; // Jasper Revive
import savingImg2 from "../../assets/product/4.png"; // Malachite Fusion
import savingImg3 from "../../assets/product/5.png"; // Obsidian Infusion
import savingImg4 from "../../assets/product/6.png"; // Olivine Relief
import savingBanner from "../../assets/about/pic1 111.png";

// FEATURED OFFERS IMAGES

import cosmetic5 from "../../assets/cosmetic/5.png";
import cosmetic6 from "../../assets/cosmetic/6.png";
import cosmetic7 from "../../assets/cosmetic/7.png";
import cosmetic8 from "../../assets/cosmetic/8.png";


import painImg from "../../assets/recent/pain.png";
// SHORTLIST SECTION IMAGES
import shortlistBanner from "../../assets/about/pic111112.png";
import shortlistImg1 from "../../assets/recent/6.png"; // Olivine Relief
import shortlistImg2 from "../../assets/recent/4.png"; // Malachite Fusion
import shortlistImg3 from "../../assets/recent/3.png"; // Jasper Revive
import shortlistImg4 from "../../assets/recent/2.png"; // Amethyst Relief

// FOOTER IMAGES

import recentPost1 from "../../assets/shop/product/small/1.png";
import recentPost2 from "../../assets/shop/product/small/2.png";
import recentPost3 from "../../assets/shop/product/small/3.png";
import footerImg from "../../assets/footer/footer.png";

// Real product jar photography used in the "Mission Strip" circular grid
import amberGlowJar from "../../assets/beauty/amber-glow.jpg";
import amethystReliefJar from "../../assets/beauty/amethyst-relief.jpg";
import jasperReviveJar from "../../assets/beauty/jasper-revive.jpg";
import malachiteFusionJar from "../../assets/beauty/malachite-fusion.jpg";
import olivineReliefJar from "../../assets/beauty/olivine-relief.jpg";
import obsidianInfusionJar from "../../assets/beauty/obsidian-infusion.jpg";

// Product photography used in the "Experience, The Tallow Collection" cards
import collectionImg1 from "../../assets/product/new/1.png";
import collectionImg2 from "../../assets/product/new/2.png";
import collectionImg3 from "../../assets/product/new/3.png";
import collectionImg4 from "../../assets/product/new/4.png";
import collectionImg5 from "../../assets/product/new/5.png";
import collectionImg6 from "../../assets/product/new/6.png";



const IMAGES = {
    heroPortrait: bannerMedia1,
    productPic1: pic1,
    productPic2: pic2,
    lavender: lavender,
};

const PRODUCTS = [
    { id: 1, name: "Amber Glow", accent: "#7A0000", items: "0 items", img: amberGlowJar },
    { id: 2, name: "Amethyst Relief", accent: "#614966", items: "4 items", img: amethystReliefJar },
    { id: 3, name: "Jasper Revive", accent: "#3B1941", items: "4 items", img: jasperReviveJar },
    { id: 4, name: "Malachite Fusion", accent: "#5B2861", items: "4 items", img: malachiteFusionJar },
    { id: 5, name: "Olivine Relief", accent: "#505634", items: "4 items", img: olivineReliefJar },
    { id: 6, name: "Obsidian Infusion", accent: "#631908", items: "4 items", img: obsidianInfusionJar },
];

const COLLECTION_CARDS = [
    { id: 1, name: "Amber Glow", tag: "Get 20% Off", accent: "#7A0000", img: collectionImg1 },
    { id: 2, name: "Amethyst Relief", accent: "#3B1941", img: collectionImg2 },
    { id: 3, name: "Jasper Revive", tag: "Featured", accent: "#3B1941", img: collectionImg3 },
    { id: 4, name: "Malachite Fusion", accent: "#5B2861", img: collectionImg4 },
    { id: 5, name: "Obsidian Infusion", accent: "#536807", img: collectionImg5 },
    { id: 6, name: "Olivine Relief", accent: "#5d1100", img: collectionImg6 },
];

const MORE_COLLECTIONS = [
    { id: 1, name: "Amethyst Relife", img: moreCollection1 },
    { id: 2, name: "Malachite Fusion", img: moreCollection2 },
    { id: 3, name: "Jasper Revive", img: moreCollection3 },
    { id: 4, name: "Anti Aging Cream", img: moreCollection4 },
];

const SIMILAR_PROFILES = [
    { id: 1, name: "Moisturizing Body Lotion", sale: "Up to 40% Off", price: "$00", img: similarImg1 },
    { id: 2, name: "Rejuvenating Body Oil", sale: "Up to 40% Off", price: "$80", was: "$95", img: similarImg2 },
    { id: 3, name: "Cleansing Body Wash", sale: "Up to 40% Off", price: "$80", was: "$95", img: similarImg3 },
];

const SAVING_LEFT = [
    { id: 1, name: "Jasper Revive", sub: "Coffee Infused Tallow", img: savingImg1 },
    { id: 2, name: "Malachite Fusion", sub: "Moringa + Butterfly Pea Infused Tallow", badge: true, img: savingImg2 },
    { id: 3, name: "Obsidian Infusion", sub: "Cacao Infused Tallow", img: savingImg3 },
    { id: 4, name: "Olivine Relief", sub: "Zechstein Magnesium + Arnica", img: savingImg4 },
];

const SHORTLIST_RIGHT = [
    { id: 1, name: "Olivine Relief", sub: "Zechstein Magnesium + Arnica", price: "$00.00", was: "$00.00", img: shortlistImg1 },
    { id: 2, name: "Malachite Fusion", sub: "Moringa + Butterfly Pea Infused Tallow", price: "$60", was: "$95", sale: "Up To 40% Off", badge: true, img: shortlistImg2 },
    { id: 3, name: "Jasper Revive", sub: "Coffee Infused Tallow", price: "$50", was: "$95", sale: "Up To 40% Off", img: shortlistImg3 },
    { id: 4, name: "Amethyst Relief", sub: "Lavender Infused & Whipped Tallow", price: "$40", was: "$95", sale: "Up To 40% Off", img: shortlistImg4 },
];

const FEATURED_OFFERS = [
    { id: 1, label: "Sale Up to 10% Off", title: "Summer", year: "2026", textColor: "#fff", img: cosmetic8 },
    { id: 2, label: "Sale Up to 10% Off", title: "Summer", year: "2026", textColor: "#fff", img: cosmetic6 },
    { id: 3, label: "20% Off", title: "Unbeatable", bgTitle: "Sale", textColor: "#fff", img: cosmetic7 },
    { id: 4, label: "10% Off", title: "Unique Deals", textColor: "#fff", img: cosmetic5 },
    { id: 5, label: "Sale Up to 5% Off", title: "Summer", year: "2026", textColor: "#fff", img: cosmetic6 },
    { id: 6, label: "10% Off", title: "Unbeatable", bgTitle: "Sale", textColor: "#fff", img: cosmetic7 },
];

const NAV_LINKS = [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/aboutus" },
    { label: "Shop", path: "/shop-list" },
    { label: "Blog", path: "/blog" },
    { label: "Contact Us", path: "/contactus" },
];

const CATEGORY_MARQUEE = ["Accessories", "Haircare", "Nailcare", "Beautycare", "Bodycare", "Skincare"];

export default function Home() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [quickView, setQuickView] = useState(false);
    const [cartTab, setCartTab] = useState("cart");

    return (
        <div
            style={{
                fontFamily: "'DM Sans', sans-serif",
                color: "#1C1C1A",
                background: "#FFFFFF",
                minHeight: "100vh",
            }}
        >
            <GlobalStyle />

            <Header
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                setCartOpen={setCartOpen}
                setSearchOpen={setSearchOpen}
            />

            <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
            <CartDrawer
                open={cartOpen}
                onClose={() => setCartOpen(false)}
                tab={cartTab}
                setTab={setCartTab}
            />
            <QuickViewModal open={quickView} onClose={() => setQuickView(false)} />

            <main>
                <Hero navigate={navigate} />
                <MissionStrip />
                <CompleteCareBanner />
                <CategoryMarquee />
                <TallowCollection onQuickView={() => setQuickView(true)} />

                <MoreCollections />
                <SimilarProfilesSection />
                <SavingSection />
                <FeaturedOffers />
                <ShortlistSection />
            </main>

            <Footer />
            <ScrollTop />
        </div>
    );
}

/* ---------------------------- Global Style ---------------------------- */

function GlobalStyle() {
    return (
        <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@400;500;700&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; }
      .ctw-serif { font-family: 'Cormorant Garamond', serif; }
      .ctw-btn {
        font-family: 'DM Sans', sans-serif;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        font-size: 12.5px;
        font-weight: 700;
        cursor: pointer;
        border: none;
        transition: all .25s ease;
      }
      .ctw-fade-in { animation: ctwFadeIn .8s ease both; }
      @keyframes ctwFadeIn {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .ctw-card-hover { transition: transform .35s ease, box-shadow .35s ease; }
      .ctw-card-hover:hover { transform: translateY(-6px); box-shadow: 0 18px 40px rgba(65,112,91,0.14); }
      .ctw-underline-link {
        position: relative;
        text-decoration: none;
        color: inherit;
      }
      .ctw-underline-link::after {
        content: '';
        position: absolute;
        left: 0; bottom: -2px;
        width: 0; height: 1px;
        background: currentColor;
        transition: width .3s ease;
      }

      .ctw-animation-text text {
  fill: transparent;
  stroke: rgba(255, 255, 255, 0.55);
  stroke-width: 1.5px;
  font-size: 200px;
  font-weight: 700;
  font-family: 'Lufga', 'DM Sans', sans-serif;
  letter-spacing: 8px;
  stroke-dasharray: 1200;
  stroke-dashoffset: 1200;
  animation: ctwStrokeDraw 4s ease forwards infinite;
}
@keyframes ctwStrokeDraw {
  0%   { stroke-dashoffset: 1200; }
  60%  { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .ctw-animation-text text { animation: "stroke 5s infinite alternate"; stroke-dashoffset: 0; }
}



      .ctw-underline-link:hover::after { width: 100%; }
      .ctw-scroll-x::-webkit-scrollbar { height: 6px; }
      .ctw-scroll-x::-webkit-scrollbar-thumb { background: #C9D2BE; border-radius: 8px; }
      @media (prefers-reduced-motion: reduce) {
        .ctw-fade-in, .ctw-card-hover { animation: none !important; transition: none !important; }
      }
    `}</style>
    );
}

/* -------------------------------- Header -------------------------------- */

function Header({ menuOpen, setMenuOpen, setCartOpen, setSearchOpen }) {
    return (
        <header style={{ position: "sticky", top: 0, zIndex: 40 }}>
            <div className="ctw-header">
                <a href="#home" className="ctw-header-logo" aria-label="Chantallow home">
                    <img src={logo} alt="Chantallow" />
                </a>

                <nav className={menuOpen ? "ctw-nav is-open" : "ctw-nav"}>
                    {NAV_LINKS.map((link) => (
                        <Link key={link.label} to={link.path} className="ctw-nav-link">
                            {link.label}
                            <span className="ctw-star" aria-hidden="true">✦</span>
                        </Link>
                    ))}
                </nav>

                <div className="ctw-header-actions">
                    <a href="#login" className="ctw-login">Login / Register</a>

                    <button className="ctw-icon-btn" aria-label="Search" onClick={() => setSearchOpen(true)}>
                        <Search size={21} strokeWidth={1.5} color="#000" />
                    </button>
                    <button className="ctw-icon-btn" aria-label="Wishlist" onClick={() => setCartOpen(true)}>
                        <Heart size={21} strokeWidth={1.5} color="#000" />
                    </button>
                    <button className="ctw-icon-btn" aria-label="Cart" onClick={() => setCartOpen(true)}>
                        <ShoppingCart size={21} strokeWidth={1.5} color="#000" />
                    </button>
                    <button className="ctw-icon-btn ctw-menu-btn" aria-label="Toggle menu" onClick={() => setMenuOpen((v) => !v)}>
                        <Menu size={22} />
                    </button>
                </div>
            </div>
        </header>
    );
}

/* --------------------------------- Hero --------------------------------- */

function Hero({ navigate }) {
    return (
        <section
            id="home"
            style={{
                position: "relative",
                background: "#FFFFFF",
                overflow: "hidden",
                minHeight: 780,
            }}
        >
            {/* Mint wash bleeding down from the header's right panel */}
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "26%",
                    height: 120,
                    background: "#EDF8F3",
                    pointerEvents: "none",
                }}
            />

            {/* Thin decorative sweep */}
            <img
                src={lineSvg}
                alt=""
                aria-hidden="true"
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    pointerEvents: "none",
                }}
            />



            <img
                src={logo2}
                alt="Chantallow mark"
                style={{
                    position: "absolute",
                    top: 40,
                    left: 40,
                    width: 100,
                    display: window.innerWidth > 1200 ? "block" : "none",
                    pointerEvents: "none",
                    zIndex: 2,
                }}
            />

            {/* Lavender, bottom left */}
            <img
                src={IMAGES.lavender}
                alt=""
                aria-hidden="true"
                style={{
                    position: "absolute",
                    bottom: 40,
                    left: 24,
                    width: 90,
                    display: window.innerWidth > 1200 ? "block" : "none",
                    pointerEvents: "none",
                }}
            />

            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    display: "grid",
                    gridTemplateColumns: window.innerWidth > 960 ? "1fr 0.9fr" : "1fr",
                    alignItems: "center",
                    minHeight: 780,
                }}
            >
                {/* Left column */}
                <div className="ctw-fade-in" style={{ padding: "0 40px 0 70px", textAlign: "left", marginLeft: " 80px" }}>
                    <h1
                        style={{
                            fontSize: "clamp(2.6rem, 4vw, 4.2rem)",
                            lineHeight: 1.05,          // was 1.15 — pulls the two lines closer
                            fontWeight: 400,
                            margin: "0px 0px 35px",
                            color: "#2D2E2F",
                            fontFamily: "Marcellus, sans-serif",
                        }}
                    >
                        A New Generation Of
                        <br />
                        Natural Tallow Skincare
                    </h1>
                    {/* Moringa leaf — below heading, right of paragraph */}
                    <img
                        src={moringaLeaf}
                        alt=""
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            // top: 340,
                            left: "72%",
                            width: 130,
                            pointerEvents: "none",

                            display: window.innerWidth > 1000 ? "block" : "none",
                        }}
                    />
                    <p
                        style={{
                            fontSize: 24,
                            lineHeight: 1.5,
                            color: "#2D2E2F",
                            maxWidth: 460,
                            margin: "0px 0px 35px",
                            fontFamily: "Marcellus, sans-serif",
                        }}
                    >
                        Handcrafted wellness using Moringa, Butterfly Pea, and Zechstein Magnesium.
                    </p>


                    <button
                        style={{
                            display: "inline-block",
                            background: "#2D2E2F",
                            color: "#FFFFFF",
                            padding: "15px 30px",
                            border: "none",
                            borderRadius: 0,
                            fontSize: 16,
                            fontFamily: "Lufga, sans-serif",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            cursor: "pointer",
                            marginBottom: 90,
                        }}
                        onClick={() => navigate("/shop")}
                    >
                        Add to Cart
                    </button>

                    {/* Mini product cards — unchanged */}
                    <div style={{ display: "flex", gap: 40, alignItems: "center", flexWrap: "nowrap" }}>
                        {[
                            { name: "Amber Glow", img: IMAGES.productPic1 },
                            { name: "Amethyst Relief", img: IMAGES.productPic2 },
                        ].map((p) => (
                            <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                                <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
                                    <div
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            borderRadius: "50%",
                                            border: "1px solid #41705B",
                                        }}
                                    />
                                    <img
                                        src={p.img}
                                        alt={p.name}
                                        style={{
                                            position: "relative",
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                            padding: 16,
                                            display: "block",
                                        }}
                                    />
                                    <button
                                        aria-label={`Add ${p.name} to cart`}
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            right: 0,
                                            width: 30,
                                            height: 30,
                                            borderRadius: "50%",
                                            background: "#2C7A55",
                                            border: "none",
                                            color: "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <Plus size={16} strokeWidth={2.4} />
                                    </button>
                                </div>

                                <div style={{ textAlign: "left" }}>
                                    <div
                                        style={{
                                            fontSize: 22,
                                            fontWeight: 400,
                                            color: "#2D2E2F",
                                            marginBottom: 6,
                                            fontFamily: "Marcellus, sans-serif",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {p.name}
                                    </div>
                                    <div style={{ fontSize: 17, fontFamily: "Marcellus, sans-serif" }}>
                                        <span style={{ color: "#41705B" }}>$00</span>{" "}
                                        <del style={{ color: "#B4B4A8", marginLeft: 6 }}>$00</del>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right column: arch/door portrait */}
                <div
                    style={{
                        position: "relative",
                        height: "100%",
                        display: window.innerWidth > 960 ? "flex" : "none",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            position: "relative",
                            width: "100%",
                            maxWidth: 430,
                            aspectRatio: "4 / 5.6",
                            borderRadius: "48% 48% 48% 48% / 34% 34% 34% 34%",
                            overflow: "hidden",
                            border: "15px solid #fff",
                            boxShadow: "0 40px 90px rgba(65,112,91,0.20)",
                            background: "#DCE6D3",
                        }}
                    >
                        <img
                            src={IMAGES.heroPortrait}
                            alt="Woman holding Chantallow Jasper Revive tallow skincare jar"
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                    </div>
                </div>
            </div>

            {/* Vertical social rail — right edge */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,               // stretches full height, no bottom gap
                    width: "20%",            // covers the right portion behind portrait + rail
                    background: "#EDF8F3",
                    zIndex: 0,               // sits behind content but above white base
                    pointerEvents: "none",

                    display: "flex",             // ← makes children distributable
                    flexDirection: "column",     // ← stack them vertically
                    // alignItems: "center",        // ← center horizontally in the panel
                    justifyContent: "space-around", // ← even vertical distribution (Image 2)
                    paddingTop: 150,              // keeps first word off the top edge
                    paddingBottom: 150,           // keeps last word off the bottom edge
                }}
            >
                {["INSTAGRAM", "FACEBOOK", "TWITTER"].map((s) => (
                    <a
                        key={s}
                        href="#social"
                        style={{
                            writingMode: "vertical-rl",
                            fontSize: 13,
                            letterSpacing: "0.25em",
                            color: "#2D2E2F",
                            textDecoration: "none",
                            fontFamily: "'DM Sans', sans-serif",
                            pointerEvents: "auto",   // re-enable clicks (parent disabled them)
                        }}
                    >
                        {s}
                    </a>
                ))}
            </div>

            {/* Let's Talk vertical tab — bottom right */}
            <a
                href="#contact"
                style={{
                    position: "absolute",
                    bottom: 24,
                    right: 12,
                    background: "#2D2E2F",
                    color: "#fff",
                    padding: "18px 8px",
                    borderRadius: 4,
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    transform: "rotate(180deg)",
                    fontSize: 12,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    fontFamily: "'DM Sans', sans-serif",
                    display: window.innerWidth > 1200 ? "block" : "none",
                    zIndex: 3,
                }}
            >
                Let's Talk
            </a>
        </section>
    );
}

/* ----------------------------- Mission Strip ----------------------------- */

function MissionStrip() {
    return (
        <section style={{ background: "#EDF8F3", padding: "64px 24px", position: "relative", overflow: "hidden" }}>

            <div
                style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    textAlign: "center",
                    padding: "80px 24px",
                }}


            >
                <h2
                    style={{
                        fontSize: 32,
                        fontFamily: "Marcellus, sans-serif",
                        color: "#2D2E2F",
                        fontWeight: 400,
                        textAlign: "left",
                        maxWidth: 1000,
                        margin: "0 auto 60px",
                        lineHeight: 1.35,
                    }}
                >
                    We Bridge The Gap Between Ancient Wisdom And Modern Skincare.
                    <br />
                    Our Mission Is To Provide Nutrient-Dense, Chemical-Free Solutions
                </h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${window.innerWidth > 900 ? 6 : window.innerWidth > 560 ? 3 : 2}, 1fr)`,
                        gap: 20,
                    }}
                >
                    {PRODUCTS.map((p) => (
                        <a
                            key={p.id}
                            href="#shop"
                            style={{ textDecoration: "none", textAlign: "center" }}
                        >
                            <div
                                className="ctw-card-hover"
                                style={{
                                    position: "relative",
                                    width: "100%",
                                    aspectRatio: "1 / 1",
                                    borderRadius: "50%",
                                    background: "#EDF8F3",
                                    marginBottom: 12,
                                    border: "1px solid #E6E0CC",
                                    overflow: "hidden",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <img
                                    src={p.img}
                                    alt={`Chantallow ${p.name} tallow skincare jar`}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        display: "block",
                                    }}
                                />
                            </div>
                            <h3
                                style={{
                                    fontSize: 22,
                                    fontWeight: 500,
                                    color: p.accent,
                                    margin: 0,
                                    fontFamily: "Marcellus",
                                }}
                            >
                                {p.name}
                            </h3>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* --------------------------- Tallow Collection --------------------------- */

function TallowCollection({ onQuickView }) {
    return (
        <section
            id="shop"
            style={{
                background: "#EDF8F3",
                padding: "80px 24px",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Curved sweep behind the grid */}
            <svg
                aria-hidden="true"
                viewBox="0 0 1440 600"
                preserveAspectRatio="none"
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 260,
                    width: "100%",
                    height: "calc(100% - 260px)",
                    pointerEvents: "none",
                }}
            >
                <path d="M0 200 C 420 20, 1020 20, 1440 200 L 1440 600 L 0 600 Z" fill="#FFFFFF" opacity="0.55" />
            </svg>
            <img
                src={moringaLeaf}
                alt=""
                aria-hidden="true"
                style={{
                    position: "absolute",
                    top: 40,
                    left: 40,
                    width: 120,
                    pointerEvents: "none",
                    zIndex: 1,
                    animation: "ctwFloat 5s ease-in-out infinite",
                    display: window.innerWidth > 1000 ? "block" : "none",
                }}
            />
            <img
                src={lavenderSprig}
                alt=""
                aria-hidden="true"
                style={{
                    position: "absolute",
                    top: 60,
                    right: 40,
                    width: 110,
                    pointerEvents: "none",
                    zIndex: 1,
                    animation: "ctwFloat 6s ease-in-out infinite",
                    animationDelay: "1s",
                    display: window.innerWidth > 1000 ? "block" : "none",
                }}
            />

            <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>

                <h2
                    style={{
                        fontSize: 65,
                        fontWeight: 500,
                        margin: "0 0 48px",
                        color: "#2D2E2F",
                        fontFamily: "Marcellus, sans-serif",
                    }}

                >
                    Experience The Tallow Collection
                </h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${window.innerWidth > 900 ? 3 : window.innerWidth > 600 ? 2 : 1}, 1fr)`,
                        gap: 24,
                        textAlign: "left",
                    }}
                >
                    {COLLECTION_CARDS.map((c) => (
                        <div
                            key={c.id}
                            className="ctw-card-hover"
                            style={{
                                background: "#fff",
                                borderRadius: 16,
                                overflow: "hidden",
                                border: "1px solid #E2E9DA",
                            }}
                        >
                            <div
                                style={{
                                    position: "relative",
                                    aspectRatio: "4 / 4.2",
                                    background: `linear-gradient(150deg, ${c.accent}24, ${c.accent}55)`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden",
                                }}
                            >
                                <img
                                    src={c.img}
                                    alt={`Chantallow ${c.name} tallow skincare jar`}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        display: "block",
                                    }}
                                />
                                {c.tag && (
                                    <span
                                        style={{
                                            position: "absolute",
                                            top: 12,
                                            left: 12,
                                            background: "#1C1C1A",
                                            color: "#fff",
                                            fontSize: 10,
                                            fontWeight: 700,
                                            padding: "5px 10px",
                                            borderRadius: 20,
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {c.tag}
                                    </span>
                                )}
                                <button
                                    onClick={() => onQuickView()}
                                    style={{
                                        position: "absolute",
                                        bottom: 14,
                                        left: 14,
                                        background: "#41705B",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 20,
                                        padding: "9px 16px",
                                        fontSize: 11.5,
                                        fontWeight: 700,
                                        cursor: "pointer",
                                    }}
                                >
                                    Quick View
                                </button>
                                <button
                                    aria-label="Add to cart"
                                    style={{
                                        position: "absolute",
                                        bottom: 14,
                                        right: 14,
                                        background: "#1C1C1A",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: 38,
                                        height: 38,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                    }}
                                >
                                    <ShoppingBag size={16} />
                                </button>
                                <button
                                    aria-label="Add to wishlist"
                                    style={{
                                        position: "absolute",
                                        top: 12,
                                        right: 12,
                                        background: "#fff",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: 32,
                                        height: 32,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                    }}
                                >
                                    <Heart size={14} />
                                </button>
                            </div>
                            <div style={{ padding: "16px 18px 20px" }}>
                                <h5 style={{ margin: "0 0 6px", fontSize: 20, fontFamily: "Marcellus, sans-serif", fontWeight: 700, color: "#3B1941", textTransform: "uppercase" }}>
                                    {c.name}
                                </h5>
                                <span style={{ fontSize: 13, fontSize: 20, fontFamily: "Marcellus, sans-serif", color: "#8A8A80" }}>
                                    $00 <span style={{ textDecoration: "line-through" }}>$00</span>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* <div style={{ display: "flex", justifyContent: "center", marginTop: 56 }}>
                    <RotatingLinkBadge label="ALL PRODUCTS" href="#shop" />
                </div> */}
            </div>
        </section>
    );
}

/* ------------------------------ Category Bar ------------------------------ */

/* --------------------- Scroll Parallax Hook (JS-driven) --------------------- */

function useParallaxOffset(speed = 0.15) {
    const ref = React.useRef(null);
    const [offset, setOffset] = useState(0);

    React.useEffect(() => {
        const prefersReduced =
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) return;

        let ticking = false;

        const update = () => {
            if (ref.current) {
                const rect = ref.current.getBoundingClientRect();
                const viewportCenter = window.innerHeight / 2;
                const distanceFromCenter = rect.top + rect.height / 2 - viewportCenter;
                setOffset(distanceFromCenter * speed);
            }
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(update);
                ticking = true;
            }
        };

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, [speed]);

    return [ref, offset];
}

/* --------------------- Complete Care Banner (parallax) --------------------- */

function CompleteCareBanner() {
    const [bgRef, bgOffset] = useParallaxOffset(0.18);
    const [videoOpen, setVideoOpen] = useState(false);

    return (
        <section
            style={{
                position: "relative",
                overflow: "hidden",
                background: "#E9DCC9",
            }}
        >
            <div
                ref={bgRef}
                aria-hidden="true"
                style={{
                    position: "absolute",
                    inset: "-14% 0",
                    backgroundImage: `url(${completeCareBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transform: `translateY(${bgOffset}px)`,
                    willChange: "transform",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "linear-gradient(90deg, rgba(233,220,201,0) 0%, rgba(233,220,201,0.25) 55%, rgba(233,220,201,0.55) 100%)",
                }}
            />

            <div
                style={{
                    position: "relative",
                    maxWidth: 1360,
                    margin: "0 auto",
                    minHeight: window.innerWidth > 900 ? 460 : 380,
                    display: "grid",
                    gridTemplateColumns: window.innerWidth > 900 ? "1fr 1fr" : "1fr",
                    alignItems: "center",
                    padding: "56px 24px",
                }}
            >
                <div
                    style={{
                        position: "relative",
                        minHeight: 320,
                        display: window.innerWidth > 900 ? "flex" : "none",
                        alignItems: "center",
                        justifyContent: "flex-end",
                    }}
                >
                    <ExploreCollectionBadge onPlay={() => setVideoOpen(true)} />
                </div>

                <div
                    style={{
                        textAlign: window.innerWidth > 900 ? "right" : "center",
                        color: "#3A2C22",
                    }}
                >



                    <div
                        style={{
                            display: window.innerWidth > 900 ? "none" : "flex",
                            justifyContent: "center",
                            marginTop: 36,
                        }}
                    >
                        <ExploreCollectionBadge size={140} onPlay={() => setVideoOpen(true)} />
                    </div>
                </div>
            </div>

            <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
        </section>
    );
}

function ExploreCollectionBadge({ size = 150, onPlay }) {
    const r = size / 2;
    const textRadius = r - 24;
    const id = "explore-collection-path";

    return (
        <div
            style={{
                position: "relative",
                width: size,
                height: size,
                left: "20%",


            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.8)",
                    filter: "drop-shadow(0px 0px 100px rgba(0, 0, 0, 0.15))",
                    backdropFilter: "blur(17px)",
                    WebkitBackdropFilter: "blur(17px)",
                    padding: 10,
                }}
            />
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{
                    position: "absolute",
                    inset: 0,
                    animation: "ctwSpin 14s linear infinite",
                }}
            >
                <defs>
                    <path
                        id={id}
                        d={`M ${r},${r} m -${textRadius},0 a ${textRadius},${textRadius} 0 1,1 ${textRadius * 2
                            },0 a ${textRadius},${textRadius} 0 1,1 -${textRadius * 2},0`}
                    />
                </defs>
                <text
                    fill="#3A2C22"
                    fontSize="16px"

                    fontWeight={500}
                    letterSpacing="2.2"
                    style={{ textTransform: "uppercase", fontFamily: "'lufga', sans-serif" }}
                >
                    <textPath href={`#${id}`} startOffset="0%">
                        EXPLORE &nbsp; MORE &nbsp; COLLECTION
                    </textPath>
                </text>
            </svg>
            <button
                aria-label="Play collection video"
                onClick={onPlay}
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                    width: size * 0.34,
                    height: size * 0.34,
                    borderRadius: "50%",
                    background: "#3A2C22",
                    border: "none",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                }}
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 2.5v11l9-5.5-9-5.5z" fill="currentColor" />
                </svg>
            </button>
            <style>{`
        @keyframes ctwSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          svg[style*="ctwSpin"] { animation: none !important; }
        }
           @keyframes ctwFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-18px); }
      }
      @media (prefers-reduced-motion: reduce) {
        img[style*="ctwFloat"] { animation: none !important; }
      }
      `}</style>
        </div>
    );
}
function VideoModal({ open, onClose }) {
    React.useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.8)",
                zIndex: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: 900,
                    aspectRatio: "16 / 9",
                    background: "#000",
                    borderRadius: 12,
                    overflow: "hidden",
                }}
            >
                <button
                    onClick={onClose}
                    aria-label="Close video"
                    style={{
                        position: "absolute",
                        top: -44,
                        right: 0,
                        background: "none",
                        border: "none",
                        color: "#fff",
                        cursor: "pointer",
                        padding: 4,
                    }}
                >
                    <X size={26} />
                </button>
                <iframe
                    src="https://www.youtube.com/embed/GNRj16pfsFY?autoplay=1"
                    title="Chantallow collection video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                />
            </div>
        </div>
    );
}

/* --------------------- Rotating "All Products" link badge --------------------- */

function RotatingLinkBadge({ label = "ALL PRODUCTS", href = "#shop", size = 190 }) {
    const outerR = size / 2;
    const ringInset = size * 0.12;
    const textRadius = outerR - ringInset / 2 - 4;
    const uid = React.useId ? React.useId() : `rlb-${label.replace(/\s+/g, "-")}`;
    const pathId = `rotating-badge-path-${uid}`;

    return (
        <a
            href={href}
            aria-label={label.replace(/\s+/g, " ").trim()}
            style={{
                position: "relative",
                width: size,
                height: size,
                display: "block",
                textDecoration: "none",
            }}
        >
            {/* Outer ring (mint background) + inner white disc, mirrors the reference badge */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "#EAF0E4",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    inset: ringInset,
                    borderRadius: "50%",
                    background: "#fff",
                    boxShadow: "0 10px 26px rgba(28,28,26,0.08)",
                }}
            />
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{
                    position: "absolute",
                    inset: 0,
                    animation: "ctwSpin 16s linear infinite",
                }}
            >
                <defs>
                    <path
                        id={pathId}
                        d={`M ${outerR},${outerR} m -${textRadius},0 a ${textRadius},${textRadius} 0 1,1 ${textRadius * 2
                            },0 a ${textRadius},${textRadius} 0 1,1 -${textRadius * 2},0`}
                    />
                </defs>
                <text
                    fill="#1C1C1A"
                    fontSize={size * 0.072}
                    fontWeight={700}
                    letterSpacing="2"
                    style={{ textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}
                >
                    <textPath href={`#${pathId}`} startOffset="0%">
                        {`· ${label} `.repeat(4)}
                    </textPath>
                </text>
            </svg>
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <ArrowRight size={size * 0.15} color="#1C1C1A" strokeWidth={1.6} />
            </div>
            <style>{`
        @media (prefers-reduced-motion: reduce) {
          svg[style*="ctwSpin"] { animation: none !important; }
        }
      `}</style>
        </a>
    );
}

function CategoryMarquee() {
    const list = [...CATEGORY_MARQUEE, ...CATEGORY_MARQUEE, ...CATEGORY_MARQUEE];
    return (
        <section
            style={{
                background: "#fff",
                overflow: "hidden",
                padding: "22px 0",
                width: "100%",
                margin: 0,
                borderRadius: 0,
            }}
        >
            <div
                style={{
                    display: "flex",
                    gap: 64,
                    whiteSpace: "nowrap",
                    animation: "ctwMarquee 30s linear infinite",
                    width: "fit-content",
                }}
            >
                {list.map((c, i) => (
                    <span
                        key={i}
                        style={{
                            fontSize: "clamp(20px, 2.2vw, 30px)",
                            fontWeight: 400,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            display: "flex",
                            alignItems: "center",
                            gap: 64,
                            color: "#1C1C1A",
                            fontFamily: "Marcellus, sans-serif",
                        }}
                    >
                        {c}
                        <span aria-hidden="true" style={{ fontSize: 20 }}>✦</span>
                    </span>
                ))}
                <style>{`
          @keyframes ctwMarquee {
            from { transform: translateX(0); }
            to { transform: translateX(-33.333%); }
          }
          @media (prefers-reduced-motion: reduce) {
            div[style*="ctwMarquee"] { animation: none !important; }
          }
        `}</style>
            </div>
        </section>
    );
}

/* ---------------------------- More Collections ---------------------------- */

function MoreCollections() {
    const [perView, setPerView] = useState(
        window.innerWidth > 900 ? 3 : window.innerWidth > 600 ? 2 : 1
    );
    const [page, setPage] = useState(0);

    React.useEffect(() => {
        const onResize = () =>
            setPerView(window.innerWidth > 900 ? 3 : window.innerWidth > 600 ? 2 : 1);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const pageCount = MORE_COLLECTIONS.length;

    // duplicate the list so the row can keep sliding and loop seamlessly
    const loopItems = [...MORE_COLLECTIONS, ...MORE_COLLECTIONS];

    // advance one card every 4s, wrap after the last real card
    React.useEffect(() => {
        const timer = setInterval(() => {
            setPage((prev) => (prev >= pageCount - 1 ? 0 : prev + 1));
        }, 4000);
        return () => clearInterval(timer);
    }, [pageCount]);

    const go = (next) => setPage(Math.max(0, Math.min(pageCount - 1, next)));

    return (
        <section style={{ padding: "80px 24px", background: "#fff" }}>
            <div
                style={{
                    maxWidth: 1360,
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: window.innerWidth > 900 ? "0.9fr 2fr" : "1fr",
                    gap: 40,
                    alignItems: "center",
                }}
            >
                <div>
                    <img
                        src={missionPortrait}
                        alt="Woman with glowing skin from Chantallow tallow skincare"
                        style={{
                            width: "98%",
                            height: "94%",
                            objectFit: "contain",
                            objectPosition: "bottom center",
                            display: "block",
                        }}
                    />
                </div>

                <div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 24,
                        }}
                    >
                        <h2
                            style={{
                                fontSize: 65,
                                fontFamily: "Marcellus, sans-serif",
                                color: "#2D2E2F",
                                fontWeight: 400,
                                margin: 0,
                            }}
                        >
                            More Collections
                        </h2>
                        <a
                            href="#shop"
                            aria-label="See all"
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                border: "1px solid #1C1C1A",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <ArrowUpRight size={18} />
                        </a>
                    </div>

                    <div style={{ overflow: "hidden" }}>
                        <div
                            style={{
                                display: "flex",
                                transform: `translateX(-${page * (100 / perView)}%)`,
                                transition: "transform .5s cubic-bezier(.4,0,.2,1)",
                            }}
                        >
                            {loopItems.map((c, i) => (
                                <div
                                    key={`${c.id}-${i}`}
                                    style={{ flex: `0 0 ${100 / perView}%`, padding: "0 10px" }}
                                >
                                    <div
                                        className="ctw-card-hover"
                                        style={{
                                            aspectRatio: "1 / 1",
                                            borderRadius: 16,
                                            background: "linear-gradient(150deg,#8FAE7C,#41705B)",
                                            marginBottom: 12,
                                            overflow: "hidden",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        {c.img && (
                                            <img
                                                src={c.img}
                                                alt={`Chantallow ${c.name} tallow skincare jar`}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    display: "block",
                                                }}
                                            />
                                        )}
                                    </div>
                                    <button
                                        style={{
                                            width: "100%",
                                            background: "#F7F4EC",
                                            border: "none",
                                            padding: "10px 12px",
                                            borderRadius: 10,
                                            fontSize: 12.5,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                        }}
                                    >
                                        {c.name}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <CarouselControls page={page} pageCount={pageCount} onGo={go} />
                </div>
            </div>
        </section>
    );
}

function CarouselControls({ page, pageCount, onGo }) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 32,
                padding: "0 10px",
            }}
        >
            <div style={{ display: "flex", gap: 24 }}>
                <button
                    onClick={() => onGo(page - 1)}
                    disabled={page === 0}
                    aria-label="Previous"
                    style={{
                        background: "none",
                        border: "none",
                        cursor: page === 0 ? "default" : "pointer",
                        opacity: page === 0 ? 0.3 : 1,
                        padding: 4,
                    }}
                >
                    <ArrowLeft size={26} strokeWidth={1.3} />
                </button>
                <button
                    onClick={() => onGo(page + 1)}
                    disabled={page === pageCount - 1}
                    aria-label="Next"
                    style={{
                        background: "none",
                        border: "none",
                        cursor: page === pageCount - 1 ? "default" : "pointer",
                        opacity: page === pageCount - 1 ? 0.3 : 1,
                        padding: 4,
                    }}
                >
                    <ArrowRight size={26} strokeWidth={1.3} />
                </button>
            </div>

            <div style={{ display: "flex", gap: 6 }}>
                {Array.from({ length: pageCount }, (_, i) => {
                    const active = i === page;
                    return (
                        <button
                            key={i}
                            onClick={() => onGo(i)}
                            aria-current={active ? "true" : undefined}
                            aria-label={`Go to slide ${i + 1}`}
                            style={{
                                width: 54,
                                height: 54,
                                borderRadius: "50%",
                                border: active ? "1px solid #C9D2BE" : "1px solid transparent",
                                background: active ? "#fff" : "transparent",
                                color: active ? "#1C1C1A" : "#B4B4A8",
                                fontSize: 15,
                                fontWeight: active ? 700 : 400,
                                cursor: "pointer",
                                transition: "all .25s ease",
                            }}
                        >
                            {String(i + 1).padStart(2, "0")}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* --------------------------- Similar Profiles --------------------------- */

function SimilarProfilesSection() {
    return (
        <section style={{ padding: "20px 24px 80px", background: "#EDF8F3" }}>
            <div
                style={{
                    maxWidth: 1360,
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: window.innerWidth > 900 ? "1.3fr 0.9fr" : "1fr",
                    gap: 40,
                    alignItems: "center",
                }}
            >
                <div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 24,
                        }}
                    >
                        <h2 style={{
                            fontSize: 65,
                            color: "#2D2E2F",
                            fontFamily: "Marcellus, sans-serif",
                            fontWeight: 500,
                            margin: 0,
                        }}>
                            Similar Profiles
                        </h2>
                        <a
                            href="#shop"
                            className="ctw-underline-link"
                            style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", color: "#1C1C1A" }}
                        >
                            All Products →
                        </a>
                    </div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${window.innerWidth > 640 ? 3 : 1}, 1fr)`,
                            gap: 18,
                        }}
                    >
                        {SIMILAR_PROFILES.map((p) => (
                            <div key={p.id} className="ctw-card-hover" style={{ background: "#fff", borderRadius: 14, padding: 14 }}>
                                <div
                                    style={{
                                        aspectRatio: "1 / 1",
                                        borderRadius: 10,
                                        background: "linear-gradient(150deg,#EFEBDD,#D9CFAE)",
                                        marginBottom: 12,
                                        overflow: "hidden",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {p.img && (
                                        <img
                                            src={p.img}
                                            alt={`Chantallow ${p.name} tallow skincare jar`}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                display: "block",
                                            }}
                                        />
                                    )}
                                </div>
                                <span style={{ fontSize: 10.5, color: "#41705B", fontWeight: 700 }}>{p.sale}</span>
                                <h6 style={{ fontSize: 13, fontWeight: 600, margin: "6px 0" }}>{p.name}</h6>
                                <span style={{ fontSize: 13, fontWeight: 700 }}>
                                    {p.price}{" "}
                                    {p.was && (
                                        <del style={{ color: "#B4B4A8", fontWeight: 400, marginLeft: 4 }}>{p.was}</del>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <img

                        src={similarPortrait}
                        alt="Man holding a Chantallow tallow skincare jar"
                        style={{
                            width: "92%",
                            height: "94%",
                            objectFit: "cover",
                            objectPosition: "bottom center",
                            display: "block",
                            borderRadius: "50% 50% 0 0 / 40% 40% 0 0",  // arch: round top, flat bottom
                        }}
                    />
                </div>
            </div>
        </section>
    );
}

/* -------------------------------- Saving -------------------------------- */

function SavingSection() {
    return (
        <section style={{ padding: "20px 24px 80px", background: "#EDF8F3", overflowX: "clip", }}>
            <div
                style={{
                    maxWidth: 1360,
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: window.innerWidth > 900 ? "1fr 1fr" : "1fr",
                    gap: 24,
                }}
            >
                {/* Left: each product in its own card */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${window.innerWidth > 560 ? 2 : 1}, 1fr)`,
                        gap: 24,
                        alignContent: "start",
                    }}
                >
                    {SAVING_LEFT.map((p) => (
                        <div
                            key={p.id}
                            className="ctw-card-hover"
                            style={{
                                position: "relative",
                                background: "#fff",
                                borderRadius: 14,
                                padding: 12,
                            }}
                        >
                            <SavingItem {...p} />
                        </div>
                    ))}
                </div>

                {/* Right: banner image */}
                <div
                    style={{

                        position: "relative",
                        minHeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        marginRight: -160,   // was -80 — now safe to increase
                        clipPath: "url(#waveLeft)",

                    }}
                >
                    <img
                        src={savingBanner}
                        alt=""
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                        }}
                    />

                    <div
                        style={{
                            position: "relative",
                            zIndex: 1,
                            textAlign: "center",
                            color: "#fff",
                            padding: "48px 32px",
                            width: "100%",
                        }}
                    >
                        <h2
                            className="ctw-serif"
                            style={{
                                fontSize: 40,
                                fontWeight: 500,
                                lineHeight: 1.25,
                                fontFamily: 'Marcellus',
                                margin: "0 auto 12px",
                                maxWidth: 380,
                                color: "#FFFFFF",
                            }}
                        >
                            Great Saving On Everyday Essentials
                        </h2>
                        <p
                            className="ctw-serif"
                            style={{
                                fontSize: 16,
                                fontFamily: 'Lufga',
                                margin: "0 0 24px",
                                color: "#FFFFFF",
                                opacity: 0.95,
                            }}
                        >
                            Up To 60% Off + Up To $107 Cashback
                        </p>
                        <a
                            href="#shop"
                            className="ctw-serif"
                            style={{
                                display: "inline-block",
                                background: "rgba(255,255,255,0.9)",
                                color: "#1C1C1A",
                                padding: "12px 32px",
                                borderRadius: 4,
                                fontSize: 17,
                                textDecoration: "none",
                            }}
                        >
                            See All
                        </a>

                        <svg
                            className="ctw-animation-text"
                            viewBox="0 0 1320 300"
                            aria-hidden="true"
                            style={{
                                position: "absolute",

                                bottom: -180,
                                left: 80,
                                fontSize: 40,
                                width: "60%",
                                height: "auto",
                                userSelect: "none",
                            }}
                        >
                            <text x="0" y="290" textLength="1320" lengthAdjust="spacingAndGlyphs">
                                GREAT SAVING
                            </text>
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    );
}

function SavingColumn({ items }) {
    return (
        <div
            className="ctw-card-hover"
            style={{
                position: "relative",
                background: "#fff",
                borderRadius: 14,
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
            }}
        >
            {items.map((p) => (
                <SavingItem key={p.id} {...p} />
            ))}
        </div>
    );
}

function SavingItem({ name, sub, price = "$00.00", was = "$00.00", badge, img }) {
    return (
        <div style={{ position: "relative" }}>
            <div
                style={{
                    width: "100%",
                    aspectRatio: "1 / 0.6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                }}
            >
                {img && (
                    <img
                        src={img}
                        alt={`Chantallow ${name} tallow skincare jar`}
                        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                    />
                )}
            </div>

            <div
                style={{
                    position: "relative",
                    marginTop: -14,
                    background: "#EAF3EE",
                    borderRadius: 8,
                    padding: "10px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 8,
                }}
            >
                <div style={{ flex: 1 }}>
                    <h6 className="ctw-serif" style={{ margin: "0 0 3px", fontSize: 18, fontWeight: 500, color: "#1C1C1A" }}>
                        {name}
                    </h6>
                    <span className="ctw-serif" style={{ fontSize: 15, color: "#41705B", lineHeight: 1.3 }}>
                        {sub}
                    </span>
                </div>
                <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <div className="ctw-serif" style={{ fontSize: 16, fontWeight: 500 }}>{price}</div>
                    <del className="ctw-serif" style={{ fontSize: 14, color: "#B4B4A8" }}>{was}</del>
                </div>
            </div>

            {badge && (
                <span
                    style={{
                        position: "absolute",
                        top: -12,
                        right: -14,
                        background: "#41705B",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 700,
                        borderRadius: "50%",
                        width: 50,
                        height: 50,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        lineHeight: 1.1,
                        zIndex: 2,
                    }}
                >
                    50%<br />Sale
                </span>
            )}
        </div>
    );
}

function ProductStripCard({ name, sub, price = "$00.00", was = "$00.00", badge }) {
    return (
        <div
            className="ctw-card-hover"
            style={{
                position: "relative",
                background: "#fff",
                borderRadius: 14,
                padding: 14,
                display: "flex",
                gap: 14,
                alignItems: "center",
            }}
        >
            <div
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: 10,
                    flexShrink: 0,
                    background: "linear-gradient(150deg,#EFEBDD,#D9CFAE)",
                }}
            />
            <div style={{ flex: 1 }}>
                <h6 style={{ margin: "0 0 4px", fontSize: 13.5, fontWeight: 700 }}>{name}</h6>
                <span style={{ fontSize: 11.5, color: "#8A8A80", display: "block", marginBottom: 6 }}>{sub}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>
                    {price} <del style={{ color: "#B4B4A8", fontWeight: 400, marginLeft: 4 }}>{was}</del>
                </span>
            </div>
            {badge && (
                <span
                    style={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        background: "#7A0000",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        borderRadius: "50%",
                        width: 44,
                        height: 44,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        lineHeight: 1.1,
                    }}
                >
                    50%
                    <br />
                    Sale
                </span>
            )}
        </div>
    );
}

/* ----------------------------- Featured Offers ----------------------------- */

function FeaturedOffers() {
    const track = [...FEATURED_OFFERS, ...FEATURED_OFFERS];

    return (
        <section style={{ padding: "20px 0 80px", background: "#EDF8F3" }}>
            <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 24px" }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 28,
                    }}
                >
                    <h2
                        style={{
                            color: "#2D2E2F",
                            fontSize: 55,
                            fontWeight: 400,
                            lineHeight: 1.2,
                            textTransform: "capitalize",
                            fontFamily: "var(--font-family-title)",
                            margin: 0,
                        }}
                    >
                        Featured offer for you
                    </h2>
                    <a
                        href="#shop"
                        className="ctw-btn"
                        style={{
                            color: "#1C1C1A",
                            textDecoration: "none",
                            border: "1px solid #1C1C1A",
                            padding: "11px 22px",
                            borderRadius: 30,
                        }}
                    >
                        View All
                    </a>
                </div>
            </div>

            <div style={{ overflow: "hidden", padding: "12px 0" }}>
                <div className="ctw-offer-track" style={{ display: "flex", gap: 24, width: "fit-content" }}>
                    {track.map((o, i) => (
                        <div
                            key={i}
                            aria-hidden={i >= FEATURED_OFFERS.length}
                            style={{
                                flex: "0 0 640px",
                                aspectRatio: "3 / 2",
                                position: "relative",
                                overflow: "hidden",
                                backgroundImage: `url(${o.img})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                padding: "0 56px 0 0",
                            }}
                        >
                            <div style={{ textAlign: "center", position: "relative" }}>
                                <span
                                    style={{
                                        display: "inline-block",
                                        background: "#2C7A55",
                                        color: "#fff",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        letterSpacing: "0.04em",
                                        textTransform: "uppercase",
                                        padding: "9px 20px",
                                        marginBottom: 18,
                                        fontFamily: "Lufga",
                                    }}
                                >
                                    {o.label}
                                </span>

                                <h4
                                    className="ctw-serif"
                                    style={{
                                        fontSize: 38,
                                        fontWeight: 400,
                                        letterSpacing: "0.1em",
                                        textTransform: "uppercase",
                                        color: o.textColor || "#0B0B0B",
                                        margin: "0 0 4px",
                                        fontFamily: "Marcellus",
                                    }}
                                >
                                    {o.title}
                                </h4>

                                {o.year && (
                                    <div
                                        className="ctw-serif"
                                        style={{
                                            fontSize: 78,
                                            lineHeight: 0.95,
                                            color: o.textColor || "#3A3A38",
                                            marginBottom: 14,
                                            fontFamily: "Marcellus",
                                        }}
                                    >
                                        {o.year}
                                    </div>
                                )}

                                {o.bgTitle && (
                                    <div
                                        className="ctw-serif"
                                        style={{
                                            fontSize: 84,
                                            lineHeight: 0.95,
                                            letterSpacing: "0.04em",
                                            textTransform: "uppercase",
                                            color: o.textColor || "#3A3A38",
                                            marginBottom: 14,
                                            fontFamily: "Marcellus",
                                        }}
                                    >
                                        {o.bgTitle}
                                    </div>
                                )}

                                <a
                                    href="#shop"
                                    className="ctw-serif"
                                    style={{
                                        display: "inline-block",
                                        marginTop: 10,
                                        border: `1px solid ${o.textColor === "#fff" ? "#fff" : "#6B6B66"}`,
                                        borderRadius: 40,
                                        padding: "14px 34px",
                                        fontSize: 18,
                                        color: o.textColor || "#1C1C1A",
                                        textDecoration: "none",
                                        fontFamily: "Marcellus",
                                    }}
                                >
                                    Collect Now
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
        .ctw-offer-track {
          animation: ctwOfferScroll 40s linear infinite;
        }
        .ctw-offer-track:hover { animation-play-state: paused; }
        @keyframes ctwOfferScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ctw-offer-track { animation: none !important; }
        }
      `}</style>
        </section>
    );
}

/* ------------------------------- Shortlist ------------------------------- */

function ShortlistSection() {
    return (
        <section style={{ background: "#F7F4EC", padding: "0", position: "relative" }}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: window.innerWidth > 900 ? "1.05fr 0.95fr" : "1fr",
                    alignItems: "center",
                }}
            >
                {/* LEFT — banner with man image, wave cut on right edge */}
                <div
                    style={{
                        position: "relative",
                        minHeight: 700,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        marginLeft: -40,
                        clipPath: "path('M 0 0 L 88% 0 C 98% 18%, 86% 32%, 94% 50%, 102% 68%, 88% 84%, 96% 100% L 0 100% Z')",
                    }}
                >
                    {/* ⚠ match this var to your man/pain banner import */}
                    <img
                        src={shortlistBanner}
                        alt=""
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                        }}
                    />

                    {/* Centered content */}
                    <div
                        style={{
                            position: "relative",
                            zIndex: 1,
                            textAlign: "center",
                            color: "#fff",
                            padding: "48px 32px",
                            width: "100%",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: 44,
                                fontWeight: 500,
                                lineHeight: 1.2,
                                margin: "0 auto 24px",
                                maxWidth: 440,
                                color: "#FFFFFF",
                                fontFamily: "Marcellus, sans-serif",
                            }}
                        >
                            Recent Additions To Your Shortlist
                        </h2>

                        <a
                            href="#shop"
                            style={{
                                display: "inline-block",
                                background: "rgba(255,255,255,0.92)",
                                color: "#1C1C1A",
                                padding: "12px 32px",
                                borderRadius: 4,
                                fontSize: 17,
                                textDecoration: "none",
                                fontFamily: "Marcellus, sans-serif",
                            }}
                        >
                            See All
                        </a>
                    </div>

                    <svg
                        className="ctw-animation-text"
                        viewBox="0 0 1320 300"
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            bottom: -28,
                            // right: 4,
                            left: "auto",          // was 0 — release left so right positioning works
                            width: "60%",          // smaller than full width
                            height: "auto",
                            // zIndex: 1,
                            // userSelect: "none",
                            // textAlign: "right",
                        }}
                    >
                        <text x="100%" y="200" textAnchor="end">SHORTLIST</text>
                    </svg>
                </div>

                {/* RIGHT — single large product */}
                <div style={{ alignSelf: "center", padding: "0 24px" }}>
                    <div style={{ maxWidth: 480, margin: "0 auto" }}>
                        {/* ⚠ match this var to your pain.png (olive-board) import */}
                        <img
                            src={painImg}
                            alt="Chantallow Olivine Relief tallow on olive wood board"
                            style={{
                                width: "100%",
                                maxWidth: 480,
                                height: "auto",
                                display: "block",
                                margin: "0 auto 20px",
                            }}
                        />
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: 16,
                                padding: "0 8px",
                            }}
                        >
                            <div>
                                <h6
                                    style={{
                                        margin: "0 0 4px",
                                        fontSize: 22,
                                        fontWeight: 500,
                                        color: "#1C1C1A",
                                        fontFamily: "Marcellus, sans-serif",
                                    }}
                                >
                                    Olivine Relief
                                </h6>
                                <span
                                    className="ctw-serif"
                                    style={{ fontSize: 18, color: "#41705B" }}
                                >
                                    Zechstein Magnesium + Arnica
                                </span>
                            </div>
                            <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                <div className="ctw-serif" style={{ fontSize: 16, fontWeight: 500 }}>$00.00</div>
                                <del className="ctw-serif" style={{ fontSize: 14, color: "#B4B4A8" }}>$00.00</del>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ShortlistColumn({ items }) {
    return (
        <div
            className="ctw-card-hover"
            style={{
                position: "relative",
                background: "#fff",
                borderRadius: 14,
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
            }}
        >
            {items.map((p) => (
                <ShortlistItem key={p.id} {...p} />
            ))}
        </div>
    );
}

function ShortlistItem({ name, sub, price = "$00.00", was = "$00.00", sale, badge, img }) {
    return (
        <div style={{ position: "relative" }}>
            <div
                style={{
                    width: "100%",
                    aspectRatio: "1 / 0.6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                }}
            >
                {img && (
                    <img
                        src={img}
                        alt={`Chantallow ${name} tallow skincare jar`}
                        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                    />
                )}
            </div>

            <div
                style={{
                    position: "relative",
                    marginTop: -14,
                    background: "#EAF3EE",
                    borderRadius: 8,
                    padding: "10px 14px",
                }}
            >
                {sale && (
                    <span
                        style={{
                            display: "block",
                            fontSize: 12,
                            color: "#41705B",
                            marginBottom: 4,
                            fontFamily: "Lufga",
                        }}
                    >
                        {sale}
                    </span>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                        <h6
                            className="ctw-serif"
                            style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 500, color: "#1C1C1A", fontFamily: "Marcellus" }}
                        >
                            {name}
                        </h6>
                        <span className="ctw-serif" style={{ fontSize: 13, color: "#41705B", lineHeight: 1.25 }}>
                            {sub}
                        </span>
                    </div>
                    <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <div className="ctw-serif" style={{ fontSize: 14, fontWeight: 500 }}>{price}</div>
                        <del className="ctw-serif" style={{ fontSize: 12, color: "#B4B4A8" }}>{was}</del>
                    </div>
                </div>
            </div>

            {badge && (
                <span
                    style={{
                        position: "absolute",
                        top: -12,
                        right: -14,
                        background: "#41705B",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 700,
                        borderRadius: "50%",
                        width: 50,
                        height: 50,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        lineHeight: 1.1,
                        zIndex: 2,
                    }}
                >
                    50%<br />Sale
                </span>
            )}
        </div>
    );
}

/* -------------------------------- Footer -------------------------------- */

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

function PaymentBadges() {
    const cards = [
        { label: "VISA", bg: "#1A1F71", fg: "#fff" },
        { label: "AMEX", bg: "#2E77BC", fg: "#fff" },
        { label: "DISC", bg: "#F58220", fg: "#fff" },
        { label: "DINERS", bg: "#0079BE", fg: "#fff" },
        { label: "JCB", bg: "#1C1C1A", fg: "#fff" },
        { label: "MC", bg: "#EB001B", fg: "#fff" },
    ];
    return (
        <div style={{ display: "flex", gap: 6 }}>
            {cards.map((c) => (
                <div
                    key={c.label}
                    style={{
                        width: 34,
                        height: 22,
                        borderRadius: 4,
                        background: c.bg,
                        color: c.fg,
                        fontSize: 7.5,
                        fontWeight: 800,
                        letterSpacing: "0.02em",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {c.label}
                </div>
            ))}
        </div>
    );
}

/* ------------------------------ Scroll to top ------------------------------ */

function ScrollTop() {
    const [visible, setVisible] = useState(false);

    React.useEffect(() => {
        const handler = () => setVisible(window.scrollY > 400);
        window.addEventListener("scroll", handler);
        return () => window.removeEventListener("scroll", handler);
    }, []);

    return (
        <button
            aria-label="Scroll to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{
                position: "fixed",
                bottom: 24,
                right: 24,
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "#41705B",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                display: visible ? "flex" : "none",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
                zIndex: 50,
            }}
        >
            <ArrowUp size={18} />
        </button>
    );
}

/* -------------------------------- Overlays -------------------------------- */

function SearchOverlay({ open, onClose }) {
    if (!open) return null;
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                zIndex: 100,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#F7F4EC",
                    width: "100%",
                    maxWidth: 720,
                    marginTop: 60,
                    borderRadius: 16,
                    padding: 28,
                    position: "relative",
                }}
            >
                <button
                    onClick={onClose}
                    aria-label="Close search"
                    style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    <X size={20} />
                </button>
                <div
                    style={{
                        display: "flex",
                        border: "1px solid #D8D4C4",
                        borderRadius: 30,
                        overflow: "hidden",
                        background: "#fff",
                        marginBottom: 20,
                    }}
                >
                    <input
                        type="search"
                        placeholder="Search Product"
                        style={{
                            flex: 1,
                            border: "none",
                            outline: "none",
                            padding: "14px 20px",
                            fontSize: 14,
                        }}
                    />
                    <button
                        style={{
                            border: "none",
                            background: "#1C1C1A",
                            color: "#fff",
                            padding: "0 22px",
                            cursor: "pointer",
                        }}
                    >
                        <Search size={16} />
                    </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    <span style={{ fontSize: 12.5, color: "#8A8A80", marginRight: 4 }}>Quick Search:</span>
                    {["Skin Product", "Body Products", "Daily Products", "Cream Products"].map((t) => (
                        <a
                            key={t}
                            href="#shop"
                            className="ctw-underline-link"
                            style={{ fontSize: 12.5, color: "#1C1C1A", textDecoration: "none" }}
                        >
                            {t}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}

function CartDrawer({ open, onClose, tab, setTab }) {
    const cartItems = [
        { id: 1, name: "Soothing Body Cream", price: "$50.00" },
        { id: 2, name: "Body Toner", price: "$40.00" },
        { id: 3, name: "Brightening Serum", price: "$65.00" },
    ];
    const wishlistItems = [
        { id: 1, name: "Soothing Body Cream", price: "$50.00" },
        { id: 2, name: "Body Toner", price: "$40.00" },
    ];
    const items = tab === "cart" ? cartItems : wishlistItems;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                pointerEvents: open ? "auto" : "none",
            }}
        >
            <div
                onClick={onClose}
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.4)",
                    opacity: open ? 1 : 0,
                    transition: "opacity .3s ease",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: "min(400px, 100%)",
                    background: "#fff",
                    transform: open ? "translateX(0)" : "translateX(100%)",
                    transition: "transform .35s ease",
                    padding: 24,
                    overflowY: "auto",
                }}
            >
                <button
                    onClick={onClose}
                    aria-label="Close cart"
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        marginBottom: 20,
                    }}
                >
                    <X size={20} />
                </button>

                <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                    <button
                        onClick={() => setTab("cart")}
                        className="ctw-btn"
                        style={{
                            flex: 1,
                            padding: "10px 0",
                            borderRadius: 30,
                            background: tab === "cart" ? "#1C1C1A" : "#F0EEE4",
                            color: tab === "cart" ? "#fff" : "#1C1C1A",
                        }}
                    >
                        Cart (5)
                    </button>
                    <button
                        onClick={() => setTab("wishlist")}
                        className="ctw-btn"
                        style={{
                            flex: 1,
                            padding: "10px 0",
                            borderRadius: 30,
                            background: tab === "wishlist" ? "#1C1C1A" : "#F0EEE4",
                            color: tab === "wishlist" ? "#fff" : "#1C1C1A",
                        }}
                    >
                        Wishlist (2)
                    </button>
                </div>

                {items.map((it) => (
                    <div
                        key={it.id}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                            marginBottom: 18,
                            paddingBottom: 18,
                            borderBottom: "1px solid #F0EEE4",
                        }}
                    >
                        <div
                            style={{
                                width: 60,
                                height: 60,
                                borderRadius: 10,
                                background: "linear-gradient(150deg,#EFEBDD,#D9CFAE)",
                                flexShrink: 0,
                            }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>{it.name}</div>
                            <div style={{ fontSize: 13, color: "#41705B", fontWeight: 700 }}>{it.price}</div>
                        </div>
                        <button aria-label="Remove" style={{ background: "none", border: "none", cursor: "pointer" }}>
                            <X size={16} color="#B4B4A8" />
                        </button>
                    </div>
                ))}

                {tab === "cart" && (
                    <>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: 16,
                                fontWeight: 700,
                                margin: "20px 0",
                            }}
                        >
                            <span>Subtotal:</span>
                            <span>$300.00</span>
                        </div>
                        <button
                            className="ctw-btn"
                            style={{
                                width: "100%",
                                background: "transparent",
                                border: "1px solid #1C1C1A",
                                color: "#1C1C1A",
                                padding: "14px 0",
                                borderRadius: 30,
                                marginBottom: 10,
                            }}
                        >
                            Checkout
                        </button>
                        <button
                            className="ctw-btn"
                            style={{
                                width: "100%",
                                background: "#1C1C1A",
                                color: "#fff",
                                padding: "14px 0",
                                borderRadius: 30,
                            }}
                        >
                            View Cart
                        </button>
                    </>
                )}
                {tab === "wishlist" && (
                    <button
                        className="ctw-btn"
                        style={{
                            width: "100%",
                            background: "#1C1C1A",
                            color: "#fff",
                            padding: "14px 0",
                            borderRadius: 30,
                            marginTop: 10,
                        }}
                    >
                        Check Your Favourite
                    </button>
                )}
            </div>
        </div>
    );
}

function QuickViewModal({ open, onClose }) {
    if (!open) return null;
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 110,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#fff",
                    borderRadius: 20,
                    maxWidth: 780,
                    width: "100%",
                    maxHeight: "88vh",
                    overflowY: "auto",
                    display: "grid",
                    gridTemplateColumns: window.innerWidth > 640 ? "1fr 1fr" : "1fr",
                    position: "relative",
                }}
            >
                <button
                    onClick={onClose}
                    aria-label="Close"
                    style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        background: "#fff",
                        border: "1px solid #ECEAE0",
                        borderRadius: "50%",
                        width: 32,
                        height: 32,
                        cursor: "pointer",
                        zIndex: 2,
                    }}
                >
                    <X size={16} />
                </button>
                <div
                    style={{
                        background: "linear-gradient(150deg,#EFEBDD,#D9CFAE)",
                        minHeight: 280,
                    }}
                />
                <div style={{ padding: 28 }}>
                    <span
                        style={{
                            display: "inline-block",
                            background: "#41705B",
                            color: "#fff",
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: "5px 10px",
                            borderRadius: 20,
                            marginBottom: 12,
                        }}
                    >
                        Sale 20% Off
                    </span>
                    <h4 className="ctw-serif" style={{ fontSize: 24, margin: "0 0 8px" }}>
                        Crystal Clear Cleanser
                    </h4>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                        <div style={{ display: "flex", gap: 2 }}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                    key={i}
                                    size={14}
                                    fill={i <= 3 ? "#E4B549" : "none"}
                                    color={i <= 3 ? "#E4B549" : "#D4D2C6"}
                                />
                            ))}
                        </div>
                        <span style={{ fontSize: 12.5, color: "#41705B", fontWeight: 700 }}>4.7 Rating</span>
                        <span style={{ fontSize: 12, color: "#8A8A80" }}>(5 customer reviews)</span>
                    </div>
                    <p style={{ fontSize: 13.5, fontFamily: 'Lufga', color: "#5A5A52", lineHeight: 1.7, marginBottom: 20 }}>
                        Lorem Ipsum is simply dummy text of the printing & typesetting
                        industry. Ipsum has been the industry's standard dummy text.
                    </p>
                    <div style={{ display: "flex", gap: 28, alignItems: "flex-end", marginBottom: 20 }}>
                        <div>
                            <div style={{ fontSize: 11, color: "#8A8A80", marginBottom: 4 }}>Price</div>
                            <div style={{ fontSize: 18, fontWeight: 700 }}>
                                $45.00 <del style={{ color: "#B4B4A8", fontWeight: 400, fontSize: 14 }}>$72.17</del>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: "#8A8A80", marginBottom: 4 }}>Quantity</div>
                            <input
                                defaultValue={1}
                                style={{
                                    width: 52,
                                    padding: "8px 10px",
                                    border: "1px solid #ECEAE0",
                                    borderRadius: 8,
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                        <button
                            className="ctw-btn"
                            style={{ flex: 1, background: "#1C1C1A", color: "#fff", padding: "13px 0", borderRadius: 30 }}
                        >
                            Add To Cart
                        </button>
                        <button
                            aria-label="Add to wishlist"
                            style={{
                                width: 46,
                                border: "1px solid #1C1C1A",
                                borderRadius: "50%",
                                background: "none",
                                cursor: "pointer",
                            }}
                        >
                            <Heart size={16} style={{ margin: "auto" }} />
                        </button>
                    </div>
                    <div style={{ fontSize: 12, color: "#8A8A80", lineHeight: 2 }}>
                        <div><strong style={{ color: "#1C1C1A" }}>SKU:</strong> PRT584E63A</div>
                        <div><strong style={{ color: "#1C1C1A" }}>Category:</strong> Skincare, Makeup, Beauty Tools, Gift Sets</div>
                        <div><strong style={{ color: "#1C1C1A" }}>Tags:</strong> Skincare, Makeup, Accessories</div>
                    </div>
                </div>
            </div>
        </div>
    );
}