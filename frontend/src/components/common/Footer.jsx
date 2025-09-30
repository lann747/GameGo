import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaGamepad,
  FaArrowUp,
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer">
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Section */}
            <div className="footer-brand">
              <div className="brand-logo">
                <FaGamepad className="logo-icon" />
                <span className="brand-text">GAMEGO</span>
              </div>
              <p className="brand-tagline">
                Platform terbaik untuk membeli game online. Temukan pengalaman
                gaming terbaik bersama kami.
              </p>
              <div className="social-links">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Facebook"
                >
                  <FaFacebook />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Instagram"
                >
                  <FaInstagram />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Twitter"
                >
                  <FaTwitter />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h3 className="section-title">Tautan Cepat</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/" className="footer-link">
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link to="/games" className="footer-link">
                    Semua Game
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="footer-link">
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="footer-link">
                    Kontak
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="footer-section">
              <h3 className="section-title">Bantuan</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/help" className="footer-link">
                    Pusat Bantuan
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="footer-link">
                    Pengiriman
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="footer-link">
                    Pengembalian
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="footer-link">
                    Kebijakan Privasi
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-section">
              <h3 className="section-title">Kontak</h3>
              <ul className="footer-links">
                <li className="footer-link">Email: support@gamego.com</li>
                <li className="footer-link">Telepon: (021) 1234-5678</li>
                <li className="footer-link">Jam Operasional: 24/7</li>
                <li className="footer-link">Jakarta, Indonesia</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p className="copyright-text">
                &copy; {currentYear}{" "}
                <span className="brand-highlight">GAMEGO</span>. All rights
                reserved.
              </p>
            </div>

            <div className="footer-actions">
              <button
                onClick={scrollToTop}
                className="scroll-top-btn"
                aria-label="Scroll to top"
              >
                <FaArrowUp />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: #1f2937;
          color: #f9fafb;
          margin-top: auto;
        }

        .footer-main {
          padding: 3rem 0 2rem;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 2rem;
        }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2.5rem;
          }
        }

        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
          }
        }

        /* Brand Section */
        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
        }

        .logo-icon {
          color: #dc2626;
          font-size: 1.5rem;
        }

        .brand-text {
          color: #dc2626;
        }

        .brand-tagline {
          line-height: 1.6;
          color: #d1d5db;
          max-width: 300px;
        }

        @media (max-width: 768px) {
          .brand-tagline {
            max-width: none;
          }
        }

        .social-links {
          display: flex;
          gap: 0.75rem;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: #374151;
          color: #f9fafb;
          text-decoration: none;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .social-link:hover {
          background: #dc2626;
          transform: translateY(-2px);
        }

        /* Footer Sections */
        .footer-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          color: white;
          margin: 0;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .footer-link {
          color: #d1d5db;
          text-decoration: none;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .footer-link:hover {
          color: #dc2626;
        }

        /* Footer Bottom */
        .footer-bottom {
          padding: 1.5rem 0;
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid #374151;
        }

        .footer-bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .footer-bottom-content {
            flex-direction: column;
            text-align: center;
          }
        }

        .copyright-text {
          margin: 0;
          color: #9ca3af;
          font-size: 0.85rem;
        }

        .brand-highlight {
          color: #dc2626;
          font-weight: 600;
        }

        .scroll-top-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border: none;
          border-radius: 8px;
          background: #dc2626;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .scroll-top-btn:hover {
          background: #b91c1c;
          transform: translateY(-2px);
        }
      `}</style>
    </footer>
  );
};

export default Footer;
