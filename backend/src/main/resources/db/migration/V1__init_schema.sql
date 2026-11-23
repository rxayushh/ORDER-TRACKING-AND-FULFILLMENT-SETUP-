-- =========================================================================
-- Flyway Database Migration: V1__init_schema.sql
-- Project: ORDER TRACKING AND FULFILLMENT SETUP
-- Target Database: MySQL 8.0+ / H2 (MySQL Mode)
-- Description: Core tables, foreign keys, constraints, and indexes
-- =========================================================================

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. User Roles Join Table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
);

-- 4. Customer Addresses Table
CREATE TABLE IF NOT EXISTS customer_addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    address_type VARCHAR(20) DEFAULT 'HOME',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_address_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 5. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Warehouses Table
CREATE TABLE IF NOT EXISTS warehouses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    contact_person VARCHAR(100),
    contact_phone VARCHAR(30),
    contact_email VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Products Table
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT,
    sku VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 10,
    image_url VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
);

-- 8. Warehouse Inventory Table
CREATE TABLE IF NOT EXISTS warehouse_inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    available_quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_warehouse_product UNIQUE (warehouse_id, product_id),
    CONSTRAINT fk_wh_inventory_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id) ON DELETE CASCADE,
    CONSTRAINT fk_wh_inventory_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

-- 9. Inventory Transactions Table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    warehouse_id BIGINT,
    transaction_type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    reference_id VARCHAR(100),
    reference_type VARCHAR(50),
    notes VARCHAR(255),
    performed_by VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inv_tx_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT fk_inv_tx_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id) ON DELETE SET NULL
);

-- 10. Carts Table
CREATE TABLE IF NOT EXISTS carts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 11. Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cart_product UNIQUE (cart_id, product_id),
    CONSTRAINT fk_cart_item_cart FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_item_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

-- 12. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(60) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    shipping_address_id BIGINT,
    warehouse_id BIGINT,
    total_items INT NOT NULL DEFAULT 0,
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    shipping_fee DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    order_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'UNPAID',
    customer_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_order_address FOREIGN KEY (shipping_address_id) REFERENCES customer_addresses (id) ON DELETE SET NULL,
    CONSTRAINT fk_order_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id) ON DELETE SET NULL
);

-- 13. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    sku VARCHAR(100) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_item_product FOREIGN KEY (product_id) REFERENCES products (id)
);

-- 14. Order Status History Table
CREATE TABLE IF NOT EXISTS order_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    comments TEXT,
    updated_by VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_history_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
);

-- 15. Shipments Table
CREATE TABLE IF NOT EXISTS shipments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE,
    tracking_number VARCHAR(100) NOT NULL UNIQUE,
    carrier VARCHAR(100) NOT NULL DEFAULT 'LogiTrack Express',
    shipping_status VARCHAR(50) NOT NULL DEFAULT 'PREPARING',
    estimated_delivery TIMESTAMP NULL,
    dispatched_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    shipping_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shipment_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
);

-- 16. Fulfillment Records Table
CREATE TABLE IF NOT EXISTS fulfillment_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE,
    warehouse_id BIGINT NOT NULL,
    assigned_to_user_id BIGINT,
    fulfillment_status VARCHAR(50) NOT NULL DEFAULT 'AWAITING_PROCESSING',
    picked_at TIMESTAMP NULL,
    packed_at TIMESTAMP NULL,
    dispatched_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fulfillment_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_fulfillment_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id),
    CONSTRAINT fk_fulfillment_user FOREIGN KEY (assigned_to_user_id) REFERENCES users (id) ON DELETE SET NULL
);

-- 17. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    transaction_ref VARCHAR(100) NOT NULL UNIQUE,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'SIMULATED_GATEWAY',
    amount DECIMAL(12, 2) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    gateway_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
);

-- Indexes for high-performance querying
CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_sku ON products (sku);
CREATE INDEX idx_orders_user ON orders (user_id);
CREATE INDEX idx_orders_status ON orders (order_status);
CREATE INDEX idx_orders_number ON orders (order_number);
CREATE INDEX idx_shipments_tracking ON shipments (tracking_number);
CREATE INDEX idx_order_history_order ON order_status_history (order_id);
CREATE INDEX idx_fulfillment_warehouse ON fulfillment_records (warehouse_id);
CREATE INDEX idx_fulfillment_status ON fulfillment_records (fulfillment_status);
