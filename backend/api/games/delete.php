<?php
// File: C:\xampp\htdocs\gamegoo\api\games\delete.php
require_once dirname(__DIR__, 2) . '/cors.php';
require_once dirname(__DIR__, 2) . '/config/Database.php';

// === Konfigurasi CORS ===
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, User-Role, User-Id");

// === Handle Preflight (OPTIONS) ===
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// === Validasi Method ===
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
    exit;
}


// === Error Handling ===
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');

// === Proteksi Role Admin ===
$user_role = strtolower(trim($_SERVER['HTTP_USER_ROLE'] ?? ''));
$admin_id  = (int) ($_SERVER['HTTP_USER_ID'] ?? 0);

if ($user_role !== 'admin' || $admin_id <= 0) {
    http_response_code(403);
    echo json_encode([
        "status"  => "error",
        "message" => "Access denied. Admin role required."
    ]);
    exit;
}

// === Koneksi Database ===
$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Database connection failed."
    ]);
    exit;
}

// === Ambil ID dari query parameter ===
$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($id <= 0) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Invalid or missing ID."
    ]);
    exit;
}

try {
    // === Soft Delete (set is_active = 0) ===
    $query = "
        UPDATE games 
        SET is_active = 0, updated_at = NOW() 
        WHERE id = :id AND is_active = 1
        LIMIT 1
    ";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);

    if ($stmt->execute() && $stmt->rowCount() > 0) {
        http_response_code(200);
        echo json_encode([
            "status"  => "success",
            "message" => "Game deactivated successfully.",
            "data"    => [
                "id"         => $id,
                "deleted_by" => $admin_id,
                "is_active"  => 0
            ]
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            "status"  => "error",
            "message" => "Game not found or already inactive."
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Server error: " . $e->getMessage()
    ]);
}