<?php
header('Access-Control-Allow-Origin: http://localhost:3002');
header('Content-Type: application/json');

$host = 'localhost';
$username = 'root';
$password = '';

try {
    // Create connection without database
    $conn = new PDO("mysql:host=$host", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database if it doesn't exist
    $sql = "CREATE DATABASE IF NOT EXISTS autoshoopa_db";
    $conn->exec($sql);
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Database created successfully'
    ]);

} catch(PDOException $e) {
    error_log("Database Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} 