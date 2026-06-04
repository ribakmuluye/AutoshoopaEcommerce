<?php
require_once '../../config/cors.php'; // Include CORS headers
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Require customer authentication
$user = Auth::requireCustomer();

$database = new Database();
$db = $database->getConnection();

$query = "SELECT c.*, p.name, p.price, p.image_url, p.stock_quantity as stock 
          FROM cart c 
          JOIN products p ON c.product_id = p.id 
          WHERE c.customer_id = ?";
$stmt = $db->prepare($query);
$stmt->execute([$user['user_id']]);
$cart_items = $stmt->fetchAll();

// Calculate total
$total = 0;
foreach ($cart_items as &$item) {
    $item['subtotal'] = $item['price'] * $item['quantity'];
    $total += $item['subtotal'];
}

$response = array(
    "items" => $cart_items,
    "total" => $total
);

http_response_code(200);
echo json_encode($response); 