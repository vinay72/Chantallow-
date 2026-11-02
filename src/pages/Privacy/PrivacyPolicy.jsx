
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import "./PrivacyPolicy.css";

// Footer assets — adjust these paths to match your project's image folder
import logo from "../../assets/logo.png";

 import recentPost1 from "../../assets/shop/product/small/1.png";
import recentPost2 from "../../assets/shop/product/small/2.png";
import recentPost3 from "../../assets/shop/product/small/3.png";
import footerImg from "../../assets/footer/footer.png";
import Header from "../../components/Header";
import { api } from "../../api/client";

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
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "contact-us.html" },
];

const SOCIAL_LINKS = ["Instagram", "Facebook", "YouTube", "Linkedin", "X.Com"];

/* ---------- Sections ---------- */

function Banner({ intro }) {
  return (
    <section className="banner">
      <div className="container">
        <h1>Privacy &amp; Policy</h1>
        <p className="banner-intro">{intro}</p>
      </div>
    </section>
  );
}

function PolicyContent({ body }) {
  return (
    <section className="policy">
      <div className="container">
        <div className="policy-block">
          <p>{body}</p>
        </div>
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
  const [privacy, setPrivacy] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api("/privacy")
      .then((res) => !cancelled && setPrivacy(res.privacy))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page-wrap">
      <Header />
      {privacy ? (
        <>
          <Banner intro={privacy.intro} />
          <PolicyContent body={privacy.body} />
        </>
      ) : (
        <Banner intro="Loading…" />
      )}
      <Footer />
    </div>
  );
}