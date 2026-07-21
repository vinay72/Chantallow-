import React, { useState } from "react";
import { Search, Heart, ShoppingCart, Menu, X, ArrowRight, ChevronDown } from "lucide-react";
import "./Terms&Conditions.css";



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

const BREADCRUMB = [
  { label: "Home", href: "index.html" },
  { label: "FAQ" },
];

const TERMS = [
  {
    id: "general",
    title: "General",
    paragraphs: [
      "These Terms & Conditions govern the use of our website and products.",
      "By placing an order, you confirm that you are at least 18 years of age or are using the website under parental/guardian supervision.",
      "We reserve the right to update or modify these terms at any time without prior notice.",
    ],
  },
  {
    id: "product-information",
    title: "Product Information",
    paragraphs: [
      "Our skincare and wellness products are handcrafted using natural ingredients. Variations in texture, color, or fragrance may occur naturally and do not indicate defects.",
      "Product descriptions and images are provided for informational purposes only. Actual products may slightly differ due to packaging or ingredient sourcing updates.",
    ],
  },
  {
    id: "usage-disclaimer",
    title: "Usage Disclaimer",
    paragraphs: [
      "Our products are intended for external use only unless specifically stated otherwise.",
      "Please perform a patch test before use.",
      "Discontinue use if irritation occurs and consult a healthcare professional if necessary.",
      "Our products are not intended to diagnose, treat, cure, or prevent any medical condition.",
    ],
  },
  {
    id: "orders-payments",
    title: "Orders & Payments",
    paragraphs: [
      "All orders are subject to availability and acceptance.",
      "Prices are listed in USD and may change without prior notice.",
      "Payments must be completed through approved payment methods available on the website.",
    ],
  },
  {
    id: "shipping",
    title: "Shipping",
    paragraphs: [
      "Delivery timelines are estimates and may vary depending on location, courier delays, or unforeseen circumstances.",
      "Once an order is shipped, tracking details will be shared via email/SMS.",
    ],
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    paragraphs: [
      "All content on this website, including logos, product names, images, text, and designs, is the property of Chantallow and may not be copied or used without written permission.",
    ],
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of Liability",
    paragraphs: [
      "Chantallow shall not be held liable for any indirect, incidental, or consequential damages arising from the use of our products or website.",
    ],
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

/* ---------- Header ---------- */

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

/* ---------- Banner ---------- */

function Banner() {
  return (
    <section className="banner tc-banner">
      <div className="container">
        <h1>Terms &amp; Conditions</h1>
        <nav aria-label="breadcrumb">
          <ul className="tc-breadcrumb">
            {BREADCRUMB.map((c) => (
              <li key={c.label}>
                {c.href ? <a href={c.href}>{c.label}</a> : <span>{c.label}</span>}
              </li>
            ))}
          </ul>
        </nav>
        <div className="tc-scroll-cue" aria-hidden="true">
          <ChevronDown size={32} strokeWidth={1.5} />
        </div>
      </div>
    </section>
  );
}

/* ---------- Accordion ---------- */

function Accordion() {
  // First panel open by default, mirroring the original markup
  const [openId, setOpenId] = useState(TERMS[0].id);

  const toggle = (id) => setOpenId((current) => (current === id ? null : id));

  return (
    <div className="tc-accordion">
      {TERMS.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div className={`tc-accordion-item${isOpen ? " open" : ""}`} key={item.id}>
            <h2 className="tc-accordion-header">
              <button
                type="button"
                className="tc-accordion-button"
                aria-expanded={isOpen}
                aria-controls={`panel-${item.id}`}
                id={`heading-${item.id}`}
                onClick={() => toggle(item.id)}
              >
                <span>{item.title}</span>
                <ChevronDown className="tc-accordion-icon" size={22} strokeWidth={1.5} />
              </button>
            </h2>
            <div
              className="tc-accordion-panel"
              id={`panel-${item.id}`}
              role="region"
              aria-labelledby={`heading-${item.id}`}
              hidden={!isOpen}
            >
              <div className="tc-accordion-body">
                {item.paragraphs.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Contact form ---------- */

function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", message: "", save: false });

  const update = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setValues((v) => ({ ...v, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Wire this up to your own endpoint
    console.log("Contact form submitted:", values);
  };

  return (
    <div className="tc-contact">
      <h3 className="tc-contact-title">Ask Differently.</h3>
      <p className="tc-contact-text">
        Your Email Address will Not Be published, required fields are Marked*
      </p>
      <form className="tc-form" onSubmit={handleSubmit}>
        <div className="tc-input-group">
          <input
            type="text"
            name="name"
            required
            placeholder="Name*"
            value={values.name}
            onChange={update("name")}
          />
        </div>
        <div className="tc-input-group">
          <input
            type="email"
            name="email"
            required
            placeholder="Email Address*"
            value={values.email}
            onChange={update("email")}
          />
        </div>
        <div className="tc-input-group">
          <textarea
            name="message"
            rows={4}
            required
            placeholder="Message*"
            value={values.message}
            onChange={update("message")}
          />
        </div>
        <label className="tc-checkbox" htmlFor="save-details">
          <input
            type="checkbox"
            id="save-details"
            checked={values.save}
            onChange={update("save")}
          />
          <span>Save My Name, Email, This Browser for The Next Time i Message.</span>
        </label>
        <button type="submit" className="tc-submit">SUBMIT</button>
      </form>
    </div>
  );
}

/* ---------- Footer ---------- */

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

/* ---------- Page ---------- */

export default function TermsConditionsPage() {
  return (
    <div className="page-wrap">
      <Header />
      <Banner />

      <section className="tc-content">
        <div className="container tc-grid">
          <div className="tc-col-main">
            <p className="tc-intro">
              Welcome to Chantallow. By accessing or purchasing from our website, you
              agree to the following Terms &amp; Conditions. Please read them carefully
              before using our services.
            </p>
            <Accordion />
          </div>
          <div className="tc-col-side">
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}