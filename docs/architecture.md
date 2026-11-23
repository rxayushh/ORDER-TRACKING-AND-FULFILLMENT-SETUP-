# Application Architecture Specification

## Project: Order Tracking & Warehouse Fulfillment Setup
**Academic Target:** MCA 3rd-Semester Major Project (Extensible to 4th Semester)<br>
**Architecture Style:** Three-Tier Layered RESTful System with Microservice-Ready Domain Boundaries<br>

---

## 1. High-Level Architectural Diagram

```
+---------------------------------------------------------------------------------+
|                                 CLIENT TIER                                     |
|  React 18 (Vite SPA) + Tailwind CSS + Lucide Icons + Recharts Analytics         |
|  - Customer Portal (Catalog, Addresses, Cart, Checkout, Order Tracking)         |
|  - Warehouse Portal (Fulfillment Queue, Picking, Packing, Dispatch Audit)        |
|  - Admin Console (Revenue Trends, Order Registers, SKU & Facility Config)       |
+---------------------------------------+-----------------------------------------+
                                        |  RESTful JSON Communication over HTTP/S
                                        |  (Secured with JWT Bearer Tokens & CORS)
                                        v
+---------------------------------------------------------------------------------+
|                                APPLICATION TIER                                 |
|                       Spring Boot 3.3.5 (Java 21 LTS)                           |
|                                                                                 |
|  [Security Filter Chain] -> JwtAuthenticationFilter -> SecurityContextHolder   |
|                                                                                 |
|  [REST Controllers]                                                             |
|   AuthController | ProductController | CartController | OrderController         |
|   WarehouseController | TrackingController | DashboardController               |
|                                                                                 |
|  [Service Layer - Business Logic & Transaction Boundaries]                      |
|   AuthService | ProductService | CartService | OrderService                     |
|   InventoryService | FulfillmentService | TrackingService | DashboardService    |
|                                                                                 |
|  [Persistence Layer - Spring Data JPA & Hibernate]                              |
|   Optimistic Concurrency Control (@Version) | Safe Parameterized Queries        |
+---------------------------------------+-----------------------------------------+
                                        |  JDBC / Connection Pool (HikariCP)
                                        v
+---------------------------------------------------------------------------------+
|                                 DATABASE TIER                                   |
|                   MySQL 8.0+ Enterprise Database Engine                         |
|             (Dev Fallback: H2 In-Memory with MySQL Dialect Compatibility)       |
|                                                                                 |
|   Flyway Versioned Schema Migrations:                                           |
|   - V1__init_schema.sql (17 Normalized Relational Tables, Constraints, Indexes)  |
|   - V2__seed_data.sql (Seed Roles, Categories, Warehouses, Products, Stocks)    |
+---------------------------------------------------------------------------------+
```

---

## 2. Layer Responsibilities

### 2.1 Presentation Tier (Frontend)
- **Framework:** React 18 with Vite for lightning-fast HMR and optimized chunking.
- **Styling:** Tailwind CSS with modern SaaS aesthetics, smooth transitions, and subtle borders.
- **State & Context:**
  - `AuthContext`: Centralized JWT token lifecycle, role checking (`isAdmin()`, `isWarehouseManager()`, `isCustomer()`), and persistent auth session.
  - `CartContext`: Live cart badge counts, item additions, quantity recalculations, and checkout handoff.
- **Data Fetching:** Centralized Axios instance (`api.js`) with automatic JWT injection, error normalization, and 401 token expiry handling.

### 2.2 Controller Layer (REST APIs)
- Strictly receives and returns Data Transfer Objects (DTOs), never exposing raw JPA entity models.
- Validates inputs using `@Valid` with JSR-380 annotations (`@NotBlank`, `@Min`, `@DecimalMin`, `@Email`).
- Maps exceptions into uniform JSON envelope responses via `GlobalExceptionHandler` and `ApiResponse<T>`.

### 2.3 Service Layer (Business Logic)
- Encapsulates transactional business logic with `@Transactional` boundaries.
- Prevents conflicting stock deductions and order state races using JPA `@Version` optimistic locking and transactional row checks.
- Enforces strict state transitions across the order lifecycle (`PENDING -> CONFIRMED -> PROCESSING -> PACKED -> SHIPPED -> OUT_FOR_DELIVERY -> DELIVERED`).

### 2.4 Data Tier (Relational Storage)
- 17 fully normalized relational tables with referential integrity (`ON DELETE CASCADE` / `ON DELETE SET NULL`).
- Uses `BigDecimal(12,2)` for financial calculations to prevent floating-point precision loss.
- Version-controlled schema migrations powered by Flyway.
