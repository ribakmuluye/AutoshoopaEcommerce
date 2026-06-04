<?php
// autoshoopa-backend/api/categories.php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../utils/AuthMiddleware.php';
require_once __DIR__ . '/../config/database.php';

try {
    $db = getConnection(); // returns MongoDB\Database
    $collection = getCollection('categories');
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed', 'message' => $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            try {
                $objId = new MongoDB\BSON\ObjectId($id);
                $category = $collection->findOne(['_id' => $objId]);
            } catch (Exception $e) {
                $category = $collection->findOne(['_id' => $id]);
            }

            if ($category) {
                echo json_encode(formatMongoDoc($category));
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Category not found']);
            }
        } else {
            $cursor = $collection->find(['is_active' => ['$ne' => 0]]);
            $categories = [];
            foreach ($cursor as $doc) {
                $categories[] = formatMongoDoc($doc);
            }
            echo json_encode($categories);
        }
        break;

    case 'POST':
        $payload = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            break;
        }

        $document = [
            'name'        => htmlspecialchars(strip_tags($data['name'])),
            'description' => htmlspecialchars(strip_tags($data['description'] ?? '')),
            'is_active'   => 1,
            'created_at'  => new MongoDB\BSON\UTCDateTime()
        ];

        try {
            $result = $collection->insertOne($document);
            $newId = $result->getInsertedId();
            $newDoc = $collection->findOne(['_id' => $newId]);
            echo json_encode(formatMongoDoc($newDoc));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create category', 'message' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $payload = requireAuth();
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id']);
            break;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        
        $updateData = [];
        $allowed = ['name', 'description', 'is_active'];
        foreach ($allowed as $f) {
            if (isset($data[$f])) {
                if ($f === 'is_active') {
                    $updateData['is_active'] = (int) $data[$f];
                } else {
                    $updateData[$f] = htmlspecialchars(strip_tags($data[$f]));
                }
            }
        }
        
        if (empty($updateData)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            break;
        }

        try {
            try {
                $objId = new MongoDB\BSON\ObjectId($id);
                $query = ['_id' => $objId];
            } catch (Exception $e) {
                $query = ['_id' => $id];
            }

            $collection->updateOne($query, ['$set' => $updateData]);
            $updatedDoc = $collection->findOne($query);
            
            if ($updatedDoc) {
                echo json_encode(formatMongoDoc($updatedDoc));
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Category not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update category', 'message' => $e->getMessage()]);
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

            // Soft delete category by setting is_active to 0
            $collection->updateOne($query, ['$set' => ['is_active' => 0]]);
            echo json_encode(['status' => 'deleted']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete category', 'message' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
