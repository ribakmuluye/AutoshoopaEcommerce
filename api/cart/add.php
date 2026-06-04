<?php
require_once '../../config/cors.php'; // Include CORS headers
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Require customer authentication
$user = Auth::requireCustomer();

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->product_id) && !empty($data->quantity)) {
    // Check if product exists and has enough stock
    $query = "SELECT stock_quantity as stock FROM products WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$data->product_id]);
    $product = $stmt->fetch();

    if (!$product) {
        http_response_code(404);
        echo json_encode(array("message" => "Product not found."));
        exit();
    }

    if ($product['stock'] < $data->quantity) {
        http_response_code(400);
        echo json_encode(array("message" => "Not enough stock available."));
        exit();
    }

    // Check if item already exists in cart
    $query = "SELECT id, quantity FROM cart WHERE customer_id = ? AND product_id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$user['user_id'], $data->product_id]);
    $cart_item = $stmt->fetch();

    if ($cart_item) {
        // Update quantity
        $new_quantity = $cart_item['quantity'] + $data->quantity;
        if ($new_quantity > $product['stock']) {
            http_response_code(400);
            echo json_encode(array("message" => "Not enough stock available."));
            exit();
        }

        $query = "UPDATE cart SET quantity = ? WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$new_quantity, $cart_item['id']]);
    } else {
        // Add new item
        $query = "INSERT INTO cart (customer_id, product_id, quantity) VALUES (?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([$user['user_id'], $data->product_id, $data->quantity]);
    }

    http_response_code(200);
    echo json_encode(array("message" => "Item added to cart successfully."));
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to add item to cart. Data is incomplete."));
} 