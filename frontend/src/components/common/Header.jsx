import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import {
  FaShoppingCart,
  FaUser,
  FaGamepad,
  FaBars,
  FaTimes,
  FaHistory,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
  FaTachometerAlt,
} from "react-icons/fa";

const Header = () => {
  const { isLoggedIn, isAdmin, logout, user } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    if (window.confirm("Yakin ingin keluar dari akun?")) {
      logout();
      navigate("/");
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={`header ${isScrolled ? "header-scrolled" : ""}`}>
      <nav className="nav-container">
        {/* Logo */}
        <Link to="/" className="brand">
          <FaGamepad className="brand-icon" />
          <span className="brand-text">GAMEGO</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="desktop-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `nav-link ${
                    isActive ? "nav-link-active" : "nav-link-inactive"
                  }`
                }
              >
                Home
              </NavLink>
            </li>

            {isLoggedIn ? (
              <>
                {/* Admin Dashboard */}
                {isAdmin && (
                  <li className="nav-item">
                    <NavLink
                      to="/admin/dashboard"
                      className={({ isActive }) =>
                        `nav-link ${
                          isActive ? "nav-link-active" : "nav-link-inactive"
                        }`
                      }
                    >
                      <FaTachometerAlt className="link-icon" />
                      Dashboard
                    </NavLink>
                  </li>
                )}

                {/* Cart */}
                <li className="nav-item">
                  <NavLink
                    to="/cart"
                    className={({ isActive }) =>
                      `nav-link ${
                        isActive ? "nav-link-active" : "nav-link-inactive"
                      }`
                    }
                  >
                    <FaShoppingCart className="link-icon" />
                    Keranjang
                    {itemCount > 0 && (
                      <span className="cart-badge">
                        {itemCount > 99 ? "99+" : itemCount}
                      </span>
                    )}
                  </NavLink>
                </li>

                {/* Order History */}
                <li className="nav-item">
                  <NavLink
                    to="/orders"
                    className={({ isActive }) =>
                      `nav-link ${
                        isActive ? "nav-link-active" : "nav-link-inactive"
                      }`
                    }
                  >
                    <FaHistory className="link-icon" />
                    Riwayat
                  </NavLink>
                </li>

                {/* User Menu */}
                <li className="nav-item user-menu">
                  <button onClick={handleLogout} className="logout-btn">
                    <FaSignOutAlt className="btn-icon" />
                    Keluar
                  </button>
                </li>
              </>
            ) : (
              <>
                {/* Login */}
                <li className="nav-item">
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `nav-link ${
                        isActive ? "nav-link-active" : "nav-link-inactive"
                      }`
                    }
                  >
                    <FaSignInAlt className="link-icon" />
                    Masuk
                  </NavLink>
                </li>

                {/* Register */}
                <li className="nav-item">
                  <NavLink to="/register" className="register-btn">
                    <FaUserPlus className="btn-icon" />
                    Daftar
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Mobile Navigation */}
        <div
          className={`mobile-nav ${isMobileMenuOpen ? "mobile-nav-open" : ""}`}
        >
          <div className="mobile-nav-content">
            <ul className="mobile-nav-list">
              <li className="mobile-nav-item">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `nav-link ${
                      isActive ? "nav-link-active" : "nav-link-inactive"
                    }`
                  }
                >
                  <span>Home</span>
                </NavLink>
              </li>

              {isLoggedIn ? (
                <>
                  {/* Admin Dashboard */}
                  {isAdmin && (
                    <li className="mobile-nav-item">
                      <NavLink
                        to="/admin/dashboard"
                        className={({ isActive }) =>
                          `nav-link ${
                            isActive ? "nav-link-active" : "nav-link-inactive"
                          }`
                        }
                      >
                        <FaTachometerAlt className="link-icon" />
                        <span>Dashboard</span>
                      </NavLink>
                    </li>
                  )}

                  {/* Cart */}
                  <li className="mobile-nav-item">
                    <NavLink
                      to="/cart"
                      className={({ isActive }) =>
                        `nav-link ${
                          isActive ? "nav-link-active" : "nav-link-inactive"
                        }`
                      }
                    >
                      <FaShoppingCart className="link-icon" />
                      <span>Keranjang</span>
                      {itemCount > 0 && (
                        <span className="cart-badge">
                          {itemCount > 99 ? "99+" : itemCount}
                        </span>
                      )}
                    </NavLink>
                  </li>

                  {/* Order History */}
                  <li className="mobile-nav-item">
                    <NavLink
                      to="/orders"
                      className={({ isActive }) =>
                        `nav-link ${
                          isActive ? "nav-link-active" : "nav-link-inactive"
                        }`
                      }
                    >
                      <FaHistory className="link-icon" />
                      <span>Riwayat</span>
                    </NavLink>
                  </li>

                  {/* Logout */}
                  <li className="mobile-nav-item">
                    <button
                      onClick={handleLogout}
                      className="logout-btn-mobile"
                    >
                      <FaSignOutAlt className="btn-icon" />
                      <span>Keluar</span>
                    </button>
                  </li>
                </>
              ) : (
                <>
                  {/* Login */}
                  <li className="mobile-nav-item">
                    <NavLink
                      to="/login"
                      className={({ isActive }) =>
                        `nav-link ${
                          isActive ? "nav-link-active" : "nav-link-inactive"
                        }`
                      }
                    >
                      <FaSignInAlt className="link-icon" />
                      <span>Masuk</span>
                    </NavLink>
                  </li>

                  {/* Register */}
                  <li className="mobile-nav-item">
                    <NavLink to="/register" className="register-btn-mobile">
                      <FaUserPlus className="btn-icon" />
                      <span>Daftar</span>
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="mobile-nav-overlay" onClick={toggleMobileMenu} />
        )}
      </nav>

      <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .header-scrolled {
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
        }

        /* Brand Logo */
        .brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          text-decoration: none;
        }

        .brand:hover {
          transform: translateY(-1px);
        }

        .brand-icon {
          color: #dc2626;
          font-size: 1.5rem;
        }

        .brand-text {
          color: #dc2626;
        }

        /* Desktop Navigation */
        .desktop-nav {
          display: flex;
          align-items: center;
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }
        }

        .nav-list {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        body {
          padding-top: 80px; /* kompensasi tinggi header */
        }

        .nav-item {
          display: flex;
          align-items: center;
        }

        /* Nav Links */
        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          border-radius: 6px;
          transition: all 0.3s ease;
          position: relative;
        }

        .nav-link-inactive {
          color: #6b7280;
          background: transparent;
        }

        .nav-link-active {
          color: #dc2626;
          background: rgba(220, 38, 38, 0.1);
        }

        .nav-link:hover {
          color: #dc2626;
          background: rgba(220, 38, 38, 0.1);
        }

        .link-icon {
          font-size: 0.9rem;
        }

        /* Register Button */
        .register-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #dc2626;
          color: white;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .register-btn:hover {
          background: #b91c1c;
        }

        /* Cart Badge */
        .cart-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #dc2626;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 600;
        }

        /* User Menu */
        .user-menu {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-left: 1rem;
          padding-left: 1rem;
          border-left: 1px solid #e5e7eb;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-weight: 500;
        }

        .user-icon {
          color: #dc2626;
        }

        .user-name {
          font-size: 0.85rem;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid #dc2626;
          border-radius: 6px;
          color: #dc2626;
          font-weight: 500;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: #dc2626;
          color: white;
        }

        .btn-icon {
          font-size: 0.8rem;
        }

        /* Mobile Menu Button */
        .mobile-menu-btn {
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: transparent;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex;
          }
        }

        .mobile-menu-btn:hover {
          border-color: #dc2626;
          color: #dc2626;
        }

        /* Mobile Navigation */
        .mobile-nav {
          position: fixed;
          top: 70px;
          right: -100%;
          width: 280px;
          height: calc(100vh - 70px);
          background: white;
          box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
          transition: right 0.3s ease;
          z-index: 999;
          border-left: 1px solid #e5e7eb;
        }

        .mobile-nav-open {
          right: 0;
        }

        .mobile-nav-content {
          padding: 1.5rem;
          height: 100%;
          overflow-y: auto;
        }

        .mobile-nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-nav-item {
          border-bottom: 1px solid #f3f4f6;
        }

        .mobile-nav-item:last-child {
          border-bottom: none;
        }

        .mobile-nav-item a,
        .mobile-nav-item button {
          display: flex;
          align-items: center;
          gap: 1rem;
          width: 100%;
          padding: 1rem;
          text-decoration: none;
          background: none;
          border: none;
          font-size: 0.95rem;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.3s ease;
          border-radius: 6px;
          cursor: pointer;
        }

        .mobile-nav-item a:hover,
        .mobile-nav-item button:hover {
          background: #f9fafb;
          color: #dc2626;
        }

        .mobile-nav-item .nav-link-active {
          background: rgba(220, 38, 38, 0.1);
          color: #dc2626;
        }

        .user-info-mobile {
          background: #f9fafb;
          border-radius: 6px;
          margin: 1rem 0;
          border: none !important;
        }

        .user-details {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          color: #6b7280;
        }

        .user-email {
          font-size: 0.8rem;
          color: #9ca3af;
          margin-top: 0.25rem;
        }

        .logout-btn-mobile {
          color: #dc2626 !important;
          justify-content: flex-start;
        }

        .logout-btn-mobile:hover {
          background: #fef2f2 !important;
        }

        .register-btn-mobile {
          background: #dc2626 !important;
          color: white !important;
          margin-top: 1rem;
          justify-content: flex-start;
        }

        .register-btn-mobile:hover {
          background: #b91c1c !important;
        }

        /* Mobile Menu Overlay */
        .mobile-nav-overlay {
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
          z-index: 998;
        }

        @media (max-width: 480px) {
          .nav-container {
            padding: 0 15px;
            height: 60px;
          }

          .brand {
            font-size: 1.1rem;
          }

          .mobile-nav {
            top: 60px;
            height: calc(100vh - 60px);
            width: 100%;
          }

          .mobile-nav-overlay {
            top: 60px;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
