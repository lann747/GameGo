import React, { useState, useEffect } from "react";
import { useCart } from "../../contexts/CartContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const {
    cartItems,
    totalAmount,
    updateQuantity,
    removeItem,
    clearCart,
    itemCount,
  } = useCart();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Auto dismiss alert setelah 3 detik
  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => setAlert({ type: "", message: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Format Rupiah
  const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  // Navigasi ke halaman checkout
  const handleGoToCheckout = () => {
    if (itemCount === 0) {
      setAlert({ type: "danger", message: "Keranjang Anda kosong!" });
      return;
    }
    setLoading(true);
    navigate("/checkout");
  };

  // Validasi perubahan jumlah item
  const handleQuantityChange = (id, value, maxStock) => {
    let qty = parseInt(value) || 1;
    if (qty < 1) qty = 1;
    if (maxStock && qty > maxStock) qty = maxStock;
    updateQuantity(id, qty);
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>🛒 Keranjang Belanja ({itemCount})</h1>
      </div>

      {/* Alert */}
      {alert.message && (
        <div
          className={`alert ${
            alert.type === "success" ? "alert-success" : "alert-error"
          }`}
        >
          <span className="alert-icon">
            {alert.type === "success" ? "✅" : "❌"}
          </span>
          <div className="alert-content">
            <strong>{alert.type === "success" ? "Sukses!" : "Error!"}</strong>
            <p>{alert.message}</p>
          </div>
        </div>
      )}

      {/* Jika keranjang kosong */}
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-icon">🛒</div>
          <h2>Keranjang Kosong</h2>
          <p>Keranjang Anda masih kosong. Ayo belanja!</p>
          <button onClick={() => navigate("/")} className="browse-games-btn">
            Lihat Semua Game
          </button>
        </div>
      ) : (
        <div className="cart-content">
          {/* Daftar Item */}
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                {/* Thumbnail */}
                <div className="item-image">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="item-img"
                    />
                  ) : (
                    <span className="image-placeholder">IMG</span>
                  )}
                </div>

                {/* Info Item */}
                <div className="item-info">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-price">
                    {formatPrice(item.price)} x {item.quantity}
                  </p>
                </div>

                {/* Input Qty & Subtotal */}
                <div className="item-controls">
                  <input
                    type="number"
                    min="1"
                    max={item.maxStock}
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        item.id,
                        e.target.value,
                        item.maxStock
                      )
                    }
                    className="quantity-input"
                    disabled={loading}
                  />
                  <p className="item-subtotal">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>

                {/* Tombol Hapus */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="remove-btn"
                  aria-label={`Hapus ${item.title}`}
                  disabled={loading}
                >
                  Hapus
                </button>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="clear-cart-btn"
              disabled={loading}
            >
              🗑️ Kosongkan Keranjang
            </button>
          </div>

          {/* Ringkasan Checkout */}
          <div className="checkout-summary">
            <div className="summary-card">
              <h2>Ringkasan Pesanan</h2>
              <div className="summary-row">
                <span>Total Item ({itemCount})</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>

              <div className="summary-total">
                <span>Total Bayar</span>
                <span className="total-price">{formatPrice(totalAmount)}</span>
              </div>

              <button
                onClick={handleGoToCheckout}
                disabled={loading || itemCount === 0}
                className="checkout-btn"
              >
                {loading && <span className="spinner"></span>}
                {loading ? "Memproses Pesanan..." : "Proses Checkout"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .cart-container {
          padding: 2rem 1rem;
          background: #f8fafc;
          min-height: 100vh;
          max-width: 1200px;
          margin: 0 auto;
        }

        .cart-header {
          margin-bottom: 2rem;
        }

        .cart-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
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

        /* Empty Cart */
        .empty-cart {
          text-align: center;
          background: white;
          padding: 3rem 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-cart h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .empty-cart p {
          color: #6b7280;
          margin-bottom: 2rem;
        }

        .browse-games-btn {
          padding: 0.75rem 2rem;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .browse-games-btn:hover {
          background: #b91c1c;
          transform: translateY(-1px);
        }

        /* Cart Content */
        .cart-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        @media (min-width: 1024px) {
          .cart-content {
            grid-template-columns: 2fr 1fr;
          }
        }

        /* Cart Items */
        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .cart-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #dc2626;
        }

        @media (max-width: 768px) {
          .cart-item {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }
        }

        .item-image {
          flex-shrink: 0;
          width: 80px;
          height: 80px;
          background: #f3f4f6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .item-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }

        .image-placeholder {
          color: #9ca3af;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .item-info {
          flex: 1;
        }

        .item-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .item-price {
          color: #6b7280;
          font-size: 0.9rem;
        }

        .item-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .quantity-input {
          width: 80px;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          text-align: center;
          font-size: 0.9rem;
        }

        .quantity-input:disabled {
          background: #f3f4f6;
          color: #9ca3af;
        }

        .item-subtotal {
          font-size: 1rem;
          font-weight: 600;
          color: #dc2626;
        }

        .remove-btn {
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid #dc2626;
          border-radius: 6px;
          color: #dc2626;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .remove-btn:hover:not(:disabled) {
          background: #dc2626;
          color: white;
        }

        .remove-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .clear-cart-btn {
          align-self: flex-start;
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: 1px solid #dc2626;
          border-radius: 6px;
          color: #dc2626;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }

        .clear-cart-btn:hover:not(:disabled) {
          background: #dc2626;
          color: white;
        }

        .clear-cart-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

        .summary-card h2 {
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

        .checkout-btn {
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
          margin-top: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .checkout-btn:hover:not(:disabled) {
          background: #b91c1c;
          transform: translateY(-1px);
        }

        .checkout-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid white;
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

export default Cart;
