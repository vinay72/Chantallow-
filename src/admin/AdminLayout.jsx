// src/admin/AdminLayout.jsx
// Shell for every /admin page: top bar + page outlet. Admins only — anyone
// else is sent to /admin/login (signed out) or their account panel (role "user").

import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { homeForRole, useAuth } from '../context/AuthContext';
import './admin.css';

function TopBar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const logOut = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <header className="admin-bar">
      <Link className="wordmark" to="/admin/dashboard">
        <i />
        Chantallow
      </Link>
      <nav>
        <NavLink to="/admin/dashboard">Dashboard</NavLink>
        <NavLink to="/admin/products">Products</NavLink>
        <NavLink to="/admin/users">Users</NavLink>
        <Link to="/">View website</Link>
      </nav>
      <button className="btn btn-outline btn-sm" onClick={logOut}>
        Log out
      </button>
    </header>
  );
}

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

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
    <div className="admin-app">
      <TopBar />
      <main className="wrap">
        <Outlet />
      </main>
    </div>
  );
}
