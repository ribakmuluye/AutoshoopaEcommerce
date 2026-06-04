# AutoShoopa Backend

This is the backend API for AutoShoopa - A Car Spare Parts Marketplace.

## Setup Instructions

1. Place this folder in your XAMPP's htdocs directory
2. Create a MySQL database named `autoshoopa_db`
3. Import the database schema from `database/schema.sql`
4. Install dependencies:
   ```bash
   composer install
   ```
5. Configure your database connection in `config/db.php`
6. Start your XAMPP Apache and MySQL services

## API Endpoints

### Authentication
- POST `/api/user/register.php` - Register new user
- POST `/api/user/login.php` - User login
- GET `/api/user/getProfile.php` - Get user profile
- PUT `/api/user/updateProfile.php` - Update user profile

### Products
- POST `/api/product/addProduct.php` - Add new product (seller only)
- GET `/api/product/getAllProducts.php` - Get all products
- GET `/api/product/getMyProducts.php` - Get seller's products
- GET `/api/product/getProductById.php` - Get single product
- PUT `/api/product/updateProduct.php` - Update product
- DELETE `/api/product/deleteProduct.php` - Delete product

### Orders
- POST `/api/order/placeOrder.php` - Place new order
- GET `/api/order/getMyOrders.php` - Get customer's orders
- GET `/api/order/getReceivedOrders.php` - Get seller's received orders 