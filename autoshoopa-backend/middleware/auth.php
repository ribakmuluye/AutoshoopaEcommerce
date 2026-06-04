<?php
require_once __DIR__ . '/../vendor/autoload.php';
use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

// Load env helper
if (file_exists(__DIR__ . '/../.env')) {
    $lines = @file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines) {
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) continue;
            $parts = explode('=', $line, 2);
            if (count($parts) === 2) {
                $name = trim($parts[0]);
                $value = trim($parts[1]);
                $value = trim($value, '"\'');
                putenv("{$name}={$value}");
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}

class Auth {
    private static function getKey() {
        return getenv('JWT_SECRET') ?: 'a3F9bG8hJkL0mN2pQrS5tUvWxYz1cD4eF6gH7iJ9kL0mNpQrStUv';
    }

    public static function generateToken($user) {
        $payload = array(
            "user_id" => $user['id'],
            "email" => $user['email'],
            "user_type" => $user['user_type'],
            "iat" => time(),
            "exp" => time() + (60 * 60 * 24) // 24 hours
        );

        return JWT::encode($payload, self::getKey(), 'HS256');
    }

    public static function validateToken() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        if (!$authHeader) {
            return false;
        }

        $token = str_replace('Bearer ', '', $authHeader);

        try {
            $decoded = JWT::decode($token, new Key(self::getKey(), 'HS256'));
            return (array) $decoded;
        } catch(Exception $e) {
            return false;
        }
    }

    public static function requireAuth() {
        $user = self::validateToken();
        if (!$user) {
            http_response_code(401);
            echo json_encode(array("message" => "Unauthorized"));
            exit();
        }
        return $user;
    }

    public static function requireSeller() {
        $user = self::requireAuth();
        if ($user['user_type'] !== 'seller') {
            http_response_code(403);
            echo json_encode(array("message" => "Forbidden - Seller access required"));
            exit();
        }
        return $user;
    }

    public static function requireCustomer() {
        $user = self::requireAuth();
        if ($user['user_type'] !== 'customer') {
            http_response_code(403);
            echo json_encode(array("message" => "Forbidden - Customer access required"));
            exit();
        }
        return $user;
    }
} 