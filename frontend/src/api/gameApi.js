// src/api/gameApi.js

const API_GAMES_URL = "http://localhost/GameGo/backend/api/games";

// === Helper Functions ===
const handleResponse = async (
  response,
  defaultError = "Terjadi kesalahan."
) => {
  let rawText;
  try {
    rawText = await response.text();
    const data = rawText ? JSON.parse(rawText) : {};

    if (!response.ok) {
      throw new Error(data.message || defaultError);
    }
    return data;
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(
        `Respons server tidak valid (bukan JSON): ${rawText || "-"}`
      );
    }
    throw err;
  }
};

const filterHeaders = (authHeaders = {}, body) => {
  const headers = { ...authHeaders };
  // Untuk FormData biarkan browser yang atur
  if (body instanceof FormData) {
    delete headers["Content-Type"];
  }
  return headers;
};

// === Public Endpoints ===
export const getAllGames = async (signal) => {
  const response = await fetch(`${API_GAMES_URL}/read_all.php`, {
    method: "GET",
    credentials: "include",
    signal,
  });
  return handleResponse(response, "Gagal mengambil daftar game.");
};

export const getGameById = async (id) => {
  const response = await fetch(`${API_GAMES_URL}/read_one.php?id=${id}`, {
    method: "GET",
    credentials: "include",
  });
  return handleResponse(response, "Game tidak ditemukan.");
};

// === Admin Endpoints ===
export const createGame = async (gameData, authHeaders) => {
  const response = await fetch(`${API_GAMES_URL}/create.php`, {
    method: "POST",
    headers: filterHeaders(authHeaders, gameData),
    body: gameData,
    credentials: "include",
  });
  return handleResponse(response, "Gagal menambahkan game.");
};

export const updateGame = async (id, updatedData, authHeaders) => {
  const response = await fetch(`${API_GAMES_URL}/update.php?id=${id}`, {
    method: "POST", // pakai POST untuk FormData
    headers: filterHeaders(authHeaders, updatedData),
    body: updatedData,
    credentials: "include",
  });
  return handleResponse(response, "Gagal mengupdate game.");
};

export const deleteGame = async (id, authHeaders) => {
  const response = await fetch(`${API_GAMES_URL}/delete.php?id=${id}`, {
    method: "POST", // ubah ke POST
    headers: filterHeaders(authHeaders),
    credentials: "include",
  });
  return handleResponse(response, "Gagal menghapus game.");
};

export const toggleGameStatus = async (id, headers) => {
  const response = await fetch(`${API_GAMES_URL}/toggle_status.php`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
    credentials: "include",
  });
  return handleResponse(response, "Gagal mengubah status game.");
};

