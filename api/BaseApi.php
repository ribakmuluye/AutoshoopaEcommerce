<?php
require_once __DIR__ . '/../config/Database.php';

class BaseApi {
    protected $conn;
    protected $db;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    protected function sendResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    protected function handleError($message, $statusCode = 500) {
        $this->sendResponse([
            'status' => 'error',
            'message' => $message
        ], $statusCode);
    }

    protected function handleSuccess($data, $message = 'Success') {
        $this->sendResponse([
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ]);
    }

    protected function validateRequest($requiredFields) {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            $this->handleError('Invalid request data', 400);
        }

        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                $this->handleError("Missing required field: {$field}", 400);
            }
        }

        return $data;
    }
} 