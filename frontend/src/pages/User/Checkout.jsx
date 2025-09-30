import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { createOrder } from "../../api/orderApi";

// 🔔 Komponen Alert Reusable
const CheckoutAlert = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => onClose?.(), 6000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className={`alert ${
        type === "success" ? "alert-success" : "alert-error"
      }`}
    >
      <span className="alert-icon">{type === "success" ? "✅" : "❌"}</span>
      <div className="alert-content">
        <strong>{type === "success" ? "Sukses!" : "Error!"}</strong>
        <p>{message}</p>
      </div>
      <button onClick={onClose} className="alert-close">
        ×
      </button>
    </div>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, totalAmount, clearCart, itemCount } = useCart();
  const { getAuthHeaders } = useAuth();

  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccessView, setIsSuccessView] = useState(false);
  const [orderRef, setOrderRef] = useState(null);
  const [countdown, setCountdown] = useState(300);

  const paymentMethods = [
    { id: "transfer", name: "Transfer Bank (BCA/Mandiri)", icon: "🏦" },
    { id: "dana", name: "E-Wallet DANA", icon: "💳" },
    { id: "cod", name: "Bayar di Tempat (COD)", icon: "🚚" },
  ];

  const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (!selectedMethod) {
      setError("Mohon pilih metode pembayaran.");
      return;
    }
    if (itemCount === 0) return;

    setLoading(true);
    setError(null);

    const orderItemsPayload = cartItems.map((item) => ({
      game_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    try {
      const authHeaders = getAuthHeaders();
      const response = await createOrder(
        orderItemsPayload,
        totalAmount,
        authHeaders
      );

      clearCart();
      setOrderRef({
        id: response?.order_id || Date.now(),
        total: totalAmount,
        method:
          paymentMethods.find((m) => m.id === selectedMethod)?.name ||
          selectedMethod,
      });
      setIsSuccessView(true);

      setTimeout(() => navigate("/orders", { replace: true }), 6000);
    } catch (err) {
      setError(
        err.message || "Gagal memproses pesanan. Silakan coba lagi nanti."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuccessView && countdown > 0) {
      const timer = setInterval(
        () => setCountdown((c) => Math.max(c - 1, 0)),
        1000
      );
      return () => clearInterval(timer);
    }
  }, [isSuccessView, countdown]);

  if (itemCount === 0 && !isSuccessView) {
    return (
      <div className="empty-checkout">
        <div className="empty-icon">🛒</div>
        <h2>Keranjang Kosong</h2>
        <p>
          Keranjang Anda kosong. <Link to="/">Lanjutkan belanja.</Link>
        </p>
      </div>
    );
  }

  if (isSuccessView && orderRef) {
    const qrContent = `ORDER ID: ${orderRef.id} | TOTAL: ${orderRef.total} | METHOD: ${orderRef.method}`;
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;

    return (
      <div className="checkout-success">
        <CheckoutAlert
          message={`Pesanan berhasil! ID Transaksi: #${
            orderRef.id
          }. Redirect otomatis dalam ${minutes}:${seconds
            .toString()
            .padStart(2, "0")}`}
          type="success"
          onClose={() => navigate("/orders")}
        />

        <div className="success-card">
          <h3>Pembayaran Berhasil</h3>
          <p className="total-amount">{formatPrice(orderRef.total)}</p>
          <p className="payment-method">Metode: {orderRef.method}</p>

          {/* Tampilkan QR hanya kalau bukan COD */}
          {orderRef.method.toLowerCase().includes("cod") ? (
            <div className="cod-info">
              <p>Bayar langsung di tempat saat barang diterima</p>
            </div>
          ) : (
            <>
              <div className="qr-container">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    qrContent
                  )}`}
                  alt="QR Code Pembayaran"
                  className="qr-code"
                  onError={(e) => (e.target.alt = "QR gagal dimuat")}
                />
              </div>
              <p className="countdown-text">
                Scan kode dalam {minutes}:{seconds.toString().padStart(2, "0")}
              </p>
            </>
          )}

          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>💳 Pilih Metode Pembayaran</h1>
      </div>

      <div className="checkout-content">
        <div className="checkout-form">
          <form onSubmit={handleConfirmOrder}>
            <div className="payment-methods">
              <h3>Pilih Cara Pembayaran</h3>

              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`payment-method ${
                    selectedMethod === method.id ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    id={method.id}
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={() => setSelectedMethod(method.id)}
                    required
                  />
                  <label htmlFor={method.id}>
                    <span className="method-icon">{method.icon}</span>
                    <span className="method-name">{method.name}</span>
                  </label>
                </div>
              ))}
            </div>

            {error && (
              <CheckoutAlert
                message={error}
                type="danger"
                onClose={() => setError(null)}
              />
            )}

            <button
              type="submit"
              disabled={loading || !selectedMethod}
              className={`confirm-button ${loading ? "loading" : ""}`}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Memproses...
                </>
              ) : (
                `Konfirmasi & Bayar ${formatPrice(totalAmount)}`
              )}
            </button>
          </form>
        </div>

        <div className="checkout-summary">
          <div className="summary-card">
            <h3>Ringkasan Checkout</h3>
            <div className="summary-row">
              <span>Subtotal ({itemCount} item)</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <div className="summary-total">
              <span>TOTAL</span>
              <span className="total-price">{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .checkout-container {
          padding: 2rem 1rem;
          background: #f8fafc;
          min-height: 100vh;
          max-width: 1200px;
          margin: 0 auto;
        }

        .checkout-header {
          margin-bottom: 2rem;
        }

        .checkout-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
        }

        /* Empty Checkout */
        .empty-checkout {
          text-align: center;
          background: white;
          padding: 3rem 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          margin: 2rem auto;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-checkout h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .empty-checkout p {
          color: #6b7280;
        }

        .empty-checkout a {
          color: #dc2626;
          text-decoration: none;
          font-weight: 600;
        }

        .empty-checkout a:hover {
          text-decoration: underline;
        }

        /* Checkout Content */
        .checkout-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        @media (min-width: 1024px) {
          .checkout-content {
            grid-template-columns: 2fr 1fr;
          }
        }

        /* Checkout Form */
        .checkout-form {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .payment-methods {
          margin-bottom: 2rem;
        }

        .payment-methods h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .payment-method {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 0.75rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .payment-method:hover {
          border-color: #dc2626;
        }

        .payment-method.selected {
          background: rgba(220, 38, 38, 0.05);
          border-color: #dc2626;
        }

        .payment-method input {
          display: none;
        }

        .payment-method label {
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          font-weight: 500;
          color: #374151;
          margin: 0;
        }

        .method-icon {
          font-size: 1.25rem;
        }

        .method-name {
          font-size: 0.95rem;
        }

        /* Alert */
        .alert {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          border-left: 4px solid;
          position: relative;
        }

        .alert-success {
          background: #f0fdf4;
          border-color: #16a34a;
          color: #166534;
        }

        .alert-error {
          background: #fef2f2;
          border-color: #dc2626;
          color: #991b1b;
        }

        .alert-icon {
          font-size: 1.25rem;
          margin-top: 0.125rem;
        }

        .alert-content {
          flex: 1;
        }

        .alert-content strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        .alert-content p {
          margin: 0;
          font-size: 0.9rem;
        }

        .alert-close {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: inherit;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Confirm Button */
        .confirm-button {
          width: 100%;
          padding: 1rem 2rem;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .confirm-button:hover:not(:disabled) {
          background: #b91c1c;
          transform: translateY(-1px);
        }

        .confirm-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        .confirm-button.loading {
          opacity: 0.8;
        }

        /* Checkout Summary */
        .checkout-summary {
          position: sticky;
          top: 2rem;
          height: fit-content;
        }

        .summary-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          border-top: 4px solid #dc2626;
        }

        .summary-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #6b7280;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 2px solid #e5e7eb;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .total-price {
          color: #dc2626;
          font-size: 1.25rem;
        }

        /* Success View */
        .checkout-success {
          text-align: center;
          padding: 2rem 1rem;
        }

        .success-card {
          background: white;
          padding: 3rem 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          max-width: 460px;
          margin: 2rem auto;
          border-top: 4px solid #16a34a;
        }

        .success-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #16a34a;
          margin-bottom: 1rem;
        }

        .total-amount {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .payment-method {
          color: #6b7280;
          margin-bottom: 2rem;
        }

        .cod-info {
          background: #f0fdf4;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #bbf7d0;
          margin-bottom: 2rem;
        }

        .cod-info p {
          color: #166534;
          font-weight: 600;
          margin: 0;
        }

        .qr-container {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          display: inline-block;
          margin-bottom: 1rem;
        }

        .qr-code {
          width: 200px;
          height: 200px;
        }

        .countdown-text {
          color: #dc2626;
          font-weight: 600;
          margin-bottom: 2rem;
        }

        /* Spinner */
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
