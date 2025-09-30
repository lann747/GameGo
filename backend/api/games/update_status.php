<?php
// File: api/games/update_status.php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, User-Role");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed."]);
    exit;
}

require_once __DIR__ . '/../../config/Database.php';
$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['id']) || !isset($data['is_active'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid request."]);
    exit;
}

try {
    $query = "UPDATE games SET is_active = :is_active WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindValue(":is_active", (int) $data['is_active'], PDO::PARAM_INT);
    $stmt->bindValue(":id", (int) $data['id'], PDO::PARAM_INT);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Game status updated."]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to update game status."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}