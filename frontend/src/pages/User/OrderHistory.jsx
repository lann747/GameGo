import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getUserOrders } from "../../api/orderApi";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAuthHeaders } = useAuth();

  // --- Helpers ---
  const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return isNaN(d)
      ? "-"
      : d.toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const getStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "paid":
      case "completed":
        return "status-success";
      case "cancelled":
        return "status-cancelled";
      case "shipped":
        return "status-shipped";
      default:
        return "status-pending";
    }
  };

  const getStatusLabel = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "paid":
        return "Dibayar";
      case "completed":
        return "Selesai";
      case "cancelled":
        return "Dibatalkan";
      case "shipped":
        return "Dikirim";
      default:
        return "Menunggu Pembayaran";
    }
  };

  // --- Fetch Orders ---
  const fetchUserOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserOrders(getAuthHeaders());
      setOrders(data || []);
    } catch (err) {
      setError(err.message || "Gagal mengambil riwayat pesanan.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  // --- Render States ---
  if (loading) {
    return (
      <div className="order-history-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Memuat Riwayat Pesanan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2>Terjadi Kesalahan</h2>
          <p>{error}</p>
          <button onClick={fetchUserOrders} className="retry-button">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <div className="order-history-header">
        <h1>Riwayat Pesanan</h1>
        <p className="order-count">Total: {orders.length} pesanan</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h2>Belum Ada Pesanan</h2>
          <p>Anda belum pernah melakukan pemesanan.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3 className="order-id">Pesanan #{order.id}</h3>
                  <p className="order-date">{formatDate(order.order_date)}</p>
                </div>
                <span
                  className={`status-badge ${getStatusClass(order.status)}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>

              {/* Delivery Info */}
              {["completed", "shipped"].includes(
                (order.status || "").toLowerCase()
              ) &&
                (order.delivery_url || order.delivery_file) && (
                  <div className="delivery-info">
                    <h4>📦 File/Link Pengiriman</h4>
                    {order.delivery_url && (
                      <p className="delivery-item">
                        <span>🔗 Link:</span>
                        <a
                          href={order.delivery_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="delivery-link"
                        >
                          {order.delivery_url}
                        </a>
                      </p>
                    )}
                    {order.delivery_file && (
                      <p className="delivery-item">
                        <span>📥 File:</span>
                        <a
                          href={order.delivery_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="delivery-link"
                        >
                          Unduh File
                        </a>
                      </p>
                    )}
                  </div>
                )}

              <div className="order-total">
                <span>Total Bayar:</span>
                <span className="total-price">
                  {formatPrice(order.total_price)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .order-history-container {
          padding: 2rem 1rem;
          background: #f8fafc;
          min-height: 100vh;
          max-width: 1200px;
          margin: 0 auto;
        }

        .order-history-header {
          margin-bottom: 2rem;
        }

        .order-history-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .order-count {
          color: #6b7280;
          font-size: 1rem;
        }

        /* Loading State */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
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

        /* Error State */
        .error-state {
          text-align: center;
          background: white;
          padding: 3rem 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          margin: 0 auto;
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .error-state h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #dc2626;
          margin-bottom: 1rem;
        }

        .error-state p {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }

        .retry-button {
          padding: 0.75rem 1.5rem;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .retry-button:hover {
          background: #b91c1c;
        }

        /* Empty State */
        .empty-state {
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

        .empty-state h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #6b7280;
        }

        /* Orders Grid */
        .orders-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Order Card */
        .order-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #dc2626;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .order-info {
          flex: 1;
        }

        .order-id {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .order-date {
          color: #6b7280;
          font-size: 0.9rem;
        }

        /* Status Badge */
        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          color: white;
        }

        .status-success {
          background: #16a34a;
        }

        .status-pending {
          background: #d97706;
        }

        .status-cancelled {
          background: #dc2626;
        }

        .status-shipped {
          background: #2563eb;
        }

        /* Delivery Info */
        .delivery-info {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .delivery-info h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #166534;
          margin-bottom: 0.75rem;
        }

        .delivery-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .delivery-item:last-child {
          margin-bottom: 0;
        }

        .delivery-item span {
          color: #166534;
          font-weight: 500;
          min-width: 60px;
        }

        .delivery-link {
          color: #2563eb;
          text-decoration: none;
          word-break: break-all;
        }

        .delivery-link:hover {
          text-decoration: underline;
        }

        /* Order Total */
        .order-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .total-price {
          color: #dc2626;
          font-size: 1.25rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .order-history-container {
            padding: 1rem;
          }

          .order-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .status-badge {
            align-self: flex-start;
          }

          .delivery-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }

          .order-total {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderHistory;
