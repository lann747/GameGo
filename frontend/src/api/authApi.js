// src/api/authApi.js

const API_BASE_URL = "http://localhost/GameGo/backend/api/auth";

// === Helper untuk response ===
const handleResponse = async (
  response,
  defaultError = "Terjadi kesalahan."
) => {
  try {
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || defaultError);
    return data;
  } catch (err) {
    throw new Error(err.message || defaultError);
  }
};

// === LOGIN ===
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include", // penting untuk session cookie
      body: JSON.stringify({ email, password }),
    });

    const data = await handleResponse(response, "Login gagal.");

    // ✅ Simpan ke localStorage
    localStorage.setItem("user_id", data.user_id);
    localStorage.setItem("role", data.role);
    localStorage.setItem("username", data.username);

    return {
      user_id: data.user_id,
      role: data.role,
      username: data.username,
      message: data.message,
    };
  } catch (error) {
    throw new Error(error.message || "Login gagal.");
  }
};

// === REGISTER ===
export const registerUser = async (username, email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, email, password }),
    });

    return await handleResponse(response, "Registrasi gagal.");
  } catch (error) {
    throw new Error(error.message || "Registrasi gagal.");
  }
};

// === LOGOUT ===
export const logoutUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/logout.php`, {
      method: "POST",
      headers: { Accept: "application/json" },
      credentials: "include",
    });

    const data = await handleResponse(response, "Logout gagal.");

    // ✅ Bersihkan localStorage
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    localStorage.removeItem("username");

    return data;
  } catch (error) {
    throw new Error(error.message || "Logout gagal.");
  }
};

// === CHECK SESSION ===
export const checkLoginStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/check_session.php`, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    });

    const data = await handleResponse(
      response,
      "Gagal memeriksa status login."
    );

    // ✅ Sinkronkan ulang ke localStorage
    if (data && data.logged_in) {
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Gagal memeriksa status login.");
  }
};
