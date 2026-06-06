<?php
// autoshoopa-backend/api/products.php
require_once __DIR__ . '/../config/cors.php';      // CORS headers + OPTIONS preflight
require_once __DIR__ . '/../autoshoopa-backend/utils/AuthMiddleware.php';
require_once __DIR__ . '/../config/database.php';

try {
    $db = getConnection(); // returns MongoDB\Database
    $collection = getCollection('products');
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed', 'message' => $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$sellerId = $_GET['sellerId'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            try {
                $objId = new MongoDB\BSON\ObjectId($id);
                $product = $collection->findOne(['_id' => $objId]);
            } catch (Exception $e) {
                // Fallback to string ID check if invalid ObjectID format
                $product = $collection->findOne(['_id' => $id]);
            }

            if ($product) {
                $formatted = formatMongoDoc($product);
                // Map stock_quantity to stock for frontend compatibility
                $formatted['stock'] = $formatted['stock_quantity'] ?? 0;
                echo json_encode($formatted);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Product not found']);
            }
        } elseif ($sellerId) {
            $cursor = $collection->find(['seller_id' => $sellerId]);
            $products = [];
            foreach ($cursor as $doc) {
                $formatted = formatMongoDoc($doc);
                $formatted['stock'] = $formatted['stock_quantity'] ?? 0;
                $products[] = $formatted;
            }
            echo json_encode($products);
        } else {
            $cursor = $collection->find([]);
            $products = [];
            foreach ($cursor as $doc) {
                $formatted = formatMongoDoc($doc);
                $formatted['stock'] = $formatted['stock_quantity'] ?? 0;
                $products[] = $formatted;
            }
            echo json_encode($products);
        }
        break;

    case 'POST':
        $payload = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['name']) || !isset($data['price'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            break;
        }

        $document = [
            'seller_id'      => (string) $payload['id'],
            'category_id'    => (string) ($data['category_id'] ?? '1'),
            'name'           => htmlspecialchars(strip_tags($data['name'])),
            'description'    => htmlspecialchars(strip_tags($data['description'] ?? '')),
            'price'          => (float) $data['price'],
            'stock_quantity' => (int) ($data['stock_quantity'] ?? $data['stock'] ?? 0),
            'image_url'      => htmlspecialchars(strip_tags($data['image_url'] ?? '')),
            'created_at'     => new MongoDB\BSON\UTCDateTime()
        ];

        try {
            $result = $collection->insertOne($document);
            $newId = $result->getInsertedId();
            $newDoc = $collection->findOne(['_id' => $newId]);
            
            $formatted = formatMongoDoc($newDoc);
            $formatted['stock'] = $formatted['stock_quantity'] ?? 0;
            echo json_encode($formatted);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create product', 'message' => $e->getMessage()]);
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
        $allowed = ['name', 'description', 'price', 'stock_quantity', 'stock', 'image_url', 'category_id'];
        
        foreach ($allowed as $f) {
            if (isset($data[$f])) {
                if ($f === 'price') {
                    $updateData['price'] = (float) $data[$f];
                } elseif ($f === 'stock_quantity' || $f === 'stock') {
                    $updateData['stock_quantity'] = (int) $data[$f];
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
                $formatted = formatMongoDoc($updatedDoc);
                $formatted['stock'] = $formatted['stock_quantity'] ?? 0;
                echo json_encode($formatted);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Product not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update product', 'message' => $e->getMessage()]);
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
            echo json_encode(['error' => 'Failed to delete product', 'message' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
