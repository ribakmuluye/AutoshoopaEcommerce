<?php
// Include CORS configuration
require_once '../../config/cors.php';

// Get database connection
include_once '../../config/database.php';
include_once '../../objects/user.php';

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Log the received data
error_log("Received login request: " . print_r($data, true));

// Validate required fields
if (!isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(array("message" => "Missing required fields"));
    exit();
}

try {
    // Create database connection
    $database = new Database();
    $db = $database->getConnection();

    // Create user object
    $user = new User($db);

    // Set user properties
    $user->email = $data->email;
    $user->password = $data->password;
    $user->user_type = $data->user_type ?? 'customer';

    // Attempt to login
    $result = $user->login();

    if ($result) {
        // Log successful login
        error_log("User logged in successfully: " . $user->email);
        
        // Include Auth helper and generate token
        require_once '../../utils/Auth.php';
        $user_data = array(
            "id" => $user->id,
            "name" => $user->name,
            "email" => $user->email,
            "user_type" => $user->user_type,
            "phone" => $user->phone,
            "business_name" => $user->business_name,
            "business_address" => $user->business_address
        );
        $token = Auth::generateToken($user_data);

        // Create response array
        $response = array(
            "message" => "Login successful",
            "token" => $token,
            "user" => array_merge($user_data, ["token" => $token])
        );

        http_response_code(200);
        echo json_encode($response);
    } else {
        // Log failed login attempt
        error_log("Failed login attempt for email: " . $user->email);
        
        http_response_code(401);
        echo json_encode(array("message" => "Invalid email or password"));
    }
} catch (Exception $e) {
    // Log the error
    error_log("Login error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode(array("message" => "Internal server error"));
}
?> 