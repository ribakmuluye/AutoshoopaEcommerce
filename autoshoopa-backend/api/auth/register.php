<?php
// Include CORS configuration
require_once '../../config/cors.php';

// Get database connection
include_once '../../config/database.php';
include_once '../../objects/user.php';

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Log the received data
error_log("Received registration request: " . print_r($data, true));

// Validate required fields
if (!isset($data->name) || !isset($data->email) || !isset($data->password)) {
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
    $user->name = $data->name;
    $user->email = $data->email;
    $user->password = $data->password;
    $user->user_type = $data->user_type ?? 'customer';
    $user->phone = $data->phone ?? '';
    $user->business_name = $data->business_name ?? '';
    $user->business_address = $data->business_address ?? '';

    // Check if email already exists
    if ($user->emailExists()) {
        http_response_code(400);
        echo json_encode(array("message" => "Email already exists"));
        exit();
    }

    // Create the user
    if ($user->create()) {
        // Log successful registration
        error_log("User registered successfully: " . $user->email);
        
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
            "message" => "Registration successful",
            "token" => $token,
            "user" => array_merge($user_data, ["token" => $token])
        );

        http_response_code(201);
        echo json_encode($response);
    } else {
        // Log failed registration
        error_log("Failed to register user: " . $user->email);
        
        http_response_code(503);
        echo json_encode(array("message" => "Unable to register user"));
    }
} catch (Exception $e) {
    // Log the error
    error_log("Registration error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode(array("message" => "Internal server error"));
}
?> 