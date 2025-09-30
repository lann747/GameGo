import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getAllOrdersAdmin, updateOrderStatusAdmin } from "../../api/orderApi";
import {
  FaBox,
  FaShoppingCart,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTruck,
  FaSync,
  FaSearch,
  FaFilter,
  FaEye,
  FaUser,
  FaCalendar,
  FaExclamationTriangle,
  FaSort,
} from "react-icons/fa";

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: "orange", icon: <FaClock />, label: "Menunggu" },
    paid: { color: "blue", icon: <FaMoneyBillWave />, label: "Dibayar" },
    completed: { color: "green", icon: <FaCheckCircle />, label: "Selesai" },
    cancelled: { color: "red", icon: <FaTimesCircle />, label: "Dibatalkan" },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div className={`status-badge status-${config.color}`}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
};

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { getAuthHeaders } = useAuth();
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Delivery data state
  const [deliveryData, setDeliveryData] = useState({});

  // Fetch all orders
  const fetchAllOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const authHeaders = getAuthHeaders();
      const data = await getAllOrdersAdmin(authHeaders);

      const ordersArray = Array.isArray(data)
        ? data
        : Array.isArray(data.orders)
        ? data.orders
        : [];

      const sortedOrders = ordersArray.sort(
        (a, b) =>
          new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
      );

      setOrders(sortedOrders);
      setFilteredOrders(sortedOrders);
    } catch (err) {
      setError(
        err.message || "Gagal mengambil data pesanan. Pastikan Anda Admin."
      );
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  // Filter and search orders
  useEffect(() => {
    let result = orders;

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (order) =>
          order.id.toString().includes(searchTerm) ||
          order.user_id.toString().includes(searchTerm) ||
          (order.user_name &&
            order.user_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.order_date) - new Date(a.order_date);
        case "oldest":
          return new Date(a.order_date) - new Date(b.order_date);
        case "price_high":
          return b.total_price - a.total_price;
        case "price_low":
          return a.total_price - b.total_price;
        default:
          return 0;
      }
    });

    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter, sortBy]);

  // Auto-hide alerts
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Format Rupiah
  const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price || 0);

  // Handle delivery input changes
  const handleDeliveryChange = (orderId, field, value) => {
    setDeliveryData((prev) => ({
      ...prev,
      [orderId]: { ...prev[orderId], [field]: value },
    }));
  };

  // Update Order Status
  const handleUpdateStatus = async (
    orderId,
    newStatus,
    deliveryUrl = null,
    deliveryFile = null
  ) => {
    if (newStatus === "completed" && !deliveryUrl && !deliveryFile) {
      setError(
        "Harap isi link file/game atau upload file sebelum menyelesaikan pesanan."
      );
      return;
    }

    if (
      !window.confirm(
        `Yakin ingin mengubah status Pesanan #${orderId} menjadi ${newStatus.toUpperCase()}?`
      )
    )
      return;

    setUpdatingId(orderId);

    try {
      const result = await updateOrderStatusAdmin(
        orderId,
        newStatus,
        getAuthHeaders(),
        deliveryUrl,
        deliveryFile
      );

      setSuccess(result.message || "Status pesanan berhasil diperbarui.");

      // Reset delivery data after success
      setDeliveryData((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });

      // Close expanded view
      setExpandedOrder(null);

      fetchAllOrders();
    } catch (err) {
      setError(err.message || "Gagal mengubah status pesanan.");
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const paid = orders.filter((o) => o.status === "paid").length;
    const completed = orders.filter((o) => o.status === "completed").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;

    return { total, pending, paid, completed, cancelled };
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <div className="manage-orders">
        <div className="page-header">
          <div className="skeleton-title"></div>
          <div className="skeleton-button"></div>
        </div>

        <div className="stats-overview">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="stat-card-skeleton">
              <div className="skeleton-icon"></div>
              <div className="skeleton-content">
                <div className="skeleton-line short"></div>
                <div className="skeleton-line long"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="orders-list">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="order-card-skeleton">
              <div className="skeleton-line medium"></div>
              <div className="skeleton-line short"></div>
              <div className="skeleton-line long"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="manage-orders">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Kelola Pesanan</h1>
          <p className="page-subtitle">
            Kelola dan proses semua pesanan pelanggan
          </p>
        </div>
        <div className="header-actions">
          <button
            onClick={fetchAllOrders}
            className="refresh-button"
            title="Refresh data"
          >
            <FaSync />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-item">
          <div className="stat-icon total">
            <FaShoppingCart />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Pesanan</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon warning">
            <FaClock />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Menunggu</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon info">
            <FaMoneyBillWave />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.paid}</div>
            <div className="stat-label">Dibayar</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon success">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Selesai</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon danger">
            <FaTimesCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.cancelled}</div>
            <div className="stat-label">Dibatalkan</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="alert error">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <strong>Error:</strong> {error}
          </div>
          <button onClick={() => setError(null)} className="alert-close">
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="alert success">
          <div className="alert-icon">✅</div>
          <div className="alert-content">
            <strong>Sukses:</strong> {success}
          </div>
          <button onClick={() => setSuccess(null)} className="alert-close">
            ×
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Cari berdasarkan ID pesanan, user ID, atau nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <div className="filter-item">
            <FaFilter className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="paid">Dibayar</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>

          <div className="filter-item">
            <FaSort className="filter-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="price_high">Harga Tertinggi</option>
              <option value="price_low">Harga Terendah</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="orders-section">
        <div className="section-header">
          <h2 className="section-title">
            Daftar Pesanan{" "}
            <span className="count-badge">{filteredOrders.length}</span>
          </h2>
          <div className="section-info">
            Menampilkan {filteredOrders.length} dari {orders.length} pesanan
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div
                  className="order-header"
                  onClick={() => toggleOrderExpansion(order.id)}
                >
                  <div className="order-info">
                    <div className="order-id">Pesanan #{order.id}</div>
                    <div className="order-meta">
                      <div className="meta-item">
                        <FaUser className="meta-icon" />
                        <span>User #{order.user_id}</span>
                        {order.user_name && (
                          <span className="user-name">({order.user_name})</span>
                        )}
                      </div>
                      <div className="meta-item">
                        <FaCalendar className="meta-icon" />
                        <span>
                          {order.order_date
                            ? new Date(order.order_date).toLocaleString("id-ID")
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="order-status">
                    <StatusBadge status={order.status} />
                    <div className="order-total">
                      {formatPrice(order.total_price)}
                    </div>
                    <FaEye
                      className={`expand-icon ${
                        expandedOrder === order.id ? "expanded" : ""
                      }`}
                    />
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="order-details">
                    {/* Order Items */}
                    <div className="detail-section">
                      <h4 className="detail-title">Item Pesanan</h4>
                      <div className="order-items">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, index) => (
                            <div key={index} className="order-item">
                              <div className="item-info">
                                <div className="item-name">
                                  {item.game_title || item.title}
                                </div>
                                <div className="item-meta">
                                  <span className="item-price">
                                    {formatPrice(item.price)}
                                  </span>
                                  <span className="item-quantity">
                                    x{item.quantity}
                                  </span>
                                </div>
                              </div>
                              <div className="item-total">
                                {formatPrice(item.price * item.quantity)}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="no-items">Tidak ada detail item</div>
                        )}
                      </div>
                    </div>

                    {/* Order Actions */}
                    <div className="detail-section">
                      <h4 className="detail-title">Aksi Pesanan</h4>
                      <div className="order-actions">
                        {order.status === "pending" && (
                          <div className="action-group">
                            <button
                              onClick={() =>
                                handleUpdateStatus(order.id, "paid")
                              }
                              className="action-button primary"
                              disabled={updatingId === order.id}
                            >
                              {updatingId === order.id ? (
                                <FaSync className="spinning" />
                              ) : (
                                <FaMoneyBillWave />
                              )}
                              Konfirmasi Pembayaran
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(order.id, "cancelled")
                              }
                              className="action-button danger"
                              disabled={updatingId === order.id}
                            >
                              <FaTimesCircle />
                              Batalkan Pesanan
                            </button>
                          </div>
                        )}

                        {order.status === "paid" && (
                          <div className="action-group">
                            <div className="delivery-inputs">
                              <div className="input-group">
                                <label className="input-label">
                                  Link File/Game
                                </label>
                                <input
                                  type="text"
                                  className="input-field"
                                  placeholder="https://example.com/game-file"
                                  value={
                                    deliveryData[order.id]?.delivery_url || ""
                                  }
                                  onChange={(e) =>
                                    handleDeliveryChange(
                                      order.id,
                                      "delivery_url",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>
                            <div className="action-buttons">
                              <button
                                onClick={() =>
                                  handleUpdateStatus(
                                    order.id,
                                    "completed",
                                    deliveryData[order.id]?.delivery_url ||
                                      null,
                                    deliveryData[order.id]?.delivery_file ||
                                      null
                                  )
                                }
                                className="action-button success"
                                disabled={updatingId === order.id}
                              >
                                {updatingId === order.id ? (
                                  <FaSync className="spinning" />
                                ) : (
                                  <FaCheckCircle />
                                )}
                                Selesaikan & Kirim
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(order.id, "cancelled")
                                }
                                className="action-button danger"
                                disabled={updatingId === order.id}
                              >
                                <FaTimesCircle />
                                Batalkan Pesanan
                              </button>
                            </div>
                          </div>
                        )}

                        {(order.status === "completed" ||
                          order.status === "cancelled") && (
                          <div className="action-group">
                            <div className="status-message">
                              <FaExclamationTriangle />
                              Pesanan sudah{" "}
                              {order.status === "completed"
                                ? "selesai"
                                : "dibatalkan"}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FaBox className="empty-icon" />
            <h3 className="empty-title">Tidak Ada Pesanan Ditemukan</h3>
            <p className="empty-description">
              {orders.length === 0
                ? "Belum ada pesanan yang tercatat dalam sistem."
                : "Tidak ada pesanan yang sesuai dengan filter pencarian Anda."}
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .manage-orders {
          padding: 2rem 1rem;
          background: #f8fafc;
          min-height: 100vh;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Page Header */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          gap: 2rem;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 1rem;
          }
        }

        .header-content {
          flex: 1;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          color: #6b7280;
          font-size: 1rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .refresh-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .refresh-button:hover {
          background: #e5e7eb;
          color: #374151;
        }

        /* Stats Overview */
        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-item {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #dc2626;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: white;
        }

        .stat-icon.total {
          background: #dc2626;
        }

        .stat-icon.warning {
          background: #d97706;
        }

        .stat-icon.info {
          background: #2563eb;
        }

        .stat-icon.success {
          background: #16a34a;
        }

        .stat-icon.danger {
          background: #dc2626;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #6b7280;
          font-weight: 600;
        }

        /* Alerts */
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

        .alert.error {
          background: #fef2f2;
          border-color: #dc2626;
          color: #991b1b;
        }

        .alert.success {
          background: #f0fdf4;
          border-color: #16a34a;
          color: #166534;
        }

        .alert-icon {
          font-size: 1.25rem;
          margin-top: 0.125rem;
        }

        .alert-content {
          flex: 1;
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

        /* Filters Section */
        .filters-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          gap: 1.5rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 300px;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          font-size: 1rem;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #dc2626;
          box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1);
        }

        .filter-group {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-icon {
          color: #6b7280;
          font-size: 0.9rem;
        }

        .filter-select {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #374151;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 140px;
        }

        .filter-select:focus {
          outline: none;
          border-color: #dc2626;
        }

        /* Orders Section */
        .orders-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .count-badge {
          background: #dc2626;
          color: white;
          border-radius: 20px;
          padding: 0.25rem 0.75rem;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .section-info {
          color: #6b7280;
          font-size: 0.9rem;
        }

        /* Orders List */
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .order-card {
          background: #f8fafc;
          border-radius: 12px;
          border: 2px solid transparent;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .order-card:hover {
          border-color: rgba(220, 38, 38, 0.2);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .order-header:hover {
          background: rgba(220, 38, 38, 0.05);
        }

        .order-info {
          flex: 1;
        }

        .order-id {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .order-meta {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .meta-icon {
          font-size: 0.8rem;
        }

        .user-name {
          color: #dc2626;
          font-weight: 500;
        }

        .order-status {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .order-total {
          font-size: 1.1rem;
          font-weight: 700;
          color: #dc2626;
        }

        .expand-icon {
          color: #9ca3af;
          transition: transform 0.3s ease;
        }

        .expand-icon.expanded {
          transform: rotate(180deg);
          color: #dc2626;
        }

        /* Status Badge */
        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          color: white;
        }

        .status-orange {
          background: #d97706;
        }

        .status-blue {
          background: #2563eb;
        }

        .status-green {
          background: #16a34a;
        }

        .status-red {
          background: #dc2626;
        }

        /* Order Details */
        .order-details {
          padding: 0 1.5rem 1.5rem;
          border-top: 1px solid #e5e7eb;
          margin-top: 1rem;
        }

        .detail-section {
          margin-bottom: 1.5rem;
        }

        .detail-section:last-child {
          margin-bottom: 0;
        }

        .detail-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
        }

        /* Order Items */
        .order-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .item-info {
          flex: 1;
        }

        .item-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .item-meta {
          display: flex;
          gap: 1rem;
          color: #6b7280;
          font-size: 0.85rem;
        }

        .item-total {
          font-weight: 700;
          color: #1f2937;
        }

        .no-items {
          text-align: center;
          color: #9ca3af;
          font-style: italic;
          padding: 2rem;
        }

        /* Order Actions */
        .order-actions {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
        }

        .action-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .delivery-inputs {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
        }

        .input-field {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .input-field:focus {
          outline: none;
          border-color: #dc2626;
          box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1);
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
          justify-content: center;
        }

        .action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .action-button.primary {
          background: #2563eb;
          color: white;
        }

        .action-button.primary:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .action-button.success {
          background: #16a34a;
          color: white;
        }

        .action-button.success:hover:not(:disabled) {
          background: #15803d;
        }

        .action-button.danger {
          background: #dc2626;
          color: white;
        }

        .action-button.danger:hover:not(:disabled) {
          background: #b91c1c;
        }

        .status-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: #f3f4f6;
          border-radius: 6px;
          color: #6b7280;
          font-weight: 500;
        }

        .spinning {
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

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
        }

        .empty-icon {
          font-size: 4rem;
          color: #9ca3af;
          margin-bottom: 1rem;
        }

        .empty-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .empty-description {
          color: #6b7280;
        }

        /* Skeleton Loading */
        .skeleton-title {
          height: 2rem;
          background: #e5e7eb;
          border-radius: 6px;
          margin-bottom: 1rem;
          animation: pulse 2s infinite;
        }

        .skeleton-button {
          height: 44px;
          width: 44px;
          background: #e5e7eb;
          border-radius: 6px;
          animation: pulse 2s infinite;
        }

        .stat-card-skeleton {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .skeleton-icon {
          width: 48px;
          height: 48px;
          background: #e5e7eb;
          border-radius: 8px;
          margin-bottom: 1rem;
          animation: pulse 2s infinite;
        }

        .skeleton-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .skeleton-line {
          height: 0.8rem;
          background: #e5e7eb;
          border-radius: 4px;
          animation: pulse 2s infinite;
        }

        .skeleton-line.short {
          width: 40%;
        }

        .skeleton-line.medium {
          width: 60%;
        }

        .skeleton-line.long {
          width: 80%;
        }

        .order-card-skeleton {
          background: #f8fafc;
          border-radius: 12px;
          padding: 1.5rem;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            min-width: auto;
          }

          .filter-group {
            justify-content: space-between;
          }

          .section-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .order-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .order-status {
            justify-content: space-between;
          }

          .action-buttons {
            flex-direction: column;
          }

          .stats-overview {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .stats-overview {
            grid-template-columns: 1fr;
          }

          .filter-group {
            flex-direction: column;
          }

          .filter-select {
            min-width: auto;
            width: 100%;
          }

          .order-meta {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ManageOrders;
