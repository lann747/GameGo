<?php
// File: C:\xampp\htdocs\gamegoo\api\games\status.php

require_once dirname(__DIR__, 2) . '/cors.php';
require_once dirname(__DIR__, 2) . '/config/Database.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, User-Role, User-Id");

// === Preflight ===
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// === Validasi Method ===
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

// === Ambil Payload ===
$raw_input = file_get_contents("php://input");
$data_input = json_decode($raw_input, true) ?? $_POST;

$id     = isset($data_input['id']) ? (int) $data_input['id'] : 0;
$action = strtolower(trim($data_input['action'] ?? ''));

if ($id <= 0 || !in_array($action, ['archive','restore','delete'])) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Invalid request. Required: id & action [archive|restore|delete]."
    ]);
    exit;
}

try {
    if ($action === 'archive') {
        $sql = "UPDATE games SET is_active = 0, updated_at = NOW() WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(["status"=>"success","message"=>"Game archived.","data"=>["id"=>$id,"archived_by"=>$admin_id]]);
        } else {
            http_response_code(404);
            echo json_encode(["status"=>"error","message"=>"Game not found or already inactive."]);
        }
    } elseif ($action === 'restore') {
        $sql = "UPDATE games SET is_active = 1, updated_at = NOW() WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(["status"=>"success","message"=>"Game restored.","data"=>["id"=>$id,"restored_by"=>$admin_id]]);
        } else {
            http_response_code(404);
            echo json_encode(["status"=>"error","message"=>"Game not found or already active."]);
        }
    } elseif ($action === 'delete') {
        $sql = "DELETE FROM games WHERE id = :id LIMIT 1";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(["status"=>"success","message"=>"Game deleted permanently.","data"=>["id"=>$id,"deleted_by"=>$admin_id]]);
        } else {
            http_response_code(404);
            echo json_encode(["status"=>"error","message"=>"Game not found."]);
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status"=>"error","message"=>"Database error: ".$e->getMessage()]);
}