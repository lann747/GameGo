<?php
// File: C:\xampp\htdocs\gamegoo\api\auth\register.php

// === Start Session (untuk cookie jika dipakai) ===
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// === CORS (gunakan cors.php biar konsisten) ===
require_once __DIR__ . "/../../cors.php";

// === Headers umum ===
header("Content-Type: application/json; charset=UTF-8");

// === Handle Preflight (OPTIONS) ===
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// === Validate Request Method ===
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed."]);
    exit;
}

// === Database Connection ===
require_once "../../config/Database.php";
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(503);
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit;
}

// === Read JSON Input ===
$input    = json_decode(file_get_contents("php://input"), true);
$username = trim($input['username'] ?? '');
$email    = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

// === Validasi dasar ===
if (!$username || !$email || !$password) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Incomplete data."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Format email tidak valid."]);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Password minimal 6 karakter."]);
    exit;
}

try {
    // === Hash Password ===
    $password_hash = password_hash($password, PASSWORD_BCRYPT);

    // === Insert User ===
    $stmt = $db->prepare("
        INSERT INTO users (username, email, password_hash, role, created_at) 
        VALUES (:username, :email, :password_hash, 'user', NOW())
    ");
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password_hash', $password_hash);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode([
            "success"  => true,
            "message"  => "Registrasi berhasil!",
            "user_id"  => $db->lastInsertId(),
            "username" => $username,
            "role"     => "user"
        ]);
    } else {
        http_response_code(503);
        echo json_encode(["success" => false, "message" => "Unable to register user."]);
    }

} catch (PDOException $e) {
    if ($e->getCode() === "23000") { // duplicate entry
        http_response_code(400);
        echo json_encode(value: ["success" => false, "message" => "Username atau email sudah terdaftar."]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Server error: " . $e->getMessage()
        ]);
    }
}