import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import "./ContactUs.css";

import logo from "../../assets/logo.png";
import recentPost1 from "../../assets/shop/product/small/1.png";
import recentPost2 from "../../assets/shop/product/small/2.png";
import recentPost3 from "../../assets/shop/product/small/3.png";
import footerImg from "../../assets/footer/footer.png";
import Header from "../../components/Header";

// 110 SE 6th Street, Suite 1700, Ft. Lauderdale, Florida 33301
const MAP_SRC =
  "https://www.google.com/maps?q=110+SE+6th+Street,+Suite+1700,+Fort+Lauderdale,+FL+33301&output=embed";

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
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contactus" },
];

const SOCIAL_LINKS = ["Instagram", "Facebook", "YouTube", "Linkedin", "X.Com"];

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
            Address: 110 SE 6th Street,
            <br />
            Suite 1700 Ft. Lauderdale,
            <br />
            Florida . 33301
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
            <strong>Address :</strong> 110 SE 6th Street, Suite 1700, Ft. Lauderdale, Florida 33301
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