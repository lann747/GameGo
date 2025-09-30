<?php
// File: C:\xampp\htdocs\gamegoo\api\games\create.php

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

// === Get Form Data ===
$title       = $_POST['title'] ?? '';
$description = !empty($_POST['description']) ? htmlspecialchars(strip_tags($_POST['description'])) : null;
$price       = isset($_POST['price']) ? (float) $_POST['price'] : null;
$stock       = isset($_POST['stock']) ? (int) $_POST['stock'] : null;
$genre       = !empty($_POST['genre']) ? htmlspecialchars(strip_tags($_POST['genre'])) : null;
$is_active   = isset($_POST['is_active']) ? (int) $_POST['is_active'] : 1;
$image_url   = $_POST['image_url'] ?? null;

// === Handle Image Upload ===
if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === UPLOAD_ERR_OK) {
    $tmp_name = $_FILES['image_file']['tmp_name'];
    $ext      = strtolower(pathinfo($_FILES['image_file']['name'], PATHINFO_EXTENSION));
    $allowed  = ['jpg','jpeg','png','gif','webp'];

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
        $image_url = "http://localhost/gamegoo/public/images/upload/" . $new_file;
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "File upload failed. Check folder permissions."]);
        exit;
    }
}

// === Validate & Insert Game ===
if (!empty($title) && $price !== null && $stock !== null) {
    try {
        $stmt = $db->prepare("
            INSERT INTO games 
                (title, description, price, stock, image_url, genre, is_active, created_by, created_at) 
            VALUES 
                (:title, :description, :price, :stock, :image_url, :genre, :is_active, :created_by, NOW())
        ");

        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':price', $price);
        $stmt->bindParam(':stock', $stock);
        $stmt->bindParam(':image_url', $image_url);
        $stmt->bindParam(':genre', $genre);
        $stmt->bindParam(':is_active', $is_active, PDO::PARAM_INT);
        $stmt->bindParam(':created_by', $admin_id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            $new_id = (int) $db->lastInsertId();
            http_response_code(201);
            echo json_encode([
                "status"  => "success",
                "message" => "Game created successfully.",
                "data"    => [
                    "id"        => $new_id,
                    "title"     => $title,
                    "price"     => $price,
                    "stock"     => $stock,
                    "image_url" => $image_url,
                    "is_active" => $is_active
                ]
            ]);
        } else {
            http_response_code(503);
            echo json_encode(["status" => "error", "message" => "Unable to create game due to database error."]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database query error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Incomplete data. Required: title, price, and stock."]);
}