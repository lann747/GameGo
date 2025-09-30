<?php
// File: C:\xampp\htdocs\gamegoo\api\games\read_all.php

// === Origin Check (Strict) ===
$allowed_origins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Forbidden origin."]);
    exit;
}

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, User-Role, User-Id");

// === Preflight ===
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// === Method Check ===
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed."]);
    exit;
}

// === Error Handling ===
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');

// === Database Connection ===
require_once __DIR__ . '/../../config/Database.php';
$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(503);
    echo json_encode(["status" => "error", "message" => "Database connection failed."]);
    exit;
}

try {
    // === Role & Filter Handling ===
    $user_role = strtolower(trim($_SERVER['HTTP_USER_ROLE'] ?? 'guest'));
    $filter = strtolower(trim($_GET['filter'] ?? ''));

    $select_cols = "id, title, description, price, stock, image_url, genre, is_active";

    // Default: hanya game aktif
    $where_clause = "WHERE is_active = 1";

    if ($user_role === 'admin') {
        // Admin bisa lihat semua
        $where_clause = "WHERE 1=1";
    }

    // === Tambahin filter khusus ===
    if ($filter === 'lowstock') {
        $where_clause .= " AND stock <= 5 AND stock > 0";
    } elseif ($filter === 'outofstock') {
        $where_clause .= " AND stock = 0";
    } elseif ($filter === 'active') {
        $where_clause .= " AND is_active = 1";
    }

    // Query final
    $query = "SELECT $select_cols FROM games $where_clause ORDER BY title ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $games_arr = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $games_arr[] = [
            "id" => (int) $row['id'],
            "title" => $row['title'],
            "description" => html_entity_decode($row['description']),
            "price" => (float) $row['price'],
            "stock" => (int) $row['stock'],
            "image_url" => $row['image_url'],
            "genre" => $row['genre'],
            "is_active" => (bool) $row['is_active']
        ];
    }

    http_response_code(200);
    echo json_encode([
        "status"  => "success",
        "count"   => count($games_arr),
        "data"    => $games_arr,
        "message" => count($games_arr) === 0 ? "No games found." : ""
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database Query Error: " . $e->getMessage()
    ]);
}
error_log("ROLE=$user_role FILTER=$filter FINAL_WHERE=$where_clause");