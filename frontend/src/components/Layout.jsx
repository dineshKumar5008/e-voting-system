import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchCsrfToken } from "../api/client.js";

const Layout = ({ children, user, onLogout, loading }) => {
  const location = useLocation();

  useEffect(() => {
    fetchCsrfToken().catch(() => {});
  }, []);

  return (
    <div className="app-root">
      <div className="background-blur" />
      <header className="app-header glass-card">
        <div className="brand">
          <span className="brand-logo">🗳️</span>
          <span className="brand-title">Secure E-Voting</span>
        </div>
        <nav className="nav-links">
          {user && (
            <>
              <Link
                to="/dashboard"
                className={location.pathname === "/dashboard" ? "active" : ""}
              >
                Dashboard
              </Link>
              <Link
                to="/vote"
                className={location.pathname === "/vote" ? "active" : ""}
              >
                Vote
              </Link>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className={location.pathname === "/admin" ? "active" : ""}
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>
        <div className="user-section">
          {user ? (
            <>
              <span className="user-name">{user.name}</span>
              <button
                className="btn-secondary"
                onClick={onLogout}
                disabled={loading}
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </header>
      <main className="app-main">
        <div className="glass-card content-card">{children}</div>
      </main>
      <footer className="app-footer">
        <span>Blockchain-backed integrity • Bot-aware voting • OWASP-conscious</span>
      </footer>
    </div>
  );
};

export default Layout;


