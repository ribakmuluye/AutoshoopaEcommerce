<?php
/**
 * cors.php – Emit CORS headers for every request.
 * This file must be included as the VERY FIRST thing in each API endpoint
 * so the headers are sent before any output or errors.
 */

// Allowed origins – add more entries if needed
$allowed_origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://autoshoopa-ecommerce.vercel.app',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Fallback for direct server requests (e.g., Postman, curl)
    header("Access-Control-Allow-Origin: http://localhost:3001");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Access-Control-Allow-Headers");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request – respond immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}