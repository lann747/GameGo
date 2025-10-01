# GameGo - Marketplace Game

GameGo adalah marketplace sederhana untuk jual beli game.  
Proyek ini terdiri dari **Backend (PHP - MySQL)** dan **Frontend (React + Vite)**.

---

## 📌 Cara Menjalankan

### 1. Setup Backend (PHP & MySQL)
1. Pindahkan folder `GameGo` (pastikan nama foldernya GameGo) ke dalam direktori **htdocs** (jika pakai XAMPP).
   ```
   C:\xampp\htdocs\GameGo
   ```
2. Jalankan **XAMPP** → start **Apache** dan **MySQL**.

---

### 2. Setup Frontend (React + Vite)
1. Buka terminal, masuk ke folder frontend:
   ```
   cd frontend
   ```
2. Install dependency:
   ```
   npm install
   ```
3. Jalankan development server:
   ```
   npm run dev
   ```
4. Buka link yang muncul (biasanya `http://localhost:5173`).

---

## 🔗 URL Default
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost/GameGo/api`

---

## 👥 Role User
- **Buyer** → Bisa membeli game.
- **Admin** → Mengelola mengelola game.

---

## ⚡ Catatan
- Pastikan MySQL & Apache berjalan sebelum membuka frontend.
- Jika API tidak terbaca, cek `API_BASE_URL` di file frontend (`src/api`).
