<?php
// autoshoopa-backend/api/setup_database.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: http://localhost:3001');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Capture any output from the main script
    ob_start();
    require_once __DIR__ . '/../setup_database.php';
    $logOutput = ob_get_clean();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Database and collections setup and seeded successfully on MongoDB.',
        'details' => $logOutput
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database setup failed: ' . $e->getMessage()
    ]);
}
?>