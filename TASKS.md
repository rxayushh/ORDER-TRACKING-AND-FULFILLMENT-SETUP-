# Tasks

## Done

- [x] Inspect workspace, installed Java/Maven/Node/npm/Git, and available MySQL/Docker/VS Code commands.
- [x] Preserve and inspect the existing backend/frontend scaffold.
- [x] Document layered architecture, schema, and REST API.
- [x] Harden public role assignment, error responses, tracking ownership/privacy, checkout pricing, stock allocation, and lifecycle transitions.
- [x] Add warehouse edit/activation workflow and customer guide.
- [x] Add root README, local run instructions, environment examples, and deployment preparation.
- [x] Re-run `npm run build` after admin user-management UI (succeeded, no bundle-size warning).
- [x] Start both applications and manually exercise an H2-backed customer-to-delivery order journey.
- [x] Verify live health, admin directory, password omission, and disabled JWT response; restore the sample warehouse account.
- [x] Validate Flyway V1–V3 and JPA mappings in H2 MySQL compatibility mode.
- [x] Replace synthetic admin sales analytics with persisted month aggregates and verify the response against seeded H2 orders.
- [x] Serialize inventory reserve, release, and adjustment operations using product and warehouse-inventory row locks.
- [x] Remove duplicate Docker Compose mapping keys found during final configuration review.
- [x] Re-run backend tests after the changes (25 passed, 0 failed, 0 errors) and frontend production build (succeeded).
- [x] Make Windows launch shortcuts use portable Maven Wrapper and Node/npm commands.
- [x] Correct customer/warehouse dashboard aggregation and inventory alert thresholds.
- [x] Fix cart removal/checkout clearing and verify stock deduction plus empty cart over live REST APIs.
- [x] Add an integration test for checkout stock reservation and cancellation stock restoration.
- [x] Verify a complete customer-to-delivered order REST flow against MySQL 8.4.9, including tracking timeline, stock decrement, and cart clearing.
- [x] Add Windows launch scripts that import `.env` for backend/frontend and a visible local MySQL startup shortcut.
- [x] Save a functionality-based completion assessment in `PROJECT_STATUS.md`.
- [x] Verify public warehouse access and frontend CORS against the live MySQL-backed API.
- [x] Verify admin product creation, editing, inventory adjustment, archiving, orders, and user directory on MySQL.

## Blocked by local environment

- [x] Install Oracle MySQL 8.4.9; Flyway V1–V3 applied and the full representative customer-to-delivery REST workflow passed against it.

- [ ] Run Docker Compose (Docker is not installed or not on PATH).
- [ ] Run hosted deployment after Vercel team approval and repository/source access are available.
- [ ] Configure Git author identity, create the initial commit, and add a GitHub remote (no remote supplied; do not push without explicit permission).

MySQL (3306), the MySQL-backed API (8081), and the frontend (5174) are currently running. The root `.env` is ignored by Git and targets port 8081 because another service occupies port 8080. Start a future MySQL session with `run-mysql.bat`, then launch the app using `run-backend.bat` and `run-frontend.bat`.

## Future improvements

- [ ] Add broader repository/controller integration tests and browser-level end-to-end coverage.
- [ ] Add real payment and carrier integrations behind provider interfaces.
- [ ] Add automated customer notification, proof-of-delivery, and warehouse allocation optimization.
