import React, { useState } from "react";
import { Search, Heart, ShoppingCart, Menu, X, ArrowRight } from "lucide-react";
import "./PrivacyPolicy.css";

// Footer assets — adjust these paths to match your project's image folder
import logo from "../../assets/logo.png";

 import recentPost1 from "../../assets/shop/product/small/1.png";
import recentPost2 from "../../assets/shop/product/small/2.png";
import recentPost3 from "../../assets/shop/product/small/3.png";
import footerImg from "../../assets/footer/footer.png";

const NAV_LINKS = [
  { label: "Home", href: "index.html", active: false },
  { label: "About Us", href: "about-us.html" },
  { label: "Shop", href: "shop-list.html" },
];

const SECONDARY_NAV = [
  { label: "Blog", href: "blog-category.html" },
  { label: "Contact US", href: "contact-us.html" },
];

const POLICY_SECTIONS = [
  {
    title: "1. Information We Collect :",
    body: (
      <p>
        Name, Email address, Phone number, Shipping and billing address, Payment
        details (processed securely through third-party payment providers)
        Website usage data through cookies and analytics tools
      </p>
    ),
  },
  {
    title: "2. How We Use Your Information Your information may be used to:",
    body: (
      <ul className="privacy-point">
        <li>Communicate order updates and customer support</li>
        <li>Improve website functionality and customer experience</li>
        <li>Send promotional offers or newsletters (only if subscribed)</li>
      </ul>
    ),
  },
  {
    title: "3. Data Protection",
    body: (
      <p>
        We implement reasonable security measures to protect your personal
        information.
        <br />
        Payment information is processed securely and is not stored on our
        servers.
      </p>
    ),
  },
  {
    title: "4. Cookies",
    body: (
      <p>
        Our website may use cookies to enhance user experience, analyze traffic,
        and improve website performance. You may disable cookies through your
        browser settings.
      </p>
    ),
  },
  {
    title: "5. Third-Party Services",
    body: (
      <p>
        We may share necessary information with trusted third-party partners such
        as payment gateways, courier services, and analytics providers solely for
        order fulfillment and website operations. We may share necessary
        information with trusted third-party partners such as payment gateways,
        courier services, and analytics providers solely for order fulfillment
        and website operations.
      </p>
    ),
  },
  {
    title: "6. Your Rights",
    body: (
      <p>
        You may request access, correction, or deletion of your personal data by
        contacting us at [your email].
      </p>
    ),
  },
  {
    title: "7. Updates to Policy",
    body: (
      <p>
        We reserve the right to update this Privacy Policy at any time. Changes
        will be reflected on this page.
      </p>
    ),
  },
];

const RECENT_POSTS = [
  { name: "Hydrated Supple Skin", time: "July 23, 2023", img: recentPost1 },
  { name: "Glowing Radiant Skin", time: "July 23, 2023", img: recentPost2 },
  { name: "Silky Soft Skin", time: "July 23, 2023", img: recentPost3 },
];

const USEFUL_LINKS = [
  { label: "Home", href: "index.html" },
  { label: "About Us", href: "about-us.html" },
  { label: "Returns", href: "return-refund-policy.html" },
  { label: "Terms & Conditions", href: "terms-conditions.html" },
  { label: "Privacy-Policy", href: "privacy-policy.html" },
  { label: "Contact Us", href: "contact-us.html" },
];

const SOCIAL_LINKS = ["Instagram", "Facebook", "YouTube", "Linkedin", "X.Com"];

/* ---------- Logo ---------- */

function Logo({ className = "" }) {
  return (
    <a href="index.html" className={`ct-logo ${className}`}>
      <img src={logo} alt="Chantallow" />
    </a>
  );
}

/* ---------- Header (provided structure) ---------- */

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="ct-header">
      <div className="ct-header-row1">
        <Logo />
        <div className="ct-header-right">
          <ul className="ct-nav-main">
            {NAV_LINKS.map((l) => (
              <li key={l.label} className={l.active ? "active" : ""}>
                <a href={l.href}>
                  {l.label} <span className="ct-nav-plus">+</span>
                </a>
              </li>
            ))}
            <ul className="ct-nav-secondary-under">
              {SECONDARY_NAV.map((l) => (
                <li key={l.label}>
                  <a href={l.href}>
                    {l.label} <span className="ct-nav-plus">+</span>
                  </a>
                </li>
              ))}
            </ul>
          </ul>
          <div className="ct-header-actions">
            <a className="login" href="registration.html">
              Login /<br />Register
            </a>
            <button className="ct-icon-btn" aria-label="Search"><Search size={19} /></button>
            <button className="ct-icon-btn" aria-label="Wishlist"><Heart size={19} /></button>
            <button className="ct-icon-btn" aria-label="Cart"><ShoppingCart size={19} /></button>
            <button className="ct-burger" aria-label="Menu" onClick={() => setMenuOpen((v) => !v)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      <div className={`ct-mobile-menu${menuOpen ? " open" : ""}`}>
        {[...NAV_LINKS, ...SECONDARY_NAV].map((l) => (
          <a key={l.label} href={l.href}>{l.label}</a>
        ))}
      </div>
    </header>
  );
}

/* ---------- Sections ---------- */

function Banner() {
  return (
    <section className="banner">
      <div className="container">
        <h1>Privacy &amp; Policy</h1>
        <p>
          At Chantallow, your privacy is important to us.
          <br />
          This Privacy Policy explains how we collect, use, and protect your
          information.
        </p>
      </div>
    </section>
  );
}

function PolicyContent() {
  return (
    <section className="policy">
      <div className="container">
        {POLICY_SECTIONS.map((s) => (
          <div className="policy-block" key={s.title}>
            <h3>{s.title}</h3>
            {s.body}
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        {/* About */}
        <div>
          <div className="footer-logo">
            <img src={logo} alt="Chantallow" />
          </div>
          <p className="footer-contact"><strong>Address :</strong> 000 Wall Street, UK, London</p>
          <p className="footer-contact"><strong>E-mail :</strong> example@info.com</p>
          <p className="footer-contact"><strong>Phone :</strong> (000) 000-0000</p>
          <h6 className="footer-subtitle">Subscribe To Our Newsletter</h6>
          <form className="footer-newsletter" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your Email Address" aria-label="Email address" />
            <button type="submit" aria-label="Subscribe"><ArrowRight size={18} /></button>
          </form>
        </div>

        {/* Recent Posts */}
        <div>
          <h5 className="footer-title">Recent Posts</h5>
          {RECENT_POSTS.map((p) => (
            <div className="footer-post" key={p.name}>
              <div className="footer-post-thumb">
                <img src={p.img} alt="" />
              </div>
              <div className="footer-post-body">
                <div className="footer-post-title">{p.name}</div>
                <div className="footer-post-date">{p.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Useful Links */}
        <div>
          <h5 className="footer-title">Useful Links</h5>
          <div className="footer-links">
            {USEFUL_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="ctw-underline-link">{l.label}</a>
            ))}
          </div>
        </div>

        {/* Social Media */}
        <div>
          <h5 className="footer-title">Social Media</h5>
          <div className="footer-links social">
            {SOCIAL_LINKS.map((l) => (
              <a key={l} href="#home" className="ctw-underline-link">{l}</a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © 2026 <span className="footer-copyright-brand">Chantallow</span> Theme. All Rights Reserved.
        </p>
        <div className="footer-pay">
          <span>We Accept:</span>
          <img src={footerImg} alt="Accepted payment methods" />
        </div>
      </div>
    </footer>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="page-wrap">
      <Header />
      <Banner />
      <PolicyContent />
      <Footer />
    </div>
  );
}