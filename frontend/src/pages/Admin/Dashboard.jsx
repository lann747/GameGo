import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaGamepad,
  FaShoppingCart,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaPlus,
  FaChartLine,
  FaSync,
  FaCog,
  FaBoxOpen,
  FaUsers,
  FaDatabase,
  FaStore,
  FaShoppingBag,
  FaArrowUp,
  FaArrowDown,
  FaEye,
} from "react-icons/fa";

// --- API Statistik ---
const fetchDashboardStats = async (authHeaders, signal) => {
  const res = await fetch("http://localhost/gamegoo/api/dashboard/stats.php", {
    headers: authHeaders,
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Gagal mengambil data statistik.");
  }

  return res.json();
};

// --- Helper Format ---
const formatNumber = (n) => new Intl.NumberFormat("id-ID").format(n || 0);
const formatCurrency = (n) =>
  `Rp ${new Intl.NumberFormat("id-ID").format(n || 0)}`;
const formatCompactNumber = (n) => {
  if (n >= 1000000) {
    return (n / 1000000).toFixed(1) + "Jt";
  }
  if (n >= 1000) {
    return (n / 1000).toFixed(1) + "Rb";
  }
  return String(n);
};

const AdminDashboard = () => {
  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("monthly");

  // Ambil data dashboard
  const loadStats = useCallback(
    async (controller, isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const payload = await fetchDashboardStats(
          getAuthHeaders(),
          controller.signal
        );

        const statsData = payload?.data || {};

        setStats({
          totalGames: statsData.totalGames || 0,
          newOrders: statsData.newOrders || 0,
          lowStockCount: statsData.lowStockCount || 0,
          monthlyRevenue: statsData.monthlyRevenue || 0,
          totalUsers: statsData.totalUsers || 0,
          pendingOrders: statsData.pendingOrders || 0,
          outOfStock: statsData.outOfStock || 0,
          weeklyGrowth: statsData.weeklyGrowth || 0,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Gagal memuat data.");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getAuthHeaders]
  );

  const handleRefresh = () => {
    const controller = new AbortController();
    loadStats(controller, true);
  };

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    const controller = new AbortController();
    loadStats(controller);
    return () => controller.abort();
  }, [user, navigate, loadStats]);

  // Skeleton Loading
  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <div className="header-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
          </div>
        </div>

        <div className="stats-grid">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className="stat-card-skeleton">
              <div className="skeleton-icon"></div>
              <div className="skeleton-content">
                <div className="skeleton-line short"></div>
                <div className="skeleton-line long"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">📊</div>
          <h2>Gagal Memuat Dashboard</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button
              onClick={handleRefresh}
              className="retry-button"
              disabled={refreshing}
            >
              {refreshing ? "Memuat..." : "Coba Lagi"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="dashboard-title">
            Selamat Datang,{" "}
            <span className="highlight">{user?.name || "Admin"}</span>
          </h1>
          <p className="dashboard-subtitle">
            Ringkasan performa toko game Anda
          </p>
        </div>
        <div className="header-actions">
          <button
            onClick={handleRefresh}
            className="refresh-button"
            disabled={refreshing}
          >
            <FaSync className={refreshing ? "spinning" : ""} />
            {refreshing ? "Memuat..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Game"
          value={formatNumber(stats?.totalGames)}
          subtitle="Produk aktif"
          link="/admin/games"
          icon={<FaGamepad />}
          trend={{ value: "+12%", direction: "up" }}
        />
        <StatCard
          title="Pesanan Baru"
          value={formatNumber(stats?.newOrders)}
          subtitle="Menunggu proses"
          link="/admin/orders"
          icon={<FaShoppingCart />}
          trend={{ value: "+5", direction: "up" }}
        />
        <StatCard
          title="Stok Rendah"
          value={formatNumber(stats?.lowStockCount)}
          subtitle="Perlu restock"
          link="/admin/games?filter=lowstock"
          icon={<FaExclamationTriangle />}
          trend={{ value: "Perhatian", direction: "warning" }}
        />
        <StatCard
          title="Pendapatan"
          value={formatCurrency(stats?.monthlyRevenue)}
          subtitle="Bulan ini"
          icon={<FaMoneyBillWave />}
          trend={{ value: "+18%", direction: "up" }}
        />
        <StatCard
          title="Total Pengguna"
          value={formatNumber(stats?.totalUsers)}
          subtitle="Pelanggan terdaftar"
          icon={<FaUsers />}
          trend={{ value: "+8%", direction: "up" }}
        />
        <StatCard
          title="Habis Stok"
          value={formatNumber(stats?.outOfStock)}
          subtitle="Perlu perhatian"
          link="/admin/games?filter=outofstock"
          icon={<FaBoxOpen />}
          trend={{ value: "Segera restock", direction: "down" }}
        />
      </div>

      {/* Quick Actions Section */}
      <div className="quick-actions-section">
        <h2 className="section-title">Alat Manajemen Cepat</h2>
        <div className="quick-actions-grid">
          <QuickAction
            to="/admin/games"
            title="Kelola Game"
            description="Tambah, edit, dan kelola katalog game"
            icon={<FaGamepad />}
            badge={stats?.totalGames}
          />
          <QuickAction
            to="/admin/orders"
            title="Pesanan"
            description="Kelola dan proses pesanan pelanggan"
            icon={<FaShoppingBag />}
            badge={stats?.newOrders}
          />
          <QuickAction
            to="/admin/games/new"
            title="Tambah Game"
            description="Tambahkan produk baru ke katalog"
            icon={<FaPlus />}
          />
          <QuickAction
            to="/admin/games?filter=lowstock"
            title="Stok Rendah"
            description="Monitor produk yang perlu restock"
            icon={<FaExclamationTriangle />}
            badge={stats?.lowStockCount}
          />
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
          padding: 2rem 1rem;
          background: #f8fafc;
          min-height: 100vh;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Dashboard Header */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          gap: 2rem;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
          }
        }

        .welcome-section {
          flex: 1;
        }

        .dashboard-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .highlight {
          color: #dc2626;
        }

        .dashboard-subtitle {
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
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .refresh-button:hover:not(:disabled) {
          background: #b91c1c;
        }

        .refresh-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        /* Stat Card */
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #dc2626;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .stat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background: #dc2626;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.25rem;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .stat-trend.up {
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
        }

        .stat-trend.down {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }

        .stat-trend.warning {
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
        }

        .stat-content {
          margin-bottom: 1rem;
        }

        .stat-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .stat-subtitle {
          font-size: 0.85rem;
          color: #9ca3af;
        }

        .stat-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #dc2626;
          font-weight: 600;
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .stat-link:hover {
          gap: 0.75rem;
        }

        /* Quick Actions */
        .quick-actions-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .quick-action {
          background: #f8fafc;
          border-radius: 8px;
          padding: 1.5rem;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .quick-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: rgba(220, 38, 38, 0.2);
        }

        .action-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .action-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: #dc2626;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.1rem;
        }

        .action-badge {
          background: #dc2626;
          color: white;
          border-radius: 10px;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          min-width: 20px;
          text-align: center;
        }

        .action-content {
          flex: 1;
          margin-bottom: 1rem;
        }

        .action-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .action-description {
          color: #6b7280;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        /* Skeleton Loading */
        .skeleton-title {
          height: 2rem;
          background: #e5e7eb;
          border-radius: 6px;
          margin-bottom: 1rem;
          animation: pulse 2s infinite;
        }

        .skeleton-text {
          height: 1rem;
          width: 60%;
          background: #e5e7eb;
          border-radius: 4px;
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

        .skeleton-line.long {
          width: 80%;
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

        /* Error State */
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
          padding: 3rem 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 100%;
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .error-content h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #dc2626;
          margin-bottom: 1rem;
        }

        .error-content p {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }

        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
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

        .retry-button:hover:not(:disabled) {
          background: #b91c1c;
        }
      `}</style>
    </div>
  );
};

// --- Komponen Stat Card ---
const StatCard = ({ title, value, subtitle, link, icon, trend }) => (
  <div className="stat-card">
    <div className="stat-card-header">
      <div className="stat-icon-wrapper">
        <div className="stat-icon">{icon}</div>
      </div>
      {trend && (
        <div className={`stat-trend ${trend.direction}`}>
          {trend.direction === "up" && <FaArrowUp />}
          {trend.direction === "down" && <FaArrowDown />}
          <span>{trend.value}</span>
        </div>
      )}
    </div>
    <div className="stat-content">
      <h3 className="stat-title">{title}</h3>
      <p className="stat-value">{value}</p>
      {subtitle && <p className="stat-subtitle">{subtitle}</p>}
    </div>
    {link && (
      <Link to={link} className="stat-link">
        <span>Lihat Detail</span>
        <FaEye />
      </Link>
    )}
  </div>
);

// --- Komponen Quick Action ---
const QuickAction = ({ to, title, description, icon, badge }) => (
  <Link to={to} className="quick-action">
    <div className="action-header">
      <div className="action-icon">{icon}</div>
      {badge > 0 && <span className="action-badge">{badge}</span>}
    </div>
    <div className="action-content">
      <h3 className="action-title">{title}</h3>
      <p className="action-description">{description}</p>
    </div>
  </Link>
);

export default AdminDashboard;
