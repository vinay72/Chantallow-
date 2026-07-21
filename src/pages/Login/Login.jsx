import React, { useState } from "react";
import { Search, Heart, ShoppingCart, Menu, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";

import logo from "../../assets/logo.png";

// Banner slider images — commented out for now, uncomment once the assets are in place.
// import bannerImg1 from "../../assets/registration/pic1.jpg";
// import bannerImg2 from "../../assets/registration/pic2.jpg";
// import bannerImg3 from "../../assets/registration/pic3.jpg";

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

const SLIDES = [
    {
        // img: bannerImg1,
        quote: "Skin, a canvas of life's journey, bears the marks of resilience and the glow of inner vitality.",
        name: "Sophie Hall",
        rating: 3,
    },
    {
        // img: bannerImg2,
        quote: "Serums, the alchemy of skincare, unlock the secrets of radiant beauty with every drop.",
        name: "Sophie Hall",
        rating: 3,
    },
    {
        // img: bannerImg3,
        quote: "Beauty is not confined to symmetry; it flourishes in the uniqueness of every body's story.",
        name: "Sophie Hall",
        rating: 3,
    },
];

export default function SignIn() {
    return (
        <div className="ctw-page">
            <Header />
            <SignInSection />
            <Footer />
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

/* ------------------------------ Sign In Section ------------------------------ */

function SignInSection() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [slide, setSlide] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        // wire up real auth here
        navigate("/");
    };

    const nextSlide = () => setSlide((s) => (s + 1) % SLIDES.length);
    const prevSlide = () => setSlide((s) => (s - 1 + SLIDES.length) % SLIDES.length);

    return (
        <section className="ctw-signin-section">
            {/* LEFT — Sign in form */}
            <div className="ctw-signin-left">
                <div className="ctw-signin-form-wrap">
                    <h2 className="ctw-signin-title">Sign in</h2>
                    <p className="ctw-signin-subtitle">welcome please login to your account</p>

                    <div className="ctw-social-row">
                        <button type="button" className="ctw-btn ctw-social-btn">
                            <GoogleIcon />
                            Log In With Google
                        </button>
                        <button type="button" className="ctw-btn ctw-social-btn">
                            <FacebookIcon />
                            Log In With Facebook
                        </button>
                    </div>

                    <div className="ctw-divider-row">
                        <span className="ctw-divider-line" />
                        <span className="ctw-divider-text">or</span>
                        <span className="ctw-divider-line" />
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="ctw-field">
                            <label className="ctw-label">Email Address</label>
                            <input type="email" required placeholder="Email Address" className="ctw-input" />
                        </div>

                        <div className="ctw-field ctw-field-password">
                            <label className="ctw-label">Password</label>
                            <div className="ctw-password-wrap">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="Password"
                                    className="ctw-input"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="ctw-eye-btn"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="ctw-form-row">
                            <label className="ctw-checkbox-label">
                                <input type="checkbox" />
                                Remember For 30 Days
                            </label>
                            <a href="#forgot" className="ctw-underline-link ctw-forgot-link">
                                Forgot Password
                            </a>
                        </div>

                        <button type="submit" className="ctw-btn ctw-signin-btn">
                            Sign In
                        </button>

                        <p className="ctw-signup-text">
                            Don't Have an Account?{" "}
                            <Link to="/registration" className="ctw-signup-link">
                                Sign up For Free
                            </Link>
                        </p>
                    </form>
                </div>
            </div>

            {/* RIGHT — Banner slider */}
            <div
                className="ctw-signin-right"
            // style={{ backgroundImage: `url(${SLIDES[slide].img})` }}
            >
                <div className="ctw-signin-right-overlay" />
                <div className="ctw-signin-right-content">
                    <h2 className="ctw-signin-quote">{SLIDES[slide].quote}</h2>

                    <div className="ctw-signin-meta-row">
                        <div>
                            <h4 className="ctw-signin-name">{SLIDES[slide].name}</h4>
                            <div className="ctw-stars-row">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <StarIcon key={i} filled={i < SLIDES[slide].rating} />
                                ))}
                            </div>
                        </div>

                        <div className="ctw-arrow-group">
                            <button onClick={prevSlide} aria-label="Previous testimonial" className="ctw-arrow-btn">
                                <ArrowLeft size={18} color="#fff" />
                            </button>
                            <button onClick={nextSlide} aria-label="Next testimonial" className="ctw-arrow-btn">
                                <ArrowRight size={18} color="#fff" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* --------------------------------- Icons --------------------------------- */

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.76215 15.7122L4.85713 19.0908L1.54929 19.1607C0.560727 17.3272 0 15.2294 0 13.0001C0 10.8443 0.524266 8.81147 1.45356 7.02148H1.45427L4.39918 7.56139L5.68923 10.4886C5.41922 11.2758 5.27206 12.1208 5.27206 13.0001C5.27216 13.9543 5.44502 14.8687 5.76215 15.7122Z" fill="#FBBB00"/>
            <path d="M25.7722 10.5715C25.9215 11.3579 25.9994 12.1701 25.9994 13.0001C25.9994 13.9308 25.9015 14.8387 25.7151 15.7144C25.0823 18.6944 23.4287 21.2965 21.138 23.138L21.1373 23.1373L17.428 22.948L16.903 19.6708C18.423 18.7794 19.6109 17.3844 20.2366 15.7144H13.2852V10.5715H20.338H25.7722Z" fill="#518EF8"/>
            <path d="M21.1374 23.1371L21.1381 23.1378C18.9103 24.9285 16.0802 26 12.9995 26C8.04883 26 3.74456 23.2329 1.54883 19.1607L5.76169 15.7122C6.85953 18.6421 9.68596 20.7279 12.9995 20.7279C14.4238 20.7279 15.7581 20.3428 16.9031 19.6707L21.1374 23.1371Z" fill="#28B446"/>
            <path d="M21.2974 2.99284L17.086 6.44069C15.901 5.69999 14.5003 5.27211 12.9996 5.27211C9.61098 5.27211 6.73168 7.45352 5.68884 10.4886L1.45384 7.02142H1.45312C3.61671 2.85 7.97527 0 12.9996 0C16.1538 0 19.046 1.12359 21.2974 2.99284Z" fill="#F14336"/>
        </svg>
    );
}

