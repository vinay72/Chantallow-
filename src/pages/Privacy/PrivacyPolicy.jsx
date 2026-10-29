
import { ArrowRight } from "lucide-react";
import "./PrivacyPolicy.css";

// Footer assets — adjust these paths to match your project's image folder
import logo from "../../assets/logo.png";

 import recentPost1 from "../../assets/shop/product/small/1.png";
import recentPost2 from "../../assets/shop/product/small/2.png";
import recentPost3 from "../../assets/shop/product/small/3.png";
import footerImg from "../../assets/footer/footer.png";
import Header from "../../components/Header";

// All of these are joined into one large paragraph on the page (titles are kept here only for reference).
const POLICY_SECTIONS = [
  {
    title: "1. Information We Collect",
    text:
      "We may collect your name, email address, phone number, shipping and billing address, and payment details (processed securely through third-party payment providers), along with website usage data gathered through cookies and analytics tools.",
  },
  {
    title: "2. How We Use Your Information",
    text:
      "Your information may be used to communicate order updates and provide customer support, to improve website functionality and the overall customer experience, and to send promotional offers or newsletters (only if you have subscribed).",
  },
  {
    title: "3. Data Protection",
    text:
      "We implement reasonable security measures to protect your personal information. Payment information is processed securely and is not stored on our servers.",
  },
  {
    title: "4. Cookies",
    text:
      "Our website may use cookies to enhance user experience, analyze traffic, and improve website performance. You may disable cookies through your browser settings.",
  },
  {
    title: "5. Third-Party Services",
    text:
      "We may share necessary information with trusted third-party partners such as payment gateways, courier services, and analytics providers solely for order fulfillment and website operations.",
  },
  {
    title: "6. Your Rights",
    text:
      "You may request access, correction, or deletion of your personal data by contacting us at [your email].",
  },
  {
    title: "7. Updates to Policy",
    text:
      "We reserve the right to update this Privacy Policy at any time. Changes will be reflected on this page.",
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

/* ---------- Sections ---------- */

function Banner() {
  return (
    <section className="banner">
      <div className="container">
        <h1>Privacy &amp; Policy</h1>
        <p className="banner-intro">
          At Chantallow, your privacy is important to us. This Privacy Policy
          explains how we collect, use, and protect your information.
        </p>
      </div>
    </section>
  );
}

function PolicyContent() {
  return (
    <section className="policy">
      <div className="container">
        {/* All sections written as one large paragraph (no numbered headings) */}
        <div className="policy-block">
          <p>{POLICY_SECTIONS.map((s) => s.text).join(" ")}</p>
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
  return (
    <div className="page-wrap">
      <Header />
      <Banner />
      <PolicyContent />
      <Footer />
    </div>
  );
}