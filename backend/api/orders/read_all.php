<?php
// File: C:\xampp\htdocs\gamegoo\api\orders\read_all.php

// === CORS & Headers ===
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
];

if (in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: http://localhost:5173");
}

header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, User-Id, User-Role");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed."]);
    exit;
}

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

// === User Authentication ===
$user_id  = intval($_SERVER['HTTP_USER_ID'] ?? 0);
$user_role = $_SERVER['HTTP_USER_ROLE'] ?? '';

if ($user_id <= 0) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized. Please login to view orders."]);
    exit;
}

try {
    if ($user_role === 'admin') {
        // ✅ Admin bisa lihat semua pesanan
        $query = "
            SELECT o.*, u.username 
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.order_date DESC
        ";
        $stmt = $db->prepare($query);
    } else {
        // ✅ Buyer hanya lihat pesanan sendiri
        $query = "
            SELECT o.*, u.username 
            FROM orders o
            JOIN users u ON o.user_id = u.id
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
        "count"   => count($orders),
        "orders"  => $orders ?: []
    ]);
} catch (PDOException $e) {
    error_log("DB Error in read_all.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database query failed."]);
}