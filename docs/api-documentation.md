# RESTful API Endpoint Documentation

## Base URL: `http://localhost:8080/api`
**Interactive Swagger UI:** `http://localhost:8080/swagger-ui/index.html`<br>
**OpenAPI Spec:** `http://localhost:8080/v3/api-docs`<br>

---

## 1. Authentication Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a customer account (staff roles are provisioned out of band) |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT bearer token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile and roles |

---

## 2. Product & Catalog Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | Paginated product search with category & status filter |
| `GET` | `/api/products/{id}` | Public | Get single product specification |
| `GET` | `/api/products/low-stock` | Admin, Warehouse | Get products triggered below safety stock threshold |
| `POST` | `/api/admin/products` | Admin | Create new catalog SKU with initial stock allocation |
| `PUT` | `/api/admin/products/{id}` | Admin | Update pricing, descriptions, and stock thresholds |
| `DELETE` | `/api/admin/products/{id}` | Admin | Soft-archive product (preserves historical order integrity) |
| `GET` | `/api/categories` | Public | List all product categories |
| `POST` | `/api/admin/categories` | Admin | Create product category |
| `PUT` | `/api/admin/categories/{id}` | Admin | Update a product category |
| `DELETE` | `/api/admin/categories/{id}` | Admin | Delete a category that has no products |

---

## 3. Shopping Cart Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/cart` | Customer | Fetch current shopping cart with calculated totals |
| `POST` | `/api/cart/items` | Customer | Add product to cart with quantity validation |
| `PUT` | `/api/cart/items/{itemId}` | Customer | Update quantity of cart line item |
| `DELETE` | `/api/cart/items/{itemId}` | Customer | Remove line item from cart |
| `DELETE` | `/api/cart` | Customer | Clear all items from cart |

---

## 4. Order Management & Checkout Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/orders/checkout` | Customer | Convert cart into confirmed order, reserve stock & init tracking |
| `GET` | `/api/customer/orders` | Customer | Get customer's past order history |
| `GET` | `/api/orders/{id}` | Customer / Admin | Get full order breakdown, items, address, and status logs |
| `POST` | `/api/orders/{id}/cancel` | Customer / Admin | Cancel order and automatically release reserved stock |
| `GET` | `/api/admin/orders` | Admin, Warehouse | Search and filter all orders across system |
| `PUT` | `/api/orders/{id}/status` | Admin, Warehouse | Update order status with timestamped audit remarks |

---

## 5. Tracking & Shipment Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/tracking/{trackingNumber}` | **Public** | Public tracking lookup: timeline milestones, timestamps, logs |
| `GET` | `/api/orders/{orderId}/tracking` | Authenticated | Detailed shipment progression timeline for an order |

---

## 6. Warehouse & Fulfillment Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/warehouse/fulfillment` | Warehouse, Admin | Get fulfillment order queue |
| `POST` | `/api/warehouse/orders/{orderId}/action` | Warehouse, Admin | Execute PICK, PACK, DISPATCH, OUT_FOR_DELIVERY, or DELIVER |
| `GET` | `/api/warehouse/inventory` | Warehouse, Admin | Get inventory stock allocations across warehouses |
| `POST` | `/api/warehouse/inventory/adjust` | Warehouse, Admin | Manually adjust warehouse stock (Stock-In / Stock-Out) |
| `GET` | `/api/warehouses` | Public | List all active warehouse facilities |
| `GET` | `/api/admin/warehouses` | Admin | List all warehouses, including inactive facilities |
| `POST` | `/api/admin/warehouses` | Admin | Add new regional warehouse facility |
| `PUT` | `/api/admin/warehouses/{id}` | Admin | Edit warehouse contact, address, and active state |

---

## 7. Dashboards & Analytics Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/admin` | Admin | Summary KPIs, revenue, sales bar chart, status pie chart |
| `GET` | `/api/dashboard/warehouse` | Warehouse, Admin | Awaiting queue metrics, packed, dispatched, critical stock |
| `GET` | `/api/dashboard/customer` | Customer | Order count, active shipments, delivered count |

---

## 8. Customer Profile and Directory

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/customer/profile` | Authenticated | Current user's name, phone, email, and roles |
| `PUT` | `/api/customer/profile` | Authenticated | Update full name and phone number |
| `GET` | `/api/customer/addresses` | Customer, Admin | Saved delivery addresses |
| `POST` | `/api/customer/addresses` | Customer, Admin | Add a delivery address |
| `PUT` | `/api/customer/addresses/{id}/default` | Customer, Admin | Mark one address as the default |
| `DELETE` | `/api/customer/addresses/{id}` | Customer, Admin | Remove an address owned by the current user |
| `GET` | `/api/admin/customers` | Admin | Paged customer directory. Returns a summary DTO, never the password hash |
| `GET` | `/api/admin/users` | Admin | Search and page through user accounts and role assignments |
| `PUT` | `/api/admin/users/{id}` | Admin | Update account roles or disable/enable a user (last admin is protected) |

Public registration creates customer accounts only. Staff roles are assigned by an administrator. For an initial MySQL installation, set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` (12+ characters) for one startup, then remove them. The seeded development admin login is documented in the README.
