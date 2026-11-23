# User Guide

## Start the application

Follow the Windows quick start in the root [README](../README.md). The development profile uses a fresh H2 database on each backend restart and seeds three demonstration accounts and sample catalog/orders.

## Customer journey

1. Register from the public page or sign in with the seeded customer account.
2. Browse products, add items to the cart, and review quantities.
3. Add or select a delivery address at checkout.
4. Select one of the clearly labelled simulated payment methods and place the order. No real payment is taken.
5. View order history and details from the customer dashboard. Use the order tracking number on the public tracking page for a limited shipment view.
6. Cancel while the order is pending or confirmed; the backend restores stock and records the change.

## Warehouse journey

Sign in with the seeded warehouse account. Review the fulfillment queue, then use PICK, PACK, DISPATCH, OUT FOR DELIVERY, and DELIVER in order. Inventory adjustments are audited with the operator and reason.

## Administrator journey

Sign in with the seeded admin account to review dashboards, products, categories, orders, customers, and warehouses. Public signup cannot grant admin or warehouse privileges.

## Reset development data

Stop the backend process and restart it. H2 is in-memory, so sample data will be recreated. MySQL mode persists data and is not reset by restarting the application.

## Important limitations

- Payments, carrier assignment, and delivery status are simulated.
- Local H2 is not durable. Use MySQL for persistence between restarts.
- The development account passwords are public examples and must never be used outside local development.
