// src/context/ShopContext.jsx
// Global cart + wishlist state, shared by every page and saved to
// localStorage so it survives refreshes and page navigation.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getProductById, isServerProductId } from "../data/products";
import { useAuth } from "./AuthContext";

const ShopContext = createContext(null);

const CART_KEY = "chantallow_cart";
const WISHLIST_KEY = "chantallow_wishlist";
const WISHLIST_ITEMS_KEY = "chantallow_wishlist_items"; // copies of admin-added items, by id

// Built-in products use numeric ids; admin-added ones keep their "srv-12" / "combo-3" id.
const normId = (id) => (isServerProductId(id) ? id : Number(id));

function load(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function save(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* storage unavailable (private mode etc.) — state still works in memory */
    }
}

export function ShopProvider({ children }) {
    // cart line: { key: "4-2oz", productId: 4, size: "2oz", qty: 1 }
    // A product added in the admin panel isn't in data/products.js, so its line
    // also carries a copy of it: { productId: "srv-12", ..., product: {...} }
    const [cart, setCart] = useState(() => load(CART_KEY, []));
    // wishlist: array of product ids
    const [wishlist, setWishlist] = useState(() => load(WISHLIST_KEY, []));
    const [wishlistCopies, setWishlistCopies] = useState(() => load(WISHLIST_ITEMS_KEY, {}));

    useEffect(() => save(CART_KEY, cart), [cart]);
    useEffect(() => save(WISHLIST_KEY, wishlist), [wishlist]);
    useEffect(() => save(WISHLIST_ITEMS_KEY, wishlistCopies), [wishlistCopies]);

    /* ---------------- Toast (small "Added to cart" popup) ---------------- */
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);

    const showToast = useCallback((message) => {
        clearTimeout(toastTimer.current);
        setToast({ message, id: Date.now() });
        toastTimer.current = setTimeout(() => setToast(null), 2500);
    }, []);

    useEffect(() => () => clearTimeout(toastTimer.current), []);

    /* ---------------- Checkout login prompt ---------------- */
    // Browsing and the cart are open to everyone; paying needs an account. A guest
    // pressing "Place Order" gets the "Login First" modal, whose Login button
    // goes to /login and brings them back to /checkout afterwards.
    const { user, loading } = useAuth();
    const [loginPrompt, setLoginPrompt] = useState(false);
    // true when the shopper must sign in first (and the modal is now showing)
    const requireLoginForCheckout = useCallback(() => {
        if (user || loading) return false;
        setLoginPrompt(true);
        return true;
    }, [user, loading]);
    const closeLoginPrompt = useCallback(() => setLoginPrompt(false), []);

    /* ---------------- Cart ---------------- */
    // `product` is only needed for admin-added products (see fromServerProduct).
    const addToCart = useCallback(
        (productId, qty = 1, size = "2oz", product = null) => {
            const id = normId(productId);
            const key = `${id}-${size}`;
            setCart((prev) => {
                const existing = prev.find((line) => line.key === key);
                if (existing) {
                    return prev.map((line) => (line.key === key ? { ...line, qty: line.qty + qty } : line));
                }
                return [...prev, { key, productId: id, size, qty, ...(isServerProductId(id) && product ? { product } : {}) }];
            });
            return true;
        },
        []
    );

    const updateQty = useCallback((key, delta) => {
        setCart((prev) =>
            prev.map((line) => (line.key === key ? { ...line, qty: Math.max(1, line.qty + delta) } : line))
        );
    }, []);

    const removeFromCart = useCallback((key) => {
        setCart((prev) => prev.filter((line) => line.key !== key));
    }, []);

    const clearCart = useCallback(() => setCart([]), []);

    /* ---------------- Wishlist ---------------- */
    // `product` is only needed for admin-added items (as with addToCart).
    const rememberCopy = useCallback((id, product) => {
        if (isServerProductId(id) && product) setWishlistCopies((prev) => ({ ...prev, [id]: product }));
    }, []);

    const addToWishlist = useCallback(
        (productId, product = null) => {
            const id = normId(productId);
            rememberCopy(id, product);
            setWishlist((prev) => (prev.includes(id) ? prev : [...prev, id]));
            return true;
        },
        [rememberCopy]
    );

    const removeFromWishlist = useCallback((productId) => {
        const id = normId(productId);
        setWishlist((prev) => prev.filter((x) => x !== id));
    }, []);

    const toggleWishlist = useCallback(
        (productId, product = null) => {
            const id = normId(productId);
            rememberCopy(id, product);
            setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
            return true;
        },
        [rememberCopy]
    );

    const isInWishlist = useCallback((productId) => wishlist.includes(normId(productId)), [wishlist]);

    const moveToCart = useCallback(
        (productId) => {
            const id = normId(productId);
            const copy = wishlistCopies[id];
            // a combo is one fixed set, so it has no size to pick
            if (!addToCart(id, 1, copy?.items ? "Combo" : "2oz", copy || null)) return false;
            removeFromWishlist(id);
            return true;
        },
        [addToCart, removeFromWishlist, wishlistCopies]
    );

    /* ---------------- Derived data ---------------- */
    const cartItems = useMemo(
        () =>
            cart
                .map((line) => ({ ...line, product: getProductById(line.productId) || line.product }))
                .filter((line) => line.product),
        [cart]
    );

    const wishlistItems = useMemo(
        () => wishlist.map((id) => getProductById(id) || wishlistCopies[id]).filter(Boolean),
        [wishlist, wishlistCopies]
    );

    const cartCount = cart.reduce((sum, line) => sum + line.qty, 0);
    const wishlistCount = wishlistItems.length;
    const subtotal = cartItems.reduce((sum, line) => sum + line.product.price * line.qty, 0);

    const value = {
        cartItems,
        wishlistItems,
        cartCount,
        wishlistCount,
        subtotal,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        moveToCart,
        showToast,
        requireLoginForCheckout,
    };

    return (
        <ShopContext.Provider value={value}>
            {children}
            {loginPrompt && <LoginFirstModal onClose={closeLoginPrompt} />}
            {toast && (
                <div
                    key={toast.id}
                    role="status"
                    aria-live="polite"
                    style={{
                        position: "fixed",
                        left: "50%",
                        bottom: 32,
                        transform: "translateX(-50%)",
                        background: "#2D2E2F",
                        color: "#fff",
                        padding: "14px 24px",
                        borderRadius: 30,
                        fontSize: 14,
                        fontFamily: "'DM Sans', sans-serif",
                        boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
                        zIndex: 200,
                        maxWidth: "calc(100% - 32px)",
                        textAlign: "center",
                        animation: "ctwToastIn .25s ease both",
                    }}
                >
                    {toast.message}
                    <style>{`
                        @keyframes ctwToastIn {
                            from { opacity: 0; transform: translate(-50%, 12px); }
                            to   { opacity: 1; transform: translate(-50%, 0); }
                        }
                    `}</style>
                </div>
            )}
        </ShopContext.Provider>
    );
}