function FacebookIcon() {
    return (
        <svg height="18" viewBox="0 0 176 176" width="18" xmlns="http://www.w3.org/2000/svg">
            <circle cx="88" cy="88" fill="#1877F2" r="88" />
            <path d="M115.88 77.58l-1.77 15.33a2.87 2.87 0 0 1-2.82 2.57h-16l-.08 45.45a2.05 2.05 0 0 1-2 2.07H77.02a2 2 0 0 1-2-2.08V95.48h-12a2.87 2.87 0 0 1-2.84-2.9l-.06-15.33a2.88 2.88 0 0 1 2.84-2.92h12.06v-14.8c0-17.18 10.2-26.53 25.16-26.53h12.26a2.88 2.88 0 0 1 2.85 2.92v12.9a2.88 2.88 0 0 1-2.85 2.92h-7.52c-8.13 0-9.71 4-9.71 9.78v12.81h17.87a2.88 2.88 0 0 1 2.82 3.25z" fill="#fff"/>
        </svg>
    );
}

function StarIcon({ filled }) {
    return (
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M7.24805 0.734375L9.22301 5.01608L13.9054 5.57126L10.4436 8.77267L11.3625 13.3975L7.24805 11.0944L3.13355 13.3975L4.0525 8.77267L0.590651 5.57126L5.27309 5.01608L7.24805 0.734375Z"
                fill="#fff"
                opacity={filled ? 1 : 0.3}
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