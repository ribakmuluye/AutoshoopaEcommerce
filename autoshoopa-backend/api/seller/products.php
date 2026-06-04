<?php
header('Content-Type: application/json');
require_once '../../config/database.php';
require_once '../../config/auth.php';

// Check if user is authenticated and is a seller
if (!isAuthenticated() || !isSeller()) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

// Get seller ID from authenticated user
$seller_id = getUserId();

// Handle POST request for adding new product
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $db = new Database();
        $conn = $db->getConnection();

        // Validate required fields
        $required_fields = ['name', 'category', 'price', 'stock', 'description'];
        foreach ($required_fields as $field) {
            if (!isset($_POST[$field]) || empty($_POST[$field])) {
                throw new Exception("Missing required field: $field");
            }
        }

        // Validate image
        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("Image upload is required");
        }

        // Validate file type
        $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
        $file_type = $_FILES['image']['type'];
        if (!in_array($file_type, $allowed_types)) {
            throw new Exception("Invalid file type. Only JPG, PNG and GIF are allowed.");
        }

        // Validate file size (10MB max)
        if ($_FILES['image']['size'] > 10 * 1024 * 1024) {
            throw new Exception("File size too large. Maximum size is 10MB.");
        }

        // Create uploads directory if it doesn't exist
        $upload_dir = '../../uploads/products/';
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        // Generate unique filename
        $file_extension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $filename = uniqid('product_') . '.' . $file_extension;
        $filepath = $upload_dir . $filename;

        // Move uploaded file
        if (!move_uploaded_file($_FILES['image']['tmp_name'], $filepath)) {
            throw new Exception("Failed to save image");
        }

        // Prepare SQL statement
        $sql = "INSERT INTO products (
            seller_id, name, category, price, stock, description, image_path, 
            created_at, updated_at
        ) VALUES (
            :seller_id, :name, :category, :price, :stock, :description, :image_path,
            NOW(), NOW()
        )";

        $stmt = $conn->prepare($sql);
        
        // Bind parameters
        $stmt->bindParam(':seller_id', $seller_id);
        $stmt->bindParam(':name', $_POST['name']);
        $stmt->bindParam(':category', $_POST['category']);
        $stmt->bindParam(':price', $_POST['price']);
        $stmt->bindParam(':stock', $_POST['stock']);
        $stmt->bindParam(':description', $_POST['description']);
        $stmt->bindParam(':image_path', $filename);

        // Execute the statement
        if ($stmt->execute()) {
            $product_id = $conn->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'Product added successfully',
                'product_id' => $product_id
            ]);
        } else {
            throw new Exception("Failed to add product to database");
        }

    } catch (Exception $e) {
        // If there's an error, delete the uploaded file if it exists
        if (isset($filepath) && file_exists($filepath)) {
            unlink($filepath);
        }

        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
    exit;
}

// Handle GET request for retrieving seller's products
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $db = new Database();
        $conn = $db->getConnection();

        $sql = "SELECT * FROM products WHERE seller_id = :seller_id ORDER BY created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':seller_id', $seller_id);
        $stmt->execute();

        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Add full image URL to each product
        foreach ($products as &$product) {
            $product['image_url'] = '/uploads/products/' . $product['image_path'];
        }

        echo json_encode([
            'success' => true,
            'products' => $products
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
    exit;
}

// Handle DELETE request for removing a product
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $product_id = $_GET['id'] ?? null;
        if (!$product_id) {
            throw new Exception("Product ID is required");
        }

        $db = new Database();
        $conn = $db->getConnection();

        // First get the product to check ownership and get image path
        $sql = "SELECT image_path FROM products WHERE id = :id AND seller_id = :seller_id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $product_id);
        $stmt->bindParam(':seller_id', $seller_id);
        $stmt->execute();

        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$product) {
            throw new Exception("Product not found or unauthorized");
        }

        // Delete the product
        $sql = "DELETE FROM products WHERE id = :id AND seller_id = :seller_id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $product_id);
        $stmt->bindParam(':seller_id', $seller_id);
        
        if ($stmt->execute()) {
            // Delete the image file
            $image_path = '../../uploads/products/' . $product['image_path'];
            if (file_exists($image_path)) {
                unlink($image_path);
            }

            echo json_encode([
                'success' => true,
                'message' => 'Product deleted successfully'
            ]);
        } else {
            throw new Exception("Failed to delete product");
        }

    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
    exit;
}

// Handle PUT request for updating a product
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        $product_id = $_GET['id'] ?? null;
        if (!$product_id) {
            throw new Exception("Product ID is required");
        }

        // Parse PUT data
        parse_str(file_get_contents("php://input"), $_PUT);

        $db = new Database();
        $conn = $db->getConnection();

        // Check if product exists and belongs to seller
        $sql = "SELECT image_path FROM products WHERE id = :id AND seller_id = :seller_id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $product_id);
        $stmt->bindParam(':seller_id', $seller_id);
        $stmt->execute();

        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$product) {
            throw new Exception("Product not found or unauthorized");
        }

        // Prepare update fields
        $update_fields = [];
        $params = [':id' => $product_id, ':seller_id' => $seller_id];

        $allowed_fields = ['name', 'category', 'price', 'stock', 'description'];
        foreach ($allowed_fields as $field) {
            if (isset($_PUT[$field])) {
                $update_fields[] = "$field = :$field";
                $params[":$field"] = $_PUT[$field];
            }
        }

        if (empty($update_fields)) {
            throw new Exception("No fields to update");
        }

        $update_fields[] = "updated_at = NOW()";

        // Update product
        $sql = "UPDATE products SET " . implode(', ', $update_fields) . 
               " WHERE id = :id AND seller_id = :seller_id";
        
        $stmt = $conn->prepare($sql);
        
        if ($stmt->execute($params)) {
            echo json_encode([
                'success' => true,
                'message' => 'Product updated successfully'
            ]);
        } else {
            throw new Exception("Failed to update product");
        }

    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
    exit;
}

// If we get here, the request method is not supported
http_response_code(405);
echo json_encode(['error' => 'Method not allowed']); 