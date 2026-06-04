<?php
require_once __DIR__ . '/Auth.php';

/**
 * Verify JWT from Authorization header and return decoded payload.
 * If token is missing or invalid, the script terminates with a 401 response.
 */
function requireAuth(): ?array {
    $jwt = Auth::getBearerToken();
    if (!$jwt) {
        http_response_code(401);
        echo json_encode(['error' => 'Authorization header missing']);
        exit;
    }
    $payload = Auth::verifyToken();
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit;
    }
    return $payload;
}
?>
