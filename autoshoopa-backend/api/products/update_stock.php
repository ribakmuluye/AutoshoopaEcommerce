<?php
require_once '../../config/cors.php';
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../utils/NotificationManager.php';

// Require seller authentication
$user = Auth::requireSeller();

$database = new Database();
$db = $database->getConnection();
$notificationManager = new NotificationManager($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->product_id) && isset($data->stock)) {
    try {
        // Start transaction
        $db->beginTransaction();

        // Get current product data
        $query = "SELECT * FROM products WHERE id = ? AND seller_id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$data->product_id, $user['user_id']]);
        $product = $stmt->fetch();

        if (!$product) {
            throw new Exception("Product not found or unauthorized");
        }

        // Validate stock value
        if ($data->stock < 0) {
            throw new Exception("Stock cannot be negative");
        }

        // Update stock
        $query = "UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$data->stock, $data->product_id]);

        // Log stock change
        $query = "INSERT INTO stock_history (product_id, previous_stock, new_stock, changed_by, change_reason) 
                 VALUES (?, ?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([
            $data->product_id,
            $product['stock'],
            $data->stock,
            $user['user_id'],
            $data->reason ?? 'Manual update'
        ]);

        // Check for low stock notification
        if ($data->stock <= 5) {
            $notificationManager->notifyLowStock(
                $data->product_id,
                $user['user_id'],
                $product['name'],
                $data->stock
            );
        }

        // Commit transaction
        $db->commit();

        // Get updated product
        $query = "SELECT p.*, c.name as category_name 
                 FROM products p 
                 JOIN categories c ON p.category_id = c.id 
                 WHERE p.id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$data->product_id]);
        $updatedProduct = $stmt->fetch();

        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Stock updated successfully",
            "product" => $updatedProduct
        ]);

    } catch (Exception $e) {
        // Rollback transaction on error
        $db->rollBack();
        
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Missing required fields"
    ]);
} 