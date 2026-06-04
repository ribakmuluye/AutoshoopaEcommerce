<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=autoshoopa_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        is_active TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    $pdo->exec("INSERT IGNORE INTO categories (name) VALUES 
        ('engine'), 
        ('brakes'), 
        ('suspension'), 
        ('electrical'), 
        ('body'), 
        ('interior'), 
        ('accessories')");
    echo "Categories table setup successfully\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
