// src/pages/Combo/ComboDetail.jsx
// /combo/:id — one combo from Admin → Home → Combo Products: image, price,
// what's inside, quantity, add to cart and favourites.

import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import Header from "../../components/Header";
import SiteFooter from "../../components/SiteFooter";
import "../../components/SiteFooter.css";
import { api } from "../../api/client";
import { useShop } from "../../context/ShopContext";
import { formatPrice, fromServerCombo } from "../../data/products";
import "./ComboDetail.css";

export default function ComboDetail() {
  const { id } = useParams();
  const { addToCart, toggleWishlist, isInWishlist, showToast } = useShop();
  const [combo, setCombo] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | missing | error
  const [qty, setQty] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setQty(1);
    api(`/combos/${encodeURIComponent(id)}`)
      .then((data) => {
        if (cancelled) return;
        setCombo(fromServerCombo(data.combo));
        setStatus("ready");
      })
      .catch((err) => !cancelled && setStatus(err.status === 404 ? "missing" : "error"));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const liked = combo ? isInWishlist(combo.id) : false;

  const addCart = () => {
    addToCart(combo.id, qty, "Combo", combo);
    showToast(`${combo.name}${qty > 1 ? ` × ${qty}` : ""} added to cart`);
  };

  const toggleLike = () => {
    toggleWishlist(combo.id, combo);
    showToast(liked ? `${combo.name} removed from favourites` : `${combo.name} added to favourites ♥`);
  };

  return (
    <div className="cb-page">
      <Header />

      <div className="cb-banner">
        <h1>{status === "ready" ? "Chantallow Duo" : "Combo"}</h1>
        <nav className="cb-crumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">◆</span>
          <Link to="/#shop">Combos</Link>
          {combo && (
            <>
              <span aria-hidden="true">◆</span>
              <span aria-current="page">{combo.name}</span>
            </>
          )}
        </nav>
      </div>

      <main className="cb-main">
        {status === "loading" && <p className="cb-note">Loading combo…</p>}

        {(status === "missing" || status === "error") && (
          <div className="cb-empty">
            <h2>{status === "missing" ? "This combo isn't available" : "Couldn't load this combo"}</h2>
            <p>{status === "missing" ? "It may have sold out or been removed." : "Please check your connection and try again."}</p>
            <Link to="/#shop" className="cb-btn cb-btn--dark">
              See all combos
            </Link>
          </div>
        )}

        {status === "ready" && combo && (
          <div className="cb-grid">
            <div className="cb-media" style={{ "--cb-accent": combo.accent }}>
              {combo.tag && <span className="cb-tag">{combo.tag}</span>}
              {combo.cardImage && <img src={combo.cardImage} alt={combo.name} />}
            </div>

            <div className="cb-info">
              <h2 className="cb-name">{combo.name}</h2>
              <div className="cb-price">
                <span>{formatPrice(combo.price)}</span>
                {combo.compareAtPrice != null && <del>{formatPrice(combo.compareAtPrice)}</del>}
              </div>

              {combo.description && <p className="cb-desc">{combo.description}</p>}

              <h3 className="cb-subtitle">What's inside</h3>
              <ul className="cb-items">
                {combo.items.map((it, i) => (
                  <li key={i}>
                    <span className="cb-item-name">{it.name}</span>
                    <span className="cb-item-meta">
                      {it.size}
                      {it.qty > 1 && ` × ${it.qty}`}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="cb-buy">
                <div className="cb-qty" role="group" aria-label="Quantity">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                    <Minus size={16} />
                  </button>
                  <span aria-live="polite">{qty}</span>
                  <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(99, q + 1))}>
                    <Plus size={16} />
                  </button>
                </div>
                <button type="button" className="cb-btn cb-btn--dark cb-add" onClick={addCart}>
                  <ShoppingBag size={17} aria-hidden="true" /> Add to cart
                </button>
                <button
                  type="button"
                  className={liked ? "cb-like is-liked" : "cb-like"}
                  aria-pressed={liked}
                  aria-label={liked ? "Remove from favourites" : "Add to favourites"}
                  onClick={toggleLike}
                >
                  <Heart size={18} fill={liked ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
