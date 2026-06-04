<?php
// Enable CORS
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

try {
    $conn = getConnection();
    
    // Get all products
    $query = "SELECT * FROM products ORDER BY created_at DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Add some sample data if no products exist
    if (empty($products)) {
        // Insert sample products
        $sampleProducts = [
            [
                'name' => 'Toyota Camry 2023',
                'description' => 'Luxury sedan with advanced features and comfortable interior',
                'price' => 850000,
                'image_url' => 'https://images.unsplash.com/photo-1617469767053-3c4f2a9c0459?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                'category' => 'sedan',
                'brand' => 'toyota',
                'rating' => 4.5,
                'is_new' => true,
                'is_best_seller' => true
            ],
            [
                'name' => 'Honda CR-V 2023',
                'description' => 'Spacious SUV perfect for family adventures',
                'price' => 950000,
                'image_url' => 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                'category' => 'suv',
                'brand' => 'honda',
                'rating' => 4.8,
                'is_new' => true,
                'is_best_seller' => false
            ],
            [
                'name' => 'Tesla Model 3',
                'description' => 'Electric sedan with impressive range and performance',
                'price' => 1200000,
                'image_url' => 'https://images.unsplash.com/photo-1617704548623-340376564e68?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                'category' => 'electric',
                'brand' => 'tesla',
                'rating' => 4.9,
                'is_new' => false,
                'is_best_seller' => true
            ],
            [
                'name' => 'BMW X5 2023',
                'description' => 'Luxury SUV with premium features and powerful engine',
                'price' => 1500000,
                'image_url' => 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                'category' => 'suv',
                'brand' => 'bmw',
                'rating' => 4.7,
                'is_new' => true,
                'is_best_seller' => false
            ],
            [
                'name' => 'Mercedes C-Class',
                'description' => 'Elegant sedan with cutting-edge technology',
                'price' => 1300000,
                'image_url' => 'https://images.unsplash.com/photo-1617469767053-3c4f2a9c0459?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                'category' => 'sedan',
                'brand' => 'mercedes',
                'rating' => 4.6,
                'is_new' => false,
                'is_best_seller' => true
            ]
        ];

        $insertQuery = "INSERT INTO products (name, description, price, image_url, category, brand, rating, is_new, is_best_seller, created_at) 
                       VALUES (:name, :description, :price, :image_url, :category, :brand, :rating, :is_new, :is_best_seller, NOW())";
        $insertStmt = $conn->prepare($insertQuery);

        foreach ($sampleProducts as $product) {
            $insertStmt->execute([
                ':name' => $product['name'],
                ':description' => $product['description'],
                ':price' => $product['price'],
                ':image_url' => $product['image_url'],
                ':category' => $product['category'],
                ':brand' => $product['brand'],
                ':rating' => $product['rating'],
                ':is_new' => $product['is_new'],
                ':is_best_seller' => $product['is_best_seller']
            ]);
        }

        // Fetch the newly inserted products
        $stmt->execute();
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode([
        'status' => 'success',
        'products' => $products
    ]);

} catch (PDOException $e) {
    error_log("Database Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch products'
    ]);
} 