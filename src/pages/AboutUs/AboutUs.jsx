import { useState } from "react";
import * as Icons from "lucide-react";
import {
  Search,
  Heart,
  ShoppingCart,
  Menu,
  X,
  MapPin,
  Mail,
  ArrowRight,
  Phone,
  ArrowUp,
  Leaf,
} from "lucide-react";
import "./AboutUs.css";
import logoImg from "../../assets/logo.png";
import womenImg from "../../assets/women.jpg";
import founderLogo from "../../assets/logo2.jpg";
import footerImg from "../../assets/footer/footer.png";

import pic3 from "../../assets/pic3.jpg";
import pic4 from "../../assets/pic4.jpg";
import pic5 from "../../assets/pic5.jpg";

const Instagram = Icons.Instagram || Icons.Camera;
const Youtube = Icons.Youtube || Icons.Play;
const Linkedin = Icons.Linkedin || Icons.Briefcase;
const Facebook = Icons.Facebook || Icons.Globe;
const Twitter = Icons.Twitter || Icons.Share2;



const NAV_LINKS = [
  { label: "Home", href: "#" },
  { label: "About Us", href: "#", active: true },
  { label: "Blog", href: "#" },
  { label: "Shop", href: "#" },
];

const SECONDARY_NAV = [
  { label: "Contact US", href: "#" },
];

const CATEGORIES = [
  { name: "Malachite Fusion", desc: "Moringa & Butterfly Pea for deep botanical support." },
  { name: "Jasper Revive", desc: "Colombian Coffee infusion to refresh and hydrate." },
  { name: "Amber Glow", desc: "Manuka Honey & Royal Jelly for ultimate skin food." },
  { name: "Amethyst Relief", desc: "Organic Lavender for a soothing, peaceful aroma." },
  { name: "Obsidian Infusion", desc: "Organic Cacao & Hazelnut for comforting moisture." },
  { name: "Olivine Relief", desc: "Magnesium & Arnica for restorative muscle care." },
];

const RECENT_POSTS = [
  { title: "Hydrated Supple Skin", date: "July 23, 2023", img: "src/assets/shop/product/small/1.png" },
  { title: "Glowing Radiant Skin", date: "July 23, 2023", img: "src/assets/shop/product/small/2.png" },
  { title: "Silky Soft Skin", date: "July 23, 2023", img: "src/assets/shop/product/small/3.png" },
];

const USEFUL_LINKS = ["Home", "About Us", "Returns", "Terms & Conditions", "Privacy Policy", "Contact Us"];

const SOCIALS = [
  { label: "Instagram", icon: Instagram },
  { label: "Facebook", icon: Facebook },
  { label: "YouTube", icon: Youtube },
  { label: "Linkedin", icon: Linkedin },
  { label: "X.Com", icon: Twitter },
];

function Logo() {
  return (
    <a href="#" className="ct-logo" aria-label="Chantallow home">
      <img
        src={logoImg}
        alt="Chantallow"
        style={{
          height: "40px",
          width: "auto",
          objectFit: "contain"
        }}
      />
    </a>
  );
}

