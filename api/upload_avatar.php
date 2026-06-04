<?php
// autoshoopa-backend/api/upload_avatar.php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../utils/AuthMiddleware.php';

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Authenticate the request
$payload = requireAuth();

if (!isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No image file provided']);
    exit;
}

$file = $_FILES['image'];

// Validate file
if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Upload failed', 'code' => $file['error']]);
    exit;
}

// Check file size (max 5MB)
$maxSize = 5 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['error' => 'File size exceeds 5MB limit']);
    exit;
}

// Validate MIME type
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type. Only JPEG, PNG, GIF, WEBP allowed']);
    exit;
}

// Create upload directory if it doesn't exist
$uploadDir = __DIR__ . '/../../uploads/avatars/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0775, true);
}

// Generate unique filename
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
if (empty($ext)) {
    $extMap = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/gif'  => 'gif',
        'image/webp' => 'webp',
    ];
    $ext = $extMap[$mimeType] ?? 'jpg';
}
$filename = uniqid('avatar_', true) . '.' . $ext;
$destPath = $uploadDir . $filename;

// Move file to destination
if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file']);
    exit;
}

// Return relative URL to store in DB (will be resolved by frontend getImageUrl helper)
$relativeUrl = '/uploads/avatars/' . $filename;

echo json_encode([
    'success' => true,
    'url'     => $relativeUrl,
    'message' => 'Profile image uploaded successfully'
]);
?>
