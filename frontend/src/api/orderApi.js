const API_ORDERS_URL = "http://localhost/GameGo/backend/api/orders";

/**
 * Utility untuk menangani response fetch dengan aman
 */
const handleResponse = async (
  response,
  defaultError = "Terjadi kesalahan."
) => {
  try {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || defaultError);
    }
    return data;
  } catch (err) {
    throw new Error(err.message || "Respons server tidak valid (bukan JSON).");
  }
};

// ------------------------------------------------------------------
// 🛒 USER ENDPOINTS
// ------------------------------------------------------------------

/**
 * Membuat pesanan baru (User login)
 */
export const createOrder = async (items, total_price, authHeaders) => {
  const response = await fetch(`${API_ORDERS_URL}/create.php`, {
    method: "POST",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ items, total_price }),
  });

  return handleResponse(response, "Gagal membuat pesanan.");
};

/**
 * Mengambil riwayat pesanan user (User login)
 */
export const getUserOrders = async (authHeaders) => {
  const response = await fetch(`${API_ORDERS_URL}/read_user_orders.php`, {
    method: "GET",
    headers: {
      ...authHeaders,
      Accept: "application/json",
    },
    credentials: "include",
  });

  const data = await handleResponse(
    response,
    "Gagal mengambil riwayat pesanan."
  );

  // pastikan selalu array
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.orders)) return data.orders;
  return [];
};

// ------------------------------------------------------------------
// 🔑 ADMIN ENDPOINTS
// ------------------------------------------------------------------

/**
 * Mengambil semua pesanan (Admin only)
 */
export const getAllOrdersAdmin = async (authHeaders) => {
  const response = await fetch(`${API_ORDERS_URL}/read_all.php`, {
    method: "GET",
    headers: {
      ...authHeaders,
      Accept: "application/json",
    },
    credentials: "include",
  });

  const data = await handleResponse(
    response,
    "Akses ditolak. Tidak dapat mengambil semua pesanan."
  );

  // biar konsisten di ManageOrders.jsx
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.orders)) return data.orders;
  return [];
};

/**
 * Update status pesanan (Admin only)
 * Bisa kirim status + delivery_url atau file
 */
export const updateOrderStatusAdmin = async (
  orderId,
  newStatus,
  authHeaders,
  deliveryUrl = null,
  deliveryFile = null
) => {
  let response;

  if (deliveryFile) {
    // === Pakai FormData kalau ada file ===
    const formData = new FormData();
    formData.append("id", orderId);
    formData.append("status", newStatus);
    if (deliveryUrl) formData.append("delivery_url", deliveryUrl);
    formData.append("delivery_file", deliveryFile);

    // Buang Content-Type manual agar boundary otomatis
    const { ["Content-Type"]: _, ...safeHeaders } = authHeaders;

    response = await fetch(`${API_ORDERS_URL}/update_status.php`, {
      method: "POST",
      headers: {
        ...safeHeaders,
        Accept: "application/json",
      },
      credentials: "include",
      body: formData,
    });
  } else {
    // === Kirim JSON biasa ===
    response = await fetch(`${API_ORDERS_URL}/update_status.php`, {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: orderId,
        status: newStatus,
        delivery_url: deliveryUrl,
      }),
    });
  }

  return handleResponse(response, "Gagal memperbarui status pesanan.");
};
