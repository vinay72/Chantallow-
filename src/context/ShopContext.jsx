// src/context/ShopContext.jsx
// Global cart + wishlist state, shared by every page and saved to
// localStorage so it survives refreshes and page navigation.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getProductById } from "../data/products";

const ShopContext = createContext(null);

const CART_KEY = "chantallow_cart";
const WISHLIST_KEY = "chantallow_wishlist";

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
    const [cart, setCart] = useState(() => load(CART_KEY, []));
    // wishlist: array of product ids
    const [wishlist, setWishlist] = useState(() => load(WISHLIST_KEY, []));

    useEffect(() => save(CART_KEY, cart), [cart]);
    useEffect(() => save(WISHLIST_KEY, wishlist), [wishlist]);

    /* ---------------- Toast (small "Added to cart" popup) ---------------- */
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);

    const showToast = useCallback((message) => {
        clearTimeout(toastTimer.current);
        setToast({ message, id: Date.now() });
        toastTimer.current = setTimeout(() => setToast(null), 2500);
    }, []);

    useEffect(() => () => clearTimeout(toastTimer.current), []);

    /* ---------------- Cart ---------------- */
    const addToCart = useCallback((productId, qty = 1, size = "2oz") => {
        const id = Number(productId);
        const key = `${id}-${size}`;
        setCart((prev) => {
            const existing = prev.find((line) => line.key === key);
            if (existing) {
                return prev.map((line) => (line.key === key ? { ...line, qty: line.qty + qty } : line));
            }
            return [...prev, { key, productId: id, size, qty }];
        });
    }, []);

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
    const addToWishlist = useCallback((productId) => {
        const id = Number(productId);
        setWishlist((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }, []);

    const removeFromWishlist = useCallback((productId) => {
        const id = Number(productId);
        setWishlist((prev) => prev.filter((x) => x !== id));
    }, []);

    const toggleWishlist = useCallback((productId) => {
        const id = Number(productId);
        setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }, []);

    const isInWishlist = useCallback((productId) => wishlist.includes(Number(productId)), [wishlist]);

    const moveToCart = useCallback(
        (productId) => {
            addToCart(productId, 1);
            removeFromWishlist(productId);
        },
        [addToCart, removeFromWishlist]
    );

    /* ---------------- Derived data ---------------- */
    const cartItems = useMemo(
        () =>
            cart
                .map((line) => ({ ...line, product: getProductById(line.productId) }))
                .filter((line) => line.product),
        [cart]
    );

    const wishlistItems = useMemo(() => wishlist.map((id) => getProductById(id)).filter(Boolean), [wishlist]);

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
    };

    return (
        <ShopContext.Provider value={value}>
            {children}
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

export function useShop() {
    const ctx = useContext(ShopContext);
    if (!ctx) throw new Error("useShop must be used inside <ShopProvider>");
    return ctx;
}