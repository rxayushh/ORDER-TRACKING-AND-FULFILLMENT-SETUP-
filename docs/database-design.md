# Database Design & Entity Relationship Specification

## Database Engine: MySQL 8.0+ / H2 MySQL Dialect
**Migration Tool:** Flyway Database Migrations (`V1__init_schema.sql` through `V3__add_order_version.sql`)<br>

---

## 1. Relational Schema Summary (17 Core Tables)

| # | Table Name | Description | Key Relationships |
|---|---|---|---|
| 1 | `roles` | System authorization roles (Admin, Customer, Warehouse Manager) | Referenced by `user_roles` |
| 2 | `users` | User credentials, contact details, BCrypt hashed passwords | Referenced by `user_roles`, `orders`, `customer_addresses`, `carts` |
| 3 | `user_roles` | Join table for Many-to-Many user-role mapping | Composite PK `(user_id, role_id)` |
| 4 | `customer_addresses` | Multiple shipping addresses per customer | FK `user_id` -> `users(id)` |
| 5 | `categories` | Product hierarchy and groupings | Referenced by `products` |
| 6 | `warehouses` | Distribution centers, locations, and manager contacts | Referenced by `warehouse_inventory`, `orders`, `fulfillment_records` |
| 7 | `products` | Master catalog, SKU, pricing, low-stock threshold, `@Version` lock | FK `category_id` -> `categories(id)` |
| 8 | `warehouse_inventory` | Physical stock allocations per warehouse facility | Unique `(warehouse_id, product_id)` |
| 9 | `inventory_transactions` | Audit ledger for stock additions, reservations, releases, adjustments | FK `product_id`, FK `warehouse_id` |
| 10 | `carts` | Active customer shopping cart | Unique FK `user_id` -> `users(id)` |
| 11 | `cart_items` | Individual product lines in cart with quantity | Unique `(cart_id, product_id)` |
| 12 | `orders` | Master orders table, totals, tax, shipping fee, status and optimistic-lock version | FK `user_id`, FK `shipping_address_id`, FK `warehouse_id` |
| 13 | `order_items` | Snapshot of purchased product SKUs, prices, quantities | FK `order_id` -> `orders(id)`, FK `product_id` |
| 14 | `order_status_history` | Complete historical audit trail of status updates with actors & notes | FK `order_id` -> `orders(id)` |
| 15 | `shipments` | Carrier tracking details, tracking number (`TRK-...`), delivery ETA | Unique FK `order_id` -> `orders(id)` |
| 16 | `fulfillment_records` | Warehouse pick, pack, and dispatch tracking timestamps | Unique FK `order_id` -> `orders(id)`, FK `warehouse_id` |
| 17 | `payments` | Simulated payment transaction receipts and gateway responses | FK `order_id` -> `orders(id)` |

---

## 2. Order Lifecycle State Transitions

```
[ ORDER_PLACED ]
       |
       v
[ ORDER_CONFIRMED ] (Stock reserved in warehouse)
       |
       v
[ ORDER_PROCESSING ] (Items picked from racks)
       |
       v
[ ORDER_PACKED ] (Parceled & shipping label generated)
       |
       v
[ SHIPPED / IN_TRANSIT ] (Handed over to carrier)
       |
       v
[ OUT_FOR_DELIVERY ] (Arrived at local hub)
       |
       v
[ DELIVERED ] (Completed doorstep delivery)
       |
  (Optional)
       v
[ RETURN_REQUESTED ] -> [ RETURNED ]

* Cancellation: Allowed only in PENDING or CONFIRMED state. Automatically restores warehouse stock.

`V3__add_order_version.sql` adds the order version column so simultaneous state updates cannot overwrite each other silently.
```
