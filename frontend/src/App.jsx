import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

// Komponen Layout
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Halaman Statis (dimuat di awal)
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Home from "./pages/User/Home";
import GameDetail from "./pages/User/GameDetail";
import Cart from "./pages/User/Cart";
import Checkout from "./pages/User/Checkout";
import OrderHistory from "./pages/User/OrderHistory";

// Halaman Admin (lazy loaded)
const AdminDashboard = lazy(() => import("./pages/Admin/Dashboard"));
const ManageGames = lazy(() => import("./pages/Admin/ManageGames"));
const ManageOrders = lazy(() => import("./pages/Admin/ManageOrders"));

// ----------------------- NotFound Page -----------------------
const NotFound = () => (
  <div className="text-center p-5 min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
    <h1 className="display-1 fw-bold text-danger">404</h1>
    <p className="fs-3 text-muted mt-3">
      Halaman yang Anda cari tidak ditemukan.
    </p>
    <Link to="/" className="btn btn-info mt-4 fw-bold">
      Kembali ke Beranda
    </Link>
  </div>
);

// ----------------------- App Router -----------------------
const App = () => (
  <BrowserRouter>
    <Header />

    <main className="container py-4 bg-light min-vh-100">
      <Suspense
        fallback={
          <div className="text-center py-5">
            <div className="spinner-border text-info" role="status"></div>
            <p className="mt-3 text-info">Loading...</p>
          </div>
        }
      >
        <Routes>
          {/* Rute Publik */}
          <Route path="/" element={<Home />} />
          <Route path="/games/:id" element={<GameDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Proteksi: User & Admin */}
          <Route element={<ProtectedRoute requiredRole={["user", "admin"]} />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<OrderHistory />} />
          </Route>

          {/* Proteksi: Admin Only */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/games" element={<ManageGames />} />
            <Route path="/admin/orders" element={<ManageOrders />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </main>

    <Footer />
  </BrowserRouter>
);

export default App;
