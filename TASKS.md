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
- [x] Publish a temporary public full-stack preview and verify its app, API, and health routes externally.

## Blocked by local environment

- [x] Install Oracle MySQL 8.4.9; Flyway V1–V3 applied and the full representative customer-to-delivery REST workflow passed against it.

- [ ] Run Docker Compose (Docker is not installed or not on PATH).
- [x] Deploy frontend to Vercel production and verify page, catalog API, customer registration/login, and protected endpoint.
- [ ] Configure durable hosting for Spring backend and managed MySQL; current Vercel `/api` rewrite uses a temporary tunnel to local services.
- [ ] Connect a Git source repository for repeatable Vercel builds; current production deployment was uploaded directly from source files.
- [x] Create the initial local Git commit; `.env` remains ignored.
- [ ] Add the chosen source repository remote and push after its URL/access are available.

Production frontend: https://order-tracking-fulfillment.vercel.app. Its `/api` route currently proxies through temporary tunnel https://brisbane-devices-easter-pad.trycloudflare.com to the local development backend on port 8082 (in-memory H2). The local backend and tunnel must stay running for remote API requests to work. If the tunnel hostname changes, update `frontend/vercel.json` and redeploy. For a durable MySQL local setup, start MySQL with `run-mysql.bat`, then configure `.env` for the MySQL profile and launch using `run-backend.bat` and `run-frontend.bat`.

## Future improvements

- [ ] Add broader repository/controller integration tests and browser-level end-to-end coverage.
- [ ] Add real payment and carrier integrations behind provider interfaces.
- [ ] Add automated customer notification, proof-of-delivery, and warehouse allocation optimization.
