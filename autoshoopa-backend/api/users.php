<?php
// autoshoopa-backend/api/users.php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../utils/AuthMiddleware.php';
require_once __DIR__ . '/../config/database.php';

try {
    $db = getConnection(); // returns MongoDB\Database
    $collection = getCollection('users');
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed', 'message' => $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id === 'me') {
            $payload = requireAuth();
            try {
                $objId = new MongoDB\BSON\ObjectId($payload['id']);
                $user = $collection->findOne(['_id' => $objId]);
            } catch (Exception $e) {
                $user = $collection->findOne(['_id' => $payload['id']]);
            }

            if ($user) {
                $formatted = formatMongoDoc($user);
                unset($formatted['password']);
                echo json_encode($formatted);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
            }
        } elseif ($id) {
            try {
                $objId = new MongoDB\BSON\ObjectId($id);
                $user = $collection->findOne(['_id' => $objId]);
            } catch (Exception $e) {
                $user = $collection->findOne(['_id' => $id]);
            }

            if ($user) {
                $formatted = formatMongoDoc($user);
                unset($formatted['password']);
                echo json_encode($formatted);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
            }
        } else {
            $payload = requireAuth(); // admin only or general
            $cursor = $collection->find([]);
            $users = [];
            foreach ($cursor as $doc) {
                $formatted = formatMongoDoc($doc);
                unset($formatted['password']);
                $users[] = $formatted;
            }
            echo json_encode($users);
        }
        break;

    case 'POST':
        $payload = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            break;
        }

        // Check if email already exists
        $email = htmlspecialchars(strip_tags($data['email']));
        $exists = $collection->countDocuments(['email' => $email]);
        if ($exists > 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Email already exists']);
            break;
        }

        $document = [
            'name'       => htmlspecialchars(strip_tags($data['name'])),
            'email'      => $email,
            'password'   => password_hash($data['password'], PASSWORD_DEFAULT),
            'user_type'  => htmlspecialchars(strip_tags($data['user_type'] ?? 'customer')),
            'phone'      => htmlspecialchars(strip_tags($data['phone'] ?? '')),
            'status'     => htmlspecialchars(strip_tags($data['status'] ?? 'approved')),
            'created_at' => new MongoDB\BSON\UTCDateTime()
        ];

        if ($document['user_type'] === 'seller') {
            $document['business_name'] = htmlspecialchars(strip_tags($data['business_name'] ?? ''));
            $document['business_address'] = htmlspecialchars(strip_tags($data['business_address'] ?? ''));
        }

        try {
            $result = $collection->insertOne($document);
            $newId = (string) $result->getInsertedId();
            echo json_encode(['id' => $newId, 'status' => 'created']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create user', 'message' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $payload = requireAuth();
        $targetId = $id ?: $payload['id'];
        $data = json_decode(file_get_contents('php://input'), true);
        
        $updateFields = [];
        $allowed = ['name', 'email', 'phone', 'user_type', 'status', 'business_name', 'business_address', 'address', 'image_url'];
        
        foreach ($allowed as $f) {
            if (isset($data[$f])) {
                $updateFields[$f] = htmlspecialchars(strip_tags($data[$f]));
            }
        }
        
        if (isset($data['password'])) {
            $updateFields['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        
        if (empty($updateFields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            break;
        }

        try {
            try {
                $objId = new MongoDB\BSON\ObjectId($targetId);
                $query = ['_id' => $objId];
            } catch (Exception $e) {
                $query = ['_id' => $targetId];
            }

            $collection->updateOne($query, ['$set' => $updateFields]);
            
            // Return updated user document to frontend
            $updatedUser = $collection->findOne($query);
            if ($updatedUser) {
                $formatted = formatMongoDoc($updatedUser);
                unset($formatted['password']);
                echo json_encode($formatted);
            } else {
                echo json_encode(['status' => 'updated']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update user', 'message' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $payload = requireAuth();
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id']);
            break;
        }

        try {
            try {
                $objId = new MongoDB\BSON\ObjectId($id);
                $query = ['_id' => $objId];
            } catch (Exception $e) {
                $query = ['_id' => $id];
            }

            $collection->deleteOne($query);
            echo json_encode(['status' => 'deleted']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete user', 'message' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
