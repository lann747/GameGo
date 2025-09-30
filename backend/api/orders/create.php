<?php
// File: C:\xampp\htdocs\gamegoo\api\orders\create.php

// === CORS (Strict) ===
$allowed_origins = ["http://localhost:5173", "http://127.0.0.1:5173"];
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
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, User-Id, User-Role");

// === Handle Preflight ===
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// === Validate Method ===
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

try {
    $database = new Database();
    $db = $database->getConnection();
    if (!$db) throw new Exception("Database connection failed.");
} catch (Exception $e) {
    http_response_code(503);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    exit;
}

// === Ambil User ID dari Header ===
$user_id = intval($_SERVER['HTTP_USER_ID'] ?? 0);
if ($user_id <= 0) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized. Please login."]);
    exit;
}

// === Input JSON ===
$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['items']) && is_array($data['items']) && isset($data['total_price'])) {
    try {
        $db->beginTransaction();

        $total_price_input = floatval($data['total_price']);
        $calculated_total  = 0.0;

        // Insert ke orders
        $stmt_order = $db->prepare("
            INSERT INTO orders (user_id, total_price, status, order_date) 
            VALUES (:user_id, :total_price, 'pending', NOW())
        ");
        $stmt_order->execute([
            ':user_id'     => $user_id,
            ':total_price' => $total_price_input
        ]);
        $order_id = $db->lastInsertId();

        // Insert ke order_items
        $stmt_item = $db->prepare("
            INSERT INTO order_items (order_id, game_id, quantity, price_at_purchase) 
            VALUES (:order_id, :game_id, :quantity, :price)
        ");

        foreach ($data['items'] as $item) {
            $game_id  = intval($item['game_id'] ?? 0);
            $quantity = intval($item['quantity'] ?? 0);
            $price    = floatval($item['price'] ?? 0);

            if ($game_id <= 0 || $quantity <= 0) {
                throw new Exception("Item pesanan tidak valid.");
            }

            // Lock stok game
            $check_stmt = $db->prepare("SELECT stock FROM games WHERE id = :game_id FOR UPDATE");
            $check_stmt->execute([':game_id' => $game_id]);
            $current_stock = $check_stmt->fetchColumn();

            if ($current_stock === false) {
                throw new Exception("Game ID {$game_id} tidak ditemukan.");
            }
            if ($current_stock < $quantity) {
                throw new Exception("Stok untuk game ID {$game_id} tidak mencukupi.");
            }

            // Insert item
            $stmt_item->execute([
                ':order_id' => $order_id,
                ':game_id'  => $game_id,
                ':quantity' => $quantity,
                ':price'    => $price
            ]);

            // Update stok game
            $stmt_stock = $db->prepare("UPDATE games SET stock = stock - :quantity WHERE id = :game_id");
            $stmt_stock->execute([
                ':quantity' => $quantity,
                ':game_id'  => $game_id
            ]);

            $calculated_total += $price * $quantity;
        }

        // Validasi total harga
        if (abs($calculated_total - $total_price_input) > 0.01) {
            throw new Exception("Total harga tidak valid. Expected: $calculated_total, Got: $total_price_input");
        }

        $db->commit();

        http_response_code(201);
        echo json_encode([
            "status" => "success",
            "data"   => [
                "order_id" => $order_id,
                "status"   => "pending",
                "total"    => $total_price_input,
                "items"    => $data['items']
            ]
        ]);
    } catch (Exception $e) {
        $db->rollBack();
        error_log("Order failed: " . $e->getMessage());
        http_response_code(400);
        echo json_encode([
            "status"  => "error",
            "message" => $e->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Data pesanan tidak lengkap atau tidak valid."]);
}