import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Account.css";
import accountBanner from "../../assets/background/bg1.jpg";
import SiteFooter from "../../components/SiteFooter";
import { useAuth } from "../../context/AuthContext";
import { DEMO_EMAIL, saveProfile, useAccount } from "../../data/account";
import Header from "../../components/Header";

/**
 * Shared shell for every "My Account" (User Panel) page:
 * header, banner + breadcrumb, the left account sidebar and the footer.
 *
 *   <AccountLayout crumb="Account Orders"> ...page content... </AccountLayout>
 */

const ORDER_LINKS = [
  { label: "Orders", to: "/account/orders" },
  { label: "Downloads", to: "/account/downloads" },
  { label: "Return request", to: "/account/return-request" },
];

const SETTINGS_LINKS = [
  { label: "Profile", to: "/account/profile" },
  { label: "Address", to: "/account/address" },
  { label: "Payment Methods", to: "/account/payment-methods" },
  { label: "Review", to: "/account/review" },
];

/* ---------------- Icons ---------------- */
export const Sparkle = () => (
  <svg className="ua-sparkle" width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
    <path d="M6 0c.35 3.05 2.95 5.65 6 6-3.05.35-5.65 2.95-6 6-.35-3.05-2.95-5.65-6-6 3.05-.35 5.65-2.95 6-6Z" fill="currentColor" />
  </svg>
);

/* ---------------- Avatar ---------------- */
export function Avatar({ profile, size = 96 }) {
  const initials =
    `${(profile.firstName || "").trim()[0] || ""}${(profile.lastName || "").trim()[0] || ""}`.toUpperCase() || "U";
  return (
    <div className="ua-avatar" style={{ width: size, height: size }}>
      {profile.avatar ? <img src={profile.avatar} alt={`${profile.firstName} ${profile.lastName}`.trim()} /> : <span>{initials}</span>}
    </div>
  );
}

/* ---------------- Layout ---------------- */
export default function AccountLayout({ crumb, children }) {
  const { profile } = useAccount();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // First visit: replace the demo name/email with the signed-in user's
  useEffect(() => {
    if (!user || profile.email !== DEMO_EMAIL) return;
    const [firstName = "", ...rest] = (user.name || "").trim().split(/\s+/);
    saveProfile({ firstName: firstName || profile.firstName, lastName: rest.join(" "), email: user.email });
  }, [user, profile.email, profile.firstName]);

  const onLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  // close the mobile account menu + jump to top when the page changes
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Username";
  const linkClass = ({ isActive }) => (isActive ? "is-active" : undefined);

  return (
    <div className="ua-page">
      <Header />

      {/* ---------------- Banner ---------------- */}
      <div className="ua-banner" style={{ "--ua-banner-img": `url(${accountBanner})` }}>
        <div className="ua-banner__inner">
          <h1>My Account</h1>
          <nav className="ua-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="ua-breadcrumb__sep">◆</span>
            <span aria-current="page">{crumb}</span>
          </nav>
        </div>
      </div>

      {/* ---------------- Content ---------------- */}
      <div className="ua-content">
        <div className="ua-grid">
          <aside className="ua-aside">
            <div className="ua-toggle-info">
              <h5>Account Navbar</h5>
              <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen}>
                {menuOpen ? "Close Menu" : "Account Menu"}
              </button>
            </div>

            <div className={`ua-sidebar${menuOpen ? " is-open" : ""}`}>
              <div className="ua-profile-head">
                <Avatar profile={profile} />
                <h5>{fullName}</h5>
                <span>{profile.email}</span>
              </div>

              <div className="ua-nav-title">Orders Details</div>
              <ul className="ua-side-links">
                {ORDER_LINKS.map((l) => (
                  <li key={l.to}>
                    <NavLink to={l.to} className={linkClass}>
                      {l.label}
                    </NavLink>
                  </li>
                ))}
              </ul>

              <div className="ua-nav-title">ACCOUNT SETTINGS</div>
              <ul className="ua-side-links">
                {SETTINGS_LINKS.map((l) => (
                  <li key={l.to}>
                    <NavLink to={l.to} className={linkClass}>
                      {l.label}
                    </NavLink>
                  </li>
                ))}
                <li>
                  <button type="button" className="ua-logout" onClick={onLogout}>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </aside>

          <section className="ua-main">{children}</section>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

/* ---------------- Small shared bits ---------------- */
export function StatusBadge({ status, statuses }) {
  const s = statuses[status] || { label: status, color: "#6b6f6c" };
  return (
    <span className="ua-status" style={{ background: s.color }}>
      {s.label}
    </span>
  );
}

export function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  return (
    <nav className="ua-pagination" aria-label="Table pagination">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1}>
        Prev
      </button>
      {pages.map((n) => (
        <button key={n} type="button" className={n === page ? "is-active" : undefined} onClick={() => onChange(n)} aria-current={n === page ? "page" : undefined}>
          {n}
        </button>
      ))}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page === pageCount}>
        Next
      </button>
    </nav>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="ua-empty">
      <h4>{title}</h4>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}