export default function AboutUs() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="ct-page">
      

      {/* ============ HEADER ============ */}
      <header className="ct-header">
        <div className="ct-header-row1">
          <Logo />
          <div className="ct-header-right">
            <ul className="ct-nav-main">
              {NAV_LINKS.map((l) => (
                <li key={l.label} className={l.active ? "active" : ""}>
                  <a href={l.href}>{l.label} <span className="ct-nav-plus">+</span></a>
                </li>
              ))}
              <ul className="ct-nav-secondary-under">
                {SECONDARY_NAV.map((l) => (
                  <li key={l.label}><a href={l.href}>{l.label} <span className="ct-nav-plus">+</span></a></li>
                ))}
              </ul>
            </ul>
            <div className="ct-header-actions">
              <a className="login" href="#">Login /<br />Register</a>
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

      {/* ============ HERO ============ */}
      <section className="ct-hero">
        <h1>About Us</h1>
        <div className="ct-breadcrumb">
          <span>Home</span>
          <span>About Us</span>
        </div>
      </section>

      {/* ============ FOUNDER'S VISION ============ */}
      <section className="ct-founder">
        <div className="ct-container ct-founder-grid">
          <div className="ct-founder-photo">
            <img src={womenImg} alt="Chantelle Dieuvil, Chantallow founder" />
          </div>
          <div className="ct-founder-content">
            <h3 className="ct-title-marcellus">Founder&rsquo;s Vision: Illuminating Beauty at Chantallow</h3>
            <p className="ct-founder-text">
              At Chantallow, the vision is simple: true beauty begins with transparency. Our brand was
              born from a passion for cruelty-free, sustainable, and tallow-rich formulas that outperform
              synthetic alternatives. A deep dedication to sourcing the highest quality, grass-finished
              tallow resonates in every jar, providing the essential vitamins and fatty acids your skin
              craves.
            </p>
            <p className="ct-founder-text">
              Chantallow is more than just skincare; it is a commitment to creating a line that is as
              ethical as it is effective. By focusing on simple, powerful, animal-based fats, we are
              helping a new generation rediscover the glow of ancestral skincare&mdash;inspiring confidence
              through visible, natural results.
            </p>
            <div className="ct-founder-avatar">
              <div className="ct-founder-avatar-badge">
                <img
                  src={founderLogo}
                  alt="Founder Badge"
                  style={{
                    width: "48px",
                    height: "48px",
                    objectFit: "contain"
                  }}
                />
              </div>
              <div>
                <div className="ct-founder-name">Chantelle Dieuvil</div>
                <div className="ct-founder-role">Ceo and founder</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ GET IN TOUCH ============ */}
      <section className="ct-cta">
        <div className="ct-cta-text">
          <h3>Questions ?</h3>
          <p>Our experts will help find the gear that’s right for you</p>
        </div>

        <a href="#" className="ct-cta-btn">Get In Touch</a>
      </section>

      {/* ============ ILLUMINATE BEAUTY ============ */}
      <section className="ct-illuminate">
        <div className="ct-container ct-illuminate-grid">
          <div className="ct-illuminate-copy">
            <h2 className="ct-title-marcellus">Illuminate Beauty. Timeless Confidence.</h2>
            <p>
              At Chantallow, we believe in empowering your beauty journey through ancestral wisdom. Our
              curated collection of nutrient-dense, tallow-based products is designed to enhance your
              natural allure, fostering timeless confidence by nourishing your skin at a cellular level.
              Discover the glow within, effortlessly.
            </p>
            <ul className="ct-illuminate-list">
              {CATEGORIES.map((c) => (
                <li key={c.name}>
                  <Leaf size={16} />
                  <span><b>{c.name}</b>: {c.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="ct-collage">
            <div className="ct-collage-main">
  <img src={pic3} alt="Let your real beauty glow with our collection of skin & face products" />
</div>

            <div className="ct-collage-row">
              <div className="ct-collage-small dark">
                <img src={pic4} alt="Skin Care" />
                <div className="tag">
                  <div className="eyebrow">Chantallow</div>
                  <h5>Non-Stop Skincare</h5>
                </div>
              </div>

              <div className="ct-collage-small">
                <img src={pic5} alt="Product" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="site-footer">
            <div className="footer-top container">
              <div>
                <div className="footer-logo">
                  <img src={logoImg} alt="Chantallow" className="footer-logo-img" />
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
                  <div className="footer-post" key={post.title}>
                    <div className="footer-post-thumb">
                      <img src={post.img} alt={post.title} />
                    </div>
                    <div className="footer-post-body">
                      <div className="footer-post-title">{post.title}</div>
                      <div className="footer-post-date">{post.date}</div>
                    </div>
                  </div>
                ))}
              </div>
      
              <div>
                <h5 className="footer-title">Useful Links</h5>
                <div className="footer-links">
                  {USEFUL_LINKS.map((link) => (
                    <a key={link} href="#" className="ctw-underline-link">
                      {link}
                    </a>
                  ))}
                </div>
              </div>
      
              <div>
                <h5 className="footer-title">Social Media</h5>
                <div className="footer-links social">
                  {SOCIALS.map((s) => (
                    <a key={s.label} href="#" className="ctw-underline-link">
                      <s.icon size={15} /> {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
      
            <div className="footer-bottom container">
              <p>
                © 2026 <span className="footer-copyright-brand">Chantallow</span> Theme. All Rights Reserved.
              </p>
              <div className="footer-pay">
                <span>We Accept:</span>
                <img src={footerImg} alt="Accepted payment methods" />
              </div>
            </div>
          </footer>

      <button
        className="ct-scrolltop"
        aria-label="Scroll to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp size={18} />
      </button>
    </div>
  );
}