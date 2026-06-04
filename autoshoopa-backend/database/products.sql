CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    description TEXT NOT NULL,
    specifications JSON,
    compatibility TEXT,
    brand VARCHAR(100),
    model VARCHAR(100),
    condition VARCHAR(50),
    warranty VARCHAR(100),
    shipping_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_seller_id (seller_id),
    INDEX idx_category (category),
    INDEX idx_brand (brand)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create product_images table for multiple images
CREATE TABLE IF NOT EXISTS product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add some sample categories
INSERT INTO product_categories (name) VALUES
('Brake Systems'),
('Engine Parts'),
('Suspension'),
('Electrical'),
('Body Parts'),
('Transmission'),
('Exhaust Systems'),
('Cooling Systems'),
('Fuel Systems'),
('Steering Systems')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Add sample brands
INSERT INTO product_brands (name) VALUES
('Bosch'),
('NGK'),
('Delphi'),
('Denso'),
('Mann-Filter'),
('Valeo'),
('Sachs'),
('Lemforder'),
('Febi'),
('Genuine Parts')
ON DUPLICATE KEY UPDATE name = VALUES(name); 