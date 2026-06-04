<?php
require_once '../../config/cors.php'; // Include CORS headers
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Require seller authentication
$user = Auth::requireSeller();

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->order_id) && !empty($data->status)) {
    // Validate status
    $valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!in_array($data->status, $valid_statuses)) {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid status."));
        exit();
    }

    // Check if order exists and belongs to seller's products
    $query = "SELECT o.id 
              FROM orders o 
              JOIN order_items oi ON o.id = oi.order_id 
              JOIN products p ON oi.product_id = p.id 
              WHERE o.id = ? AND p.seller_id = ? 
              GROUP BY o.id";
    $stmt = $db->prepare($query);
    $stmt->execute([$data->order_id, $user['user_id']]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(array("message" => "Order not found or not authorized."));
        exit();
    }

    // Update order status
    $query = "UPDATE orders SET status = ? WHERE id = ?";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([$data->status, $data->order_id])) {
        http_response_code(200);
        echo json_encode(array("message" => "Order status updated successfully."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to update order status."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to update order status. Data is incomplete."));
} 