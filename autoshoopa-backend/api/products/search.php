<?php
require_once '../../config/cors.php'; // Include CORS headers
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Get query parameters
$search = isset($_GET['search']) ? $_GET['search'] : null;
$category_id = isset($_GET['category_id']) ? $_GET['category_id'] : null;
$min_price = isset($_GET['min_price']) ? (float)$_GET['min_price'] : null;
$max_price = isset($_GET['max_price']) ? (float)$_GET['max_price'] : null;
$in_stock = isset($_GET['in_stock']) ? $_GET['in_stock'] === 'true' : null;
$sort_by = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'created_at';
$sort_order = isset($_GET['sort_order']) ? strtoupper($_GET['sort_order']) : 'DESC';
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($page - 1) * $limit;

// Validate sort parameters
$allowed_sort_fields = ['price', 'created_at', 'name', 'rating'];
$allowed_sort_orders = ['ASC', 'DESC'];

if (!in_array($sort_by, $allowed_sort_fields)) {
    $sort_by = 'created_at';
}
if (!in_array($sort_order, $allowed_sort_orders)) {
    $sort_order = 'DESC';
}

// Build query
$query = "SELECT p.*, c.name as category_name, u.name as seller_name,
          COALESCE(AVG(r.rating), 0) as average_rating,
          COUNT(r.id) as review_count
          FROM products p 
          JOIN categories c ON p.category_id = c.id 
          JOIN users u ON p.seller_id = u.id 
          LEFT JOIN reviews r ON p.id = r.product_id
          WHERE 1=1";
$params = [];

if ($search) {
    $query .= " AND (p.name LIKE ? OR p.description LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

if ($category_id) {
    $query .= " AND p.category_id = ?";
    $params[] = $category_id;
}

if ($min_price !== null) {
    $query .= " AND p.price >= ?";
    $params[] = $min_price;
}

if ($max_price !== null) {
    $query .= " AND p.price <= ?";
    $params[] = $max_price;
}

if ($in_stock) {
    $query .= " AND p.stock > 0";
}

// Group by to handle aggregations
$query .= " GROUP BY p.id";

// Add sorting
$query .= " ORDER BY " . ($sort_by === 'rating' ? 'average_rating' : 'p.' . $sort_by) . " " . $sort_order;

// Get total count
$count_query = str_replace("p.*, c.name as category_name, u.name as seller_name,
          COALESCE(AVG(r.rating), 0) as average_rating,
          COUNT(r.id) as review_count", "COUNT(DISTINCT p.id) as total", $query);
$stmt = $db->prepare($count_query);
$stmt->execute($params);
$total = $stmt->fetch()['total'];

// Add pagination
$query .= " LIMIT ? OFFSET ?";
$params[] = $limit;
$params[] = $offset;

// Execute query
$stmt = $db->prepare($query);
$stmt->execute($params);
$products = $stmt->fetchAll();

// Format response
foreach ($products as &$product) {
    $product['average_rating'] = round($product['average_rating'], 1);
}

$response = array(
    "total" => $total,
    "page" => $page,
    "limit" => $limit,
    "total_pages" => ceil($total / $limit),
    "products" => $products
);

http_response_code(200);
echo json_encode($response); 