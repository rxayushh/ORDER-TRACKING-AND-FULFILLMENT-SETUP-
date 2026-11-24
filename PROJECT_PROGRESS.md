# Project Progress

**Project:** Order Tracking and Fulfillment Setup<br>
**Updated:** 24 November 2026 (Asia/Kolkata)<br>
**Status:** Vercel production frontend is live at https://order-tracking-fulfillment.vercel.app. Its `/api` rewrite currently reaches the local Spring Boot development backend on port 8082 (in-memory H2) through https://brisbane-devices-easter-pad.trycloudflare.com. The Vercel page visibly rendered; catalog API, customer registration/login, and protected customer endpoint passed live checks. Durable backend/database hosting, browser E2E, and Docker remain unverified.

## Environment inspected

| Tool | Detected |
|---|---|
| Windows | Windows 11, amd64 |
| Java | Temurin 21.0.13.1 LTS |
| Maven | 3.10.1 |
| Node.js / npm | 26.13.1 / 12.2.3 |
| Git | 2.56.1; local repository initialized on `main`, no remote or author identity configured |
| MySQL | Oracle MySQL Community Server 8.4.9 installed; migrated user-scoped database is running on 127.0.0.1:3306. |
| Docker | Not installed or not on PATH |
| VS Code | `code.cmd` detected |

## Completed in this workspace

- Reviewed the pre-existing React/Spring Boot project rather than recreating it.
- Spring Boot 3.3.5 / Java 21 backend, JPA entities/repositories/services/controllers, JWT/BCrypt security, DTO validation, Swagger config, MySQL Flyway migrations, and H2 development profile are present.
- React 18 / Vite frontend, Tailwind styles, role portals, API client, and pages are present.
- Added customer-only public registration (including rejecting warehouse-manager self-registration) and removed role selection from the registration UI.
- Added an explicit order lifecycle transition matrix; prevent skipping fulfillment steps.
- Checkout refreshes cart prices from the product catalog. Inventory reservation now requires explicit warehouse allocation, checks warehouse stock, and fails if global stock would become negative after a stock adjustment.
- Public tracking history masks operator/customer email identifiers; order-ID tracking checks ownership for customers.
- Development seed users/data now run only in the `dev` profile. Generic server errors no longer include internal exception details.
- Added warehouse editing and active/inactive management for admins; warehouse endpoints return DTOs.
- Added admin user search/role/activation management, self-lockout and last-admin safeguards, and disabled-account JWT revocation.
- Added one-time MySQL admin bootstrap through environment variables, order optimistic locking (Flyway V3), live health endpoint, and Vercel SPA rewrite.
- Replaced generated monthly sales chart values with six months of persisted order aggregates; added pessimistic row locks around stock reservation, release, and adjustment, with product-ID lock ordering across checkout.
- Corrected warehouse inventory dashboard totals and threshold alerts, and changed customer activity counts to query all of the customer's orders rather than only the latest five.
- Fixed cart item removal/checkout clearing so the inverse JPA collection uses orphan removal; a regression test covers both removal and clear operations.
- Removed duplicated YAML keys from the Compose configuration found during the acceptance re-audit.
- Initialized the local Git repository on `main`, staged the reviewed project files, and verified `.env`, Maven/Node build output, and dependencies are ignored. No remote, author identity, or push is configured.
- Updated Windows launch shortcuts to use the Maven Wrapper and the current Node/npm on `PATH`, removing hard-coded install locations; frontend dependencies install from the lockfile on first shortcut run.
- Added Windows PowerShell launchers that load the ignored root `.env`, validate MySQL profile secrets, run MySQL visibly from its existing user data directory, and wire the frontend API URL from the same environment file.
- Added README and user guide; corrected Compose frontend port and moved example secrets out of the Compose file.
- Added order-transition, role-escalation, disabled-token, user-management, and Flyway schema/repository regression tests.

## Verification status

- Frontend production build succeeded after the latest UI changes: `npm run build`; 5 output chunks, no size warning.
- Backend suite passed after the latest backend changes: `mvnw test`; 25 tests, 0 failures, 0 errors.
- Flyway V1–V3 apply and Hibernate schema validation pass in H2 MySQL compatibility mode; the seeded user search repository query passes against that migrated schema.
- Spring Boot `dev` profile starts on port 8080 and seeds H2 sample users/catalog.
- Local API flow verified: customer login/address/cart/checkout; warehouse PICK, PACK, DISPATCH, OUT_FOR_DELIVERY, DELIVER; public tracking reached DELIVERED with seven timeline steps and a masked actor label.
- Live API verification confirmed health `UP`, admin user directory returns 3 seeded accounts without password fields, customer checkout to delivery succeeds, and disabling an account makes its old JWT return HTTP 401. The manager account was restored afterward.
- Latest live API check on port 8081 returned six month buckets, with November showing the three persisted sample orders and their database-summed revenue. The separate process already occupying port 8080 was left untouched.
- Live customer checkout on port 8081 returned a confirmed order and tracking number, reduced product stock from 180 to 179, and left the cart empty. Warehouse and customer dashboard API metrics matched the seeded records.
- Integration coverage now verifies checkout reservation, cancellation stock restoration, and cart persistence/removal through the Spring application context.
- Real MySQL 8.4.9 startup validated and applied Flyway V1–V3. A complete live REST flow registered a customer, created an address, checked out, reduced stock by one, emptied the cart, ran all five fulfillment actions, and fetched a seven-step DELIVERED tracking timeline. The admin API also created/edited/archived a product, adjusted allocated stock from 4 to 7, and queried orders/users/inventory.
- After locating the existing MySQL, backend, and frontend processes, the MySQL app was restarted through the `.env` launcher. Its health is UP, CORS works for the frontend on 5174, and `GET /api/warehouses` is public as documented. `run-mysql.bat` offers an explicit visible startup for future user sessions.
- The separate service on port 8080 remains untouched. This workspace uses port 8081 in its ignored `.env`; current frontend is on 5174.
- Docker Compose remains unverified because Docker is unavailable. The Vercel project has no Git source connection; backend service and managed database are not hosted. The browser control tool did not grant Chrome access.
- Deployed the Vite frontend directly to the Vercel production project. The public site returned HTTP 200; `/api/products` returned eight products; customer registration, login, and a protected customer endpoint worked through its Vercel rewrite.
- A temporary Cloudflare Quick Tunnel currently links the Vercel API rewrite to the local Spring development backend on port 8082 (H2). It is ephemeral and has no uptime guarantee; when restarted, the hostname and `frontend/vercel.json` rewrite must be updated and redeployed.
- `frontend/preview-server.cjs` remains available for a local full-stack preview.

## Remaining work

- Expand end-to-end coverage beyond the successful representative H2 order journey.

- Run browser UI workflows for public/customer/admin/warehouse pages; Chrome control was not approved by the computer-use tool.
- Verify Docker Compose on a host with Docker; Docker is unavailable here.
- Add broader controller/concurrency integration tests; verify browser UI and Docker Compose when available.
- Configure a GitHub remote only when one is provided; do not push without explicit permission.
- Set up durable Java backend hosting and managed MySQL, then change the Vercel `/api` rewrite to the hosted backend and verify production checkout/tracking.
- Connect a Git repository to Vercel for repeatable deployments; the current production deployment was uploaded directly from source files.
