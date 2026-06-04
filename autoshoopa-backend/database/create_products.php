<?php
header("Access-Control-Allow-Origin: http://localhost:3001");
header("Content-Type: application/json; charset=UTF-8");

try {
    // Connect to database
    $pdo = new PDO("mysql:host=localhost;dbname=autoshoopa_db", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create products table
    $pdo->exec("CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(255),
        category VARCHAR(50),
        stock INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Insert sample products
    $products = [
        [
            'name' => 'Toyota Camry 2023',
            'description' => 'Latest model Toyota Camry with advanced features',
            'price' => 35000.00,
            'image_url' => '/images/camry.jpg',
            'category' => 'Sedan',
            'stock' => 5
        ],
        [
            'name' => 'Honda CR-V 2023',
            'description' => 'Spacious SUV with excellent fuel efficiency',
            'price' => 32000.00,
            'image_url' => '/images/crv.jpg',
            'category' => 'SUV',
            'stock' => 3
        ],
        [
            'name' => 'Tesla Model 3',
            'description' => 'Electric sedan with autopilot capabilities',
            'price' => 45000.00,
            'image_url' => '/images/tesla.jpg',
            'category' => 'Electric',
            'stock' => 2
        ]
    ];

    $stmt = $pdo->prepare("INSERT INTO products (name, description, price, image_url, category, stock) 
                          VALUES (:name, :description, :price, :image_url, :category, :stock)");

    foreach ($products as $product) {
        $stmt->execute($product);
    }

    echo json_encode([
        "status" => "success",
        "message" => "Products table created and sample data inserted"
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage()
    ]);
} 