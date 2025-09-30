import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { loginUser } from "../../api/authApi";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaUserPlus,
  FaSpinner,
} from "react-icons/fa";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState({ error: "", success: "" });
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ error: "", success: "" });
    setLoading(true);

    try {
      const userData = await loginUser(formData.email, formData.password);
      login(userData);

      setFeedback({
        error: "",
        success: "Login berhasil! Mengarahkan...",
      });

      setTimeout(() => {
        navigate(userData.role === "admin" ? "/admin/dashboard" : "/", {
          replace: true,
        });
      }, 1500);
    } catch (err) {
      console.error("Login Error:", err);
      setFeedback({
        success: "",
        error: err.message || "Email atau password salah. Silakan coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Brand */}
        <div className="login-brand">
          <div className="brand-content">
            <h1 className="brand-title">Selamat Datang Kembali</h1>
            <p className="brand-subtitle">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-container">
          <div className="login-form-card">
            <div className="form-header">
              <h2>Masuk ke Akun</h2>
              <p>Masukkan kredensial Anda</p>
            </div>

            {/* Alert Feedback */}
            {feedback.success && (
              <div className="alert success">
                <strong>Sukses!</strong> {feedback.success}
              </div>
            )}

            {feedback.error && (
              <div className="alert error">
                <strong>Error:</strong> {feedback.error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
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
                    placeholder="masukkan password"
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
              </div>

              {/* Form Options */}
              <div className="form-options">
                <label className="checkbox">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Ingat Saya
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Lupa Password?
                </Link>
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
                    Memproses...
                  </>
                ) : (
                  <>
                    <FaSignInAlt />
                    Masuk
                  </>
                )}
              </button>

              {/* Register Link */}
              <div className="register-section">
                <p>
                  Belum punya akun?
                  <Link to="/register" className="register-link">
                    <FaUserPlus />
                    Daftar
                  </Link>
                </p>
              </div>
            </form>

            {/* Demo Accounts */}
            <div className="demo-accounts">
              <h4>Akun Demo</h4>
              <div className="demo-list">
                <div className="demo-item">
                  <strong>Admin:</strong> admin@gamegoo.com / password
                </div>
                <div className="demo-item">
                  <strong>User:</strong> user@gamegoo.com / password
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
          padding: 20px;
        }

        .login-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1000px;
          width: 100%;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        /* Brand Section */
        .login-brand {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: white;
          padding: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-content {
          text-align: center;
        }

        .brand-title {
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .brand-subtitle {
          opacity: 0.9;
          font-size: 1.1rem;
        }

        /* Form Section */
        .login-form-container {
          padding: 40px;
        }

        .login-form-card {
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
        .login-form {
          margin-bottom: 30px;
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

        /* Form Options */
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          font-size: 14px;
        }

        .checkbox {
          display: flex;
          align-items: center;
          cursor: pointer;
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

        .forgot-link {
          color: #dc2626;
          text-decoration: none;
          font-weight: 500;
        }

        .forgot-link:hover {
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

        /* Register Section */
        .register-section {
          text-align: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }

        .register-section p {
          color: #666;
          margin: 0;
        }

        .register-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-left: 8px;
          color: #dc2626;
          text-decoration: none;
          font-weight: 500;
        }

        .register-link:hover {
          text-decoration: underline;
        }

        /* Demo Accounts */
        .demo-accounts {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 4px;
          border: 1px solid #eee;
        }

        .demo-accounts h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .demo-list {
          font-size: 13px;
        }

        .demo-item {
          margin-bottom: 8px;
          color: #666;
        }

        .demo-item strong {
          color: #333;
          margin-right: 6px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .login-container {
            grid-template-columns: 1fr;
          }

          .login-brand {
            padding: 30px 20px;
          }

          .brand-title {
            font-size: 1.5rem;
          }

          .login-form-container {
            padding: 30px 20px;
          }

          .form-options {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .login-page {
            padding: 10px;
          }

          .brand-title {
            font-size: 1.3rem;
          }

          .login-form-container {
            padding: 20px 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
