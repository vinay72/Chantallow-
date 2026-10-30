import React, { useState } from "react";
import Header from "../../components/Header";
import {
  Heart,
  ShoppingBag,
  X,
  Plus,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Star,
  ArrowUp,
  Minus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Home.css";
import "../../components/SiteFooter.css";
import logo from "../../assets/logo.png";
import logo2 from "../../assets/logo2.jpg";   // adjust path to where you place it

import bannerMedia1 from "../../assets/banner-media1.png";
import pic1 from "../../assets/pic1.png";
import pic2 from "../../assets/pic2.png";
import lavender from "../../assets/lavender.png";

import CollectionCard from "../../components/CollectionCard";
import { useShop } from "../../context/ShopContext";
import { PRODUCTS as CATALOGUE, formatPrice, fromServerCombo, fromServerProduct, getProductById } from "../../data/products";
import { useCachedApi } from "../../api/useCachedApi";
import { mediaUrl } from "../../api/client";

import petMap from "../../assets/map/map2.png";
import petDog from "../../assets/pet/dog.png";
import petCat from "../../assets/pet/cat.png";
import petJars from "../../assets/pet/P1.png";

import completeCareBg from "../../assets/about/bg1.png";
import lineSvg from "../../assets/line.svg";   // adjust path to where you place it

import moringaLeaf from "../../assets/collection/2.png";   // moringa
import lavenderSprig from "../../assets/collection/3.png"; // lavender

// MORE COLLECTIONS IMAGES

import missionPortrait from "../../assets/about/abut.png";
// "Our Best Sellers" photos (src/assets/banner). If your files are .jpg, change the extensions below.
// NOTE: the file named "Amber Glow" actually shows the OLIVINE RELIEF jar.
import bestOlivine from "../../assets/banner/AmberGlow.png";       // Olivine Relief jar
import bestBare from "../../assets/banner/BareHydrate.png";        // Bare Whipped Tallow jar
import bestMalachite from "../../assets/banner/MalachiteFusion.png"; // Malachite Fusion jar
import bestTaluma from "../../assets/banner/TalumaHairCare.png";  // Taluma Hair Care jar

// SIMILAR PROFILES IMAGES

import similarPortrait from "../../assets/about/pic12.jpeg";

import similarImg2 from "../../assets/shop/product/Similar/3.png"; // Jasper Revive 4oz + 2oz
import similarImg3 from "../../assets/shop/product/Similar/5.png"; // Obsidian Infusion 4oz + 2oz

// SAVING SECTION IMAGES

import savingImg1 from "../../assets/shop/product/savings/4.png"; // Malachite Fusion
import savingImg2 from "../../assets/shop/product/savings/2.png"; // Amethyst Relief
import savingImg3 from "../../assets/shop/product/savings/1.png"; // Obsidian Infusion
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
import talumaHairCareJar from "../../assets/beauty/taluma-hair-care.jpg";
import bareWhippedTallowJar from "../../assets/beauty/bare-whipped-tallow.jpg";

// Product photography used in the "Experience, The Tallow Collection" cards
import collectionImg1 from "../../assets/product/new/1.jpg";
import collectionImg2 from "../../assets/product/new/2.jpg";
import collectionImg3 from "../../assets/product/new/3.jpg";
import collectionImg4 from "../../assets/product/new/4.jpg";
import collectionImg5 from "../../assets/product/new/5.jpg";
import collectionImg6 from "../../assets/product/new/6.jpg";
import collectionImg7 from "../../assets/product/new/7.jpg"; // Bare Whipped Tallow
import collectionImg8 from "../../assets/product/new/8.jpg"; // Taluma Hair Care

const IMAGES = {
    heroPortrait: bannerMedia1,
    productPic1: pic1,
    productPic2: pic2,
    lavender: lavender,
};

const PRODUCTS = [
    // `slug` = the product page each "Buy Now" opens (/product/<slug>)
    // `jarScale` = evens out jar size in the round images (photos have different
    //   empty space around the jar). Raise it to make a jar bigger, lower to shrink.
    { id: 1, slug: "amber-glow", jarScale: 0.92, name: "Amber Glow", accent: "#7A0000", items: "0 items", img: amberGlowJar },
    { id: 2, slug: "amethyst-relief", jarScale: 0.88, name: "Amethyst Relief", accent: "#614966", items: "4 items", img: amethystReliefJar },
    { id: 3, slug: "jasper-revive", jarScale: 1, name: "Jasper Revive", accent: "#3B1941", items: "4 items", img: jasperReviveJar },
    { id: 4, slug: "malachite-fusion", jarScale: 1, name: "Malachite Fusion", accent: "#5B2861", items: "4 items", img: malachiteFusionJar },
    { id: 5, slug: "olivine-relief", jarScale: 1.02, name: "Olivine Relief", accent: "#505634", items: "4 items", img: olivineReliefJar },
    { id: 6, slug: "obsidian-infusion", jarScale: 1.02, name: "Obsidian Infusion", accent: "#631908", items: "4 items", img: obsidianInfusionJar },
    { id: 7, slug: "taluma-hair-care", jarScale: 1.03, name: "Taluma Hair Care", accent: "#2D2E2F", items: "4 items", img: talumaHairCareJar },
    { id: 8, slug: "bare-whipped-tallow", jarScale: 1.05, name: "Bare Whipped Tallow", accent: "#c5502f", items: "4 items", img: bareWhippedTallowJar },
];

// Built-in combo cards, shown until the combos from Admin → Home → Combo
// Products load (and if the server can't be reached or has none).
// Each photo shows two jars: a big one in front and a small one beside it.
// `name` = big jar + small jar.  `id` = the BIG jar's product, so clicking the
// card, the heart and the cart button all use the product that's in front.
// `key` keeps each card unique for React.
const COLLECTION_CARDS = [
    { key: "c1", id: 4, name: "Malachite Fusion (4oz) + Amethyst Relief (2oz)", tag: "Get 20% Off", accent: "#7A0000", img: collectionImg1, col: 1 },
    { key: "c2", id: 1, name: "Amber Glow (4oz) + Bare Whipped Tallow (2oz)", accent: "#3B1941", img: collectionImg2, col: 2 },
    { key: "c3", id: 3, name: "Jasper Revive (4oz) + Obsidian Infusion (2oz)", tag: "Featured", accent: "#3B1941", img: collectionImg3, col: 3 },
    { key: "c4", id: 6, name: "Olivine Relief (4oz) + Malachite Fusion (2oz)", accent: "#5B2861", img: collectionImg4, col: 1 },
    { key: "c5", id: 5, name: "Obsidian Infusion (4oz) + Taluma Hair Care (2oz)", accent: "#5d1100", img: collectionImg8, col: 2 },
    { key: "c6", id: 7, name: "Taluma Hair Care (4oz) + Amber Glow (2oz)", accent: "#536807", img: collectionImg5, col: 3 },
    { key: "c7", id: 8, name: "Bare Whipped Tallow (4oz) + Olivine Relief (2oz)", accent: "#5d1100", img: collectionImg7, col: 1 },
    { key: "c8", id: 2, name: "Amethyst Relief (4oz) + Jasper Revive (2oz)", accent: "#5d1100", img: collectionImg6, col: 3 },
];

// Built-in "Our Best Sellers", shown until the picks from Admin → Home →
// Best Sellers load (and if none are picked or the server can't be reached).
// "Our Best Sellers" — each name matches the jar shown in its image.
// To add more products, import their arch photo and add a row here.
// "Our Best Sellers" — same style photos (jar on a grey-blue stand), each name matches its jar.
const MORE_COLLECTIONS = [
    { id: 1, slug: "olivine-relief", name: "Olivine Relief", img: bestOlivine },
    { id: 2, slug: "malachite-fusion", name: "Malachite Fusion", img: bestMalachite },
    { id: 3, slug: "taluma-hair-care", name: "Taluma Hair Care", img: bestTaluma },
    { id: 4, slug: "bare-whipped-tallow", name: "Bare Whipped Tallow", img: bestBare },
];

// Built-in "Nourish Your Skin, Naturally" cards, shown until the picks from
// Admin → Home → Nourish Your Skin load (and if none are picked or the server
// can't be reached).
const SIMILAR_PROFILES = [
    { id: 1, name: "Jasper Revive", sale: "Up To 10% Off", price: "$00", was: "$00", img: similarImg2 },      // Jasper Revive 4oz + 2oz jars
    { id: 2, name: "Obsidian Infusion", sale: "Up To 10% Off", price: "$00", was: "$00", img: similarImg3 },  // Obsidian Infusion 4oz + 2oz jars
];

// Built-in "Pure Care for Every Tattoo" cards, shown until the picks from
// Admin → Home → Pure Care for Every Tattoo load (and if none are picked or the
// server can't be reached).
const SAVING_LEFT = [
    { id: 1, name: "Malachite Fusion", sub: "Moringa + Butterfly Pea", price: "$00.00", was: "$00.00", img: savingImg1, path: "/shop-list" },
    { id: 2, name: "Amethyst Relief", sub: "Lavender Whipped Tallow", price: "$00.00", was: "$00.00", img: savingImg2, badge: true, path: "/shop-list" },
    // Only two products are shown. Uncomment to bring these back:
    // { id: 3, name: "Amber Glow", sub: "Manuka + Lavender", price: "$00.00", was: "$00.00", img: savingImg3, path: "/shop-list" },
    // { id: 4, seeAll: true },
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

const NEW_ARRIVALS = [
    { id: 1, name: "Bare Whipped Tallow", img: collectionImg6 },
    { id: 2, name: "Furkind Pet Tallow", img: collectionImg6 },
    { id: 3, name: "Taluma Hair Care", img: collectionImg6 },
];

const CATEGORY_MARQUEE = ["Accessories", "Haircare", "Nailcare", "Beautycare", "Bodycare", "Skincare"];

// Size options for the Amber Glow / Amethyst Relief cards in the hero
const HERO_SIZES = [
    { value: "2oz", label: "2 oz" },
    { value: "4oz", label: "4 oz" },
];
const HERO_SIZE_LABEL = { "2oz": "2 oz", "4oz": "4 oz" };

// Shown in the hero when the admin hasn't picked any new launches
// (Admin → Home). These come from data/products.js.
const DEFAULT_HERO_PRODUCTS = [
    { id: 1, name: "Amber Glow", img: pic1 },
    { id: 2, name: "Amethyst Relief", img: pic2 },
].map((p) => ({ ...p, price: getProductById(p.id)?.price, was: null, sizes: HERO_SIZES, inStock: true, product: null }));

export default function Home() {
    const navigate = useNavigate();
    const [quickView, setQuickView] = useState(null); // card shown in Quick View (null = closed)
    // Products picked in Admin → Home (new launches + best sellers)
    const home = useCachedApi("/home");

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

            <Header />
            <QuickViewModal card={quickView} onClose={() => setQuickView(null)} />

            <main>
                <Hero navigate={navigate} home={home} />
                <MissionStrip />
                <CompleteCareBanner />
                {/* <CategoryMarquee /> */}
                <TallowCollection onQuickView={(card) => setQuickView(card)} />
                <MoreCollections home={home} />
                <SimilarProfilesSection home={home} />
                <SavingSection home={home} />
                <FurkindPetSection />
                <FeaturedOffers />
                <ShortlistSection />
            </main>

            <Footer />
            <ScrollTop />
        </div>
    );
}

// A "Nourish Your Skin" card: links to the product when it has a page to go to.
function SimilarCardLink({ path, children }) {
    if (!path) return <div style={{ minWidth: 0 }}>{children}</div>;
    return (
        <Link to={path} style={{ minWidth: 0, display: "block", color: "inherit", textDecoration: "none" }}>
            {children}
        </Link>
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

      /* ---- Mission Strip: hover = grey wash + tilted jar + "Buy Now" pill ---- */
      .ctw-mission-circle img {
        transform: scale(var(--jar-scale, 1));
        transform-origin: center;
        transition: transform .5s ease;
      }
      .ctw-mission-circle::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: #BDBDBD;
        mix-blend-mode: multiply;   /* turns the white photo background grey */
        opacity: 0;
        transition: opacity .4s ease;
        pointer-events: none;
        z-index: 1;
      }
      .ctw-mission-circle:hover::after { opacity: 1; }
      .ctw-mission-circle:hover img { transform: rotate(25deg) scale(calc(var(--jar-scale, 1) * 1.03)); }

      .ctw-buy-now {
        position: absolute;
        top: 50%;
        left: 50%;
        z-index: 2;
        transform: translate(-50%, -50%) scale(.85);
        opacity: 0;
        background: #fff;
        color: #1C1C1A;
        border: none;
        border-radius: 30px;
        padding: 10px 22px;
        font-family: 'DM Sans', sans-serif;
        font-size: 15px;
        font-weight: 600;
        letter-spacing: .04em;
        text-transform: uppercase;
        white-space: nowrap;
        cursor: pointer;
        box-shadow: 0 8px 20px rgba(0,0,0,.15);
        transition: opacity .35s ease, transform .35s ease, background .25s ease, color .25s ease;
      }
      .ctw-buy-now:hover { background: #2D2E2F; color: #fff; }
      .ctw-mission-circle:hover .ctw-buy-now,
      .ctw-buy-now:focus-visible {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      /* Touch screens have no hover, so keep the button visible there */
      @media (hover: none) {
        .ctw-buy-now { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
      @media (prefers-reduced-motion: reduce) {
        .ctw-mission-circle img, .ctw-mission-circle:hover img { transition: none; transform: scale(var(--jar-scale, 1)); }
      }
    `}</style>
    );
}

/* --------------------------------- Hero --------------------------------- */

function Hero({ navigate, home }) {
    const { addToCart, showToast } = useShop();

    // New launch products picked in Admin → Home → New Launches.
    const launches = home.data ? home.data.new_launches.map(fromServerProduct) : null;

    // Nothing until loaded (or the defaults if the server can't be reached).
    const heroProducts =
        launches === null
            ? home.status === "error"
                ? DEFAULT_HERO_PRODUCTS
                : []
            : launches.length
            ? launches.map((p) => ({
                  id: p.id,
                  name: p.name,
                  img: p.cardImage,
                  price: p.price,
                  was: p.compareAtPrice,
                  sizes: p.size ? [{ value: p.size, label: p.size }] : [],
                  inStock: p.inStock,
                  product: p,
              }))
            : DEFAULT_HERO_PRODUCTS;

    // Selected size for each hero mini product (product id -> size); first size by default
    const [heroSizes, setHeroSizes] = useState({});
    const sizeOf = (p) => heroSizes[p.id] ?? p.sizes[0]?.value ?? "";
    const sizeLabel = (p, value) => p.sizes.find((s) => s.value === value)?.label || HERO_SIZE_LABEL[value] || value;

    return (
        <section
            id="home"
            className="ctw-hero"
            style={{
                position: "relative",
                background: "#FFFFFF",
                overflow: "hidden",
            }}
        >
            {/* Mint wash bleeding down from the header's right panel */}
            <div
                aria-hidden="true"
                className="hide-below-md"
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

            {/* <img
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
            /> */}

            {/* Lavender, bottom left */}
            <img
                src={IMAGES.lavender}
                alt=""
                aria-hidden="true"
                className="hide-below-lg"
                style={{
                    position: "absolute",
                    bottom: 40,
                    left: 24,
                    width: 90,
                    pointerEvents: "none",
                }}
            />

            <div className="ctw-hero-grid">
                {/* Left column */}
                <div className="ctw-fade-in ctw-hero-copy">
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
                        className="hide-below-md"
                        style={{
                            position: "absolute",
                            // top: 340,
                            left: "72%",
                            width: 130,
                            pointerEvents: "none",
                        }}
                    />
                    <p
                        className="ctw-hero-text"
                        style={{
                            color: "#2D2E2F",
                            fontFamily: "Marcellus, sans-serif",
                        }}
                    >
                        Handcrafted wellness using Moringa, Butterfly Pea, and Zechstein Magnesium.
                    </p>

                    <button
                        className="ctw-hero-cta"
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
                        }}
                        onClick={() => navigate("/shop")}
                    >
                        Shop Now
                    </button>

                    {/* Mini product cards (new launches) — "+" adds that product to the cart */}
                    <div className="ctw-hero-minis" style={{ minHeight: 110 }}>
                        {heroProducts.map((p) => (
                            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
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
                                        aria-label={p.inStock ? `Add ${p.name}${sizeOf(p) ? ` (${sizeLabel(p, sizeOf(p))})` : ""} to cart` : `${p.name} is sold out`}
                                        disabled={!p.inStock}
                                        onClick={() => {
                                            const size = sizeOf(p);
                                            addToCart(p.id, 1, size || "One size", p.product);
                                            showToast(`${p.name}${size ? ` (${sizeLabel(p, size)})` : ""} added to cart`);
                                        }}
                                        style={{
                                            opacity: p.inStock ? 1 : 0.4,
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
                                            cursor: p.inStock ? "pointer" : "not-allowed",
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
                                        <span style={{ color: "#41705B" }}>{p.price != null ? formatPrice(p.price) : "$00"}</span>
                                        {p.was != null && <del style={{ color: "#B4B4A8", marginLeft: 6 }}>{formatPrice(p.was)}</del>}
                                        {!p.inStock && <span style={{ color: "#B5483A", marginLeft: 10, fontSize: 14 }}>Sold out</span>}
                                    </div>

                                    {/* Size selector (2 oz / 4 oz, or the launch product's size) */}
                                    {p.sizes.length > 0 && (
                                        <div
                                            role="radiogroup"
                                            aria-label={`${p.name} size`}
                                            style={{ display: "flex", gap: 8, marginTop: 10 }}
                                        >
                                            {p.sizes.map((s) => {
                                                const active = sizeOf(p) === s.value;
                                                return (
                                                    <button
                                                        key={s.value}
                                                        type="button"
                                                        role="radio"
                                                        aria-checked={active}
                                                        onClick={() => setHeroSizes((prev) => ({ ...prev, [p.id]: s.value }))}
                                                        style={{
                                                            minWidth: 52,
                                                            padding: "6px 12px",
                                                            borderRadius: 20,
                                                            border: `1px solid ${active ? "#2C7A55" : "#C9D2CC"}`,
                                                            background: active ? "#2C7A55" : "transparent",
                                                            color: active ? "#fff" : "#2D2E2F",
                                                            fontSize: 13,
                                                            fontFamily: "Lufga, 'DM Sans', sans-serif",
                                                            cursor: "pointer",
                                                            transition: "all .2s ease",
                                                        }}
                                                    >
                                                        {s.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right column: arch/door portrait */}
                <div className="ctw-hero-media">
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
                className="ctw-hero-rail"
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,               // stretches full height, no bottom gap
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
                className="hide-below-lg"
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
    const navigate = useNavigate();

    return (
        <section className="ctw-mission" style={{ background: "#EDF8F3", position: "relative", overflow: "hidden" }}>

            <div
                className="ctw-mission-inner"
                style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    textAlign: "center",
                }}
            >
                <h2
                    className="ctw-mission-title"
                    style={{
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

                <div className="ctw-mission-grid">
                    {PRODUCTS.map((p) => (
                        <a
                            key={p.id}
                            href="#shop"
                            style={{ textDecoration: "none", textAlign: "center" }}
                        >
                            <div
                                className="ctw-card-hover ctw-mission-circle"
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
                                        objectPosition: "center",
                                        // "--jar-scale": p.jarScale || 1,
                                    }}
                                />
                                <button
                                    type="button"
                                    className="ctw-buy-now"
                                    aria-label={`Buy ${p.name} now`}
                                    onClick={(e) => {
                                        e.preventDefault();   // don't follow the card's #shop link
                                        e.stopPropagation();
                                        navigate(`/product/${p.slug}`);
                                    }}
                                >
                                    Buy Now
                                </button>
                            </div>
                            <h3
                                className="ctw-mission-name"
                                style={{
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
/* Cards come from components/CollectionCard.jsx:
     image  -> product detail page
     heart  -> adds/removes favourite, stays on Home
     bag    -> adds to cart, stays on Home                                    */

function TallowCollection({ onQuickView }) {
    // Combos managed in Admin → Home → Combo Products. The last copy saved in
    // this browser shows at once while the latest loads.
    const { data, status } = useCachedApi("/combos");
    const combos = data ? data.combos.map(fromServerCombo) : null;

    // Server combos fill the 3 columns left to right, like the built-in layout.
    // While the first load is running, placeholder cards hold the space; the
    // built-in cards are only used if there's nothing from the server at all.
    const cards = combos?.length
        ? combos.map((combo, i) => ({
              key: combo.id,
              id: combo.id,
              name: combo.name,
              tag: combo.tag,
              accent: combo.accent,
              img: combo.cardImage,
              col: (i % 3) + 1,
              combo,
          }))
        : status === "loading"
        ? Array.from({ length: 6 }, (_, i) => ({ key: `placeholder-${i}`, col: (i % 3) + 1, placeholder: true }))
        : COLLECTION_CARDS;

    return (
        <section
            id="shop"
            className="ctw-duos"
            style={{
                background: "#EDF8F3",
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
                className="hide-below-md"
                style={{
                    position: "absolute",
                    top: 40,
                    left: 40,
                    width: 120,
                    pointerEvents: "none",
                    zIndex: 1,
                    animation: "ctwFloat 5s ease-in-out infinite",
                }}
            />
            <img
                src={lavenderSprig}
                alt=""
                aria-hidden="true"
                className="hide-below-md"
                style={{
                    position: "absolute",
                    top: 60,
                    right: 40,
                    width: 110,
                    pointerEvents: "none",
                    zIndex: 1,
                    animation: "ctwFloat 6s ease-in-out infinite",
                    animationDelay: "1s",
                }}
            />

            <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
                <h2
                    className="ctw-duos-title"
                    style={{
                        fontWeight: 500,
                        margin: "0 0 48px",
                        color: "#2D2E2F",
                        fontFamily: "Marcellus, sans-serif",
                    }}
                >
                    The Chantallow Duos - Discover Your Perfect Tallow Duo
                </h2>

                {/* Desktop: 3 masonry columns, middle column offset down.
                    Tablet / phone: Home.css dissolves the columns and the cards
                    wrap in list order (kept via `order`). */}
                <div className="ctw-duos-grid">
                    {[1, 2, 3].map((col) => (
                        <div key={col} className={col === 2 ? "ctw-duos-col ctw-duos-col--offset" : "ctw-duos-col"}>
                            {cards.map((c, i) =>
                                c.col === col ? (
                                    <div key={c.key || c.id} className="ctw-duos-card" style={{ order: i }}>
                                        {c.placeholder ? (
                                            <div className="ctw-duos-placeholder" aria-hidden="true" />
                                        ) : (
                                            <CollectionCard c={c} onQuickView={() => onQuickView(c)} />
                                        )}
                                    </div>
                                ) : null
                            )}
                        </div>
                    ))}
                </div>
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

            <div className="ctw-care-grid">
                <div className="ctw-care-badge-col">
                    <ExploreCollectionBadge onPlay={() => setVideoOpen(true)} />
                </div>

                <div className="ctw-care-copy">
                    <div
                        className="show-below-md"
                        style={{
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
            className="ctw-explore-badge"
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

// function CategoryMarquee() {
//     const list = [...CATEGORY_MARQUEE, ...CATEGORY_MARQUEE, ...CATEGORY_MARQUEE];
//     return (
//         <section
//             style={{
//                 background: "#fff",
//                 overflow: "hidden",
//                 padding: "22px 0",
//                 width: "100%",
//                 margin: 0,
//                 borderRadius: 0,
//             }}
//         >
//             <div
//                 style={{
//                     display: "flex",
//                     gap: 64,
//                     whiteSpace: "nowrap",
//                     animation: "ctwMarquee 30s linear infinite",
//                     width: "fit-content",
//                 }}
//             >
//                 {list.map((c, i) => (
//                     <span
//                         key={i}
//                         style={{
//                             fontSize: "clamp(20px, 2.2vw, 30px)",
//                             fontWeight: 400,
//                             letterSpacing: "0.04em",
//                             textTransform: "uppercase",
//                             display: "flex",
//                             alignItems: "center",
//                             gap: 64,
//                             color: "#1C1C1A",
//                             fontFamily: "Marcellus, sans-serif",
//                         }}
//                     >
//                         {c}
//                         <span aria-hidden="true" style={{ fontSize: 20 }}>✦</span>
//                     </span>
//                 ))}
//                 <style>{`
//           @keyframes ctwMarquee {
//             from { transform: translateX(0); }
//             to { transform: translateX(-33.333%); }
//           }
//           @media (prefers-reduced-motion: reduce) {
//             div[style*="ctwMarquee"] { animation: none !important; }
//           }
//         `}</style>
//             </div>
//         </section>
//     );
// }

/* ---------------------------- More Collections ---------------------------- */

function MoreCollections({ home }) {
    // 4 in one row on desktop, 2 on tablet / phone (see .ctw-best-* in Home.css)

    // Admin's picks; undefined until loaded (an older saved copy may not have them yet).
    const picks = home.data?.best_sellers;
    const waiting = picks === undefined && (home.status === "loading" || home.status === "stale");
    const items = picks?.length
        ? picks.map((row) => {
              const p = fromServerProduct(row);
              // Products that also exist in the built-in catalogue keep their detail page.
              const builtIn = CATALOGUE.find((x) => x.name.toLowerCase() === p.name.toLowerCase());
              // `scene`: an ordinary product photo, so it's drawn on the arched backdrop + stand.
              // Photos marked "already has the backdrop" in the admin are shown as they are.
              return {
                  id: p.id,
                  name: p.name,
                  img: p.cardImage,
                  scene: row.home_style !== "photo",
                  path: builtIn ? `/product/${builtIn.slug}` : "/shop-list",
              };
          })
        : waiting
        ? Array.from({ length: 4 }, (_, i) => ({ id: `placeholder-${i}`, placeholder: true }))
        : MORE_COLLECTIONS.map((c) => ({ ...c, path: `/product/${c.slug}` }));

    return (
        <section className="ctw-best" style={{ background: "#fff", overflow: "hidden" }}>
            <div className="ctw-best-grid">
                {/* Left: large portrait, flush to the left edge */}
                <div className="ctw-best-portrait">
                    <img
                        src={missionPortrait}
                        alt="Woman with glowing skin from Chantallow tallow skincare"
                        style={{ width: "100%", height: "auto", display: "block" }}
                    />
                </div>

                {/* Right: heading + 4 products in one row (no slider, no arrows) */}
                <div className="ctw-best-main">
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 30,
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "clamp(36px, 4vw, 75px)",
                                fontFamily: "Marcellus, sans-serif",
                                color: "#2D2E2F",
                                fontWeight: 400,
                                margin: 0,
                                lineHeight: 1.1,
                            }}
                        >
                            Our Best Sellers
                        </h2>
                        {/* ↗ "see all" arrow button — commented out
                        <Link
                            to="/shop-list"
                            aria-label="See all products"
                            style={{
                                width: isDesktop ? 100 : 60,
                                height: isDesktop ? 100 : 60,
                                flexShrink: 0,
                                borderRadius: "50%",
                                background: "#EDF8F3",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#1C1C1A",
                            }}
                        >
                            <ArrowUpRight size={isDesktop ? 40 : 26} strokeWidth={1.5} />
                        </Link>
                        */}
                    </div>

                    <div className="ctw-best-list">
                        {items.map((c) =>
                            c.placeholder ? (
                                <div key={c.id} aria-hidden="true">
                                    <div className="ctw-best-placeholder" />
                                </div>
                            ) : (
                                <Link
                                    key={c.id}
                                    to={c.path}
                                    style={{ textDecoration: "none", display: "block" }}
                                >
                                    {c.scene ? (
                                        // Admin-picked product: the built-in photos have the arched
                                        // backdrop and stand baked in; here CSS draws them and the
                                        // white photo background is blended away (see Home.css).
                                        <div className="ctw-best-scene">
                                            <span className="ctw-best-stand" aria-hidden="true" />
                                            <img className="ctw-best-jar" src={c.img} alt={`Chantallow ${c.name} tallow skincare jar`} />
                                        </div>
                                    ) : (
                                        <div
                                            style={{
                                                aspectRatio: "1 / 1",
                                                borderRadius: "150px 150px 0 0",
                                                overflow: "hidden",
                                                marginBottom: 14,
                                                background: c.bg || "#EDF8F3",
                                            }}
                                        >
                                            <img
                                                src={c.img}
                                                alt={`Chantallow ${c.name} tallow skincare jar`}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: c.fit || "cover",
                                                    objectPosition: c.fit === "contain" ? "center bottom" : "center",
                                                    padding: c.fit === "contain" ? "12% 8% 3%" : 0,
                                                    // blends the photo's cream background into the backdrop
                                                    mixBlendMode: c.fit === "contain" ? "multiply" : "normal",
                                                    display: "block",
                                                    transition: "transform .5s ease",
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                                                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                            />
                                        </div>
                                    )}
                                    <div
                                        style={{
                                            textAlign: "center",
                                            fontFamily: "Lufga, sans-serif",
                                            fontSize: 17,
                                            fontWeight: 500,
                                            color: "#1C1C1A",
                                        }}
                                    >
                                        {c.name}
                                    </div>
                                </Link>
                            )
                        )}
                    </div>

                    {/* Slider arrows + 01/02/03 numbers — commented out
                    <CarouselControls page={page} pageCount={pageCount} onGo={go} />
                    */}
                </div>
            </div>
        </section>
    );
}

/* ---- Old Best Sellers slider (auto-slide + arrows), kept for reference ---- */
// function MoreCollections() {
//     const getPerView = () => (window.innerWidth > 900 ? 3 : window.innerWidth > 600 ? 2 : 1);
//     const [perView, setPerView] = useState(getPerView());
//     const [page, setPage] = useState(0);
//     const [paused, setPaused] = useState(false);
//     const isDesktop = window.innerWidth > 900;
//
//     const pageCount = MORE_COLLECTIONS.length;
//     const loopItems = [...MORE_COLLECTIONS, ...MORE_COLLECTIONS];
//
//     React.useEffect(() => {
//         const onResize = () => setPerView(getPerView());
//         window.addEventListener("resize", onResize);
//         return () => window.removeEventListener("resize", onResize);
//     }, []);
//
//     React.useEffect(() => {
//         if (paused) return;
//         const timer = setTimeout(() => setPage((prev) => (prev + 1) % pageCount), 4000);
//         return () => clearTimeout(timer);
//     }, [page, paused, pageCount]);
//
//     const go = (next) => setPage(((next % pageCount) + pageCount) % pageCount);
//
//     return (
//         <section style={{ padding: isDesktop ? "50px 0 70px" : "50px 24px", background: "#fff", overflow: "hidden" }}>
//             <div
//                 style={{
//                     display: "grid",
//                     gridTemplateColumns: isDesktop ? "34% 1fr" : "1fr",
//                     gap: isDesktop ? 120 : 32,
//                     alignItems: "center",
//                     paddingRight: isDesktop ? "7.5%" : 0,
//                 }}
//             >
//                 {/* Left: large portrait, flush to the left edge */}
//                 <div style={{ display: isDesktop ? "block" : "none" }}>
//                     <img
//                         src={missionPortrait}
//                         alt="Woman with glowing skin from Chantallow tallow skincare"
//                         style={{ width: "100%", height: "auto", display: "block" }}
//                     />
//                 </div>
//
//                 {/* Right: heading + slider */}
//                 <div style={{ minWidth: 0 }}>
//                     <div
//                         style={{
//                             display: "flex",
//                             justifyContent: "space-between",
//                             alignItems: "center",
//                             marginBottom: 30,
//                             padding: "0 19px",
//                         }}
//                     >
//                         <h2
//                             style={{
//                                 fontSize: "clamp(36px, 4vw, 75px)",
//                                 fontFamily: "Marcellus, sans-serif",
//                                 color: "#2D2E2F",
//                                 fontWeight: 400,
//                                 margin: 0,
//                                 lineHeight: 1.1,
//                             }}
//                         >
//                             Our Best Sellers
//                         </h2>
//                         <Link
//                             to="/shop-list"
//                             aria-label="See all products"
//                             style={{
//                                 width: isDesktop ? 100 : 60,
//                                 height: isDesktop ? 100 : 60,
//                                 flexShrink: 0,
//                                 borderRadius: "50%",
//                                 background: "#EDF8F3",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 color: "#1C1C1A",
//                             }}
//                         >
//                             <ArrowUpRight size={isDesktop ? 40 : 26} strokeWidth={1.5} />
//                         </Link>
//                     </div>
//
//                     <div
//                         style={{ overflow: "hidden" }}
//                         onMouseEnter={() => setPaused(true)}
//                         onMouseLeave={() => setPaused(false)}
//                     >
//                         <div
//                             style={{
//                                 display: "flex",
//                                 transform: `translateX(-${page * (100 / perView)}%)`,
//                                 transition: "transform .5s cubic-bezier(.4,0,.2,1)",
//                             }}
//                         >
//                             {loopItems.map((c, i) => (
//                                 <div
//                                     key={`${c.id}-${i}`}
//                                     aria-hidden={i >= pageCount}
//                                     style={{ flex: `0 0 ${100 / perView}%`, padding: "0 19px" }}
//                                 >
//                                     <div
//                                         style={{
//                                             aspectRatio: "1 / 1",
//                                             borderRadius: "150px 150px 0 0",
//                                             overflow: "hidden",
//                                             marginBottom: 14,
//                                             background: "#EDF8F3",
//                                         }}
//                                     >
//                                         <img
//                                             src={c.img}
//                                             alt={`Chantallow ${c.name} tallow skincare jar`}
//                                             style={{
//                                                 width: "100%",
//                                                 height: "100%",
//                                                 objectFit: "cover",
//                                                 display: "block",
//                                                 transition: "transform .5s ease",
//                                             }}
//                                             onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
//                                             onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
//                                         />
//                                     </div>
//                                     <div style={{ textAlign: "center" }}>
//                                         <Link
//                                             to="/shop-list"
//                                             style={{
//                                                 fontFamily: "Lufga, sans-serif",
//                                                 fontSize: 17,
//                                                 fontWeight: 500,
//                                                 color: "#1C1C1A",
//                                                 textDecoration: "none",
//                                             }}
//                                         >
//                                             {c.name}
//                                         </Link>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//
//                     <CarouselControls page={page} pageCount={pageCount} onGo={go} />
//                 </div>
//             </div>
//         </section>
//     );
// }

function CarouselControls({ page, pageCount, onGo }) {
    const arrowStyle = {
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 4,
        color: "#1C1C1A",
        display: "flex",
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 32,
                padding: "0 19px",
            }}
        >
            <div style={{ display: "flex", gap: 24 }}>
                <button onClick={() => onGo(page - 1)} aria-label="Previous" style={arrowStyle}>
                    <ArrowLeft size={40} strokeWidth={1} />
                </button>
                <button onClick={() => onGo(page + 1)} aria-label="Next" style={arrowStyle}>
                    <ArrowRight size={40} strokeWidth={1} />
                </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {Array.from({ length: pageCount }, (_, i) => {
                    const active = i === page;
                    return (
                        <button
                            key={i}
                            onClick={() => onGo(i)}
                            aria-current={active ? "true" : undefined}
                            aria-label={`Go to slide ${i + 1}`}
                            style={{
                                width: active ? 70 : 56,
                                height: active ? 70 : 56,
                                borderRadius: "50%",
                                border: active ? "1px solid #DADADA" : "1px solid transparent",
                                background: "transparent",
                                color: active ? "#1C1C1A" : "#B4B4A8",
                                fontSize: active ? 22 : 16,
                                fontFamily: "Lufga, sans-serif",
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

function SimilarProfilesSection({ home }) {
    // Admin's two picks; undefined until loaded (an older saved copy may not have them yet).
    const picks = home.data?.featured;
    const waiting = picks === undefined && (home.status === "loading" || home.status === "stale");
    const cards = picks?.length
        ? picks.map((row) => {
              const p = fromServerProduct(row);
              // Products that also exist in the built-in catalogue keep their detail page.
              const builtIn = CATALOGUE.find((x) => x.name.toLowerCase() === p.name.toLowerCase());
              return {
                  id: p.id,
                  name: p.name,
                  sale: row.home_label || "",
                  price: formatPrice(p.price),
                  was: p.compareAtPrice != null ? formatPrice(p.compareAtPrice) : null,
                  img: p.cardImage,
                  path: builtIn ? `/product/${builtIn.slug}` : "/shop-list",
              };
          })
        : waiting
        ? [{ id: "placeholder-1", placeholder: true }, { id: "placeholder-2", placeholder: true }]
        : SIMILAR_PROFILES;

    return (
        <section className="ctw-similar" style={{ background: "#EDF8F3" }}>
            <div className="ctw-similar-grid">
                <div className="ctw-similar-main">
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 24,
                        }}
                    >
                        <div style={{ textAlign: "left", maxWidth: 760 }}>
                            <h2 style={{
                                fontSize: "clamp(32px, 3.4vw, 52px)",
                                lineHeight: 1.15,
                                color: "#2D2E2F",
                                fontFamily: "Marcellus, sans-serif",
                                fontWeight: 400,
                                margin: "0 0 14px",
                            }}>
                                Nourish Your Skin, Naturally
                            </h2>
                            <p style={{
                                fontSize: 18,
                                lineHeight: 1.7,
                                fontFamily: "var(--font-family-base, 'DM Sans', sans-serif)", // same font as the header links (full "g")
                                color: "#5A5A52",
                                margin: 0,
                            }}>
                                Discover your favorite tallow essentials and botanical blends, thoughtfully crafted to nourish, hydrate, and restore.
                            </p>
                        </div>
                        {/* "All Products →" link — commented out
                        <a
                            href="#shop"
                            className="ctw-underline-link"
                            style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", color: "#1C1C1A" }}
                        >
                            All Products →
                        </a>
                        */}
                    </div>
                    <div className="ctw-similar-cards">
                        {cards.map((p) =>
                            p.placeholder ? (
                                <div key={p.id} style={{ minWidth: 0 }} aria-hidden="true">
                                    <div className="ctw-similar-placeholder" />
                                </div>
                            ) : (
                                <SimilarCardLink key={p.id} path={p.path}>
                                    {/* Image box: cream background, full jar visible */}
                                    <div
                                        className="ctw-card-hover"
                                        style={{
                                            width: "100%",
                                            aspectRatio: "443 / 478",
                                            background: "#FFFDF0",
                                            marginBottom: 22,
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
                                                    objectFit: "contain",
                                                    display: "block",
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Info row: sale + name on the left, price on the right */}
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            gap: 12,
                                        }}
                                    >
                                        <div style={{ textAlign: "left" }}>
                                            <span
                                                style={{
                                                    display: "block",
                                                    fontSize: 17,
                                                    fontFamily: "Lufga, sans-serif",
                                                    fontWeight: 500,
                                                    color: "#41705B",
                                                    marginBottom: 6,
                                                }}
                                            >
                                                {p.sale}
                                            </span>
                                            <h6
                                                className="ctw-similar-name"
                                                style={{
                                                    fontFamily: "Marcellus, sans-serif",
                                                    fontWeight: 400,
                                                    color: "#2D2E2F",
                                                    margin: 0,
                                                }}
                                            >
                                                {p.name}
                                            </h6>
                                        </div>
                                        <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                            <div
                                                className="ctw-similar-price"
                                                style={{
                                                    fontFamily: "Marcellus, sans-serif",
                                                    color: "#1C1C1A",
                                                }}
                                            >
                                                {p.price}
                                            </div>
                                            {p.was && (
                                                <del
                                                    style={{
                                                        fontSize: 20,
                                                        fontFamily: "Marcellus, sans-serif",
                                                        color: "#9A9A90",
                                                    }}
                                                >
                                                    {p.was}
                                                </del>
                                            )}
                                        </div>
                                    </div>
                                </SimilarCardLink>
                            )
                        )}
                    </div>
                </div>

                <div className="ctw-similar-portrait">
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

function SavingSection({ home }) {
    // Admin's picks; undefined until loaded (an older saved copy may not have them yet).
    const picks = home.data?.tattoo;
    const waiting = picks === undefined && (home.status === "loading" || home.status === "stale");
    const cards = picks?.length
        ? picks.map((row) => {
              const p = fromServerProduct(row);
              // Products that also exist in the built-in catalogue keep their detail page.
              const builtIn = CATALOGUE.find((x) => x.name.toLowerCase() === p.name.toLowerCase());
              return {
                  id: p.id,
                  name: p.name,
                  sub: p.subtitle,
                  price: formatPrice(p.price),
                  was: p.compareAtPrice != null ? formatPrice(p.compareAtPrice) : null,
                  // a card photo set for this section wins over the product's own photo
                  img: row.home_image ? mediaUrl(row.home_image) : p.cardImage,
                  badge: row.home_label || null,
                  path: builtIn ? `/product/${builtIn.slug}` : "/shop-list",
              };
          })
        : waiting
        ? [{ id: "placeholder-1", placeholder: true }, { id: "placeholder-2", placeholder: true }]
        : SAVING_LEFT;

    return (
        <section className="ctw-saving" style={{ background: "#EDF8F3", overflowX: "clip" }}>
            <div className="ctw-saving-grid">
                {/* LEFT: title + product cards */}
                <div>
                    <div style={{ textAlign: "left", maxWidth: 640, margin: "0 0 40px" }}>
                        <h2
                            style={{
                                fontSize: "clamp(32px, 3.4vw, 52px)",
                                lineHeight: 1.15,
                                fontFamily: "Marcellus, sans-serif",
                                fontWeight: 400,
                                color: "#2D2E2F",
                                margin: "0 0 14px",
                            }}
                        >
                            Pure Care for Every Tattoo
                        </h2>
                        <p
                            style={{
                                fontSize: 18,
                                lineHeight: 1.7,
                                fontFamily: "var(--font-family-base, 'DM Sans', sans-serif)", // same font as the header links (full "g")
                                color: "#5A5A52",
                                margin: 0,
                            }}
                        >
                            Discover Chantallow’s tallow-based tattoo care crèmes, crafted to deeply moisturize, soothe, and keep your tattooed skin looking vibrant.
                        </p>
                    </div>

                    <div className="ctw-saving-cards">
                        {cards.map((p) =>
                            p.placeholder ? (
                                <div key={p.id} className="ctw-saving-placeholder" aria-hidden="true" />
                            ) : p.seeAll ? (
                                /* 4th cell: transparent, "See All" button centred vertically */
                                <div
                                    key={p.id}
                                    style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}
                                >
                                    <Link
                                        to="/shop-list"
                                        style={{
                                            display: "inline-block",
                                            background: "#fff",
                                            color: "#2D2E2F",
                                            border: "2px solid #38996e",
                                            borderRadius: 11,
                                            padding: "12px 34px",
                                            fontSize: 20,
                                            fontWeight: 400,
                                            fontFamily: "Lufga, sans-serif",
                                            textDecoration: "none",
                                            textTransform: "capitalize",
                                        }}
                                    >
                                        See All
                                    </Link>
                                </div>
                            ) : (
                                /* Product card: white box with padding */
                                <div
                                    key={p.id}
                                    className="ctw-card-hover"
                                    style={{ position: "relative", background: "#fff", padding: "20px 22px 12px" }}
                                >
                                    <SavingItem {...p} />
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* RIGHT: banner image — stretches to exactly the height of the left
                    column, so the image bottom lines up with the product cards */}
                <div className="ctw-saving-banner" style={{ clipPath: "url(#waveLeft)" }}>
                    <img
                        src={savingBanner}
                        alt=""
                        aria-hidden="true"
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />

                    <div style={{ position: "relative", zIndex: 1, textAlign: "center", color: "#fff", padding: "48px 32px", width: "100%" }}>
                        {/* <h2
                            className="ctw-serif"
                            style={{ fontSize: 40, fontWeight: 500, lineHeight: 1.25, fontFamily: "Marcellus", margin: "0 auto 12px", maxWidth: 380, color: "#FFFFFF" }}
                        >
                            Great Saving On Everyday Essentials
                        </h2>
                        <p className="ctw-serif" style={{ fontSize: 16, fontFamily: "Lufga", margin: "0 0 24px", color: "#FFFFFF", opacity: 0.95 }}>
                            Up To 60% Off + Up To $107 Cashback
                        </p>
                        <a
                            href="#shop"
                            className="ctw-serif"
                            style={{ display: "inline-block", background: "rgba(255,255,255,0.9)", color: "#1C1C1A", padding: "12px 32px", borderRadius: 4, fontSize: 17, textDecoration: "none" }}
                        >
                            See All
                        </a> */}

                        {/* <svg
                            className="ctw-animation-text"
                            viewBox="0 0 1320 300"
                            aria-hidden="true"
                            style={{ position: "absolute", bottom: -180, left: 80, fontSize: 40, width: "60%", height: "auto", userSelect: "none" }}
                        >
                            <text x="0" y="290" textLength="1320" lengthAdjust="spacingAndGlyphs">
                                GREAT SAVING
                            </text>
                        </svg> */}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ----------------------------- Furkind Pet Tallow ----------------------------- */

function FurkindPetSection() {
    const navigate = useNavigate();

    return (
        <section
            id="furkind"
            className="ctw-furkind"
            style={{
                background: "linear-gradient(180deg, #D6F5C9 0%, #D6F5C9 25%, #FFFFFF 75%)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* .ctw-furkind-scene padding-top pushes the whole scene down so the jars aren't cut off */}
            <div className="ctw-furkind-scene" style={{
                position: "relative",
                maxWidth: 1200,
                margin: "0 auto 40px",
            }}>
                {/* Grass map with pets and jars.
                    The grass island sits left of centre inside the map image itself
                    (extra empty space on its right), so the whole scene — island,
                    dog, jars, cat — is nudged right to sit in the middle of the screen.
                    Fine-tune with the 7% value below (bigger = further right). */}
                <div
                    style={{
                        position: "relative",
                        maxWidth: 1200,
                        margin: "0 auto 40px",
                        transform: "translateX(var(--furkind-shift, 7%))",
                    }}
                >
                    <img
                        src={petMap}
                        alt=""
                        aria-hidden="true"
                        style={{ width: "100%", height: "auto", display: "block" }}
                    />

                    {/* area-box1 — dog, left */}
                    <div
                        className="ctw-furkind-pet"
                        style={{
                            position: "absolute",
                            left: "12%",
                            bottom: "44%",        // was 18% — raised up
                            zIndex: 2,
                        }}
                    >
                        <img
                            src={petDog}
                            alt="image"
                            style={{ width: "80%", height: "auto", display: "block" }}
                        />
                    </div>

                    {/* area-box3 — jars, center */}
                    <div
                        className="ctw-furkind-jars"
                        style={{
                            position: "absolute",
                            left: "44%",
                            bottom: "64%",        // was 20% — raised up
                            transform: "translateX(-50%)",
                            zIndex: 1,
                        }}
                    >
                        <img
                            src={petJars}
                            alt="image"
                            style={{ width: "100%", height: "auto", display: "block" }}
                        />
                    </div>

                    {/* area-box2 — cat, right */}
                    <div
                        className="ctw-furkind-pet"
                        style={{
                            position: "absolute",
                            right: "23%",
                            bottom: "44%",        // was 18% — raised up
                            zIndex: 2,
                        }}
                    >
                        <img
                            src={petCat}
                            alt="image"
                            style={{ width: "100%", height: "auto", display: "block" }}
                        />
                    </div>
                </div>

                {/* Text content — heading, justified paragraph and button share one centre line */}
                <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
                    <a
                        onClick={() => navigate("/furkind-pet-tallow")}
                        style={{ textDecoration: "none", cursor: "pointer" }}
                    >
                        <h2
                            style={{
                                fontSize: "clamp(2.4rem, 4vw, 3.8rem)",
                                fontFamily: "Marcellus, sans-serif",
                                color: "#0F3D2E",
                                fontWeight: 400,
                                margin: "0 0 24px",
                            }}
                        >
                            Furkind Pet Tallow
                        </h2>
                    </a>

                    <p
                        className="ctw-furkind-text"
                        style={{
                            lineHeight: 1.85,
                            fontFamily: "Lufga, sans-serif",
                            color: "#5A5A52",
                            margin: "0 0 40px",
                            textAlign: "justify",      // straight edges on both sides
                            textAlignLast: "left",     // last line stays normal
                            hyphens: "auto",
                        }}
                    >
                        Our nutrient-rich Pet Balm combines the nourishing power of grass-fed,
                        grass-finished beef tallow with organic raw unrefined coconut oil to help
                        soothe, protect, and restore dry, rough, or irritated skin and paws. Beef
                        tallow is a natural source of Vitamin A, which supports skin renewal and
                        healthy tissue maintenance; Vitamin D, which helps support skin barrier
                        function; Vitamin E, a powerful antioxidant that helps protect against
                        environmental stressors and supports moisture retention; and Vitamin K,
                        which contributes to overall skin health. The naturally occurring fatty
                        acids in tallow closely resemble the oils found in healthy skin, making it
                        highly absorbable and deeply moisturizing. Organic raw unrefined coconut
                        oil provides additional hydration and contains lauric acid, caprylic acid,
                        and capric acid, which help condition the skin and support a clean, healthy
                        environment on your pet’s skin surface. Together, these ingredients help
                        soften rough paws, reduce dryness and cracking, calm irritation, and create
                        a protective moisture barrier to keep your pet's skin and paws healthy,
                        smooth, and comfortable.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/furkind-pet-tallow")}
                        style={{
                            display: "inline-block",
                            background: "#FFFFFF",
                            color: "#1C1C1A",
                            border: "1px solid #1C1C1A",
                            padding: "16px 44px",
                            fontSize: 18,
                            fontWeight: 500,
                            fontFamily: "Lufga, sans-serif",
                            cursor: "pointer",
                            transition: "background .25s ease, color .25s ease",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#0F3D2E"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.color = "#1C1C1A"; }}
                    >
                        Buy Now
                    </button>
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

function SavingItem({ name, sub, price = "$00.00", was = "$00.00", badge, img, path = "/shop-list" }) {
    return (
        <div style={{ position: "relative" }}>
            {/* Product image, full jar visible */}
            <div
                style={{
                    width: "100%",
                    aspectRatio: "1 / 0.82",
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

            {/* Mint info box overlapping the bottom of the image */}
            <div
                style={{
                    position: "relative",
                    marginTop: -10,
                    background: "#EDF8F3",
                    borderRadius: 6,
                    padding: "14px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 10,
                }}
            >
                <Link to={path} style={{ textDecoration: "none", flex: 1, minWidth: 0, textAlign: "left" }}>
                    <h6 style={{ margin: "0 0 6px", fontSize: 19, fontWeight: 400, color: "#2D2E2F", fontFamily: "Marcellus, sans-serif" }}>
                        {name}
                    </h6>
                    <span style={{ display: "block", fontSize: 16, color: "#41705B", lineHeight: 1.3, fontFamily: "Marcellus, sans-serif" }}>
                        {sub}
                    </span>
                </Link>
                <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ fontSize: 19, fontFamily: "Marcellus, sans-serif", color: "#1C1C1A", marginBottom: 4 }}>{price}</div>
                    {was && <del style={{ fontSize: 15, fontFamily: "Marcellus, sans-serif", color: "#9A9A90" }}>{was}</del>}
                </div>
            </div>

            {/* Green star badge, top-right corner: `true` = the built-in "00% Sale",
                or the text set in the admin (its last word goes on a second line) */}
            {badge && (
                <span
                    className="ctw-sale-star"
                    style={{
                        position: "absolute",
                        background: "#5E9A7F",
                        color: "#fff",
                        clipPath:
                            "polygon(50% 0%, 59% 18%, 79% 10%, 76% 31%, 97% 33%, 83% 50%, 97% 67%, 76% 69%, 79% 90%, 59% 82%, 50% 100%, 41% 82%, 21% 90%, 24% 69%, 3% 67%, 17% 50%, 3% 33%, 24% 31%, 21% 10%, 41% 18%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        fontFamily: "Lufga, sans-serif",
                        fontWeight: 500,
                        lineHeight: 1.2,
                        zIndex: 2,
                    }}
                >
                    {badge === true ? (
                        <>
                            00%
                            <br />
                            Sale
                        </>
                    ) : (
                        <StarBadgeText text={badge} />
                    )}
                </span>
            )}
        </div>
    );
}

// "20% Sale" -> 20% / Sale on two lines, like the built-in badge.
function StarBadgeText({ text }) {
    const words = String(text).trim().split(/\s+/);
    if (words.length < 2) return text;
    return (
        <>
            {words.slice(0, -1).join(" ")}
            <br />
            {words[words.length - 1]}
        </>
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
                <div className="ctw-offers-head">
                    <h2
                        className="ctw-offers-title"
                        style={{
                            color: "#2D2E2F",
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
                            className="ctw-offer-card"
                            style={{
                                aspectRatio: "3 / 2",
                                position: "relative",
                                overflow: "hidden",
                                backgroundImage: `url(${o.img})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                            }}
                        >
                            <div style={{ textAlign: "center", position: "relative" }}>
                                <span
                                    className="ctw-offer-label"
                                    style={{
                                        display: "inline-block",
                                        background: "#2C7A55",
                                        color: "#fff",
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
                                    className="ctw-serif ctw-offer-name"
                                    style={{
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
                                        className="ctw-serif ctw-offer-big"
                                        style={{
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
                                        className="ctw-serif ctw-offer-big ctw-offer-big--sale"
                                        style={{
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
                                    className="ctw-serif ctw-offer-cta"
                                    style={{
                                        display: "inline-block",
                                        marginTop: 10,
                                        border: `1px solid ${o.textColor === "#fff" ? "#fff" : "#6B6B66"}`,
                                        borderRadius: 40,
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
    const navigate = useNavigate();
    return (
        <section style={{ background: "#F7F4EC", padding: "0", position: "relative" }}>
            <div className="ctw-shortlist-grid">
                {/* LEFT — banner with man image, wave cut on right edge */}
                <div
                    className="ctw-shortlist-banner"
                    style={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
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

                    {/* Soft light fade on the left so the text stays readable over the plant leaves */}
                    <div
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "62%", // only behind the text — the jar below stays untouched
                            zIndex: 1,
                            pointerEvents: "none",
                            background:
                                "linear-gradient(100deg, rgba(247,244,236,0.88) 0%, rgba(247,244,236,0.7) 30%, rgba(247,244,236,0) 52%)",
                            WebkitMaskImage: "linear-gradient(to bottom, #000 70%, transparent 100%)",
                            maskImage: "linear-gradient(to bottom, #000 70%, transparent 100%)",
                        }}
                    />

                    {/* Title + description — top-left of the photo, above the Olivine Relief jar */}
                    <div
                        className="ctw-shortlist-copy"
                        style={{
                            position: "absolute",
                            zIndex: 2,
                            textAlign: "left",
                        }}
                    >
                        <h2
                            style={{
                                margin: "0 0 16px",
                                fontFamily: "Marcellus, sans-serif",
                                fontWeight: 400,
                                fontSize: "clamp(24px, 2vw, 32px)",
                                lineHeight: 1.2,
                                color: "#1C1C1A",
                                // one line on desktop; wraps on smaller screens (Home.css)
                            }}
                        >
                            Soothe Sore Muscles, Naturally
                        </h2>
                        <p
                            style={{
                                margin: 0,
                                fontFamily: "var(--font-family-base, 'DM Sans', sans-serif)", // same font as the header links (full "g")
                                fontSize: "clamp(16px, 1.3vw, 20px)",
                                lineHeight: 1.6,
                                color: "#2D2E2F",
                                // exactly two rows on desktop; wraps on smaller screens (Home.css)
                            }}
                        >
                            Magnesium &amp; arnica-infused tallow crème for targeted pain relief,{" "}
                            <br className="ctw-br-desktop" />
                            muscle comfort, and skin nourishment.
                        </p>
                    </div>

                    {/* Old centered content (kept for reference) */}
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
                        {/* <h2
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
                        </a> */}
                    </div>

                    {/* <svg
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
                    </svg> */}
                </div>

                {/* RIGHT — single large product */}
                <div className="ctw-shortlist-product">
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

                        {/* Buy Now — opens the Olivine Relief product page */}
                        <div style={{ padding: "0 8px", marginTop: 20 }}>
                            <button
                                type="button"
                                onClick={() => navigate("/product/olivine-relief")}
                                style={{
                                    display: "inline-block",
                                    background: "#FFFFFF",
                                    color: "#2D2E2F",
                                    border: "1px solid #E4E4DC",
                                    padding: "14px 34px",
                                    fontSize: 16,
                                    fontWeight: 500,
                                    fontFamily: "'Lufga', sans-serif",
                                    cursor: "pointer",
                                    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                                    transition: "background .25s ease, color .25s ease, border-color .25s ease",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "#0F3D2E"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#0F3D2E"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.color = "#2D2E2F"; e.currentTarget.style.borderColor = "#E4E4DC"; }}
                            >
                                Buy Now
                            </button>
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
        <footer className="ctw-footer" style={{ background: "#FFFFFF", color: "#1C1C1A", borderTop: "1px solid #F0EEE4" }}>
            <div className="ctw-footer-grid">
                <div>
                    <div style={{ marginBottom: 24 }}>
                        <img src={logo} alt="Chantallow" style={{ height: 48, width: "auto", display: "block" }} />
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
                        { label: "FAQ", path: "/faq" },
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
                <div className="ctw-footer-payments" style={{ display: "flex", alignItems: "center", gap: 10 }}>
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

/* ----------------------------- Quick View ----------------------------- */
/* Opens from a card's "Quick View" button and shows THAT product:
   image on the left (cream panel), details on the right (mint panel). */

const QV_GREEN = "#1B4D3E";
const QV_SIZES = [
    { value: "2oz", label: "2 .Oz" },
    { value: "4oz", label: "4 .Oz" },
];

function QvStars({ rating = 4.7 }) {
    const uid = React.useId().replace(/:/g, "");
    return (
        <span style={{ display: "inline-flex", gap: 3 }} aria-label={`${rating} out of 5 stars`}>
            {[0, 1, 2, 3, 4].map((i) => {
                const fill = Math.max(0, Math.min(1, rating - i));
                const id = `qv-star-${uid}-${i}`;
                return (
                    <svg key={i} width="17" height="16" viewBox="0 0 24 24" aria-hidden="true">
                        <defs>
                            <linearGradient id={id}>
                                <stop offset={`${fill * 100}%`} stopColor="#1C1C1A" />
                                <stop offset={`${fill * 100}%`} stopColor="#D4D6DB" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M12 2l2.9 6.26 6.85.7-5.12 4.6 1.45 6.74L12 16.9l-6.08 3.4 1.45-6.74L2.25 8.96l6.85-.7L12 2z"
                            fill={`url(#${id})`}
                        />
                    </svg>
                );
            })}
        </span>
    );
}

const QV_SOCIAL = [
    { label: "Facebook", d: "M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.7-.6z" },
    { label: "LinkedIn", d: "M4 9h3.6v11H4V9zm1.8-5.5a2.1 2.1 0 110 4.2 2.1 2.1 0 010-4.2zM10 9h3.4v1.6c.5-.9 1.7-1.9 3.5-1.9 3.7 0 4.4 2.4 4.4 5.6V20h-3.6v-5c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V20H10V9z" },
    { label: "Instagram", d: "M7.5 3h9A4.5 4.5 0 0121 7.5v9a4.5 4.5 0 01-4.5 4.5h-9A4.5 4.5 0 013 16.5v-9A4.5 4.5 0 017.5 3zm0 1.8A2.7 2.7 0 004.8 7.5v9a2.7 2.7 0 002.7 2.7h9a2.7 2.7 0 002.7-2.7v-9a2.7 2.7 0 00-2.7-2.7h-9zM12 8a4 4 0 110 8 4 4 0 010-8zm0 1.8a2.2 2.2 0 100 4.4 2.2 2.2 0 000-4.4zm4.3-3.1a1 1 0 110 2 1 1 0 010-2z" },
    { label: "X", d: "M4 3h4.7l4.2 5.9L18 3h2.3l-6.4 7.4L21 21h-4.7l-4.6-6.4L6.1 21H3.8l6.9-7.9L4 3zm3 1.6l10.2 14.8h1.6L8.6 4.6H7z" },
];

// Shows "(4oz)" / "(2oz)" in normal case even when the name is styled UPPERCASE
function withSizes(name) {
    return String(name)
        .split(/(\(\d+(?:\.\d+)?oz\))/i)
        .map((part, i) =>
            /^\(\d/.test(part) ? (
                <span key={i} style={{ textTransform: "none" }}>{part}</span>
            ) : (
                part
            )
        );
}

function QuickViewModal({ card, onClose }) {
    // `card` = the clicked collection card: { id (big jar's product), name ("Big + Small"), img }
    const productId = card ? card.id : null;
    const navigate = useNavigate();
    const { addToCart, toggleWishlist, isInWishlist, showToast } = useShop();
    const product = productId != null ? getProductById(productId) : null;

    const [qty, setQty] = useState(1);
    const [size, setSize] = useState("4oz");

    // reset when a different product is opened
    React.useEffect(() => {
        setQty(1);
        setSize("4oz");
    }, [productId]);

    // Esc to close + stop the page scrolling behind the modal
    React.useEffect(() => {
        if (!product) return;
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [product, onClose]);

    if (!product) return null;

    const liked = isInWishlist(product.id);
    const summary = Array.isArray(product.description) ? product.description[0] : product.description;
    // Same "big jar (4oz) + small jar (2oz)" name and photo as the card that was clicked
    const displayName = card?.name || product.displayName || product.name;

    const handleAdd = () => {
        addToCart(product.id, qty, size);
        showToast(`${product.name} (${size.replace("oz", " oz")}) added to cart`);
        onClose();
    };

    const handleWishlist = () => {
        toggleWishlist(product.id);
        showToast(liked ? `${product.name} removed from favourites` : `${product.name} added to favourites ♥`);
    };

    const openDetails = () => {
        onClose();
        navigate(`/product/${product.slug}`);
    };

    const label = { fontSize: 16, color: "#2D2E2F", marginBottom: 8, fontFamily: "Lufga, 'DM Sans', sans-serif" };
    const stepBtn = {
        width: 34,
        height: 34,
        border: "none",
        background: "#1C1C1A",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
    };
    const metaRow = { display: "flex", flexWrap: "wrap", gap: 8, fontSize: 15, color: "#5A5A52", marginBottom: 9 };
    const metaKey = { color: "#1C1C1A", fontWeight: 600 };

    return (
        <div
            onClick={onClose}
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
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={`${displayName} quick view`}
                onClick={(e) => e.stopPropagation()}
                className="ctw-qv"
                style={{
                    width: "100%",
                    maxWidth: 1240,
                    maxHeight: "90vh",
                    position: "relative",
                    background: "#EDF8F3",
                    fontFamily: "Lufga, 'DM Sans', sans-serif",
                    textAlign: "left",
                }}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    aria-label="Close quick view"
                    style={{
                        position: "absolute",
                        top: 20,
                        right: 24,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#1C1C1A",
                        zIndex: 2,
                        padding: 4,
                    }}
                >
                    <X size={28} strokeWidth={1.6} />
                </button>

                {/* LEFT — product image on a cream card */}
                <div
                    onClick={openDetails}
                    className="ctw-qv-media"
                    style={{
                        background: "#FFFDF0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        cursor: "pointer",
                    }}
                >
                    <img
                        src={card?.img || product.cardImage || product.gallery[0]}
                        alt={`Chantallow ${displayName} tallow jars`}
                        style={{
                            width: "100%",
                            maxWidth: 460,
                            objectFit: "contain",
                            display: "block",
                        }}
                    />
                </div>

                {/* RIGHT — details */}
                <div className="ctw-qv-body">
                    {product.badge && (
                        <span
                            style={{
                                display: "inline-block",
                                background: "#2C7A55",
                                color: "#fff",
                                fontSize: 13,
                                fontWeight: 500,
                                padding: "3px 6px",
                                marginBottom: 12,
                            }}
                        >
                            {product.badge}
                        </span>
                    )}

                    <h4
                        onClick={openDetails}
                        // long two-jar names wrap onto 2 lines, so `is-long` uses a slightly smaller size
                        className={displayName.length > 28 ? "ctw-qv-title is-long" : "ctw-qv-title"}
                        style={{
                            fontFamily: "Marcellus, serif",
                            // explicit line height (another stylesheet was squeezing it)
                            lineHeight: 1.25,
                            letterSpacing: "0.01em",
                            fontWeight: 400,
                            textTransform: "uppercase",
                            color: "#1C1C1A",
                            margin: "0 0 14px",
                            paddingRight: 36, // keep clear of the close (X) button
                            cursor: "pointer",
                        }}
                    >
                        {withSizes(displayName)}
                    </h4>

                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, fontSize: 15 }}>
                        <QvStars rating={product.rating ?? 4.7} />
                        <span style={{ color: "#2D2E2F" }}>{(product.rating ?? 4.7).toFixed(1)} Rating</span>
                        <span style={{ color: "#5A5A52" }}>(5 customer reviews)</span>
                    </div>

                    <p
                        style={{
                            fontSize: 16,
                            lineHeight: 1.6,
                            color: "#5A5A52",
                            margin: "0 0 18px",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        {summary}
                    </p>
                    {/* Size */}
                    <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 22 }}>
                        <div style={{ ...label, marginBottom: 0 }}>Size:</div>
                        <div style={{ display: "flex", gap: 22 }}>
                            {QV_SIZES.map((s) => (
                                <label key={s.value} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, cursor: "pointer" }}>
                                    <input
                                        type="radio"
                                        name={`qv-size-${product.id}`}
                                        checked={size === s.value}
                                        onChange={() => setSize(s.value)}
                                        style={{ accentColor: QV_GREEN, width: 18, height: 18 }}
                                    />
                                    {s.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Price + quantity */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 44, alignItems: "flex-end", marginBottom: 22 }}>
                        <div>
                            <div style={label}>Price</div>
                            <div style={{ fontFamily: "Marcellus, serif", fontSize: 30, color: "#1C1C1A" }}>
                                {formatPrice(product.price)}{" "}
                                <del style={{ fontSize: 18, color: "#9A9A90", marginLeft: 6 }}>{formatPrice(product.oldPrice)}</del>
                            </div>
                        </div>
                        <div>
                            <div style={label}>Quantity</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} style={stepBtn}>
                                    <Minus size={18} />
                                </button>
                                <input
                                    readOnly
                                    value={qty}
                                    aria-label="Quantity"
                                    style={{ width: 40, height: 34, textAlign: "center", border: "1px solid #D5E2DA", background: "#fff", fontSize: 16, color: "#1C1C1A", fontFamily: "Lufga, 'DM Sans', sans-serif" }}
                                />
                                <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)} style={stepBtn}>
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginBottom: 24 }}>
                        <button
                            type="button"
                            onClick={handleAdd}
                            style={{
                                background: QV_GREEN,
                                color: "#fff",
                                border: "none",
                                padding: "14px 28px",
                                fontSize: 17,
                                fontWeight: 600,
                                textTransform: "uppercase",
                                cursor: "pointer",
                            }}
                        >
                            Add To Cart
                        </button>
                        <button
                            type="button"
                            onClick={handleWishlist}
                            aria-pressed={liked}
                            style={{
                                background: "transparent",
                                color: "#1C1C1A",
                                border: "1px solid #1C1C1A",
                                padding: "12px 26px",
                                fontSize: 17,
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                cursor: "pointer",
                            }}
                        >
                            <Heart size={22} strokeWidth={1.6} color={liked ? "#7A0000" : "#1C1C1A"} fill={liked ? "#7A0000" : "none"} />
                            {liked ? "In Your Wishlist" : "Add To Wishlist"}
                        </button>
                    </div>

                    {/* Meta */}
                    <div style={{ borderTop: "1px solid #D5E2DA", paddingTop: 16 }}>
                        <div style={metaRow}>
                            <span style={metaKey}>SKU:</span> CT-{String(product.id).padStart(4, "0")}
                        </div>
                        <div style={metaRow}>
                            <span style={metaKey}>Category:</span> {product.category || (product.slug === "taluma-hair-care" ? "Hair Care" : "Skincare, Body Care")}
                        </div>
                        <div style={metaRow}>
                            <span style={metaKey}>Tags:</span> {product.tags || "Tallow, Natural, Handmade"}
                        </div>
                        <div style={{ ...metaRow, alignItems: "center", gap: 22, marginBottom: 0 }}>
                            <span style={metaKey}>Share:</span>
                            {QV_SOCIAL.map((s) => (
                                <a key={s.label} href="#share" aria-label={`Share on ${s.label}`} style={{ color: "#2D2E2F", display: "flex" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d={s.d} />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}