<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../BaseApi.php';
require_once __DIR__ . '/../../services/EmailService.php';

class ContactEmailApi extends BaseApi {
    private $emailService;

    public function __construct() {
        parent::__construct();
        $this->emailService = new EmailService();
    }
    
    public function sendEmail() {
        // Only allow POST requests
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->handleError('Method not allowed', 405);
        }
        
        // Validate required fields
        $data = $this->validateRequest(['name', 'email', 'subject', 'message']);
        
        // Validate email format
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $this->handleError('Invalid email format', 400);
        }
        
        // Validate name length (minimum 5 characters)
        if (strlen(trim($data['name'])) < 5) {
            $this->handleError('Name must be at least 5 characters long', 400);
        }
        
        // Validate message length (minimum 10 characters)
        if (strlen(trim($data['message'])) < 10) {
            $this->handleError('Message must be at least 10 characters long', 400);
        }
        
        try {
            // Send email via EmailService (handles SMTP + DB logging)
            $result = $this->emailService->sendContactEmail($data);
            
            // Also log to contact_submissions collection (legacy record)
            $this->logContactSubmission($data);
            
            $this->handleSuccess([
                'message' => 'Your message has been received!',
                'mail_sent' => $result['sent'],
                'method' => $result['method'],
                'logged_to_db' => true,
                'smtp_message' => $result['message'] ?? null
            ], $result['sent']
                ? 'Your message has been sent successfully!'
                : 'Your message has been saved. We will review it shortly.'
            );
            
        } catch (Exception $e) {
            $this->handleError('An error occurred while processing your message: ' . $e->getMessage(), 500);
        }
    }
    
    private function logContactSubmission($data) {
        try {
            $collection = $this->conn->selectCollection('contact_submissions');
            $collection->insertOne([
                'name' => trim($data['name']),
                'email' => trim($data['email']),
                'subject' => trim($data['subject']),
                'message' => trim($data['message']),
                'created_at' => new MongoDB\BSON\UTCDateTime()
            ]);
        } catch (Exception $e) {
            error_log("Failed to log contact submission to MongoDB: " . $e->getMessage());
        }
    }
}

// Handle the request
$api = new ContactEmailApi();
$api->sendEmail();
?>