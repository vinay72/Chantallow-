// src/components/Header.jsx
// The site header used on every storefront page (same design as the home page):
// logo, main links, Login / My Account, search, wishlist and cart.
// It owns its own search overlay and cart / wishlist drawer, so a page only
// needs <Header />.
//
// Responsive: full bar on desktop; at ≤1024px the links (and the account link)
// fold into a hamburger dropdown; spacing and logo shrink further on phones.

import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, Menu, Search, ShoppingCart, X } from "lucide-react";
import AccountLink from "./AccountLink";
import { useShop } from "../context/ShopContext";
import { formatPrice, productPath } from "../data/products";
import logo from "../assets/logo.png";
import "./Header.css";

const NAV_LINKS = [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/aboutus" },
    { label: "Shop", path: "/shop-list" },
    { label: "Blog", path: "/blog" },
    { label: "Contact Us", path: "/contactus" },
];

const QUICK_SEARCH = ["Skin Product", "Body Products", "Daily Products", "Cream Products"];

export default function Header() {
    const { cartCount, wishlistCount } = useShop();
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [cartTab, setCartTab] = useState("cart");

    const closeMenu = () => setMenuOpen(false);

    // Each icon opens the drawer on its own tab
    const openDrawer = (tab) => {
        setCartTab(tab);
        setCartOpen(true);
        closeMenu();
    };

    // Escape closes whatever is open
    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== "Escape") return;
            setMenuOpen(false);
            setSearchOpen(false);
            setCartOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Stop the page scrolling behind the search overlay / drawer
    useEffect(() => {
        if (!searchOpen && !cartOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [searchOpen, cartOpen]);

    return (
        <>
            <header className="sh-header">
                <div className="sh-bar">
                    <Link to="/" className="sh-logo" aria-label="Chantallow home" onClick={closeMenu}>
                        <img src={logo} alt="Chantallow" />
                    </Link>

                    <nav id="sh-nav" className={menuOpen ? "sh-nav is-open" : "sh-nav"} aria-label="Main">
                        {NAV_LINKS.map((link) => (
                            <NavLink
                                key={link.label}
                                to={link.path}
                                end={link.path === "/"}
                                className={({ isActive }) => (isActive ? "sh-nav-link is-active" : "sh-nav-link")}
                                onClick={closeMenu}
                            >
                                {link.label}
                                <span className="sh-star" aria-hidden="true">✦</span>
                            </NavLink>
                        ))}
                        {/* Login / My Account lives in the dropdown on small screens */}
                        <AccountLink className="sh-nav-link sh-nav-account" inline />
                    </nav>

                    <div className="sh-actions">
                        <AccountLink className="sh-login" inline />

                        <button
                            type="button"
                            className="sh-icon-btn"
                            aria-label="Search"
                            onClick={() => {
                                setSearchOpen(true);
                                closeMenu();
                            }}
                        >
                            <Search size={21} strokeWidth={1.5} />
                        </button>
                        <button
                            type="button"
                            className="sh-icon-btn"
                            aria-label={`Wishlist (${wishlistCount})`}
                            onClick={() => openDrawer("wishlist")}
                        >
                            <Heart size={21} strokeWidth={1.5} />
                            {wishlistCount > 0 && <span className="sh-badge">{wishlistCount}</span>}
                        </button>
                        <button
                            type="button"
                            className="sh-icon-btn"
                            aria-label={`Cart (${cartCount})`}
                            onClick={() => openDrawer("cart")}
                        >
                            <ShoppingCart size={21} strokeWidth={1.5} />
                            {cartCount > 0 && <span className="sh-badge">{cartCount}</span>}
                        </button>
                        <button
                            type="button"
                            className="sh-icon-btn sh-menu-btn"
                            aria-label={menuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={menuOpen}
                            aria-controls="sh-nav"
                            onClick={() => setMenuOpen((v) => !v)}
                        >
                            {menuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </header>

            <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} tab={cartTab} setTab={setCartTab} />
        </>
    );
}

/* ------------------------------ Search ------------------------------ */

function SearchOverlay({ open, onClose }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");

    if (!open) return null;

    const goSearch = (term) => {
        onClose();
        const q = term.trim();
        navigate(q ? `/shop-list?search=${encodeURIComponent(q)}` : "/shop-list");
    };

    return (
        <div className="sh-search" onClick={onClose}>
            <div className="sh-search-box" role="dialog" aria-label="Search products" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="sh-close" onClick={onClose} aria-label="Close search">
                    <X size={20} />
                </button>
                <form
                    className="sh-search-field"
                    onSubmit={(e) => {
                        e.preventDefault();
                        goSearch(query);
                    }}
                >
                    <input
                        type="search"
                        placeholder="Search Product"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" aria-label="Search">
                        <Search size={16} />
                    </button>
                </form>
                <div className="sh-quick">
                    <span>Quick Search:</span>
                    {QUICK_SEARCH.map((t) => (
                        <button type="button" key={t} onClick={() => goSearch(t)}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* -------------------------- Cart / wishlist drawer -------------------------- */

function CartDrawer({ open, onClose, tab, setTab }) {
    const navigate = useNavigate();
    const { cartItems, wishlistItems, cartCount, wishlistCount, subtotal, removeFromCart, removeFromWishlist } = useShop();

    const goTo = (path) => {
        onClose();
        navigate(path);
    };

    // Normalise both lists into the same row shape the drawer renders
    const rows =
        tab === "cart"
            ? cartItems.map((line) => ({
                  key: line.key,
                  product: line.product,
                  meta: `${line.size} × ${line.qty}`,
                  price: formatPrice(line.product.price * line.qty),
                  onRemove: () => removeFromCart(line.key),
              }))
            : wishlistItems.map((product) => ({
                  key: product.id,
                  product,
                  meta: product.subtitle,
                  price: formatPrice(product.price),
                  onRemove: () => removeFromWishlist(product.id),
              }));

    return (
        <div className={open ? "sh-drawer is-open" : "sh-drawer"} aria-hidden={!open}>
            <div className="sh-drawer-backdrop" onClick={onClose} />
            <aside className="sh-drawer-panel" aria-label={tab === "cart" ? "Cart" : "Wishlist"}>
                <button type="button" className="sh-drawer-close" onClick={onClose} aria-label="Close cart">
                    <X size={20} />
                </button>

                <div className="sh-tabs">
                    <button type="button" className={tab === "cart" ? "sh-btn is-active" : "sh-btn"} onClick={() => setTab("cart")}>
                        Cart ({cartCount})
                    </button>
                    <button
                        type="button"
                        className={tab === "wishlist" ? "sh-btn is-active" : "sh-btn"}
                        onClick={() => setTab("wishlist")}
                    >
                        Wishlist ({wishlistCount})
                    </button>
                </div>

                {rows.length === 0 && (
                    <p className="sh-empty">{tab === "cart" ? "Your cart is empty." : "Your wishlist is empty."}</p>
                )}

                {rows.map((row) => {
                    const name = row.product.displayName || row.product.name;
                    return (
                        <div key={row.key} className="sh-row">
                            <button type="button" className="sh-row-img" onClick={() => goTo(productPath(row.product))}>
                                <img src={row.product.cardImage || row.product.gallery[0]} alt={name} />
                            </button>
                            <div className="sh-row-info">
                                <button type="button" className="sh-row-name" onClick={() => goTo(productPath(row.product))}>
                                    {name}
                                </button>
                                <div className="sh-row-meta">{row.meta}</div>
                                <div className="sh-row-price">{row.price}</div>
                            </div>
                            <button type="button" className="sh-row-remove" aria-label={`Remove ${name}`} onClick={row.onRemove}>
                                <X size={16} />
                            </button>
                        </div>
                    );
                })}

                {tab === "cart" && (
                    <>
                        <div className="sh-subtotal">
                            <span>Subtotal:</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <button
                            type="button"
                            className="sh-btn sh-btn--outline"
                            onClick={() => goTo("/checkout")}
                            disabled={cartItems.length === 0}
                        >
                            Checkout
                        </button>
                        <button type="button" className="sh-btn sh-btn--dark" onClick={() => goTo("/cart")}>
                            View Cart
                        </button>
                    </>
                )}
                {tab === "wishlist" && (
                    <button type="button" className="sh-btn sh-btn--dark sh-btn--spaced" onClick={() => goTo("/wishlist")}>
                        Check Your Favourite
                    </button>
                )}
            </aside>
        </div>
    );
}
