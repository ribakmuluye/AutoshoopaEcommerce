<?php
require_once __DIR__ . '/../BaseApi.php';

class ProductsApi extends BaseApi {
    public function __construct() {
        parent::__construct();
    }

    public function getAllProducts() {
        try {
            $query = "SELECT p.*, u.business_name as seller_name 
                     FROM products p 
                     JOIN users u ON p.seller_id = u.id 
                     ORDER BY p.created_at DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            $products = $stmt->fetchAll();
            $this->handleSuccess($products);
        } catch (Exception $e) {
            $this->handleError($e->getMessage());
        }
    }

    public function getProduct($id) {
        try {
            $query = "SELECT p.*, u.business_name as seller_name 
                     FROM products p 
                     JOIN users u ON p.seller_id = u.id 
                     WHERE p.id = :id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            $product = $stmt->fetch();
            
            if (!$product) {
                $this->handleError('Product not found', 404);
            }
            
            $this->handleSuccess($product);
        } catch (Exception $e) {
            $this->handleError($e->getMessage());
        }
    }

    public function createProduct() {
        try {
            $data = $this->validateRequest(['name', 'description', 'price', 'stock', 'seller_id']);
            
            $query = "INSERT INTO products (name, description, price, stock, seller_id, image_url, category) 
                     VALUES (:name, :description, :price, :stock, :seller_id, :image_url, :category)";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':price', $data['price']);
            $stmt->bindParam(':stock', $data['stock']);
            $stmt->bindParam(':seller_id', $data['seller_id']);
            $stmt->bindParam(':image_url', $data['image_url'] ?? null);
            $stmt->bindParam(':category', $data['category'] ?? null);
            
            if ($stmt->execute()) {
                $data['id'] = $this->conn->lastInsertId();
                $this->handleSuccess($data, 'Product created successfully');
            } else {
                $this->handleError('Failed to create product');
            }
        } catch (Exception $e) {
            $this->handleError($e->getMessage());
        }
    }

    public function updateProduct($id) {
        try {
            $data = $this->validateRequest(['name', 'description', 'price', 'stock']);
            
            $query = "UPDATE products 
                     SET name = :name, 
                         description = :description, 
                         price = :price, 
                         stock = :stock, 
                         image_url = :image_url, 
                         category = :category 
                     WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':price', $data['price']);
            $stmt->bindParam(':stock', $data['stock']);
            $stmt->bindParam(':image_url', $data['image_url'] ?? null);
            $stmt->bindParam(':category', $data['category'] ?? null);
            
            if ($stmt->execute()) {
                $data['id'] = $id;
                $this->handleSuccess($data, 'Product updated successfully');
            } else {
                $this->handleError('Failed to update product');
            }
        } catch (Exception $e) {
            $this->handleError($e->getMessage());
        }
    }

    public function deleteProduct($id) {
        try {
            $query = "DELETE FROM products WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                $this->handleSuccess(null, 'Product deleted successfully');
            } else {
                $this->handleError('Failed to delete product');
            }
        } catch (Exception $e) {
            $this->handleError($e->getMessage());
        }
    }
} 