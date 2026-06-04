<?php
require_once '../../config/cors.php'; // Include CORS headers
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../utils/FileUploader.php';

// Require seller authentication
$user = Auth::requireSeller();

$database = new Database();
$db = $database->getConnection();

// Check if product exists and belongs to seller
$product_id = $_POST['product_id'] ?? null;
if (!$product_id) {
    http_response_code(400);
    echo json_encode(array("message" => "Product ID is required."));
    exit();
}

$query = "SELECT id FROM products WHERE id = ? AND seller_id = ?";
$stmt = $db->prepare($query);
$stmt->execute([$product_id, $user['user_id']]);
$product = $stmt->fetch();

if (!$product) {
    http_response_code(404);
    echo json_encode(array("message" => "Product not found or not authorized."));
    exit();
}

// Handle file uploads
if (!isset($_FILES['images'])) {
    http_response_code(400);
    echo json_encode(array("message" => "No images uploaded."));
    exit();
}

try {
    $uploader = new FileUploader();
    $uploaded_files = $uploader->uploadMultiple($_FILES['images']);
    
    if (empty($uploaded_files)) {
        throw new Exception("No images were successfully uploaded");
    }

    // Begin transaction
    $db->beginTransaction();

    // Set the first image as primary if no primary image exists
    $query = "SELECT COUNT(*) as count FROM product_images WHERE product_id = ? AND is_primary = 1";
    $stmt = $db->prepare($query);
    $stmt->execute([$product_id]);
    $has_primary = $stmt->fetch()['count'] > 0;

    // Insert images
    $query = "INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)";
    $stmt = $db->prepare($query);

    foreach ($uploaded_files as $index => $image_path) {
        $is_primary = !$has_primary && $index === 0;
        $stmt->execute([$product_id, $image_path, $is_primary, $index]);
    }

    // Update product thumbnail if this is the first image
    if (!$has_primary) {
        $query = "UPDATE products SET thumbnail_url = ? WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$uploaded_files[0], $product_id]);
    }

    $db->commit();

    http_response_code(200);
    echo json_encode(array(
        "message" => "Images uploaded successfully.",
        "images" => $uploaded_files
    ));
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(400);
    echo json_encode(array("message" => $e->getMessage()));
} 