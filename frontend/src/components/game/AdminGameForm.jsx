import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { createGame, updateGame, deleteGame } from "../../api/gameApi";
import {
  FaUpload,
  FaImage,
  FaSave,
  FaTrash,
  FaPlus,
  FaEdit,
  FaLink,
  FaSpinner,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const AdminGameForm = ({ gameToEdit, onGameSaved, onGameDeleted }) => {
  const { getAuthHeaders } = useAuth();
  const isEditMode = !!gameToEdit;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    image_url: "",
    genre: "",
    is_active: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [imageError, setImageError] = useState(null);

  useEffect(() => {
    if (gameToEdit) {
      setFormData({
        title: gameToEdit.title || "",
        description: gameToEdit.description || "",
        price: gameToEdit.price || "",
        stock: gameToEdit.stock || "",
        image_url: gameToEdit.image_url || "",
        genre: gameToEdit.genre || "",
        is_active: gameToEdit.is_active === 1 || gameToEdit.is_active === true,
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      setActiveTab(gameToEdit.image_url ? "url" : "upload");
    } else {
      resetForm();
    }

    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [gameToEdit]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      stock: "",
      image_url: "",
      genre: "",
      is_active: true,
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(null);
    setImageError(null);
    setActiveTab("upload");
  };

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file) {
        if (!file.type.startsWith("image/")) {
          setImageError("Harap pilih file gambar yang valid");
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setImageError("Ukuran file maksimal 5MB");
          return;
        }
        setImageError(null);
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setFormData((prev) => ({ ...prev, image_url: "" }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "image_url" && value) {
      setImageError(null);
    }
  };

  const handleImageUrlChange = (url) => {
    setFormData((prev) => ({ ...prev, image_url: url }));
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setImageError(null);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Judul game wajib diisi.");
      return false;
    }
    if (formData.price === "" || Number(formData.price) < 0) {
      setError("Harga tidak boleh kosong atau negatif.");
      return false;
    }
    if (formData.stock === "" || Number(formData.stock) < 0) {
      setError("Stok tidak boleh kosong atau negatif.");
      return false;
    }
    if (!selectedFile && !formData.image_url && !gameToEdit?.image_url) {
      setError("Harap upload gambar atau masukkan URL gambar.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const formPayload = new FormData();
    Object.keys(formData).forEach((key) => {
      let value = formData[key];
      if (key === "price") value = parseFloat(value);
      if (key === "stock") value = parseInt(value, 10);
      if (key === "is_active") value = formData.is_active ? "1" : "0";
      if (key === "image_url" && selectedFile) return;
      formPayload.append(key, value);
    });
    if (selectedFile) formPayload.append("image_file", selectedFile);

    const authHeaders = getAuthHeaders();
    const apiFunction = isEditMode ? updateGame : createGame;
    const successMessage = isEditMode ? "diperbarui" : "ditambahkan";

    try {
      if (isEditMode) {
        await apiFunction(gameToEdit.id, formPayload, authHeaders);
      } else {
        await apiFunction(formPayload, authHeaders);
        resetForm();
      }
      setSuccess(`Game "${formData.title}" berhasil ${successMessage}.`);
      onGameSaved?.();
    } catch (err) {
      console.error("API Error:", err);
      if (err.message?.includes("Failed to fetch")) {
        setError(
          "Gagal terhubung ke server. Periksa koneksi dan pastikan backend berjalan."
        );
      } else {
        setError(err.message || `Gagal ${successMessage} game.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus game "${formData.title}"?`
      )
    )
      return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const authHeaders = getAuthHeaders();
      await deleteGame(gameToEdit.id, authHeaders);
      setSuccess(`Game "${formData.title}" berhasil dihapus.`);
      onGameDeleted?.();
    } catch (err) {
      setError(err.message || "Gagal menghapus game.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = () => {
    setImageError("Gagal memuat gambar. Periksa URL atau upload file baru.");
  };

  const currentImageUrl =
    previewUrl || formData.image_url || gameToEdit?.image_url;

  return (
    <div className="admin-game-form">
      {/* Header */}
      <div className="form-header">
        <h1 className="form-title">
          {isEditMode ? `Edit Game "${gameToEdit.title}"` : "Tambah Game Baru"}
        </h1>
        <button
          type="button"
          onClick={resetForm}
          className="reset-btn"
          disabled={loading}
        >
          Reset
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="alert error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="alert success">
          <strong>Sukses:</strong> {success}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="game-form">
        <div className="form-grid">
          {/* Basic Information */}
          <div className="form-section">
            <h3 className="section-title">Informasi Dasar</h3>

            <div className="input-group">
              <label>Judul Game *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Masukkan judul game..."
              />
            </div>

            <div className="input-group">
              <label>Genre</label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                placeholder="Contoh: Action, RPG, Adventure..."
              />
            </div>

            <div className="input-group">
              <label>Deskripsi</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Deskripsikan game secara detail..."
              ></textarea>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="form-section">
            <h3 className="section-title">Harga & Stok</h3>

            <div className="input-row">
              <div className="input-group">
                <label>Harga (IDR) *</label>
                <div className="price-input">
                  <span className="prefix">Rp</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Stok *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="toggle-group">
              <label className="toggle">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-text">
                  {formData.is_active ? "Game Aktif" : "Game Nonaktif"}
                </span>
              </label>
            </div>
          </div>

          {/* Image Upload */}
          <div className="form-section image-section">
            <h3 className="section-title">Gambar Game</h3>

            {/* Image Tabs */}
            <div className="tabs">
              <button
                type="button"
                className={activeTab === "upload" ? "tab active" : "tab"}
                onClick={() => setActiveTab("upload")}
              >
                <FaUpload />
                Upload File
              </button>
              <button
                type="button"
                className={activeTab === "url" ? "tab active" : "tab"}
                onClick={() => setActiveTab("url")}
              >
                <FaLink />
                URL Gambar
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === "upload" && (
                <div className="upload-area">
                  <input
                    type="file"
                    name="image_file"
                    onChange={handleChange}
                    accept="image/*"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="upload-label">
                    <FaImage />
                    <span>
                      {selectedFile ? selectedFile.name : "Pilih gambar..."}
                    </span>
                    <small>PNG, JPG, JPEG (Maks. 5MB)</small>
                  </label>
                </div>
              )}

              {activeTab === "url" && (
                <div className="url-input">
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}
            </div>

            {/* Image Preview */}
            {(currentImageUrl || imageError) && (
              <div className="image-preview">
                <p>Preview Gambar:</p>
                {imageError ? (
                  <div className="preview-error">
                    <FaImage />
                    <span>{imageError}</span>
                  </div>
                ) : (
                  <div className="preview-container">
                    <img
                      src={currentImageUrl}
                      alt="Preview"
                      onError={handleImageError}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className={loading ? "btn primary loading" : "btn primary"}
          >
            {loading ? (
              <>
                <FaSpinner className="spinner" />
                {isEditMode ? "Menyimpan..." : "Menambahkan..."}
              </>
            ) : (
              <>
                <FaSave />
                {isEditMode ? "Simpan Perubahan" : "Tambah Game"}
              </>
            )}
          </button>

          {isEditMode && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="btn danger"
            >
              <FaTrash />
              Hapus Game
            </button>
          )}
        </div>
      </form>

      <style jsx>{`
        .admin-game-form {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          background: white;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e5e5e5;
        }

        .form-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .reset-btn {
          padding: 8px 16px;
          background: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 4px;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-btn:hover:not(:disabled) {
          background: #e9ecef;
        }

        .reset-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .alert.error {
          background: #fee;
          border: 1px solid #fcc;
          color: #c33;
        }

        .alert.success {
          background: #efe;
          border: 1px solid #cfc;
          color: #363;
        }

        .game-form {
          background: white;
        }

        .form-grid {
          display: grid;
          gap: 30px;
        }

        @media (min-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .form-section {
          background: #fafafa;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #eee;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 20px 0;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e5e5;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #333;
        }

        .input-group input,
        .input-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        .input-group input:focus,
        .input-group textarea:focus {
          outline: none;
          border-color: #dc2626;
        }

        .input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .price-input {
          position: relative;
          display: flex;
          align-items: center;
        }

        .prefix {
          position: absolute;
          left: 12px;
          color: #666;
          font-weight: 500;
        }

        .price-input input {
          padding-left: 30px;
        }

        .toggle-group {
          margin-top: 25px;
        }

        .toggle {
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .toggle input {
          display: none;
        }

        .toggle-slider {
          width: 44px;
          height: 24px;
          background: #ccc;
          border-radius: 24px;
          position: relative;
          margin-right: 10px;
          transition: background 0.2s;
        }

        .toggle-slider:before {
          content: "";
          position: absolute;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          top: 3px;
          left: 3px;
          transition: transform 0.2s;
        }

        .toggle input:checked + .toggle-slider {
          background: #dc2626;
        }

        .toggle input:checked + .toggle-slider:before {
          transform: translateX(20px);
        }

        .toggle-text {
          font-weight: 500;
          color: #333;
        }

        .tabs {
          display: flex;
          background: #f5f5f5;
          border-radius: 4px;
          padding: 4px;
          margin-bottom: 15px;
        }

        .tab {
          flex: 1;
          padding: 10px;
          border: none;
          background: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border-radius: 4px;
          font-size: 14px;
          color: #666;
          transition: all 0.2s;
        }

        .tab.active {
          background: white;
          color: #dc2626;
          font-weight: 500;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .file-input {
          display: none;
        }

        .upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 30px;
          border: 2px dashed #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: border-color 0.2s;
          text-align: center;
          color: #666;
        }

        .upload-label:hover {
          border-color: #dc2626;
        }

        .upload-label svg {
          font-size: 2rem;
          margin-bottom: 10px;
          color: #999;
        }

        .upload-label small {
          margin-top: 5px;
          color: #999;
        }

        .url-input input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .image-preview {
          margin-top: 20px;
        }

        .image-preview p {
          margin-bottom: 10px;
          font-weight: 500;
          color: #333;
        }

        .preview-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 15px;
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 4px;
          color: #c33;
        }

        .preview-container {
          max-width: 200px;
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid #ddd;
        }

        .preview-container img {
          width: 100%;
          height: auto;
          display: block;
        }

        .form-actions {
          display: flex;
          gap: 15px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e5e5;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn.primary {
          background: #dc2626;
          color: white;
        }

        .btn.primary:hover:not(:disabled) {
          background: #b91c1c;
        }

        .btn.danger {
          background: #f8f9fa;
          border: 1px solid #ddd;
          color: #666;
        }

        .btn.danger:hover:not(:disabled) {
          background: #e9ecef;
        }

        .btn.loading {
          opacity: 0.8;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 767px) {
          .admin-game-form {
            padding: 15px;
          }

          .form-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }

          .input-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminGameForm;
