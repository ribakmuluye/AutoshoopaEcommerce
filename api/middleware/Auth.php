<?php
require_once __DIR__ . '/../../config/database.php';

class Auth {
    private $conn;
    private $headers;
    private $user;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
        $this->headers = getallheaders();
    }

    public function authenticate() {
        if (!isset($this->headers['Authorization'])) {
            Response::unauthorized('No token provided');
        }

        $token = str_replace('Bearer ', '', $this->headers['Authorization']);
        
        try {
            $query = "SELECT * FROM users WHERE id = :id LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $token);
            $stmt->execute();

            if ($stmt->rowCount() === 0) {
                Response::unauthorized('Invalid token');
            }

            $this->user = $stmt->fetch();
            return $this->user;
        } catch(PDOException $e) {
            Response::error('Database error: ' . $e->getMessage(), 500);
        }
    }

    public function requireRole($roles) {
        if (!$this->user) {
            $this->authenticate();
        }

        if (!in_array($this->user['user_type'], (array)$roles)) {
            Response::forbidden('Insufficient permissions');
        }

        return $this->user;
    }

    public function getUser() {
        return $this->user;
    }
}
?> 