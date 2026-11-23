-- =========================================================================
-- Flyway Database Migration: V2__seed_data.sql
-- Project: ORDER TRACKING AND FULFILLMENT SETUP
-- Description: Baseline roles, categories, warehouses, and initial catalog
-- =========================================================================

-- Seed Roles
INSERT INTO roles (name, description) VALUES
('ROLE_ADMIN', 'System Administrator with full access to all modules and configurations'),
('ROLE_CUSTOMER', 'Standard customer who can browse products, manage cart, place orders, and track shipments'),
('ROLE_WAREHOUSE_MANAGER', 'Warehouse personnel who can process orders, pick, pack, and dispatch shipments');

-- Seed Categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Industrial Electronics', 'industrial-electronics', 'Microcontrollers, sensors, industrial PLCs, and automation components', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'),
('Logistics & Packaging', 'logistics-packaging', 'Thermal label printers, barcoding scanners, ESD packaging, and tape dispensers', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'),
('Warehouse Tools', 'warehouse-tools', 'Digital calipers, laser distance meters, safety scanners, and material handling gear', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'),
('Networking & Telemetry', 'networking-telemetry', 'Industrial IoT gateways, cellular telemetry routers, and PoE switches', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80');

-- Seed Warehouses
INSERT INTO warehouses (code, name, location, address, contact_person, contact_phone, contact_email, is_active) VALUES
('WH-MUM-01', 'West Hub Central Logistics', 'Bhiwandi, Mumbai', 'Building C4, Logistics Park, Mumbai-Nashik Expressway, Bhiwandi 421302', 'Rajesh Kadam', '+91 98201 12345', 'mumbai.hub@ordertrack.com', TRUE),
('WH-BLR-02', 'South Hub Fulfillment Center', 'Electronic City, Bengaluru', 'Plot 88-B, Phase 1, Electronic City, Bengaluru 560100', 'Priya Sundaram', '+91 98450 67890', 'blr.hub@ordertrack.com', TRUE),
('WH-DEL-03', 'North Hub Distribution Center', 'Kundli, NCR Delhi', 'Sector 53, Phase 4 HSIIDC, Kundli, NCR 131028', 'Amitabh Sharma', '+91 98111 23456', 'delhi.hub@ordertrack.com', TRUE);

-- Seed Products
INSERT INTO products (category_id, sku, name, description, price, stock_quantity, low_stock_threshold, image_url, status, version) VALUES
(1, 'ELEC-ESP32-S3', 'ESP32-S3 Dual-Core Industrial IoT Module', 'High-performance Wi-Fi + Bluetooth 5 (LE) MCU module designed for connected edge devices and telemetry hubs.', 1450.00, 180, 25, 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', 'ACTIVE', 0),
(1, 'ELEC-STM32-H7', 'STM32H743 High-Precision Core Development Board', 'ARM Cortex-M7 core running at 480 MHz with double-precision FPU, DSP instructions, and industrial interfaces.', 4200.00, 95, 15, 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80', 'ACTIVE', 0),
(2, 'LOGI-PRN-420B', 'Thermal Barcode & Shipping Label Printer 4-Inch', 'Direct thermal commercial high-speed desktop label printer for Amazon, Flipkart, FedEx shipping labels.', 8999.00, 45, 10, 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80', 'ACTIVE', 0),
(2, 'LOGI-SCN-2D', 'Wireless 2D QR Code & Barcode Handheld Scanner', 'Rugged handheld Bluetooth and 2.4GHz wireless scanner for warehouse inventory picking and dispatch audits.', 3650.00, 120, 20, 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&q=80', 'ACTIVE', 0),
(3, 'TOOL-DMM-RMS', 'Industrial True-RMS Digital Multimeter with Data Logging', '6000-count CAT IV 600V certified auto-ranging multimeter with Bluetooth connectivity for QA logging.', 5490.00, 60, 12, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', 'ACTIVE', 0),
(3, 'TOOL-DIST-100', 'Laser Precision Distance Measurer 100M', 'High-accuracy laser rangefinder for warehouse rack planning, bay dimensioning, and volume verification.', 2890.00, 75, 15, 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80', 'ACTIVE', 0),
(4, 'NET-IOT-GATE', '4G LTE Industrial Telemetry & Modbus Gateway', 'Rugged DIN-rail cellular gateway with RS485 Modbus RTU to MQTT/HTTP conversion for remote tracking.', 11200.00, 32, 8, 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80', 'ACTIVE', 0),
(4, 'NET-POE-SW8', '8-Port Gigabit Unmanaged Industrial PoE+ Switch', 'Rugged metal housing switch with 120W total PoE budget, redundant power inputs, and surge protection.', 7800.00, 40, 10, 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80', 'ACTIVE', 0);

-- Seed Warehouse Inventory Allocations
INSERT INTO warehouse_inventory (warehouse_id, product_id, available_quantity, reserved_quantity) VALUES
(1, 1, 80, 0),
(2, 1, 60, 0),
(3, 1, 40, 0),
(1, 2, 45, 0),
(2, 2, 30, 0),
(3, 2, 20, 0),
(1, 3, 20, 0),
(2, 3, 15, 0),
(3, 3, 10, 0),
(1, 4, 50, 0),
(2, 4, 40, 0),
(3, 4, 30, 0),
(1, 5, 25, 0),
(2, 5, 20, 0),
(3, 5, 15, 0),
(1, 6, 30, 0),
(2, 6, 25, 0),
(3, 6, 20, 0),
(1, 7, 15, 0),
(2, 7, 10, 0),
(3, 7, 7, 0),
(1, 8, 18, 0),
(2, 8, 12, 0),
(3, 8, 10, 0);
