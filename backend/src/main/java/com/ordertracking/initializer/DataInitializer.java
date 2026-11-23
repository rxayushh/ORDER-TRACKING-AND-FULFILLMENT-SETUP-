package com.ordertracking.initializer;

import com.ordertracking.entity.*;
import com.ordertracking.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Profile;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final WarehouseInventoryRepository warehouseInventoryRepository;
    private final CustomerAddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository historyRepository;
    private final ShipmentRepository shipmentRepository;
    private final FulfillmentRecordRepository fulfillmentRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Initializing baseline roles, users, and catalog data...");

        // 1. Roles
        Role adminRole = getOrCreateRole(RoleName.ROLE_ADMIN, "System Administrator");
        Role customerRole = getOrCreateRole(RoleName.ROLE_CUSTOMER, "Standard Customer");
        Role warehouseRole = getOrCreateRole(RoleName.ROLE_WAREHOUSE_MANAGER, "Warehouse Manager");

        // 2. Default Seed Users
        User admin = getOrCreateUser(
                "admin@ordertrack.com",
                "Admin@123",
                "System Administrator",
                "+91 99000 11223",
                Set.of(adminRole)
        );

        User warehouseManager = getOrCreateUser(
                "warehouse@ordertrack.com",
                "Warehouse@123",
                "Rajesh Kadam (Manager)",
                "+91 98201 12345",
                Set.of(warehouseRole)
        );

        User customer = getOrCreateUser(
                "customer@ordertrack.com",
                "Customer@123",
                "Aarav Mehta",
                "+91 98765 43210",
                Set.of(customerRole)
        );

        // 3. Customer Address
        CustomerAddress address;
        if (addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(customer.getId()).isEmpty()) {
            address = CustomerAddress.builder()
                    .user(customer)
                    .recipientName("Aarav Mehta")
                    .phoneNumber("+91 98765 43210")
                    .streetAddress("Flat 402, Green Acres Heights, Off Linking Road, Bandra West")
                    .city("Mumbai")
                    .state("Maharashtra")
                    .postalCode("400050")
                    .country("India")
                    .addressType("HOME")
                    .isDefault(true)
                    .build();
            address = addressRepository.save(address);
        } else {
            address = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(customer.getId()).get(0);
        }

        // 4. Warehouses
        Warehouse wh1 = getOrCreateWarehouse("WH-MUM-01", "West Hub Central Logistics", "Bhiwandi, Mumbai", "Building C4, Logistics Park, Mumbai-Nashik Expressway, Bhiwandi 421302", "Rajesh Kadam", "+91 98201 12345", "mumbai.hub@ordertrack.com");
        Warehouse wh2 = getOrCreateWarehouse("WH-BLR-02", "South Hub Fulfillment Center", "Electronic City, Bengaluru", "Plot 88-B, Phase 1, Electronic City, Bengaluru 560100", "Priya Sundaram", "+91 98450 67890", "blr.hub@ordertrack.com");
        Warehouse wh3 = getOrCreateWarehouse("WH-DEL-03", "North Hub Distribution Center", "Kundli, NCR Delhi", "Sector 53, Phase 4 HSIIDC, Kundli, NCR 131028", "Amitabh Sharma", "+91 98111 23456", "delhi.hub@ordertrack.com");

        // 5. Categories
        Category catElectronics = getOrCreateCategory("Industrial Electronics", "industrial-electronics", "Microcontrollers, sensors, industrial PLCs, and automation components", "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80");
        Category catPackaging = getOrCreateCategory("Logistics & Packaging", "logistics-packaging", "Thermal label printers, barcoding scanners, ESD packaging, and tape dispensers", "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80");
        Category catTools = getOrCreateCategory("Warehouse Tools", "warehouse-tools", "Digital calipers, laser distance meters, safety scanners, and material handling gear", "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80");
        Category catNet = getOrCreateCategory("Networking & Telemetry", "networking-telemetry", "Industrial IoT gateways, cellular telemetry routers, and PoE switches", "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80");

        // 6. Products
        Product p1 = getOrCreateProduct("ELEC-ESP32-S3", "ESP32-S3 Dual-Core Industrial IoT Module", "High-performance Wi-Fi + Bluetooth 5 (LE) MCU module designed for connected edge devices.", BigDecimal.valueOf(1450.00), 180, 25, catElectronics, "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80", wh1);
        Product p2 = getOrCreateProduct("LOGI-PRN-420B", "Thermal Barcode & Shipping Label Printer 4-Inch", "Direct thermal commercial high-speed desktop label printer for FedEx, BlueDart, DHL shipping labels.", BigDecimal.valueOf(8999.00), 45, 10, catPackaging, "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80", wh1);
        Product p3 = getOrCreateProduct("LOGI-SCN-2D", "Wireless 2D QR Code & Barcode Handheld Scanner", "Rugged handheld Bluetooth and 2.4GHz wireless scanner for warehouse inventory picking.", BigDecimal.valueOf(3650.00), 120, 20, catPackaging, "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&q=80", wh2);
        Product p4 = getOrCreateProduct("TOOL-DMM-RMS", "Industrial True-RMS Digital Multimeter with Data Logging", "6000-count CAT IV 600V certified auto-ranging multimeter with Bluetooth connectivity.", BigDecimal.valueOf(5490.00), 60, 12, catTools, "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80", wh3);
        Product p5 = getOrCreateProduct("NET-IOT-GATE", "4G LTE Industrial Telemetry & Modbus Gateway", "Rugged DIN-rail cellular gateway with RS485 Modbus RTU to MQTT/HTTP conversion.", BigDecimal.valueOf(11200.00), 32, 8, catNet, "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80", wh1);
        Product p6 = getOrCreateProduct("NET-POE-SW8", "8-Port Gigabit Unmanaged Industrial PoE+ Switch", "Rugged metal housing switch with 120W total PoE budget, redundant power inputs.", BigDecimal.valueOf(7800.00), 8, 10, catNet, "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80", wh2); // Low stock sample

        // 7. Seed Sample Orders with Realistic Tracking Milestones
        if (orderRepository.count() == 0) {
            createSampleOrder(
                    "ORD-20261120-7A8901BC",
                    "TRK-20261120-99482103",
                    customer,
                    address,
                    wh1,
                    List.of(p1, p3),
                    OrderStatus.SHIPPED,
                    "IN_TRANSIT",
                    warehouseManager
            );

            createSampleOrder(
                    "ORD-20261118-4E5F611A",
                    "TRK-20261118-88371940",
                    customer,
                    address,
                    wh2,
                    List.of(p2),
                    OrderStatus.DELIVERED,
                    "DELIVERED",
                    warehouseManager
            );

            createSampleOrder(
                    "ORD-20261121-12C3D4E5",
                    "TRK-20261121-77290123",
                    customer,
                    address,
                    wh1,
                    List.of(p4, p5),
                    OrderStatus.PROCESSING,
                    "PREPARING",
                    warehouseManager
            );
        }

        log.info("System data initialization complete.");
        log.info("========================================================================");
        log.info("Default Credentials Available:");
        log.info("  Admin:             admin@ordertrack.com     / Admin@123");
        log.info("  Warehouse Manager: warehouse@ordertrack.com / Warehouse@123");
        log.info("  Customer:          customer@ordertrack.com  / Customer@123");
        log.info("  Sample Tracking:   TRK-20261120-99482103");
        log.info("========================================================================");
    }

    private Role getOrCreateRole(RoleName name, String description) {
        return roleRepository.findByName(name)
                .orElseGet(() -> roleRepository.save(Role.builder().name(name).description(description).build()));
    }

    private User getOrCreateUser(String email, String rawPassword, String fullName, String phone, Set<Role> roles) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .fullName(fullName)
                    .phoneNumber(phone)
                    .enabled(true)
                    .roles(roles)
                    .build();
            return userRepository.save(user);
        });
    }

    private Warehouse getOrCreateWarehouse(String code, String name, String loc, String addr, String cp, String phone, String email) {
        return warehouseRepository.findByCode(code).orElseGet(() -> {
            Warehouse wh = Warehouse.builder()
                    .code(code)
                    .name(name)
                    .location(loc)
                    .address(addr)
                    .contactPerson(cp)
                    .contactPhone(phone)
                    .contactEmail(email)
                    .isActive(true)
                    .build();
            return warehouseRepository.save(wh);
        });
    }

    private Category getOrCreateCategory(String name, String slug, String desc, String img) {
        return categoryRepository.findBySlug(slug).orElseGet(() -> {
            Category cat = Category.builder()
                    .name(name)
                    .slug(slug)
                    .description(desc)
                    .imageUrl(img)
                    .build();
            return categoryRepository.save(cat);
        });
    }

    private Product getOrCreateProduct(String sku, String name, String desc, BigDecimal price, int qty, int threshold, Category cat, String img, Warehouse wh) {
        return productRepository.findBySku(sku).orElseGet(() -> {
            Product p = Product.builder()
                    .sku(sku)
                    .name(name)
                    .description(desc)
                    .price(price)
                    .stockQuantity(qty)
                    .lowStockThreshold(threshold)
                    .category(cat)
                    .imageUrl(img)
                    .status("ACTIVE")
                    .build();
            p = productRepository.save(p);

            WarehouseInventory inventory = WarehouseInventory.builder()
                    .warehouse(wh)
                    .product(p)
                    .availableQuantity(qty)
                    .reservedQuantity(0)
                    .build();
            warehouseInventoryRepository.save(inventory);

            return p;
        });
    }

    private void createSampleOrder(String orderNum, String trackNum, User customer, CustomerAddress address, Warehouse wh, List<Product> products, OrderStatus status, String shippingStatus, User manager) {
        BigDecimal subtotal = BigDecimal.ZERO;
        int totalItems = 0;
        for (Product p : products) {
            subtotal = subtotal.add(p.getPrice());
            totalItems += 1;
        }
        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.05));
        BigDecimal total = subtotal.add(tax);

        Order order = Order.builder()
                .orderNumber(orderNum)
                .user(customer)
                .shippingAddress(address)
                .warehouse(wh)
                .totalItems(totalItems)
                .subtotal(subtotal)
                .shippingFee(BigDecimal.ZERO)
                .taxAmount(tax)
                .totalAmount(total)
                .orderStatus(status)
                .paymentStatus("PAID")
                .customerNotes("Academic demo order initialization")
                .build();
        order = orderRepository.save(order);

        for (Product p : products) {
            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(p)
                    .sku(p.getSku())
                    .productName(p.getName())
                    .unitPrice(p.getPrice())
                    .quantity(1)
                    .subtotal(p.getPrice())
                    .build();
            orderItemRepository.save(item);
        }

        // Timeline milestones
        LocalDateTime t0 = LocalDateTime.now().minusDays(3);
        LocalDateTime t1 = t0.plusHours(1);
        LocalDateTime t2 = t0.plusHours(5);
        LocalDateTime t3 = t0.plusHours(10);
        LocalDateTime t4 = t0.plusHours(18);

        historyRepository.save(OrderStatusHistory.builder().order(order).previousStatus(null).newStatus(OrderStatus.PENDING).comments("Order placed by customer").updatedBy(customer.getEmail()).createdAt(t0).build());
        historyRepository.save(OrderStatusHistory.builder().order(order).previousStatus(OrderStatus.PENDING).newStatus(OrderStatus.CONFIRMED).comments("Simulated payment approved").updatedBy("SYSTEM_GATEWAY").createdAt(t1).build());

        if (status == OrderStatus.PROCESSING || status == OrderStatus.PACKED || status == OrderStatus.SHIPPED || status == OrderStatus.DELIVERED) {
            historyRepository.save(OrderStatusHistory.builder().order(order).previousStatus(OrderStatus.CONFIRMED).newStatus(OrderStatus.PROCESSING).comments("Items picked at warehouse").updatedBy(manager.getEmail()).createdAt(t2).build());
        }
        if (status == OrderStatus.PACKED || status == OrderStatus.SHIPPED || status == OrderStatus.DELIVERED) {
            historyRepository.save(OrderStatusHistory.builder().order(order).previousStatus(OrderStatus.PROCESSING).newStatus(OrderStatus.PACKED).comments("Items packed into secure shipping container").updatedBy(manager.getEmail()).createdAt(t3).build());
        }
        if (status == OrderStatus.SHIPPED || status == OrderStatus.DELIVERED) {
            historyRepository.save(OrderStatusHistory.builder().order(order).previousStatus(OrderStatus.PACKED).newStatus(OrderStatus.SHIPPED).comments("Dispatched with carrier LogiTrack Express").updatedBy(manager.getEmail()).createdAt(t4).build());
        }
        if (status == OrderStatus.DELIVERED) {
            historyRepository.save(OrderStatusHistory.builder().order(order).previousStatus(OrderStatus.SHIPPED).newStatus(OrderStatus.DELIVERED).comments("Package delivered to customer").updatedBy("CARRIER_DELIVERY_AGENT").createdAt(LocalDateTime.now().minusHours(2)).build());
        }

        Shipment shipment = Shipment.builder()
                .order(order)
                .trackingNumber(trackNum)
                .carrier("LogiTrack Express")
                .shippingStatus(shippingStatus)
                .estimatedDelivery(LocalDateTime.now().plusDays(2))
                .dispatchedAt(status == OrderStatus.SHIPPED || status == OrderStatus.DELIVERED ? t4 : null)
                .deliveredAt(status == OrderStatus.DELIVERED ? LocalDateTime.now().minusHours(2) : null)
                .shippingNotes("Tracked via LogiTrack GPS Telemetry Hub")
                .build();
        shipmentRepository.save(shipment);

        FulfillmentRecord fulfillment = FulfillmentRecord.builder()
                .order(order)
                .warehouse(wh)
                .assignedTo(manager)
                .fulfillmentStatus(status == OrderStatus.DELIVERED ? "COMPLETED" : (status == OrderStatus.SHIPPED ? "DISPATCHED" : "PROCESSING"))
                .pickedAt(t2)
                .packedAt(status != OrderStatus.PROCESSING ? t3 : null)
                .dispatchedAt(status == OrderStatus.SHIPPED || status == OrderStatus.DELIVERED ? t4 : null)
                .notes("Standard warehouse fulfillment record")
                .build();
        fulfillmentRepository.save(fulfillment);

        Payment payment = Payment.builder()
                .order(order)
                .transactionRef("TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 5))
                .paymentMethod("SIMULATED_CARD")
                .amount(total)
                .paymentStatus("SUCCESS")
                .gatewayResponse("APPROVED")
                .build();
        paymentRepository.save(payment);
    }
}
