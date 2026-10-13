/**
 * ============================================================
 * NAVBAR — Production Ready
 * ============================================================
 *
 * Features:
 * - Logo → home
 * - Role-based nav links
 * - Mobile hamburger menu
 * - Keyboard accessible
 * - Theme toggle (animated)
 * - Profile link (avatar)
 * - Logout
 * ============================================================
 */

import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { useTheme } from "../../context/ThemeContext";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, token } = useSelector((s) => s.auth);

  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    setMobileOpen(false);
    navigate("/login");
  };

  const isClient = user?.role === "client";
  const isFreelancer = user?.role === "freelancer";

  return (
    <nav className="navbar">
      {/* ============== LEFT: LOGO + HAMBURGER ============== */}
      <div className="navbar-left">
        <button
          className="hamburger"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>

        <Link to="/" className="logo">
          <span className="logo-icon">💼</span>
          <span className="logo-text">FreelanceHub</span>
        </Link>
      </div>

      {/* ============== MIDDLE: NAV LINKS ============== */}
      <div className={`nav-links ${mobileOpen ? "open" : ""}`}>
        {token && (
          <>
            <NavLink to="/" end className="nav-link">
              Jobs
            </NavLink>

            {isFreelancer && (
              <>
                <NavLink to="/saved" className="nav-link">
                  Saved
                </NavLink>
                <NavLink to="/applications" className="nav-link">
                  My Applications
                </NavLink>
              </>
            )}

            {isClient && (
              <>
                <NavLink to="/my-jobs" className="nav-link">
                  My Jobs
                </NavLink>
                <NavLink to="/post-job" className="nav-link">
                  Post Job
                </NavLink>
                <NavLink to="/applications" className="nav-link">
                  Applications
                </NavLink>
              </>
            )}
          </>
        )}
      </div>

      {/* ============== RIGHT: ACTIONS ============== */}
      <div className="nav-right">
        {/* Theme toggle */}
        <button
          className="icon-btn theme-toggle-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={
            theme === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
        >
          <span className="theme-icon">{theme === "light" ? "🌙" : "☀️"}</span>
        </button>

        {/* Logged in */}
        {token && user ? (
          <>
            <Link
              to="/profile"
              className="user-avatar"
              title={`${user.name} — View profile`}
              aria-label="View your profile"
            >
              {user.name?.[0]?.toUpperCase() || "?"}
            </Link>

            <span className="user-name">{user.name}</span>

            <button className="btn-ghost logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          /* Guest */
          <>
            <Link to="/login" className="btn-ghost">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* ============== MOBILE OVERLAY ============== */}
      {mobileOpen && (
        <div
          className="navbar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </nav>
  );
};

export default Navbar;
