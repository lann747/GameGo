<?php
// File: C:\xampp\htdocs\gamegoo\api\dashboard\stats.php

// === Session ===
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// === CORS & Headers ===
$allowed_origins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000', // tambahin kalau pakai React default
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    http_response_code(403);
    echo json_encode([
        "status" => "error",
        "message" => "Forbidden origin."
    ]);
    exit;
}

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, User-Role, User-Id");

// === Handle Preflight ===
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// === Validate Method ===
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Method not allowed."
    ]);
    exit;
}

// === Error Config ===
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Pastikan logs folder ada
$logDir = __DIR__ . '/../../logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0777, true);
}
ini_set('error_log', $logDir . '/php_errors.log');

// === Database Connection ===
require_once __DIR__ . '/../../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    if (!$db) {
        throw new Exception("Database connection failed.");
    }
} catch (Exception $e) {
    http_response_code(503);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
    exit;
}

// === Admin Role Check ===
$user_role = strtolower(trim($_SERVER['HTTP_USER_ROLE'] ?? ''));
if ($user_role !== 'admin') {
    http_response_code(403);
    echo json_encode([
        "status" => "error",
        "message" => "Access denied. Admin role required."
    ]);
    exit;
}

try {
    // === Dashboard Stats Queries ===
    $totalGames = (int) $db->query("SELECT COUNT(*) FROM games WHERE is_active = 1")->fetchColumn();

    $newOrders = (int) $db->query("
        SELECT COUNT(*)
        FROM orders
        WHERE status IN ('pending','paid') 
          AND order_date >= CURDATE()
          AND order_date < CURDATE() + INTERVAL 1 DAY
    ")->fetchColumn();

    $lowStockCount = (int) $db->query("
    SELECT COUNT(*) 
    FROM games
    WHERE stock <= 5 AND stock > 0
    ")->fetchColumn();

    $monthlyRevenue = (float) $db->query("
        SELECT IFNULL(SUM(total_price),0)
        FROM orders
        WHERE status = 'completed'
          AND YEAR(order_date) = YEAR(NOW())
          AND MONTH(order_date) = MONTH(NOW())
    ")->fetchColumn();


    // === JSON Response ===
    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "data"   => [
            "totalGames"     => $totalGames,
            "newOrders"      => $newOrders,
            "lowStockCount"  => $lowStockCount,
            "monthlyRevenue" => $monthlyRevenue
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database Query Error: " . $e->getMessage()
    ]);
}