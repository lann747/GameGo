import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Wrapper untuk membatasi akses berdasarkan login & role.
 * Menangani loading, login, dan pengecekan role.
 */
const ProtectedRoute = ({ requiredRole }) => {
  const { isLoggedIn, user, loading } = useAuth();

  // 1️⃣ Loading state
  if (loading) {
    return (
      <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
        <div className="spinner-border text-info me-2" role="status"></div>
        <span className="fw-semibold text-muted">Memeriksa akses...</span>
      </div>
    );
  }

  // 2️⃣ Belum login → redirect ke login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 3️⃣ Cek role jika disyaratkan
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];

    if (!allowedRoles.includes(user?.role)) {
      // Admin salah akses → redirect ke dashboard admin
      if (user?.role === "admin")
        return <Navigate to="/admin/dashboard" replace />;
      // User biasa salah akses → redirect ke home
      return <Navigate to="/" replace />;
    }
  }

  // 4️⃣ Akses diperbolehkan → render child routes
  return <Outlet />;
};

export default ProtectedRoute;
