<?php
// autoshoopa-backend/setup_database.php
// Setup and seed MongoDB database

header("Access-Control-Allow-Origin: http://localhost:3001");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/config/database.php';

try {
    $db = getMongoDB();
    $dbName = $db->getDatabaseName();

    echo "Using MongoDB database: " . $dbName . PHP_EOL;

    // Drop existing collections to start clean
    $collections = iterator_to_array($db->listCollections());
    foreach ($collections as $col) {
        $name = $col->getName();
        echo "Dropping collection: " . $name . PHP_EOL;
        $db->dropCollection($name);
    }

    // Create collections
    $db->createCollection('users');
    $db->createCollection('products');
    $db->createCollection('categories');
    $db->createCollection('orders');

    $usersCol = $db->selectCollection('users');
    $productsCol = $db->selectCollection('products');
    $categoriesCol = $db->selectCollection('categories');

    // 1. Seed Users
    echo "Seeding users..." . PHP_EOL;
    
    $adminDoc = [
        'name' => 'Admin User',
        'email' => 'admin@autoshoopa.com',
        'password' => password_hash('adminpassword', PASSWORD_DEFAULT),
        'user_type' => 'admin',
        'phone' => '08000000000',
        'status' => 'approved',
        'created_at' => new MongoDB\BSON\UTCDateTime()
    ];
    $usersCol->insertOne($adminDoc);
    
    $sellerDoc = [
        'name' => 'Demo Seller',
        'email' => 'seller@autoshoopa.com',
        'password' => password_hash('sellerpassword', PASSWORD_DEFAULT),
        'user_type' => 'seller',
        'phone' => '08098765432',
        'status' => 'approved',
        'business_name' => 'Shoopa Electronics & Gear',
        'business_address' => '101 Silicon Valley Road, Lagos',
        'created_at' => new MongoDB\BSON\UTCDateTime()
    ];
    $sellerResult = $usersCol->insertOne($sellerDoc);
    $sellerId = (string) $sellerResult->getInsertedId();
    
    $customerDoc = [
        'name' => 'Demo Customer',
        'email' => 'customer@autoshoopa.com',
        'password' => password_hash('customerpassword', PASSWORD_DEFAULT),
        'user_type' => 'customer',
        'phone' => '08012345678',
        'status' => 'approved',
        'created_at' => new MongoDB\BSON\UTCDateTime()
    ];
    $usersCol->insertOne($customerDoc);

    // 2. Seed Categories
    echo "Seeding categories..." . PHP_EOL;
    
    $cats = [
        ['name' => 'Electronics', 'description' => 'Gadgets, phones, laptops, and accessories', 'is_active' => 1],
        ['name' => 'Fashion', 'description' => 'Clothing, shoes, watches, and accessories', 'is_active' => 1],
        ['name' => 'Home & Kitchen', 'description' => 'Furniture, kitchenware, and decorations', 'is_active' => 1],
        ['name' => 'Books', 'description' => 'Fiction, non-fiction, educational, and text books', 'is_active' => 1],
        ['name' => 'Beauty & Personal Care', 'description' => 'Cosmetics, skin care, and perfumes', 'is_active' => 1]
    ];
    
    $catMap = [];
    foreach ($cats as $cat) {
        $cat['created_at'] = new MongoDB\BSON\UTCDateTime();
        $res = $categoriesCol->insertOne($cat);
        $catMap[$cat['name']] = (string) $res->getInsertedId();
    }

    // 3. Seed Products
    echo "Seeding products..." . PHP_EOL;
    
    $products = [
        [
            'seller_id' => $sellerId,
            'category_id' => $catMap['Electronics'],
            'name' => 'iPhone 14 Pro Max',
            'description' => 'Latest Apple iPhone with 256GB storage, dynamic island, and outstanding triple cameras.',
            'price' => 750000.00,
            'stock_quantity' => 10,
            'image_url' => 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60'
        ],
        [
            'seller_id' => $sellerId,
            'category_id' => $catMap['Electronics'],
            'name' => 'Sony WH-1000XM4 Headphones',
            'description' => 'Premium noise cancelling wireless over-ear headphones in silver.',
            'price' => 180000.00,
            'stock_quantity' => 15,
            'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'
        ],
        [
            'seller_id' => $sellerId,
            'category_id' => $catMap['Fashion'],
            'name' => 'Modern Leather Jacket',
            'description' => 'High quality black sheepskin leather jacket for everyday wear.',
            'price' => 450000.00,
            'stock_quantity' => 8,
            'image_url' => 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60'
        ],
        [
            'seller_id' => $sellerId,
            'category_id' => $catMap['Fashion'],
            'name' => 'Sporty Running Shoes',
            'description' => 'Lightweight, breathable, and highly cushioned sneakers for athletes.',
            'price' => 30000.00,
            'stock_quantity' => 25,
            'image_url' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60'
        ],
        [
            'seller_id' => $sellerId,
            'category_id' => $catMap['Home & Kitchen'],
            'name' => 'Ergonomic Office Chair',
            'description' => 'High-back mesh chair with adjustable headrest, armrests, and lumbar support.',
            'price' => 85000.00,
            'stock_quantity' => 5,
            'image_url' => 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500&auto=format&fit=crop&q=60'
        ],
        [
            'seller_id' => $sellerId,
            'category_id' => $catMap['Home & Kitchen'],
            'name' => 'Ceramic Coffee Mug Set',
            'description' => 'Set of 4 beautifully glazed stoneware coffee mugs, dishwasher safe.',
            'price' => 12000.00,
            'stock_quantity' => 40,
            'image_url' => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60'
        ]
    ];

    foreach ($products as $prod) {
        $prod['created_at'] = new MongoDB\BSON\UTCDateTime();
        $productsCol->insertOne($prod);
    }

    echo "Database setup and seeding completed successfully!" . PHP_EOL;
    
    // Output JSON for HTTP request context
    if (php_sapi_name() !== 'cli') {
        echo json_encode([
            'status' => 'success',
            'message' => 'Database initialized and seeded successfully'
        ]);
    }
} catch (Exception $e) {
    echo "SETUP ERROR: " . $e->getMessage() . PHP_EOL;
    if (php_sapi_name() !== 'cli') {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Database setup failed: ' . $e->getMessage()
        ]);
    }
}
?>