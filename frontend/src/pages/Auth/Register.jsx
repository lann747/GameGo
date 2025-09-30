import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../api/authApi";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserPlus,
  FaSignInAlt,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [feedback, setFeedback] = useState({ error: "", success: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();
  const usernameRef = useRef(null);

  useEffect(() => {
    if (usernameRef.current) usernameRef.current.focus();
  }, []);

  useEffect(() => {
    const strength = calculatePasswordStrength(formData.password);
    setPasswordStrength(strength);
  }, [formData.password]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return Math.min(strength, 5);
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength === 0) return "#e5e7eb";
    if (strength <= 2) return "#ef4444";
    if (strength <= 3) return "#f59e0b";
    if (strength <= 4) return "#10b981";
    return "#059669";
  };

  const getPasswordStrengthText = (strength) => {
    if (strength === 0) return "";
    if (strength <= 2) return "Lemah";
    if (strength <= 3) return "Cukup";
    if (strength <= 4) return "Baik";
    return "Kuat";
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) return "Username wajib diisi.";
    if (formData.username.length < 3) return "Username minimal 3 karakter.";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return "Format email tidak valid.";
    if (formData.password.length < 6)
      return "Password minimal harus 6 karakter.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ error: "", success: "" });

    const validationError = validateForm();
    if (validationError) {
      setFeedback({ error: validationError, success: "" });
      return;
    }

    setLoading(true);
    try {
      await registerUser(formData.username, formData.email, formData.password);
      setFeedback({
        success: "Pendaftaran berhasil! Mengarahkan ke login...",
        error: "",
      });

      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      console.error("Registration Error:", err);
      setFeedback({
        success: "",
        error:
          err.message || "Pendaftaran gagal. Email mungkin sudah terpakai.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Left Side - Form */}
        <div className="register-form-container">
          <div className="register-form-card">
            <div className="form-header">
              <h2>Buat Akun Baru</h2>
              <p>Bergabunglah dengan komunitas gaming kami</p>
            </div>

            {/* Alert Feedback */}
            {feedback.success && (
              <div className="alert success">
                <FaCheckCircle />
                <div>
                  <strong>Sukses!</strong> {feedback.success}
                </div>
              </div>
            )}

            {feedback.error && (
              <div className="alert error">
                <FaExclamationTriangle />
                <div>
                  <strong>Error:</strong> {feedback.error}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form">
              {/* Username Field */}
              <div className="input-group">
                <label>Username</label>
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    name="username"
                    ref={usernameRef}
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="pilih username"
                    minLength={3}
                  />
                </div>
                {formData.username && formData.username.length < 3 && (
                  <div className="input-hint">
                    Username harus minimal 3 karakter
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div className="input-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="email@contoh.com"
                  />
                </div>
                {formData.email && !/\S+@\S+\.\S+/.test(formData.email) && (
                  <div className="input-hint error">
                    Format email tidak valid
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="input-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    disabled={loading}
                    placeholder="buat password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={loading}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Password Strength */}
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-meter">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className="strength-segment"
                          style={{
                            backgroundColor:
                              level <= passwordStrength
                                ? getPasswordStrengthColor(passwordStrength)
                                : "#e5e7eb",
                          }}
                        />
                      ))}
                    </div>
                    <div className="strength-text">
                      Kekuatan:{" "}
                      <span
                        style={{
                          color: getPasswordStrengthColor(passwordStrength),
                        }}
                      >
                        {getPasswordStrengthText(passwordStrength)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Password Hints */}
                <div className="password-hints">
                  <div
                    className={`hint ${
                      formData.password.length >= 6 ? "valid" : ""
                    }`}
                  >
                    <FaCheckCircle />
                    Minimal 6 karakter
                  </div>
                  <div
                    className={`hint ${
                      formData.password.length >= 8 ? "valid" : ""
                    }`}
                  >
                    <FaCheckCircle />
                    Minimal 8 karakter (disarankan)
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="terms-group">
                <label className="checkbox">
                  <input type="checkbox" required />
                  <span className="checkmark"></span>
                  Saya menyetujui{" "}
                  <Link to="/terms" className="link">
                    Syarat & Ketentuan
                  </Link>{" "}
                  dan{" "}
                  <Link to="/privacy" className="link">
                    Kebijakan Privasi
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={loading ? "btn primary loading" : "btn primary"}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spinner" />
                    Membuat Akun...
                  </>
                ) : (
                  <>
                    <FaUserPlus />
                    Daftar
                  </>
                )}
              </button>

              {/* Login Link */}
              <div className="login-section">
                <p>
                  Sudah punya akun?
                  <Link to="/login" className="link">
                    <FaSignInAlt />
                    Masuk
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Benefits */}
        <div className="register-benefits">
          <div className="benefits-content">
            <h1>Bergabung dengan GameGoo</h1>
            <p>Dapatkan akses ke dunia gaming terbaik</p>

            <div className="benefits-list">
              <div className="benefit">
                <div className="benefit-icon">🎮</div>
                <div>
                  <h3>Katalog Game Lengkap</h3>
                  <p>Akses ribuan game dari berbagai genre</p>
                </div>
              </div>

              <div className="benefit">
                <div className="benefit-icon">💰</div>
                <div>
                  <h3>Harga Terbaik</h3>
                  <p>Penawaran eksklusif dan diskon spesial</p>
                </div>
              </div>

              <div className="benefit">
                <div className="benefit-icon">⚡</div>
                <div>
                  <h3>Download Instan</h3>
                  <p>Akses langsung setelah pembelian</p>
                </div>
              </div>

              <div className="benefit">
                <div className="benefit-icon">🛡️</div>
                <div>
                  <h3>Transaksi Aman</h3>
                  <p>Sistem pembayaran terenkripsi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .register-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
          padding: 20px;
        }

        .register-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1200px;
          width: 100%;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        /* Form Section */
        .register-form-container {
          padding: 40px;
        }

        .register-form-card {
          max-width: 400px;
          margin: 0 auto;
        }

        .form-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .form-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .form-header p {
          color: #666;
          margin: 0;
        }

        /* Alerts */
        .alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .alert.success {
          background: #f0f9f0;
          border: 1px solid #4caf50;
          color: #2e7d32;
        }

        .alert.error {
          background: #fee;
          border: 1px solid #fcc;
          color: #c33;
        }

        /* Form Styles */
        .register-form {
          margin-bottom: 20px;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #333;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: #666;
          font-size: 16px;
        }

        .input-wrapper input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .input-wrapper input:focus {
          outline: none;
          border-color: #dc2626;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          font-size: 16px;
          padding: 0;
        }

        .password-toggle:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .input-hint {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }

        .input-hint.error {
          color: #dc2626;
        }

        /* Password Strength */
        .password-strength {
          margin-top: 10px;
        }

        .strength-meter {
          display: flex;
          gap: 2px;
          margin-bottom: 6px;
        }

        .strength-segment {
          flex: 1;
          height: 4px;
          border-radius: 2px;
          transition: background-color 0.3s;
        }

        .strength-text {
          font-size: 12px;
          color: #666;
        }

        .strength-text span {
          font-weight: 600;
        }

        /* Password Hints */
        .password-hints {
          margin-top: 10px;
        }

        .hint {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #999;
          margin-bottom: 4px;
        }

        .hint.valid {
          color: #10b981;
        }

        .hint svg {
          font-size: 10px;
        }

        /* Terms and Conditions */
        .terms-group {
          margin: 25px 0;
        }

        .checkbox {
          display: flex;
          align-items: center;
          cursor: pointer;
          font-size: 14px;
          color: #666;
        }

        .checkbox input {
          display: none;
        }

        .checkmark {
          width: 18px;
          height: 18px;
          border: 2px solid #ddd;
          border-radius: 3px;
          margin-right: 8px;
          position: relative;
          transition: all 0.2s;
        }

        .checkbox input:checked + .checkmark {
          background: #dc2626;
          border-color: #dc2626;
        }

        .checkbox input:checked + .checkmark:after {
          content: "";
          position: absolute;
          left: 4px;
          top: 1px;
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .link {
          color: #dc2626;
          text-decoration: none;
          font-weight: 500;
        }

        .link:hover {
          text-decoration: underline;
        }

        /* Buttons */
        .btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn.primary {
          background: #dc2626;
          color: white;
        }

        .btn.primary:hover:not(:disabled) {
          background: #b91c1c;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn.loading {
          opacity: 0.8;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Login Section */
        .login-section {
          text-align: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }

        .login-section p {
          color: #666;
          margin: 0;
        }

        .login-section .link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-left: 8px;
        }

        /* Benefits Section */
        .register-benefits {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: white;
          padding: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .benefits-content {
          max-width: 400px;
        }

        .benefits-content h1 {
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .benefits-content > p {
          opacity: 0.9;
          margin-bottom: 30px;
        }

        .benefits-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .benefit {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }

        .benefit-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .benefit h3 {
          margin: 0 0 5px 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .benefit p {
          margin: 0;
          opacity: 0.8;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .register-container {
            grid-template-columns: 1fr;
          }

          .register-form-container {
            padding: 30px 20px;
          }

          .register-benefits {
            padding: 30px 20px;
          }

          .benefits-content h1 {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .register-page {
            padding: 10px;
          }

          .register-form-container {
            padding: 20px 15px;
          }

          .register-benefits {
            padding: 20px 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;
