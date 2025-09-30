<?php
// File: C:\xampp\htdocs\gamegoo\api\orders\read_user_orders.php

// === CORS & Headers ===
// Origin check dinamis untuk mengatasi error wildcard/credentials
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
$allowed_origins = ["http://localhost:5173", "http://127.0.0.1:5173"];
header("Content-Type: application/json; charset=UTF-8");


if (in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    // Fallback yang aman
    header("Access-Control-Allow-Origin: *");
}

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
// Wajib mengizinkan header otorisasi React
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, User-Id, User-Role");

// === Preflight ===
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// === Validate Method ===
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); echo json_encode(["status" => "error", "message" => "Method not allowed."]); exit;
}

// === Error Handling ===
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// === DB Connection ===
require_once __DIR__ . '/../../config/Database.php';
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(503); echo json_encode(["status" => "error", "message" => "Database connection failed."]); exit;
}

// === Proteksi User Authentication (Menggunakan Header) ===
// Ambil User ID dari header React
$user_id = intval($_SERVER['HTTP_USER_ID'] ?? 0); 

if ($user_id <= 0) {
    http_response_code(401); // Unauthorized
    echo json_encode(["status" => "error", "message" => "Unauthorized. Please login to view orders."]);
    exit;
}

// === Fetch Orders (KOREKSI QUERY KRITIS) ===
try {
    // 🚨 KOREKSI: Tambahkan klausa WHERE untuk memfilter berdasarkan user_id
    $query = "
        SELECT 
            o.id, o.user_id, o.order_date, o.total_price, o.status, o.delivery_file,
            o.delivery_url, o.updated_at,
            u.username
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        WHERE o.user_id = :user_id 
        ORDER BY o.order_date DESC
    ";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT); // Bind user_id
    $stmt->execute();
    
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "count"   => count($orders),
        "orders"  => $orders ?: []
    ]);
} catch (PDOException $e) {
    error_log("DB Error in read_user_orders.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database query failed. Please try again later."]);
}