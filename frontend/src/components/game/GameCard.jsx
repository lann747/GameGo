import React, { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import CustomAlert from "../common/Alert";

const GameCard = ({ game }) => {
  const { addToCart } = useCart();
  const [localAlert, setLocalAlert] = useState(null);
  const [alertTimeout, setAlertTimeout] = useState(null);

  const formattedPrice = useMemo(
    () =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(game.price),
    [game.price]
  );

  const isOutOfStock = game.stock <= 0;

  const showAlert = useCallback(
    (message, alertType, duration = 3000) => {
      setLocalAlert({ message, alertType });

      if (alertTimeout) clearTimeout(alertTimeout);

      const timeout = setTimeout(() => setLocalAlert(null), duration);
      setAlertTimeout(timeout);
    },
    [alertTimeout]
  );

  const handleAddToCart = () => {
    if (isOutOfStock) {
      showAlert(`${game.title} kehabisan stok!`, "danger", 4000);
      return;
    }
    addToCart(game);
    showAlert(`${game.title} berhasil ditambahkan ke keranjang!`, "success");
  };

  return (
    <div className="game-card-container">
      {localAlert && (
        <CustomAlert
          message={localAlert.message}
          type={localAlert.alertType}
          onClose={() => setLocalAlert(null)}
        />
      )}

      <div className="game-card">
        <div className="game-image">
          <img
            src={
              game.image_url ||
              "https://via.placeholder.com/400x300?text=Game+Image"
            }
            alt={game.title || "Game Image"}
            className="game-img"
          />
        </div>

        <div className="game-content">
          <h3 className="game-title">{game.title}</h3>
          <p className="game-price">{formattedPrice}</p>
          <div className="game-details">
            <p className="game-genre">
              Genre: <span>{game.genre || "Umum"}</span>
            </p>
            <p className="game-stock">
              Stok:{" "}
              <span className={isOutOfStock ? "stock-out" : "stock-in"}>
                {isOutOfStock ? "Habis" : `${game.stock} unit`}
              </span>
            </p>
          </div>

          <div className="game-actions">
            <Link to={`/games/${game.id}`} className="detail-button">
              Lihat Detail
            </Link>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`cart-button ${isOutOfStock ? "disabled" : ""}`}
            >
              {isOutOfStock ? "Stok Habis" : "Tambah ke Keranjang"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .game-card-container {
          position: relative;
        }

        .game-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid #e5e7eb;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .game-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          border-color: rgba(220, 38, 38, 0.2);
        }

        .game-image {
          height: 200px;
          overflow: hidden;
        }

        .game-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .game-card:hover .game-img {
          transform: scale(1.05);
        }

        .game-content {
          padding: 1.25rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .game-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .game-price {
          color: #dc2626;
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .game-details {
          margin-bottom: 1.5rem;
          flex: 1;
        }

        .game-genre,
        .game-stock {
          color: #6b7280;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .game-genre span {
          color: #374151;
          font-weight: 600;
        }

        .stock-in {
          color: #16a34a;
          font-weight: 600;
        }

        .stock-out {
          color: #dc2626;
          font-weight: 600;
        }

        .game-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-button {
          padding: 0.75rem 1rem;
          background: transparent;
          color: #2563eb;
          border: 1px solid #2563eb;
          border-radius: 6px;
          text-decoration: none;
          text-align: center;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .detail-button:hover {
          background: #2563eb;
          color: white;
          transform: translateY(-1px);
        }

        .cart-button {
          padding: 0.75rem 1rem;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cart-button:hover:not(.disabled) {
          background: #b91c1c;
          transform: translateY(-1px);
        }

        .cart-button.disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .game-image {
            height: 180px;
          }

          .game-content {
            padding: 1rem;
          }

          .game-title {
            font-size: 1rem;
          }

          .game-price {
            font-size: 1.1rem;
          }

          .detail-button,
          .cart-button {
            padding: 0.625rem 0.875rem;
            font-size: 0.85rem;
          }
        }

        @media (max-width: 480px) {
          .game-image {
            height: 160px;
          }

          .game-actions {
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default GameCard;
