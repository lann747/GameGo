<?php
// File: C:\xampp\htdocs\gamegoo\api\orders\update_status.php

require_once dirname(__DIR__, 2) . '/cors.php';
require_once dirname(__DIR__, 2) . '/config/Database.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require dirname(__DIR__, 2) . '/vendor/autoload.php';

// === Session & Role Check ===
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$user_role = $_SESSION['role'] ?? ($_SERVER['HTTP_USER_ROLE'] ?? '');
$admin_id  = (int)($_SESSION['user_id'] ?? ($_SERVER['HTTP_USER_ID'] ?? 0));

if (strtolower($user_role) !== 'admin' || $admin_id <= 0) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Access denied. Admin only."]);
    exit;
}

$database = new Database();
$db = $database->getConnection();
if (!$db) {
    http_response_code(503);
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit;
}

// === Input ===
$contentType = $_SERVER["CONTENT_TYPE"] ?? '';
if (strpos($contentType, "application/json") !== false) {
    $data_input = json_decode(file_get_contents("php://input"), true);
} else {
    $data_input = $_POST;
}

$order_id     = $data_input['id'] ?? $data_input['order_id'] ?? null;
$new_status   = strtoupper(trim($data_input['status'] ?? ''));
$delivery_url = $data_input['delivery_url'] ?? null;

// === Validasi ===
if (!$order_id || !is_numeric($order_id)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid or missing Order ID."]);
    exit;
}

$allowed_status = ['PENDING','PAID','CANCELLED','SHIPPED','COMPLETED'];
if (!in_array($new_status, $allowed_status, true)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid status: $new_status"]);
    exit;
}

// === File Upload ===
$delivery_file = null;
if (!empty($_FILES['delivery_file']) && $_FILES['delivery_file']['error'] === UPLOAD_ERR_OK) {
    $ext = strtolower(pathinfo($_FILES['delivery_file']['name'], PATHINFO_EXTENSION));
    $allowed_ext = ['zip','rar','7z','txt','pdf','png','jpg','jpeg'];

    if (!in_array($ext, $allowed_ext, true)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "File type not allowed."]);
        exit;
    }

    if ($_FILES['delivery_file']['size'] > 20 * 1024 * 1024) { // max 20MB
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "File too large. Max 20MB allowed."]);
        exit;
    }

    $new_name   = uniqid("delivery_", true) . '.' . $ext;
    $upload_dir = dirname(__DIR__, 2) . "/public/delivery/";
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);

    if (move_uploaded_file($_FILES['delivery_file']['tmp_name'], $upload_dir . $new_name)) {
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? "https" : "http";
        $base_url = $scheme . "://" . $_SERVER['HTTP_HOST'] . "/gamegoo/public/delivery/";
        $delivery_file = $base_url . $new_name;
    }
}

try {
    // === Update Orders ===
    $query = "UPDATE orders SET 
                status = :status,
                delivery_url = :delivery_url,
                updated_at = NOW()";

    if ($delivery_file) {
        $query .= ", delivery_file = :delivery_file";
    }

    $query .= " WHERE id = :id";

    $stmt = $db->prepare($query);
    $stmt->bindValue(':status', $new_status);
    $stmt->bindValue(':delivery_url', $delivery_url ?: null, PDO::PARAM_STR);
    if ($delivery_file) $stmt->bindValue(':delivery_file', $delivery_file);
    $stmt->bindValue(':id', (int)$order_id, PDO::PARAM_INT);

    if ($stmt->execute()) {
        $stmt_new = $db->prepare("SELECT * FROM orders WHERE id = :id");
        $stmt_new->bindValue(':id', (int)$order_id, PDO::PARAM_INT);
        $stmt_new->execute();
        $updated_order = $stmt_new->fetch(PDO::FETCH_ASSOC);

        // === Ambil user email ===
        $stmt_user = $db->prepare("SELECT username, email FROM users WHERE id = :uid LIMIT 1");
        $stmt_user->execute([":uid" => $updated_order['user_id']]);
        $user = $stmt_user->fetch(PDO::FETCH_ASSOC);

        // === Kirim email ===
        if ($user && !empty($user['email'])) {
            $mail = new PHPMailer(true);
            try {
                $mail->isSMTP();
                $mail->Host = 'smtp.gmail.com';
                $mail->SMTPAuth = true;
                $mail->Username = getenv('MAIL_USERNAME');
                $mail->Password = getenv('MAIL_PASSWORD');
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port = 587;

                $fromAddress = getenv('MAIL_FROM') ?: 'noreply@gamegoo.local';

                $mail->setFrom($fromAddress, 'GAMEGO');
                $mail->addAddress($user['email'], $user['username']);

                $mail->isHTML(true);
                $mail->Subject = "📦 Pesanan #$order_id - Status: $new_status";
                $mail->Body = "
                    <p>Halo <b>{$user['username']}</b>,</p>
                    <p>Status pesanan Anda <b>#$order_id</b> kini: <b>$new_status</b>.</p>
                    " . ($delivery_url ? "<p>🔗 Link Download: <a href='$delivery_url'>$delivery_url</a></p>" : "") . 
                      ($delivery_file ? "<p>📎 File tersedia: <a href='$delivery_file'>Download File</a></p>" : "") . 
                    "<p>Terima kasih telah berbelanja di GAMEGO</p>
                ";
                $mail->AltBody = "Halo {$user['username']},\nStatus pesanan #$order_id kini: $new_status.\n";

                $mail->send();
            } catch (Exception $e) {
                error_log("Email gagal: " . $mail->ErrorInfo);
            }
        }

        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Order updated successfully.",
            "data"    => $updated_order
        ]);
    } else {
        http_response_code(503);
        echo json_encode(["success" => false, "message" => "Failed to update order.", "data" => []]);
    }
} catch (PDOException $e) {
    error_log("DB Error update_status.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database query failed.", "data" => []]);
}