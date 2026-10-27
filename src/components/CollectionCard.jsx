// src/components/CollectionCard.jsx
// Card used in "Experience The Tallow Collection" on the Home page.
//   • click image (or name)   -> product detail page for this product
//   • heart (top right)       -> adds/removes favourite, stays on the page
//   • bag (bottom right)      -> adds to cart, stays on the page
//   • Quick View              -> opens the quick view modal (unchanged)

import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { getProductById, formatPrice } from "../data/products";

export default function CollectionCard({ c, onQuickView }) {
    const navigate = useNavigate();
    const { addToCart, toggleWishlist, isInWishlist, showToast } = useShop();
    const product = getProductById(c.id);
    const liked = isInWishlist(c.id);

    const openDetail = () => {
        if (product) navigate(`/product/${product.slug}`);
    };

    const handleWishlist = (e) => {
        e.stopPropagation(); // don't also open the detail page
        toggleWishlist(c.id);
        showToast(liked ? `${c.name} removed from favourites` : `${c.name} added to favourites ♥`);
    };

    const handleCart = (e) => {
        e.stopPropagation();
        addToCart(c.id, 1);
        showToast(`${c.name} added to cart`);
    };

    const handleQuickView = (e) => {
        e.stopPropagation();
        onQuickView && onQuickView(c.id);
    };

    const handleKeyDown = (e) => {
        // only react when the image area itself is focused, not a button inside it
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openDetail();
        }
    };

    return (
        <div
            className="ctw-card-hover"
            style={{
                background: "#fff",
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid #E2E9DA",
            }}
        >
            <div
                role="link"
                tabIndex={0}
                aria-label={`View ${c.name} details`}
                onClick={openDetail}
                onKeyDown={handleKeyDown}
                style={{
                    position: "relative",
                    aspectRatio: "4 / 4.2",
                    background: `linear-gradient(150deg, ${c.accent}24, ${c.accent}55)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    cursor: "pointer",
                }}
            >
                <img
                    src={c.img}
                    alt={`Chantallow ${c.name} tallow skincare jar`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
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
                    type="button"
                    onClick={handleQuickView}
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
                    type="button"
                    aria-label={`Add ${c.name} to cart`}
                    onClick={handleCart}
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
                    type="button"
                    aria-label={liked ? `${c.name} is in your favourites` : `Add ${c.name} to favourites`}
                    aria-pressed={liked}
                    onClick={handleWishlist}
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
                    <Heart size={14} color={liked ? "#7A0000" : "#1C1C1A"} fill={liked ? "#7A0000" : "none"} />
                </button>
            </div>

            <div style={{ padding: "16px 18px 20px" }}>
                <h5
                    onClick={openDetail}
                    style={{
                        margin: "0 0 6px",
                        fontSize: 20,
                        fontFamily: "Marcellus, sans-serif",
                        fontWeight: 700,
                        color: "#3B1941",
                        textTransform: "uppercase",
                        cursor: "pointer",
                    }}
                >
                    {String(c.name)
                        .split(/(\(\d+(?:\.\d+)?oz\))/i)
                        .map((part, i) =>
                            /^\(\d/.test(part) ? (
                                // sizes like (4oz) stay lowercase inside the uppercase title
                                <span key={i} style={{ textTransform: "none" }}>{part}</span>
                            ) : (
                                part
                            )
                        )}
                </h5>
                <span style={{ fontSize: 20, fontFamily: "Marcellus, sans-serif", color: "#8A8A80" }}>
                    {formatPrice(product?.price)}{" "}
                    <span style={{ textDecoration: "line-through" }}>{formatPrice(product?.oldPrice)}</span>
                </span>
            </div>
        </div>
    );
}