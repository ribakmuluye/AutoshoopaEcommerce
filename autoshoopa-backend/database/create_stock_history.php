<?php
header('Access-Control-Allow-Origin: http://localhost:3001');
header('Content-Type: application/json; charset=UTF-8');

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Create stock_history table
    $query = "CREATE TABLE IF NOT EXISTS stock_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        previous_stock INT NOT NULL,
        new_stock INT NOT NULL,
        changed_by INT NOT NULL,
        change_reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_product_id (product_id),
        INDEX idx_changed_by (changed_by),
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $db->exec($query);
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Stock history table created successfully'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to create stock history table: ' . $e->getMessage()
    ]);
} 