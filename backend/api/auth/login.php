<?php
// File: C:\xampp\htdocs\gamegoo\api\auth\login.php

// === Start Session ===
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// === CORS (gunakan file cors.php biar konsisten) ===
require_once __DIR__ . "/../../cors.php";

// === Headers umum ===
header("Content-Type: application/json; charset=UTF-8");

// === Handle Preflight (OPTIONS) ===
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// === Validasi method ===
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed."]);
    exit;
}

// === Database Connection ===
require_once __DIR__ . "/../../config/Database.php";
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(503);
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit;
}

// === Ambil input JSON ===
$input = json_decode(file_get_contents("php://input"), true);
$email    = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if ($email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email dan password wajib diisi."]);
    exit;
}

try {
    // === Cari user ===
    $stmt = $db->prepare("
        SELECT id, username, email, password_hash, role 
        FROM users 
        WHERE email = :email 
        LIMIT 1
    ");
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password_hash'])) {
        // === Set session ===
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role']    = $user['role'];

        // === Set cookie tambahan agar lebih aman ===
        setcookie("PHPSESSID", session_id(), [
            "httponly" => true,
            "samesite" => "Lax",
            "secure"   => isset($_SERVER['HTTPS']) // aktif kalau HTTPS
        ]);

        http_response_code(200);
        echo json_encode([
            "success"  => true,
            "message"  => "Login berhasil.",
            "user_id"  => $user['id'],
            "username" => $user['username'],
            "role"     => $user['role']
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Email atau password salah."]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Server error."
        // untuk debug tambahin: . $e->getMessage()
    ]);
}