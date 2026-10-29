// src/components/SiteFooter.jsx
// The footer that was copy-pasted into ProductDetail and AddToCart, now shared.

import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import logo from "../assets/logo.png";
import recentPost1 from "../assets/shop/product/small/1.png";
import recentPost2 from "../assets/shop/product/small/2.png";
import recentPost3 from "../assets/shop/product/small/3.png";
import footerImg from "../assets/footer/footer.png";
import "./SiteFooter.css";

const USEFUL_LINKS = [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/aboutus" },
    { label: "Returns", path: "#" },
    { label: "Terms & Conditions", path: "/terms-and-conditions" },
    { label: "Privacy-Policy", path: "/privacy-policy" },
    { label: "Contact Us", path: "/contactus" },
];

const RECENT_POSTS = [
    { title: "Hydrated Supple Skin", img: recentPost1 },
    { title: "Glowing Radiant Skin", img: recentPost2 },
    { title: "Silky Soft Skin", img: recentPost3 },
];

const p = { fontSize: 13.5, fontFamily: "Lufga", lineHeight: 2, color: "#5A5A52", margin: "0 0 6px" };
const h5 = { fontSize: 20, fontWeight: 700, color: "#1C1C1A", margin: "0 0 22px" };

export default function SiteFooter() {
    return (
        <footer className="ctw-footer" style={{ background: "#FFFFFF", color: "#1C1C1A", borderTop: "1px solid #F0EEE4" }}>
            <div className="ctw-footer-grid">
                <div>
                    <div style={{ marginBottom: 24 }}>
                        <img src={logo} alt="Chantallow" style={{ height: 40, width: "auto", display: "block" }} />
                    </div>
                    <p style={p}><strong style={{ color: "#1C1C1A" }}>Address :</strong> 000 Wall Street, UK, London</p>
                    <p style={p}><strong style={{ color: "#1C1C1A" }}>E-mail :</strong> example@info.com</p>
                    <p style={{ ...p, margin: "0 0 24px" }}><strong style={{ color: "#1C1C1A" }}>Phone :</strong> (000) 000-0000</p>
                    <h6 style={{ fontSize: 14.5, fontWeight: 700, margin: "0 0 12px" }}>Subscribe To Our Newsletter</h6>
                    <div style={{ display: "flex", background: "#EAF5EA", borderRadius: 30, overflow: "hidden" }}>
                        <input
                            type="email"
                            placeholder="Your Email Address"
                            style={{ flex: 1, background: "transparent", border: "none", padding: "14px 20px", color: "#1C1C1A", fontSize: 13.5, outline: "none" }}
                        />
                        <button
                            aria-label="Subscribe"
                            style={{ background: "transparent", border: "none", width: 52, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                        >
                            <ArrowRight size={18} color="#1C1C1A" />
                        </button>
                    </div>
                </div>

                <div>
                    <h5 style={h5}>Recent Posts</h5>
                    {RECENT_POSTS.map((t) => (
                        <div key={t.title} style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
                            <div style={{ width: 76, height: 76, borderRadius: 4, background: "#F4F1E6", flexShrink: 0, overflow: "hidden" }}>
                                <img src={t.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                            </div>
                            <div style={{ paddingTop: 6 }}>
                                <div style={{ fontSize: 17, fontWeight: 700, color: "#1C1C1A", marginBottom: 6, fontFamily: "Lufga" }}>{t.title}</div>
                                <div style={{ fontSize: 14, color: "#9A9A90", fontFamily: "Lufga" }}>July 23, 2023</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div>
                    <h5 style={h5}>Useful Links</h5>
                    {USEFUL_LINKS.map((l) => (
                        <Link
                            key={l.label}
                            to={l.path}
                            className="ctw-underline-link"
                            style={{ display: "block", fontSize: 15, fontFamily: "Lufga, sans-serif", color: "#2D2E2F", marginBottom: 14, textDecoration: "none" }}
                        >
                            {l.label}
                        </Link>
                    ))}
                </div>

                <div>
                    <h5 style={h5}>Social Media</h5>
                    {["Instagram", "Facebook", "YouTube", "Linkedin", "X.Com"].map((l) => (
                        <a
                            key={l}
                            href="#home"
                            className="ctw-underline-link"
                            style={{ display: "block", fontSize: 14.5, color: "#3A3A36", marginBottom: 14, textDecoration: "none" }}
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
                <p style={{ fontFamily: "Lufga", margin: 0 }}>
                    © 2026 <span style={{ color: "#41705B", fontWeight: 600 }}>Chantallow</span> Theme. All Rights Reserved.
                </p>
                <div className="ctw-footer-payments" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span>We Accept:</span>
                    <img src={footerImg} alt="Accepted payment methods" style={{ height: 24, display: "block" }} />
                </div>
            </div>
        </footer>
    );
}