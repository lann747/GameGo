<?php
// File: C:\xampp\htdocs\gamegoo\api\orders\read_orders.php

// === Start Session ===
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// === CORS & Headers ===
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = ["http://localhost:5173", "http://127.0.0.1:5173"];

if (in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: http://localhost:5173");
}

header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// === Error Handling ===
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// === Database Connection ===
require_once __DIR__ . '/../../config/Database.php';
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(503);
    echo json_encode(["status" => "error", "message" => "Database connection failed."]);
    exit;
}

// === Ambil user dari session ===
$user_id   = $_SESSION['user_id'] ?? 0;
$user_role = strtolower($_SESSION['role'] ?? 'user');

if ($user_id <= 0) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized. Please login."]);
    exit;
}

try {
    if ($user_role === 'admin') {
        // 🔹 ADMIN: lihat semua pesanan
        $query = "
            SELECT 
                o.id, o.user_id, u.username, o.order_date, 
                o.total_price, o.status, 
                o.delivery_url, o.delivery_file,
                o.updated_at
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            ORDER BY o.order_date DESC
        ";
        $stmt = $db->prepare($query);
    } else {
        // 🔹 USER: hanya lihat order miliknya
        $query = "
            SELECT 
                o.id, o.user_id, u.username, o.order_date, 
                o.total_price, o.status, 
                o.delivery_url, o.delivery_file,
                o.updated_at
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            WHERE o.user_id = :user_id
            ORDER BY o.order_date DESC
        ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    }

    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "role"    => $user_role,
        "count"   => count($orders),
        "orders"  => $orders ?: []
    ]);
} catch (PDOException $e) {
    error_log("DB Error in read_orders.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database query failed."]);
}