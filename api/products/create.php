<?php
require_once '../../config/cors.php'; // Include CORS headers
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log incoming request
error_log("Received product creation request: " . print_r($_POST, true));
error_log("Received files: " . print_r($_FILES, true));

// Require seller authentication
$user = Auth::requireSeller();

$database = new Database();
$db = $database->getConnection();

// Handle image upload
$image_url = null;
if (isset($_FILES['image'])) {
    $upload_dir = '../../uploads/products/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    $file_extension = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
    $file_name = uniqid() . '.' . $file_extension;
    $target_file = $upload_dir . $file_name;

    // Validate file type
    $allowed_types = ['jpg', 'jpeg', 'png', 'gif'];
    if (!in_array($file_extension, $allowed_types)) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid file type. Only JPG, JPEG, PNG & GIF files are allowed.']);
        exit();
    }

    // Validate file size (5MB max)
    if ($_FILES['image']['size'] > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['message' => 'File is too large. Maximum size is 5MB.']);
        exit();
    }

    if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file)) {
        $image_url = '/uploads/products/' . $file_name;
        error_log("Image uploaded successfully: " . $image_url);
    } else {
        error_log("Failed to upload image: " . print_r($_FILES['image']['error'], true));
    }
}

// Get product data
$productData = json_decode($_POST['productData'], true);
error_log("Decoded product data: " . print_r($productData, true));

if (
    !empty($productData['name']) &&
    !empty($productData['description']) &&
    !empty($productData['price']) &&
    !empty($productData['stock']) &&
    !empty($productData['category'])
) {
    try {
        $db->beginTransaction();

        $query = "INSERT INTO products 
                  (seller_id, name, description, price, stock, category, brand, model, year, condition, specifications, image_url, created_at) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        
        $stmt = $db->prepare($query);
        
        $params = [
            $user['user_id'],
            $productData['name'],
            $productData['description'],
            $productData['price'],
            $productData['stock'],
            $productData['category'],
            $productData['brand'],
            $productData['model'],
            $productData['year'],
            $productData['condition'],
            $productData['specifications'],
            $image_url
        ];
        
        error_log("Executing query with params: " . print_r($params, true));
        
        if ($stmt->execute($params)) {
            $product_id = $db->lastInsertId();
            error_log("Product created with ID: " . $product_id);
            
            // Log initial stock
            $stock_query = "INSERT INTO stock_history 
                           (product_id, previous_stock, new_stock, changed_by, change_reason) 
                           VALUES (?, 0, ?, ?, 'Initial stock')";
            $stock_stmt = $db->prepare($stock_query);
            $stock_stmt->execute([$product_id, $productData['stock'], $user['user_id']]);

            // Get the created product
            $query = "SELECT * FROM products WHERE id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$product_id]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            $db->commit();
            error_log("Transaction committed successfully");

            http_response_code(201);
            echo json_encode([
                "message" => "Product created successfully.",
                "product" => $product
            ]);
        } else {
            error_log("Failed to execute product insert query: " . print_r($stmt->errorInfo(), true));
            throw new Exception("Unable to create product.");
        }
    } catch (Exception $e) {
        $db->rollBack();
        error_log("Error creating product: " . $e->getMessage());
        http_response_code(503);
        echo json_encode(["message" => $e->getMessage()]);
    }
} else {
    error_log("Missing required fields in product data");
    http_response_code(400);
    echo json_encode(["message" => "Unable to create product. Data is incomplete."]);
} 