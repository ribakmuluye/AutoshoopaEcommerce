<?php
header('Access-Control-Allow-Origin: http://localhost:3001');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Test database connection
    $testQuery = "SELECT 1 as test";
    $testStmt = $db->prepare($testQuery);
    $testStmt->execute();
    
    // Check users table
    $usersQuery = "SHOW TABLES LIKE 'users'";
    $usersStmt = $db->prepare($usersQuery);
    $usersStmt->execute();
    $usersTableExists = $usersStmt->rowCount() > 0;
    
    // Check categories table
    $categoriesQuery = "SHOW TABLES LIKE 'categories'";
    $categoriesStmt = $db->prepare($categoriesQuery);
    $categoriesStmt->execute();
    $categoriesTableExists = $categoriesStmt->rowCount() > 0;
    
    // Check products table
    $productsQuery = "SHOW TABLES LIKE 'products'";
    $productsStmt = $db->prepare($productsQuery);
    $productsStmt->execute();
    $productsTableExists = $productsStmt->rowCount() > 0;
    
    // Get table structures
    $usersStructure = [];
    if ($usersTableExists) {
        $usersStructureQuery = "DESCRIBE users";
        $usersStructureStmt = $db->prepare($usersStructureQuery);
        $usersStructureStmt->execute();
        $usersStructure = $usersStructureStmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful',
        'data' => [
            'connection_test' => $testStmt->fetch(PDO::FETCH_ASSOC),
            'tables_exist' => [
                'users' => $usersTableExists,
                'categories' => $categoriesTableExists,
                'products' => $productsTableExists
            ],
            'users_structure' => $usersStructure
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
} 