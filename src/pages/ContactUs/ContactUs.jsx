import React, { useState } from "react";
import { Search, Heart, ShoppingCart, Menu, X, ArrowRight } from "lucide-react";
import "./ContactUs.css";

import logo from "../../assets/logo.png";
import recentPost1 from "../../assets/shop/product/small/1.png";
import recentPost2 from "../../assets/shop/product/small/2.png";
import recentPost3 from "../../assets/shop/product/small/3.png";
import footerImg from "../../assets/footer/footer.png";



const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/aboutus" },
  { label: "Shop", href: "/shop" },
];

const SECONDARY_NAV = [
  { label: "Blog", href: "/blog" },
  { label: "Contact US", href: "/contactus" },
];

const MAP_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d227748.3825624477!2d75.65046970649679!3d26.88544791796718!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396c4adf4c57e281%3A0xce1c63a0cf22e09!2sJaipur%2C+Rajasthan!5e0!3m2!1sen!2sin!4v1500819483219";

const RECENT_POSTS = [
  { name: "Hydrated Supple Skin", time: "July 23, 2023", img: recentPost1 },
  { name: "Glowing Radiant Skin", time: "July 23, 2023", img: recentPost2 },
  { name: "Silky Soft Skin", time: "July 23, 2023", img: recentPost3 },
];

const USEFUL_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/aboutus" },
  { label: "Returns", href: "/" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Privacy-Policy", href: "/privacy-policy" },
  { label: "Contact Us", href: "/contactus" },
];

const SOCIAL_LINKS = ["Instagram", "Facebook", "YouTube", "Linkedin", "X.Com"];

/* ---------- Logo ---------- */

function Logo({ className = "" }) {
  return (
    <a href="/" className={`ct-logo ${className}`}>
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
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href}>
                  {link.label} <span className="ct-nav-plus">+</span>
                </a>
              </li>
            ))}
            <ul className="ct-nav-secondary-under">
              {SECONDARY_NAV.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>
                    {link.label} <span className="ct-nav-plus">+</span>
                  </a>
                </li>
              ))}
            </ul>
          </ul>
          <div className="ct-header-actions">
            <a className="login" href="/">
              Login /<br />Register
            </a>
            <button className="ct-icon-btn" aria-label="Search">
              <Search size={19} />
            </button>
            <button className="ct-icon-btn" aria-label="Wishlist">
              <Heart size={19} />
            </button>
            <button className="ct-icon-btn" aria-label="Cart">
              <ShoppingCart size={19} />
            </button>
            <button className="ct-burger" aria-label="Menu" onClick={() => setMenuOpen((v) => !v)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      <div className={`ct-mobile-menu${menuOpen ? " open" : ""}`}>
        {[...NAV_LINKS, ...SECONDARY_NAV].map((link) => (
          <a key={link.label} href={link.href}>
            {link.label}
          </a>
        ))}
      </div>
    </header>
  );
}

/* ---------- Contact info (left column) ---------- */

function ContactInfo() {
  return (
    <div className="cu-info">
      <span className="cu-eyebrow">How To Contact us</span>
      <h2 className="cu-title">Say Hello To Us!</h2>
      <p className="cu-text">
        Let’s Talk Business or Just Have a Coffee.
        <br />
        We Would Love TO hear From You!
      </p>

      <div className="cu-block">
        <h3>United States</h3>
        <ul>
          <li>
            Address: 3553 Brandywine Street
            <br />
            Northwest, Washington AR 20008
          </li>
        </ul>
      </div>

      <div className="cu-block-row">
        <div className="cu-block">
          <h3>Call Us</h3>
          <ul>
            <li>+01-123-456-7890</li>
            <li>+01-123-456-7890</li>
          </ul>
        </div>
        <div className="cu-block">
          <h3>Email Us</h3>
          <ul>
            <li>help@Chantallow.com</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---------- Contact form (right column) ---------- */

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    // Wire this up to your own endpoint
    console.log("Contact form submitted:", { name, email, phone, message });
  }

  return (
    <div className="cu-form-card">
      <form className="cu-form" onSubmit={handleSubmit}>
        <label className="cu-label" htmlFor="cu-name">Your Name</label>
        <div className="cu-input-group">
          <input
            id="cu-name"
            type="text"
            name="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <label className="cu-label" htmlFor="cu-email">Email Address</label>
        <div className="cu-input-group">
          <input
            id="cu-email"
            type="email"
            name="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <label className="cu-label" htmlFor="cu-phone">Phone Number</label>
        <div className="cu-input-group">
          <input
            id="cu-phone"
            type="tel"
            name="phone"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>

        <label className="cu-label" htmlFor="cu-message">Massage</label>
        <div className="cu-input-group">
          <textarea
            id="cu-message"
            name="message"
            rows={4}
            required
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>

        {/* reCAPTCHA goes here if you need it */}

        <button type="submit" className="cu-submit">SUBMIT</button>
      </form>
    </div>
  );
}

/* ---------- Map ---------- */

function Map() {
  return (
    <section className="cu-map">
      <iframe
        src={MAP_SRC}
        title="Chantallow location map"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    </section>
  );
}

/* ---------- Footer ---------- */

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <div className="footer-logo">
            <img src={logo} alt="Chantallow" />
          </div>
          <p className="footer-contact">
            <strong>Address :</strong> 000 Wall Street, UK, London
          </p>
          <p className="footer-contact">
            <strong>E-mail :</strong> example@info.com
          </p>
          <p className="footer-contact">
            <strong>Phone :</strong> (000) 000-0000
          </p>
          <h6 className="footer-subtitle">Subscribe To Our Newsletter</h6>
          <form className="footer-newsletter" onSubmit={(event) => event.preventDefault()}>
            <input type="email" placeholder="Your Email Address" aria-label="Email address" />
            <button type="submit" aria-label="Subscribe">
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        <div>
          <h5 className="footer-title">Recent Posts</h5>
          {RECENT_POSTS.map((post) => (
            <div className="footer-post" key={post.name}>
              <div className="footer-post-thumb">
                <img src={post.img} alt={post.name} />
              </div>
              <div className="footer-post-body">
                <div className="footer-post-title">{post.name}</div>
                <div className="footer-post-date">{post.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h5 className="footer-title">Useful Links</h5>
          <div className="footer-links">
            {USEFUL_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="ctw-underline-link">
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h5 className="footer-title">Social Media</h5>
          <div className="footer-links social">
            {SOCIAL_LINKS.map((network) => (
              <a key={network} href="#home" className="ctw-underline-link">
                {network}
              </a>
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

export default function ContactUsPage() {
  return (
    <div className="page-wrap">
      <Header />

      <section className="cu-content">
        <div className="container cu-grid">
          <ContactInfo />
          <ContactForm />
        </div>
      </section>

      <Map />
      <Footer />
    </div>
  );
}