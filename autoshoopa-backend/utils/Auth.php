<?php
require __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Simple .env file loader
if (file_exists(__DIR__ . '/../../.env')) {
    $lines = @file(__DIR__ . '/../../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines) {
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) continue;
            $parts = explode('=', $line, 2);
            if (count($parts) === 2) {
                $name = trim($parts[0]);
                $value = trim($parts[1]);
                $value = trim($value, '"\''); // strip quotes
                putenv("{$name}={$value}");
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}

class Auth {
    public static function getBearerToken(): ?string {
        $headers = getallheaders();
        // Check both capitalized and lowercase variations
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        if (!$authHeader) {
            return null;
        }
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
        return null;
    }

    public static function verifyToken(): ?array {
        $token = self::getBearerToken();
        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'Missing token']);
            exit;
        }
        $secret = getenv('JWT_SECRET') ?: 'a3F9bG8hJkL0mN2pQrS5tUvWxYz1cD4eF6gH7iJ9kL0mNpQrStUv';
        try {
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));
            return (array)$decoded;
        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token', 'message' => $e->getMessage()]);
            exit;
        }
    }

    public static function generateToken($user): string {
        $secret = getenv('JWT_SECRET') ?: 'a3F9bG8hJkL0mN2pQrS5tUvWxYz1cD4eF6gH7iJ9kL0mNpQrStUv';
        $payload = [
            "id" => $user['id'],
            "email" => $user['email'],
            "user_type" => $user['user_type'] ?? 'customer',
            "iat" => time(),
            "exp" => time() + (int)(getenv('JWT_EXPIRE') ?: 3600)
        ];
        return JWT::encode($payload, $secret, 'HS256');
    }
}
?>
