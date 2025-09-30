import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getGameById } from "../../api/gameApi";
import { useCart } from "../../contexts/CartContext";

// 🔔 Komponen Alert Sederhana
const CustomAlert = ({ message, type = "info", onClose, duration = 4000 }) => {
  if (!message) return null;

  useEffect(() => {
    const timer = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  return (
    <div
      className={`alert ${
        type === "success" ? "alert-success" : "alert-error"
      } fixed-top mx-auto mt-4 shadow`}
      role="alert"
      style={{
        maxWidth: "420px",
        zIndex: 1050,
        background: type === "success" ? "#dcfce7" : "#fef2f2",
        border: type === "success" ? "1px solid #16a34a" : "1px solid #dc2626",
        color: type === "success" ? "#166534" : "#991b1b",
        padding: "1rem",
        borderRadius: "8px",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
      }}
    >
      <span style={{ fontSize: "1.1rem" }}>
        {type === "success" ? "✅" : "⚠️"}
      </span>
      <div style={{ flex: 1 }}>
        <strong style={{ display: "block", marginBottom: "0.25rem" }}>
          {type === "success" ? "Berhasil!" : "Error!"}
        </strong>
        {message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          fontSize: "1.25rem",
          cursor: "pointer",
          color: "inherit",
          padding: "0",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ×
      </button>
    </div>
  );
};

const GameDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [localAlert, setLocalAlert] = useState(null);

  // 📌 Fetch data game
  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getGameById(id);
        const data = response.data;

        if (!data) throw new Error("Game tidak ditemukan.");
        setGame(data);
      } catch (err) {
        console.error("Fetch Game Detail Error:", err);
        setError(err.message || "Gagal memuat detail game.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchGame();
  }, [id]);

  // 📌 Format harga ke Rupiah
  const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  // 📌 Kontrol jumlah item
  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value, 10) || 1;
    setQuantity(Math.max(1, Math.min(val, game?.stock || 1)));
  };

  // 📌 Tambahkan ke keranjang
  const handleAddToCart = useCallback(() => {
    if (!game || quantity <= 0) return;

    setLocalAlert(null);

    if (quantity > game.stock) {
      setLocalAlert({
        message: `Stok hanya tersedia ${game.stock} unit.`,
        type: "danger",
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(game);
    }

    setLocalAlert({
      message: `${game.title} (x${quantity}) berhasil ditambahkan ke keranjang!`,
      type: "success",
    });
  }, [game, quantity, addToCart]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Memuat Detail Game...</p>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h2>Terjadi Kesalahan</h2>
          <p>{error || "Game tidak ditemukan."}</p>
        </div>
      </div>
    );
  }

  const isOutOfStock = game.stock <= 0;

  return (
    <div className="game-detail-container">
      {localAlert && (
        <CustomAlert
          message={localAlert.message}
          type={localAlert.type === "success" ? "success" : "danger"}
          onClose={() => setLocalAlert(null)}
        />
      )}

      <div className="game-detail-card">
        <div className="game-detail-grid">
          {/* Kolom Kiri: Gambar */}
          <div className="game-image-section">
            <img
              src={
                game.image_url ||
                "https://via.placeholder.com/400x500?text=Game+Image"
              }
              alt={game.title}
              className="game-image"
            />
          </div>

          {/* Kolom Kanan: Detail */}
          <div className="game-info-section">
            <div className="game-info-content">
              <h1 className="game-title">{game.title}</h1>

              <p className="game-genre">
                Genre: <span>{game.genre || "Tidak ada genre"}</span>
              </p>

              <div className="stock-info">
                Status:{" "}
                <span className={isOutOfStock ? "stock-out" : "stock-in"}>
                  {isOutOfStock ? "Stok Habis" : `Tersedia (${game.stock})`}
                </span>
              </div>

              <div className="price-section">
                <span className="game-price">{formatPrice(game.price)}</span>
              </div>

              <div className="game-description">
                <p>
                  {game.description || "Tidak ada deskripsi untuk game ini."}
                </p>
              </div>

              {/* Kontrol Kuantitas dan Tombol Keranjang */}
              <div className="cart-controls">
                <div className="quantity-control">
                  <label>Jumlah:</label>
                  <input
                    type="number"
                    min="1"
                    max={game.stock}
                    value={quantity}
                    onChange={handleQuantityChange}
                    disabled={isOutOfStock}
                    className="quantity-input"
                  />
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={
                    isOutOfStock || quantity > game.stock || quantity <= 0
                  }
                  className={`add-to-cart-btn ${
                    isOutOfStock ? "disabled" : ""
                  }`}
                >
                  {isOutOfStock
                    ? "Stok Habis"
                    : `Tambah ke Keranjang - ${formatPrice(
                        game.price * quantity
                      )}`}
                </button>
              </div>

              {quantity > game.stock && (
                <p className="stock-warning">
                  Jumlah melebihi stok yang tersedia ({game.stock} unit)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .game-detail-container {
          padding: 2rem 1rem;
          background: #f8fafc;
          min-height: 100vh;
        }

        .game-detail-card {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .game-detail-grid {
          display: grid;
          grid-template-columns: 1fr;
        }

        @media (min-width: 768px) {
          .game-detail-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .game-image-section {
          padding: 1.5rem;
        }

        .game-image {
          width: 100%;
          height: auto;
          max-height: 500px;
          object-fit: cover;
          border-radius: 8px;
        }

        .game-info-section {
          padding: 1.5rem;
          background: white;
        }

        .game-info-content {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .game-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }

        .game-genre {
          color: #6b7280;
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }

        .game-genre span {
          color: #dc2626;
          font-weight: 600;
        }

        .stock-info {
          margin-bottom: 1.5rem;
          font-size: 1rem;
        }

        .stock-in {
          color: #16a34a;
          font-weight: 600;
        }

        .stock-out {
          color: #dc2626;
          font-weight: 600;
        }

        .price-section {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .game-price {
          font-size: 2rem;
          font-weight: 800;
          color: #dc2626;
        }

        .game-description {
          margin-bottom: 2rem;
          flex: 1;
        }

        .game-description p {
          color: #6b7280;
          line-height: 1.6;
        }

        .cart-controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        @media (min-width: 480px) {
          .cart-controls {
            flex-direction: row;
            align-items: flex-end;
          }
        }

        .quantity-control {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .quantity-control label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
        }

        .quantity-input {
          width: 80px;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          text-align: center;
          font-size: 1rem;
        }

        .quantity-input:disabled {
          background: #f3f4f6;
          color: #9ca3af;
        }

        .add-to-cart-btn {
          flex: 1;
          padding: 1rem 1.5rem;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .add-to-cart-btn:hover:not(.disabled) {
          background: #b91c1c;
          transform: translateY(-1px);
        }

        .add-to-cart-btn.disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        .stock-warning {
          color: #dc2626;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          color: #dc2626;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-left: 4px solid #dc2626;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .error-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          padding: 2rem;
        }

        .error-content {
          text-align: center;
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 100%;
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default GameDetail;
