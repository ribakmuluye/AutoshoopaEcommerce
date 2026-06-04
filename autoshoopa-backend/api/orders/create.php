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

if (!empty($data->shipping_address)) {
    try {
        $db->beginTransaction();

        // Get cart items
        $query = "SELECT c.*, p.price, p.stock 
                 FROM cart c 
                 JOIN products p ON c.product_id = p.id 
                 WHERE c.customer_id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$user['user_id']]);
        $cart_items = $stmt->fetchAll();

        if (empty($cart_items)) {
            throw new Exception("Cart is empty");
        }

        // Calculate total and check stock
        $total = 0;
        foreach ($cart_items as $item) {
            if ($item['quantity'] > $item['stock']) {
                throw new Exception("Not enough stock for product ID: " . $item['product_id']);
            }
            $total += $item['price'] * $item['quantity'];
        }

        // Create order
        $query = "INSERT INTO orders (customer_id, total_amount, status, shipping_address) 
                 VALUES (?, ?, 'pending', ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([$user['user_id'], $total, $data->shipping_address]);
        $order_id = $db->lastInsertId();

        // Create order items and update stock
        foreach ($cart_items as $item) {
            // Add order item
            $query = "INSERT INTO order_items (order_id, product_id, quantity, price) 
                     VALUES (?, ?, ?, ?)";
            $stmt = $db->prepare($query);
            $stmt->execute([$order_id, $item['product_id'], $item['quantity'], $item['price']]);

            // Update product stock
            $query = "UPDATE products 
                     SET stock = stock - ? 
                     WHERE id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$item['quantity'], $item['product_id']]);
        }

        // Clear cart
        $query = "DELETE FROM cart WHERE customer_id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$user['user_id']]);

        $db->commit();

        http_response_code(201);
        echo json_encode(array(
            "message" => "Order created successfully.",
            "order_id" => $order_id
        ));
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(400);
        echo json_encode(array("message" => $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to create order. Shipping address is required."));
} 