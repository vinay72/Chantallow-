import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Heart, ShoppingCart, Menu, ArrowRight, ChevronDown } from "lucide-react";
import "./ReturnRefundPolicy.css";
import logo from "../../assets/logo.png";
import recentPost1 from "../../assets/shop/product/small/1.png";
import recentPost2 from "../../assets/shop/product/small/2.png";
import recentPost3 from "../../assets/shop/product/small/3.png";
import footerImg from "../../assets/footer/footer.png";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/aboutus" },
  { label: "Shop", path: "/shop-list" },
  { label: "Blog", path: "/blog-category" },
  { label: "Contact US", path: "/contactus" },
];

/**
 * Chantallow — Return & Refund Policy page
 * Converted from the static HTML template (Bootstrap accordion + contact
 * form) into a self-contained React component.
 *
 * Wrap this with your shared <Header /> and <Footer /> in your router,
 * the same ones used on the Product Detail page.
 */

const POLICY_ITEMS = [
  {
    id: "returns",
    title: "Returns",
    body: [
      "For hygiene and safety reasons, opened or used products cannot be returned or exchanged.",
      "Returns are only accepted for products received in damaged, defective, or incorrect condition.",
    ],
  },
  {
    id: "timeline",
    title: "Return Request Timeline",
    body: [
      "Any issue with the order must be reported within 48 hours of delivery.",
      "Customers must provide order details along with clear images of the product and packaging.",
    ],
  },
  {
    id: "refunds",
    title: "Refunds & Replacements",
    body: [
      "Once the issue is reviewed and approved, we may offer:",
      "Replacement of the product, or Refund to the original payment method. Refund timelines may vary depending on the payment provider.",
    ],
  },
  {
    id: "non-returnable",
    title: "Non-Returnable Items",
    body: [
      "The following items are not eligible for return:",
      "Opened or used skincare products, products purchased during sale or promotional events, gift cards or complimentary items.",
    ],
  },
  {
    id: "shipping",
    title: "Shipping Charges",
    body: [
      "Shipping charges are non-refundable unless the error was from our side.",
    ],
  },
];

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className={`rr-accordion__item ${isOpen ? "is-open" : ""}`}>
      <h2 className="rr-accordion__header">
        <button
          type="button"
          className="rr-accordion__button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={`rr-panel-${item.id}`}
        >
          {item.title}
          <ChevronDown className="rr-accordion__chevron" size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </h2>
      <div
        id={`rr-panel-${item.id}`}
        className="rr-accordion__panel"
        role="region"
        hidden={!isOpen}
      >
        <div className="rr-accordion__body">
          {item.body.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ReturnRefundPolicy() {
  const [openIndex, setOpenIndex] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", message: "", save: false });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Hook up to your API / email service here.
    setSubmitted(true);
  };

  return (
    <div className="rr-page">
      <Header />

      {/* ---------------- Banner ---------------- */}
      <div className="rr-banner">
        <div className="rr-container">
          <div className="rr-banner__entry">
            <h1>Return &amp; Refund Policy</h1>
            <nav aria-label="Breadcrumb" className="rr-breadcrumb">
              <a href="/">Home</a>
              <span aria-hidden="true">◆</span>
              <span>Return &amp; Refund Policy</span>
            </nav>
            <svg
              className="rr-banner__chevron"
              width="35"
              height="35"
              viewBox="0 0 35 35"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M9.5 13L18.25 21.75L27 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ---------------- Content ---------------- */}
      <section className="rr-content">
        <div className="rr-container rr-content__grid">
          {/* Left: intro + accordion */}
          <div className="rr-policy">
            <p className="rr-policy__intro">
              Welcome to Chantallow. By accessing or purchasing from our website, you agree to the
              following Terms &amp; Conditions. Please read them carefully before using our
              services.
            </p>

            <div className="rr-accordion">
              {POLICY_ITEMS.map((item, i) => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  isOpen={openIndex === i}
                  onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
                />
              ))}
            </div>
          </div>

          {/* Right: contact form */}
          <div className="rr-contact">
            <h3 className="rr-contact__title">Ask Differently.</h3>
            <p className="rr-contact__text">
              Your Email Address will Not Be published, required fields are Marked*
            </p>

            {submitted ? (
              <p className="rr-contact__success">
                Thank you — your message has been sent. We&rsquo;ll get back to you soon.
              </p>
            ) : (
              <form className="rr-form" onSubmit={handleSubmit}>
                <div className="rr-form__group">
                  <input
                    required
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Name*"
                    aria-label="Name"
                  />
                </div>
                <div className="rr-form__group">
                  <input
                    required
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email Address*"
                    aria-label="Email Address"
                  />
                </div>
                <div className="rr-form__group">
                  <textarea
                    required
                    rows={4}
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Message*"
                    aria-label="Message"
                  />
                </div>
                <label className="rr-form__check">
                  <input
                    type="checkbox"
                    name="save"
                    checked={form.save}
                    onChange={handleChange}
                  />
                  <span>Save My Name, Email, This Browser for The Next Time i Message.</span>
                </label>
                <button type="submit" className="rr-btn rr-btn--outline">
                  SUBMIT
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ---------------- Header ---------------- */

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

/* ---------------- Footer ---------------- */

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
                        { label: "Returns", path: "/returns" },
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