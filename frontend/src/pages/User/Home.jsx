import React, { useState, useEffect, useCallback } from "react";
import { getAllGames } from "../../api/gameApi";
import GameCard from "../../components/game/GameCard";
import "../../index.css";

const Home = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch daftar game
  const fetchGames = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllGames(signal);
      setGames(response.data || []);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Fetch Games Error:", err);
        setError(err.message || "Gagal memuat daftar game. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchGames(controller.signal);
    return () => controller.abort();
  }, [fetchGames]);

  // Loading dengan skeleton
  if (loading) {
    return (
      <div className="home-container">
        {/* Hero Section Skeleton */}
        <div className="hero-section">
          <div className="container">
            <div className="hero-content">
              <div
                className="skeleton-title"
                style={{ height: "3rem", marginBottom: "1rem" }}
              ></div>
              <div
                className="skeleton-text"
                style={{ height: "1.5rem", width: "70%", margin: "0 auto" }}
              ></div>
              <div className="hero-stats">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="stat">
                    <div
                      className="skeleton-text"
                      style={{
                        height: "2rem",
                        width: "4rem",
                        margin: "0 auto 0.5rem",
                      }}
                    ></div>
                    <div
                      className="skeleton-text"
                      style={{ height: "1rem", width: "6rem" }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Games Section Skeleton */}
        <div className="games-section">
          <div className="container">
            <div className="section-header">
              <div
                className="skeleton-subtitle"
                style={{ height: "2rem", width: "200px" }}
              ></div>
            </div>
            <div className="games-grid">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="game-card-skeleton">
                  <div
                    className="skeleton-image"
                    style={{ height: "200px", borderRadius: "8px 8px 0 0" }}
                  ></div>
                  <div className="skeleton-content" style={{ padding: "1rem" }}>
                    <div
                      className="skeleton-line short"
                      style={{ height: "1.25rem", marginBottom: "0.75rem" }}
                    ></div>
                    <div
                      className="skeleton-line medium"
                      style={{ height: "1rem", marginBottom: "0.5rem" }}
                    ></div>
                    <div
                      className="skeleton-line long"
                      style={{ height: "1rem", marginBottom: "1rem" }}
                    ></div>
                    <div
                      className="skeleton-line"
                      style={{ height: "2.5rem", borderRadius: "6px" }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && games.length === 0) {
    return (
      <div className="home-container">
        <div className="error-container">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h1 className="error-title">Terjadi Kesalahan</h1>
            <p className="error-message">{error}</p>
            <p className="error-help">
              Pastikan koneksi internet stabil dan server berjalan dengan baik.
            </p>
            <button
              onClick={() => fetchGames()}
              className="retry-button"
              style={{ marginTop: "1rem" }}
            >
              <span>🔄</span>
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Katalog Game <span className="highlight">GAMEGO</span>
            </h1>
            <p className="hero-subtitle">
              Temukan dan beli game favorit Anda dengan pengalaman terbaik
            </p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">{games.length}</span>
                <span className="stat-label">Game Tersedia</span>
              </div>
              <div className="stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support</span>
              </div>
              <div className="stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">Original</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="games-section">
        <div className="container">
          {games.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎮</div>
              <h2 className="empty-title">Belum Ada Game</h2>
              <p className="empty-message">
                Maaf, belum ada game yang tersedia saat ini.
              </p>
            </div>
          ) : (
            <div className="games-grid">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
