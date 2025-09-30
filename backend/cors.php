<?php
// === Konfigurasi CORS ===

// Ambil origin dari request (kalau ada)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Daftar origin yang diizinkan (whitelist)
$allowed_origins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173'
];

// Cek apakah origin ada di whitelist
if ($origin && in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true"); // penting untuk cookie/session
}

// Header umum CORS
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, User-Id, User-Role");

// Kalau request preflight (OPTIONS), langsung kasih 200 OK
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}