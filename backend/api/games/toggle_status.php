<?php
// File: C:\xampp\htdocs\gamegoo\api\games\toggle_status.php

// === CORS ===
require_once dirname(__DIR__, 2) . '/cors.php';
require_once dirname(__DIR__, 2) . '/config/Database.php';

// === Headers ===
header("Content-Type: application/json; charset=UTF-8");

// === Handle Preflight ===
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// === Admin Authentication ===
$user_role = strtolower(trim($_SERVER['HTTP_USER_ROLE'] ?? ''));
$admin_id  = (int) ($_SERVER['HTTP_USER_ID'] ?? 0);
if ($user_role !== 'admin' || $admin_id <= 0) {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Access denied. Admin role required."]);
    exit;
}

// === Error Handling ===
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');

// === Database Connection ===
try {
    $database = new Database();
    $db = $database->getConnection();
    if (!$db) throw new Exception("Database connection failed.");
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    exit;
}

// === Get JSON Input ===
$input = json_decode(file_get_contents("php://input"), true);
$id = isset($input['id']) ? (int) $input['id'] : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Game ID diperlukan."]);
    exit;
}

// === Toggle Logic ===
try {
    $check = $db->prepare("SELECT is_active FROM games WHERE id = :id LIMIT 1");
    $check->execute([":id" => $id]);
    $row = $check->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Game tidak ditemukan."]);
        exit;
    }

    $newStatus = $row['is_active'] ? 0 : 1;

    $update = $db->prepare("
        UPDATE games 
        SET is_active = :is_active, updated_by = :updated_by, updated_at = NOW()
        WHERE id = :id
    ");
    $ok = $update->execute([
        ":is_active" => $newStatus,
        ":id"        => $id,
        ":updated_by"=> $admin_id
    ]);

    if ($ok) {
        echo json_encode([
            "status"    => "success",
            "message"   => "Status game berhasil diubah.",
            "data"      => [
                "id"        => $id,
                "is_active" => (bool) $newStatus
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Gagal mengubah status."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database query error: " . $e->getMessage()]);
}

error_log("RAW INPUT: " . file_get_contents("php://input"));