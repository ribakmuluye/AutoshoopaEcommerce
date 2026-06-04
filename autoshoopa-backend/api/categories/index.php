<?php
require_once '../../config/cors.php'; // Include the CORS header setup
require_once '../../config/database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/Auth.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

$categories = array();

$query = "SELECT id, name FROM categories ORDER BY name ASC";
$stmt = $db->prepare($query);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $category_item = array(
            "id" => $id,
            "name" => $name
        );
        array_push($categories, $category_item);
    }
    http_response_code(200);
    echo json_encode($categories);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "No categories found."));
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        // Create new category (admin only)
        $auth = new Auth($db);
        $auth->requireRole(['admin']);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->name) || empty($data->name)) {
            Response::validationError(['Name is required']);
        }

        try {
            $query = "INSERT INTO categories (name, description) VALUES (:name, :description)";
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(':name', $data->name);
            $stmt->bindParam(':description', $data->description);
            
            if ($stmt->execute()) {
                $category_id = $db->lastInsertId();
                Response::success([
                    'id' => $category_id,
                    'name' => $data->name,
                    'description' => $data->description
                ], 'Category created successfully');
            } else {
                Response::error('Unable to create category', 500);
            }
        } catch(PDOException $e) {
            Response::error('Database error: ' . $e->getMessage(), 500);
        }
        break;

    case 'PUT':
        // Update category (admin only)
        $auth = new Auth($db);
        $auth->requireRole(['admin']);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->id) || !isset($data->name) || empty($data->name)) {
            Response::validationError(['ID and name are required']);
        }

        try {
            $query = "UPDATE categories SET name = :name, description = :description WHERE id = :id";
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(':id', $data->id);
            $stmt->bindParam(':name', $data->name);
            $stmt->bindParam(':description', $data->description);
            
            if ($stmt->execute()) {
                Response::success([
                    'id' => $data->id,
                    'name' => $data->name,
                    'description' => $data->description
                ], 'Category updated successfully');
            } else {
                Response::error('Unable to update category', 500);
            }
        } catch(PDOException $e) {
            Response::error('Database error: ' . $e->getMessage(), 500);
        }
        break;

    case 'DELETE':
        // Delete category (admin only)
        $auth = new Auth($db);
        $auth->requireRole(['admin']);
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->id)) {
            Response::validationError(['ID is required']);
        }

        try {
            // Check if category has products
            $query = "SELECT COUNT(*) FROM products WHERE category_id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $data->id);
            $stmt->execute();
            
            if ($stmt->fetchColumn() > 0) {
                Response::error('Cannot delete category with associated products', 400);
            }

            $query = "DELETE FROM categories WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $data->id);
            
            if ($stmt->execute()) {
                Response::success(null, 'Category deleted successfully');
            } else {
                Response::error('Unable to delete category', 500);
            }
        } catch(PDOException $e) {
            Response::error('Database error: ' . $e->getMessage(), 500);
        }
        break;

    default:
        Response::error('Method not allowed', 405);
        break;
}
?> 