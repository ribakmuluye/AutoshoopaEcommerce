<?php
require_once '../../config/cors.php'; // Include CORS headers
header("Access-Control-Allow-Origin: *");
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

if (!empty($data->product_id) && !empty($data->rating)) {
    // Validate rating
    if ($data->rating < 1 || $data->rating > 5) {
        http_response_code(400);
        echo json_encode(array("message" => "Rating must be between 1 and 5."));
        exit();
    }

    // Check if customer has purchased the product
    $query = "SELECT 1 
              FROM orders o 
              JOIN order_items oi ON o.id = oi.order_id 
              WHERE o.customer_id = ? 
              AND oi.product_id = ? 
              AND o.status = 'delivered'";
    $stmt = $db->prepare($query);
    $stmt->execute([$user['user_id'], $data->product_id]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(403);
        echo json_encode(array("message" => "You can only review products you have purchased."));
        exit();
    }

    // Check if customer has already reviewed this product
    $query = "SELECT id FROM reviews WHERE customer_id = ? AND product_id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$user['user_id'], $data->product_id]);
    
    if ($stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(array("message" => "You have already reviewed this product."));
        exit();
    }

    // Create review
    $query = "INSERT INTO reviews (product_id, customer_id, rating, comment) 
              VALUES (?, ?, ?, ?)";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([
        $data->product_id,
        $user['user_id'],
        $data->rating,
        $data->comment ?? null
    ])) {
        $review_id = $db->lastInsertId();
        
        // Get the created review with user details
        $query = "SELECT r.*, u.name as customer_name 
                 FROM reviews r 
                 JOIN users u ON r.customer_id = u.id 
                 WHERE r.id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$review_id]);
        $review = $stmt->fetch();

        http_response_code(201);
        echo json_encode(array(
            "message" => "Review created successfully.",
            "review" => $review
        ));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to create review."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to create review. Data is incomplete."));
} 