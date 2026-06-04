<?php
// Include CORS configuration
require_once '../../config/cors.php';

// Get database connection
include_once '../../config/database.php';
include_once '../../objects/user.php';

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Log the received data
error_log("Received reset request: " . print_r($data, true));

// Validate required fields
if (!isset($data->action)) {
    http_response_code(400);
    echo json_encode(array("message" => "Missing required fields"));
    exit();
}

try {
    // Create database connection
    $database = new Database();
    $db = $database->getConnection();
    $collection = getCollection('users');

    if ($data->action === 'request') {
        if (!isset($data->email)) {
            http_response_code(400);
            echo json_encode(array("message" => "Missing email"));
            exit();
        }

        $email = htmlspecialchars(strip_tags($data->email));
        $userDoc = $collection->findOne(['email' => $email]);

        if ($userDoc) {
            // Generate a secure token
            $token = bin2hex(random_bytes(32));
            $expiry = new MongoDB\BSON\UTCDateTime((time() + 3600) * 1000); // 1 hour expiry

            $collection->updateOne(
                ['_id' => $userDoc['_id']],
                ['$set' => [
                    'reset_token' => $token,
                    'reset_token_expiry' => $expiry
                ]]
            );

            // In a real application, you would send an email here.
            // For development, we just return success and log the token.
            error_log("Password reset token for $email: $token");

            http_response_code(200);
            echo json_encode(array(
                "message" => "Password reset email sent",
                "dev_token" => $token // Useful for testing without email setup
            ));
        } else {
            // Return 200 even if user not found to prevent email enumeration
            http_response_code(200);
            echo json_encode(array("message" => "If the email exists, a reset link has been sent"));
        }

    } else if ($data->action === 'confirm') {
        if (!isset($data->token) || !isset($data->password)) {
            http_response_code(400);
            echo json_encode(array("message" => "Missing token or password"));
            exit();
        }

        $token = htmlspecialchars(strip_tags($data->token));
        $new_password = $data->password;

        $userDoc = $collection->findOne([
            'reset_token' => $token,
            'reset_token_expiry' => ['$gt' => new MongoDB\BSON\UTCDateTime()]
        ]);

        if ($userDoc) {
            $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

            $collection->updateOne(
                ['_id' => $userDoc['_id']],
                ['$set' => ['password' => $hashed_password],
                 '$unset' => ['reset_token' => '', 'reset_token_expiry' => '']]
            );

            http_response_code(200);
            echo json_encode(array("message" => "Password successfully reset"));
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Invalid or expired reset token"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid action"));
    }

} catch (Exception $e) {
    // Log the error
    error_log("Reset error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode(array("message" => "Internal server error"));
}
?>
