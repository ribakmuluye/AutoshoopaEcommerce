<?php
header("Access-Control-Allow-Origin: http://localhost:3001");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/ProductsApi.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$api = new ProductsApi();

// Get the request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = explode('/', trim($path, '/'));

// Get the product ID if it exists
$productId = isset($path[count($path) - 1]) ? $path[count($path) - 1] : null;

// Route the request
switch ($method) {
    case 'GET':
        if ($productId) {
            $api->getProduct($productId);
        } else {
            $api->getAllProducts();
        }
        break;
        
    case 'POST':
        $api->createProduct();
        break;
        
    case 'PUT':
        if (!$productId) {
            http_response_code(400);
            echo json_encode(['error' => 'Product ID is required']);
            exit();
        }
        $api->updateProduct($productId);
        break;
        
    case 'DELETE':
        if (!$productId) {
            http_response_code(400);
            echo json_encode(['error' => 'Product ID is required']);
            exit();
        }
        $api->deleteProduct($productId);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?> 