// Shown when a signed-out shopper tries to check out. ShopProvider sits outside
// the router, so these are plain links; the cart lives in localStorage, so a
// full page load loses nothing.
function LoginFirstModal({ onClose }) {
    const loginRef = useRef(null);
    const redirect = `?redirect=${encodeURIComponent("/checkout")}`;

    useEffect(() => {
        loginRef.current?.focus();
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const btn = {
        display: "block",
        width: "100%",
        padding: "13px 18px",
        borderRadius: 30,
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        textDecoration: "none",
        textAlign: "center",
        boxSizing: "border-box",
        cursor: "pointer",
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 300,
                background: "rgba(20, 24, 22, 0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="login-first-title"
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: 400,
                    background: "#fff",
                    borderRadius: 18,
                    padding: "36px 28px 28px",
                    textAlign: "center",
                    fontFamily: "'DM Sans', sans-serif",
                    color: "#2D2E2F",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
                }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    style={{ position: "absolute", top: 12, right: 14, background: "none", border: "none", fontSize: 24, lineHeight: 1, color: "#8A8A80", cursor: "pointer" }}
                >
                    ×
                </button>
                <h2 id="login-first-title" style={{ margin: "0 0 10px", fontFamily: "Marcellus, serif", fontWeight: 400, fontSize: 28, color: "#2D2E2F" }}>
                    Login First
                </h2>
                <p style={{ margin: "0 0 24px", fontSize: 15, lineHeight: 1.6, color: "#5A5A52" }}>
                    Please log in to continue to checkout and pay for your cart.
                </p>
                <a ref={loginRef} href={`/login${redirect}`} style={{ ...btn, background: "#1B4D3E", color: "#fff", border: "1px solid #1B4D3E" }}>
                    Login
                </a>
                <a href={`/register${redirect}`} style={{ ...btn, marginTop: 10, background: "#fff", color: "#1B4D3E", border: "1px solid #1B4D3E" }}>
                    Create An Account
                </a>
                <button
                    type="button"
                    onClick={onClose}
                    style={{ marginTop: 14, background: "none", border: "none", color: "#8A8A80", fontSize: 14, cursor: "pointer" }}
                >
                    Continue browsing
                </button>
            </div>
        </div>
    );
}

export function useShop() {
    const ctx = useContext(ShopContext);
    if (!ctx) throw new Error("useShop must be used inside <ShopProvider>");
    return ctx;
}