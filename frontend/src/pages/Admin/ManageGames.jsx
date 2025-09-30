import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getAllGames, deleteGame, toggleGameStatus } from "../../api/gameApi";
import AdminGameForm from "../../components/game/AdminGameForm";
import {
  FaGamepad,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaSearch,
  FaFilter,
  FaSort,
  FaSync,
  FaBox,
  FaExclamationTriangle,
  FaDollarSign,
} from "react-icons/fa";

const ManageGames = () => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [gameToEdit, setGameToEdit] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const { getAuthHeaders } = useAuth();

  // Format Rupiah
  const formatCurrency = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num || 0);

  // Ambil data game
  const fetchGames = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await getAllGames(signal);
      const normalized = (response.data || []).map((g) => ({
        id: g.id ?? g.game_id,
        title: g.title,
        price: g.price,
        stock: g.stock,
        is_active: g.is_active,
        image_url: g.image_url,
        genre: g.genre || "Unknown",
        description: g.description || "",
        created_at: g.created_at || new Date().toISOString(),
      }));
      setGames(normalized);
      setFilteredGames(normalized);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Gagal mengambil daftar game.");
        setGames([]);
        setFilteredGames([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter dan search games
  useEffect(() => {
    let result = games;

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (game) =>
          game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          game.genre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((game) =>
        statusFilter === "active" ? game.is_active : !game.is_active
      );
    }

    // Stock filter
    if (stockFilter !== "all") {
      if (stockFilter === "low") {
        result = result.filter((game) => game.stock <= 5 && game.stock > 0);
      } else if (stockFilter === "out") {
        result = result.filter((game) => game.stock === 0);
      } else if (stockFilter === "good") {
        result = result.filter((game) => game.stock > 5);
      }
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title);
        case "price_high":
          return b.price - a.price;
        case "price_low":
          return a.price - b.price;
        case "stock_high":
          return b.stock - a.stock;
        case "stock_low":
          return a.stock - b.stock;
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        default:
          return 0;
      }
    });

    setFilteredGames(result);
  }, [games, searchTerm, statusFilter, stockFilter, sortBy]);

  useEffect(() => {
    const controller = new AbortController();
    fetchGames(controller.signal);
    return () => controller.abort();
  }, [fetchGames]);

  const handleEdit = (gameId) => {
    const selectedGame = games.find((g) => g.id === gameId);
    if (selectedGame) {
      setGameToEdit(selectedGame);
      setIsFormVisible(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (gameId) => {
    const game = games.find((g) => g.id === gameId);
    if (
      !window.confirm(
        `Yakin ingin menghapus game "${game?.title}"? Tindakan ini tidak bisa dibatalkan.`
      )
    )
      return;

    setDeletingId(gameId);
    try {
      await deleteGame(gameId, getAuthHeaders());
      setSuccess(`Game "${game?.title}" berhasil dihapus.`);
      fetchGames();
    } catch (err) {
      setError(err.message || "Gagal menghapus game.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (gameId) => {
    const game = games.find((g) => g.id === gameId);
    try {
      await toggleGameStatus(gameId, getAuthHeaders());
      setSuccess(
        `Game "${game?.title}" berhasil ${
          game?.is_active ? "dinonaktifkan" : "diaktifkan"
        }.`
      );
      fetchGames();
    } catch (err) {
      setError(err.message || "Gagal mengubah status game.");
    }
  };

  const handleFormCallback = (message) => {
    if (message) setSuccess(message);
    setGameToEdit(null);
    setIsFormVisible(false);
    fetchGames();
  };

  const handleAddNew = () => {
    setGameToEdit(null);
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefresh = () => {
    fetchGames();
  };

  const getStockStatus = (stock) => {
    if (stock === 0)
      return { label: "Habis", color: "red", icon: <FaExclamationTriangle /> };
    if (stock <= 5)
      return {
        label: "Sedikit",
        color: "orange",
        icon: <FaExclamationTriangle />,
      };
    return { label: "Tersedia", color: "green", icon: <FaBox /> };
  };

  const getStats = () => {
    const total = games.length;
    const active = games.filter((g) => g.is_active).length;
    const lowStock = games.filter((g) => g.stock <= 5 && g.stock > 0).length;
    const outOfStock = games.filter((g) => g.stock === 0).length;

    return { total, active, lowStock, outOfStock };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="manage-games">
        <div className="page-header">
          <div className="skeleton-title"></div>
          <div className="skeleton-button"></div>
        </div>

        <div className="stats-grid">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="stat-card-skeleton">
              <div className="skeleton-icon"></div>
              <div className="skeleton-content">
                <div className="skeleton-line short"></div>
                <div className="skeleton-line long"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="games-grid">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className="game-card-skeleton">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-line short"></div>
                <div className="skeleton-line medium"></div>
                <div className="skeleton-line long"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="manage-games">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Kelola Katalog Game</h1>
          <p className="page-subtitle">Kelola semua produk game di toko Anda</p>
        </div>
        <div className="header-actions">
          <button
            onClick={handleRefresh}
            className="refresh-button"
            title="Refresh data"
          >
            <FaSync />
          </button>
          <button onClick={handleAddNew} className="primary-button">
            <FaPlus className="button-icon" />
            Tambah Game
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-item">
          <div className="stat-icon total">
            <FaGamepad />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Game</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon active">
            <FaEye />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Aktif</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon warning">
            <FaExclamationTriangle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.lowStock}</div>
            <div className="stat-label">Stok Sedikit</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon danger">
            <FaBox />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.outOfStock}</div>
            <div className="stat-label">Habis</div>
          </div>
        </div>
      </div>

      {/* Notifikasi */}
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

      {/* Form Tambah/Edit */}
      {isFormVisible && (
        <div className="form-section">
          <AdminGameForm
            gameToEdit={gameToEdit}
            onGameSaved={() => handleFormCallback("Game berhasil disimpan.")}
            onGameDeleted={() => handleFormCallback("Game berhasil dihapus.")}
          />
          <button
            onClick={() => setIsFormVisible(false)}
            className="secondary-button"
          >
            Sembunyikan Form
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Cari game berdasarkan judul atau genre..."
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
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>

          <div className="filter-item">
            <FaBox className="filter-icon" />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Semua Stok</option>
              <option value="good">Stok Baik</option>
              <option value="low">Stok Sedikit</option>
              <option value="out">Habis</option>
            </select>
          </div>

          <div className="filter-item">
            <FaSort className="filter-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="name">Nama A-Z</option>
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="price_high">Harga Tertinggi</option>
              <option value="price_low">Harga Terendah</option>
              <option value="stock_high">Stok Terbanyak</option>
              <option value="stock_low">Stok Tersedikit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="games-section">
        <div className="section-header">
          <h2 className="section-title">
            Daftar Game{" "}
            <span className="count-badge">{filteredGames.length}</span>
          </h2>
          <div className="section-info">
            Menampilkan {filteredGames.length} dari {games.length} game
          </div>
        </div>

        {filteredGames.length > 0 ? (
          <div className="games-grid">
            {filteredGames.map((game) => {
              const stockStatus = getStockStatus(game.stock);
              return (
                <div key={game.id} className="game-card">
                  <div className="game-image">
                    <img
                      src={game.image_url || "/api/placeholder/200/120"}
                      alt={game.title}
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA1MEgxMjBNNzAgNjBIMTMwTTY1IDcwSDEzNSIgc3Ryb2tlPSIjQzBDREUxIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+";
                      }}
                    />
                    <div className="status-badge">
                      {game.is_active ? "Aktif" : "Nonaktif"}
                    </div>
                  </div>

                  <div className="game-content">
                    <h3 className="game-title">{game.title}</h3>
                    <p className="game-genre">{game.genre}</p>

                    <div className="game-details">
                      <div className="detail-item">
                        <FaDollarSign className="detail-icon" />
                        <span className="detail-value">
                          {formatCurrency(game.price)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <FaBox className="detail-icon" />
                        <span className={`stock-value ${stockStatus.color}`}>
                          {stockStatus.icon} {game.stock} unit
                        </span>
                      </div>
                    </div>

                    <div className="game-actions">
                      <button
                        onClick={() => handleEdit(game.id)}
                        className="action-button edit"
                        title="Edit game"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleToggle(game.id)}
                        className={`action-button toggle ${
                          game.is_active ? "deactivate" : "activate"
                        }`}
                        title={game.is_active ? "Nonaktifkan" : "Aktifkan"}
                      >
                        {game.is_active ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <button
                        onClick={() => handleDelete(game.id)}
                        disabled={deletingId === game.id}
                        className="action-button delete"
                        title="Hapus game"
                      >
                        {deletingId === game.id ? (
                          <FaSync className="spinning" />
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <FaGamepad className="empty-icon" />
            <h3 className="empty-title">Tidak Ada Game Ditemukan</h3>
            <p className="empty-description">
              {games.length === 0
                ? "Belum ada game yang ditambahkan. Mulai dengan menambahkan game pertama Anda!"
                : "Tidak ada game yang sesuai dengan filter pencarian Anda."}
            </p>
            {games.length === 0 && (
              <button onClick={handleAddNew} className="primary-button">
                <FaPlus className="button-icon" />
                Tambah Game Pertama
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .manage-games {
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

        .primary-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .primary-button:hover {
          background: #b91c1c;
        }

        .button-icon {
          font-size: 0.9rem;
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

        .stat-icon.active {
          background: #16a34a;
        }

        .stat-icon.warning {
          background: #d97706;
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

        /* Form Section */
        .form-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .secondary-button {
          padding: 0.75rem 1.5rem;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .secondary-button:hover {
          background: #e5e7eb;
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

        /* Games Section */
        .games-section {
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

        /* Games Grid */
        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .game-card {
          background: #f8fafc;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .game-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          border-color: rgba(220, 38, 38, 0.2);
        }

        .game-image {
          position: relative;
          height: 160px;
          overflow: hidden;
        }

        .game-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .game-card:hover .game-image img {
          transform: scale(1.05);
        }

        .status-badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          background: #16a34a;
        }

        .game-content {
          padding: 1.5rem;
        }

        .game-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }

        .game-genre {
          color: #dc2626;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .game-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .detail-icon {
          color: #6b7280;
          font-size: 0.8rem;
          width: 16px;
        }

        .detail-value {
          font-size: 0.9rem;
          color: #374151;
          font-weight: 500;
        }

        .stock-value {
          font-size: 0.9rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .stock-value.green {
          color: #16a34a;
        }

        .stock-value.orange {
          color: #d97706;
        }

        .stock-value.red {
          color: #dc2626;
        }

        .game-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
        }

        .action-button.edit {
          background: #2563eb;
        }

        .action-button.edit:hover {
          background: #1d4ed8;
        }

        .action-button.toggle {
          background: #d97706;
        }

        .action-button.toggle:hover {
          background: #b45309;
        }

        .action-button.delete {
          background: #dc2626;
        }

        .action-button.delete:hover:not(:disabled) {
          background: #b91c1c;
        }

        .action-button:disabled {
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
          margin-bottom: 2rem;
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
          width: 150px;
          background: #e5e7eb;
          border-radius: 6px;
          animation: pulse 2s infinite;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
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

        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .game-card-skeleton {
          background: #f8fafc;
          border-radius: 12px;
          overflow: hidden;
        }

        .skeleton-image {
          height: 160px;
          background: #e5e7eb;
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

          .games-grid {
            grid-template-columns: 1fr;
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
        }
      `}</style>
    </div>
  );
};

export default ManageGames;
