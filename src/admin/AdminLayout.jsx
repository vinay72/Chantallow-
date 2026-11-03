// src/admin/AdminLayout.jsx
// Shell for every /admin page: left sidebar, top bar with Log out, and the
// page outlet. Admins only — anyone else is sent to /admin/login (signed out)
// or their account panel (role "user").
// Below 900px the sidebar slides in from the left via the menu button.

import { useEffect, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ExternalLink, FileText, HelpCircle, House, Info, LayoutDashboard, LogOut, Menu, Newspaper, Package, ShieldCheck, Star, ShoppingCart, Undo2, Users, X } from 'lucide-react';
import { homeForRole, useAuth } from '../context/AuthContext';
import './admin.css';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  {
    to: '/admin/home',
    label: 'Home',
    Icon: House,
    children: [
      { to: '/admin/home/launches', label: 'New Launches' },
      { to: '/admin/home/bridge', label: 'We Bridge The Gap' },
      { to: '/admin/home/combos', label: 'Combo Products' },
      { to: '/admin/home/best-sellers', label: 'Best Sellers' },
      { to: '/admin/home/featured', label: 'Nourish Your Skin' },
      { to: '/admin/home/tattoo', label: 'Pure Care for Every Tattoo' },
      { to: '/admin/home/furkind', label: 'Furkind Pet Tallow' },
      { to: '/admin/home/offers', label: 'Featured Offer For You' },
      { to: '/admin/home/shortlist', label: 'Soothe Sore Muscles' },
    ],
  },
  { to: '/admin/about', label: 'About Us', Icon: Info },
  { to: '/admin/products', label: 'Products', Icon: Package },
  { to: '/admin/blog', label: 'Blog', Icon: Newspaper },
  { to: '/admin/reviews', label: 'Reviews', Icon: Star },
  { to: '/admin/home/faqs', label: 'FAQs', Icon: HelpCircle },
  { to: '/admin/terms', label: 'Terms & Conditions', Icon: FileText },
  { to: '/admin/privacy', label: 'Privacy Policy', Icon: ShieldCheck },
  { to: '/admin/orders', label: 'Orders', Icon: ShoppingCart },
  { to: '/admin/returns', label: 'Returns', Icon: Undo2 },
  { to: '/admin/users', label: 'Users', Icon: Users },
];

// A sidebar entry with a sub-menu; open while one of its pages is showing.
function NavGroup({ item, onNavigate }) {
  const { pathname } = useLocation();
  const inside = pathname.startsWith(item.to);
  const [open, setOpen] = useState(inside);
  useEffect(() => {
    if (inside) setOpen(true);
  }, [inside]);

  const { Icon } = item;
  const id = `side-group-${item.label.toLowerCase()}`;
  return (
    <div className={inside ? 'side-group is-inside' : 'side-group'}>
      <button type="button" className="side-group-btn" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
        <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
        {item.label}
        <ChevronDown size={17} className={open ? 'chev is-open' : 'chev'} aria-hidden="true" />
      </button>
      {open && (
        <div id={id} className="side-sub">
          {item.children.map((c) => (
            <NavLink key={c.to} to={c.to} onClick={onNavigate}>
              {c.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function Sidebar({ open, onClose }) {
  return (
    <aside id="admin-side" className={open ? 'admin-side is-open' : 'admin-side'} aria-label="Admin menu">
      <div className="side-brand">
        <Link to="/admin/dashboard" className="wordmark" onClick={onClose}>
          Chantallow
        </Link>
        <button type="button" className="side-close" aria-label="Close menu" onClick={onClose}>
          <X size={22} />
        </button>
      </div>
      <nav className="side-nav">
        {NAV.map((item) =>
          item.children ? (
            <NavGroup key={item.to} item={item} onNavigate={onClose} />
          ) : (
            <NavLink key={item.to} to={item.to} onClick={onClose}>
              <item.Icon size={19} strokeWidth={1.8} aria-hidden="true" />
              {item.label}
            </NavLink>
          )
        )}
        <Link to="/" className="side-site">
          <ExternalLink size={19} strokeWidth={1.8} aria-hidden="true" />
          View website
        </Link>
      </nav>
    </aside>
  );
}

function TopBar({ onMenu, menuOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const logOut = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <header className="admin-top">
      <button
        type="button"
        className="menu-btn"
        aria-label="Open menu"
        aria-controls="admin-side"
        aria-expanded={menuOpen}
        onClick={onMenu}
      >
        <Menu size={22} />
      </button>
      <span className="top-user">{user?.name}</span>
      <button type="button" className="logout-btn" onClick={logOut}>
        <LogOut size={17} aria-hidden="true" />
        Logout
      </button>
    </header>
  );
}

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Escape closes the slide-in menu on small screens
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  if (loading) {
    return (
      <div className="admin-app">
        <main className="wrap">
          <div className="empty-state">Loading…</div>
        </main>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />;
  }
  if (user.role !== 'admin') {
    return <Navigate to={homeForRole(user.role)} replace />;
  }

  return (
    <div className="admin-app admin-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && <div className="side-backdrop" onClick={() => setMenuOpen(false)} />}
      <div className="admin-main">
        <TopBar onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />
        <main className="wrap">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
