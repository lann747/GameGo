<?php
// File: C:\xampp\htdocs\gamegoo\api\games\update.php

require_once dirname(__DIR__, 2) . '/cors.php';
require_once dirname(__DIR__, 2) . '/config/Database.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, User-Role, User-Id");

// === Preflight ===
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// === Validasi Method ===
if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT'])) {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed."]);
    exit;
}

// === Proteksi Role Admin ===
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

// === Validasi Game ID ===
$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid or missing Game ID."]);
    exit;
}

// === Ambil data lama dulu ===
$stmt_old = $db->prepare("SELECT * FROM games WHERE id = :id");
$stmt_old->bindParam(':id', $id, PDO::PARAM_INT);
$stmt_old->execute();
$old_data = $stmt_old->fetch(PDO::FETCH_ASSOC);

if (!$old_data) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "Game not found."]);
    exit;
}

// === Ambil data payload baru ===
$data_input = [];
if (!empty($_POST)) {
    $data_input = $_POST;
} else {
    $raw_input = file_get_contents("php://input");
    $data_input = json_decode($raw_input, true) ?? [];
}

// === Upload File (jika ada) ===
if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === UPLOAD_ERR_OK) {
    $tmp_name   = $_FILES['image_file']['tmp_name'];
    $ext        = strtolower(pathinfo($_FILES['image_file']['name'], PATHINFO_EXTENSION));
    $allowed    = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    if (!in_array($ext, $allowed)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid image type."]);
        exit;
    }

    $new_file    = uniqid('game_', true) . '.' . $ext;
    $upload_dir  = __DIR__ . '/../../public/images/upload/';
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
    $upload_path = $upload_dir . $new_file;

    if (move_uploaded_file($tmp_name, $upload_path)) {
        $data_input['image_url'] = "http://localhost/gamegoo/public/images/upload/" . $new_file;
    }
}

// === Gabungkan data lama + baru (fallback ke lama kalau kosong) ===
$allowed_fields = ['title','description','price','stock','image_url','genre','is_active'];
$final_data = [];

foreach ($allowed_fields as $f) {
    if (isset($data_input[$f]) && $data_input[$f] !== '' && $data_input[$f] !== null) {
        $final_data[$f] = $data_input[$f];
    } else {
        $final_data[$f] = $old_data[$f]; // fallback ke data lama
    }
}

// === Build update query ===
$sql = "UPDATE games SET 
            title = :title,
            description = :description,
            price = :price,
            stock = :stock,
            image_url = :image_url,
            genre = :genre,
            is_active = :is_active,
            updated_at = NOW()
        WHERE id = :id";

$stmt = $db->prepare($sql);

// Bind params
$stmt->bindValue(':title', htmlspecialchars(strip_tags($final_data['title'])), PDO::PARAM_STR);
$stmt->bindValue(':description', $final_data['description'] ? htmlspecialchars(strip_tags($final_data['description'])) : null, $final_data['description'] ? PDO::PARAM_STR : PDO::PARAM_NULL);
$stmt->bindValue(':price', (float)$final_data['price'], PDO::PARAM_STR);
$stmt->bindValue(':stock', (int)$final_data['stock'], PDO::PARAM_INT);
$stmt->bindValue(':image_url', $final_data['image_url'] ?: null, $final_data['image_url'] ? PDO::PARAM_STR : PDO::PARAM_NULL);
$stmt->bindValue(':genre', $final_data['genre'] ? htmlspecialchars(strip_tags($final_data['genre'])) : null, $final_data['genre'] ? PDO::PARAM_STR : PDO::PARAM_NULL);
$stmt->bindValue(':is_active', (int)$final_data['is_active'], PDO::PARAM_INT);
$stmt->bindValue(':id', $id, PDO::PARAM_INT);

// === Eksekusi ===
try {
    $stmt->execute();

    $stmt_new = $db->prepare("SELECT * FROM games WHERE id = :id");
    $stmt_new->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt_new->execute();
    $updated_game = $stmt_new->fetch(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        "status"  => "success",
        "message" => "Game updated successfully.",
        "data"    => $updated_game
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Database Query Error: " . $e->getMessage()
    ]);
}