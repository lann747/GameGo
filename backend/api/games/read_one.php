<?php
// File: C:\xampp\htdocs\gamegoo\api\games\read_one.php

// === CORS & Headers ===
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
if (isset($_SERVER['HTTP_ORIGIN']) && 
    (strpos($origin, 'localhost:5173') !== false || strpos($origin, '127.0.0.1:5173') !== false)) {
    $origin = $_SERVER['HTTP_ORIGIN'];
} else {
    $origin = '*';
}
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, User-Role, User-Id");

// === Handle Preflight ===
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// === Validate Request Method ===
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Method not allowed."
    ]);
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
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed."
    ]);
    exit;
}

// === Get Game ID ===
$id = $_GET['id'] ?? null;
if (!$id || !is_numeric($id)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Invalid or missing Game ID."
    ]);
    exit;
}

try {
    // === Role-based Query ===
    $user_role = strtolower(trim($_SERVER['HTTP_USER_ROLE'] ?? 'guest'));

    if ($user_role === 'admin') {
        $query = "SELECT id, title, description, price, stock, image_url, genre, is_active 
                  FROM games WHERE id = :id LIMIT 1";
    } else {
        $query = "SELECT id, title, description, price, stock, image_url, genre 
                  FROM games WHERE id = :id AND is_active = 1 LIMIT 1";
    }

    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();

    if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $game = [
            "id"          => (int) $row['id'],
            "title"       => $row['title'],
            "description" => html_entity_decode($row['description']),
            "price"       => (float) $row['price'],
            "stock"       => (int) $row['stock'],
            "image_url"   => $row['image_url'],
            "genre"       => $row['genre']
        ];

        if ($user_role === 'admin') {
            $game['is_active'] = (bool) $row['is_active'];
        }

        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "data" => $game
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "Game not found or inactive.",
            "requested_id" => (int) $id
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database Query Error: " . $e->getMessage()
    ]);
}