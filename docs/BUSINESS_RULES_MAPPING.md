# Business Rules → Implementation Mapping

This document maps each provided business rule (BR) to the backend and frontend files that implement or enforce the rule, and briefly describes how the feature integrates with the rule.

Notes:
- Backend file paths reference the FastAPI app under `backend/`.
- Frontend file paths reference the SPA under `frontend/`.

---

## Authentication & Authorization (BR1 — BR5, BR14, BR15, BR49)

- BR1 — Sign In (display):
  - Frontend: `frontend/src/auth-config.ts` and app layout components (login button shown in header/sidebar). See `frontend/src/components/app-sidebar.tsx` for role-aware navigation.
  - Integration: UI shows Sign In controls; clicking opens Auth0 flow defined by `auth-config`.

- BR2 — Sign In (displaying multiple providers):
  - Frontend: `frontend/src/auth-config.ts` (Auth0 client configuration) and Auth0-hosted login page configured via the Auth0 dashboard.
  - Integration: Auth0 login page presents Google, GitHub and local options.

- BR3 — Sign In (validation, redirect, JWT):
  - Frontend: Auth UI initiates provider flows (Auth0). JWT received in frontend and stored in app client state.
  - Backend: `backend/app/dependencies.py` (JWT verification helpers) and `backend/app/core/auth.py` for Auth0 integration.
  - Integration: Username/password validated by Auth0; backend expects JWT for protected APIs.

- BR4 — Sign In (JWT verification):
  - Backend: `backend/app/dependencies.py` (functions like `verify_jwt`) and `backend/app/core/auth.py` (token validation and public keys/audience checks).
  - Integration: Requests include Authorization header; `Depends(verify_jwt)` enforces signature/expiry/audience, returning HTTP 401 when invalid.

- BR5 — Role verification (Admin / CSA / Traveler):
  - Backend: `backend/app/dependencies.py` (role-checking helpers such as `verify_admin`, `verify_agent`) used by routers.
  - Frontend: role gating in `frontend/src/components/app-sidebar.tsx` and route-level checks (client state checks user roles before showing admin links).
  - Integration: Backend enforces role-based access (403 on failure); frontend hides or disables UI as appropriate.

- BR14 / BR15 — Admin approves role / Auth0 sync:
  - Backend: `backend/app/routers/role_request_router.py`, `backend/app/repositories/role_request_repository.py`, and any role-request model in `backend/app/models/role_request.py`.
  - Integration: Admin actions update local DB and call Auth0 management APIs (via `backend/app/core/auth.py` or a role-request service). Successful Auth0 changes update local status and trigger notification emails.

- BR49 — User requests role (profile display):
  - Frontend: user profile components (profile page/component) display `email`, `username`, and `role` using client-side user claims from Auth0.
  - Backend: `backend/app/routers/passenger_router.py` or user/profile endpoints that return stored profile fields.

---

## Booking & Booking Management (BR6 — BR13, BR21, BR23 — BR31, BR41, BR43)

- BR6 — Create booking (CSA personal vs on-behalf):
  - Backend: `backend/app/routers/booking_router.py`, `backend/app/services/booking_service.py` (or booking repository) and `backend/app/models/booking.py`.
  - Frontend: CSA booking pages/components under `frontend/src/pages/*booking*` or booking components (CSA UI). The UI presents options for `personal` vs `on-behalf` booking flows.

- BR7 & BR8 — Manage booking services (search, price update):
  - Backend: `backend/app/repositories/booking_repository.py` (search/update booking), `backend/app/routers/booking_router.py` for endpoints to fetch and modify bookings and to attach services.
  - Frontend: booking edit UI, service selection components, and notification flows that call backend endpoints and display success/errors.

- BR9 — Process refund request (validation & gateway):
  - Backend: `backend/app/routers/refund_router.py`, `backend/app/services/refund_service.py` (refund logic), and `backend/app/repositories/payment_repository.py` (trigger gateway integration).
  - Frontend: refund request UI and status notifications (email triggered by backend).

- BR10 / BR11 — Refund notification & results:
  - Backend: refund flow sends emails and updates statuses; actual money flow handled by payment gateway integration in `payment_repository`/`payment` service.
  - Frontend: traveler receives status via email and can view refund status in booking/payment UI.

- BR12 / BR13 — View all bookings and edit/save:
  - Backend: `backend/app/routers/booking_router.py` & `backend/app/repositories/booking_repository.py` implement endpoints for listing, fetching details, updating bookings and sending notifications.
  - Frontend: `frontend/src/pages/my-bookings` / booking-table components (table UI, edit modal) that call backend endpoints and show booking details including flights, passengers, and payments.

- BR23 — Traveler books flight (displaying available flights):
  - Backend: `backend/app/routers/flight_router.py`, `backend/app/repositories/flight_repository.py` to return matching flights.
  - Frontend: booking/search UI shows matching flights (search results pages/components).

- BR24 / BR25 — Seat selection and services pricing:
  - Backend: `backend/app/routers/flight_seat_router.py`, `backend/app/models/seat` (status) and booking service to lock/assign seats.
  - Frontend: seat map component (seat selection), service add-ons UI; price recalculation performed client-side and confirmed by the backend during booking completion.

- BR41 / BR43 — Modify booking & pending booking review:
  - Backend: booking endpoints support update and status transitions; review flows handled by admin/CSA endpoints and business logic in `booking_service`.
  - Frontend: CSA dashboards and pending booking lists (components / pages); UI triggers update/cancel actions which call backend APIs.

---

## Payments & Refunds (BR26 — BR27, BR44 — BR48, BR46 — BR47)

- BR26 — Payment gateway methods (Visa, Mastercard, MoMo):
  - Backend: `backend/app/routers/payment_router.py` and `backend/app/repositories/payment_repository.py` integrate with external gateway adapters.
  - Frontend: payment components and redirect flows to gateway pages.

- BR27 — Payment validation & state transitions:
  - Backend: payment processing updates `payment_status` and `ticket_status` in `backend/app/models/payment.py` and `backend/app/models/booking.py`.
  - Frontend: checkout flow displays payment errors and success states.

- BR44 / BR45 / BR46 / BR47 — Payment verification, tracking and state transitions:
  - Backend: payment endpoints and state-transition checks live in `payment_repository` / payment service; invalid transitions return HTTP 400/422 and are protected by server-side validation logic.
  - Frontend: payment status dashboards and notifications consume payment endpoints for date-range queries and state updates.

- BR48 — View all payments (date/range):
  - Backend: `backend/app/routers/payment_router.py` provides endpoints to query by date or date range.
  - Frontend: admin/payment reports page uses `frontend/src/api/*payment*` to fetch and display results.

---

## Services, Car & Hotel (BR50 — BR61)

- BR50 / BR51 — Add service to booking and validation:
  - Backend: `backend/app/routers/service_router.py` and `backend/app/repositories/service_repository.py` validate booking ID and recalculate price.
  - Frontend: services dashboard and booking-add-service UI components that call service endpoints.

- BR52 / BR53 — Create new service and uniqueness check:
  - Backend: service creation endpoints check uniqueness in `service_repository` and return validation errors.
  - Frontend: `Services Dashboard` UI shows validation errors returned by APIs.

- BR54 — BR61 — Car/Hotel management and search:
  - Backend: `backend/app/routers/car_rental_router.py`, `backend/app/routers/hotel_router.py` and repositories manage availability and enforce constraints when linked to bookings.
  - Frontend: fleet/hotel management screens, search/filter components, and availability toggles.

---

## Revenue Forecasting (BR21 — BR22)

- BR21 — Access control to Revenue Forecasting (Admin only):
  - Backend: `backend/app/routers/revenue_router.py` and `backend/app/dependencies.py` (`verify_admin`) enforce admin-only access.
  - Frontend: `frontend/src/components/app-sidebar.tsx` shows `Revenue Forecasting` item only for admins; `frontend/src/components/revenue/prediction-panel.tsx` renders the reports.

- BR22 — Decision support (Apply Price Adjustment):
  - Frontend: `frontend/src/components/revenue/prediction-panel.tsx` includes UI actions (Apply Price Adjustment) that redirect to pricing configuration pages.
  - Backend: endpoint to accept adjustments would live in pricing/flight management routers (e.g. `flight_router` or a pricing-specific router) that apply the new configuration.

---

## Master Data (Airplane, Flight, Seat) (BR32 — BR40)

- BR32 — Master airplane:
  - Backend: `backend/app/routers/airplane_router.py`, `backend/app/models/airplane.py`, `backend/app/repositories/airplane_repository.py` implement create/view/update/delete and validations.
  - Frontend: airplane management screen components.

- BR36 — BR38 — Master flight:
  - Backend: `backend/app/routers/flight_router.py` and flight-related services enforce required fields and CRUD rules.
  - Frontend: flight management screen components implement single-action flows.

- BR39 / BR40 — Seat map & management:
  - Backend: `backend/app/routers/flight_seat_router.py`, seat models and repositories expose seat status and passenger lists; exporting PDFs handled in a utility endpoint.
  - Frontend: seat map components and admin seat management UI.

---

## Notes on enforcement & integration patterns

- Role checks are enforced server-side with dependency injection (`Depends(verify_admin)` / `Depends(verify_agent)`), and mirrored client-side by checking user claims stored in the SPA.
- All data-changing flows (booking updates, payment state transitions, role approvals) are performed by backend routers and repositories; frontend components call these endpoints and handle user interactions and confirmations.
- Notification flows (email) are triggered from backend services after state transitions (booking confirmation, refund issued, role approved) using the internal mail utility.

---

## Next actions

- I can extract exact code snippets for any BR and assemble unit tests or end-to-end test cases that assert the business rule behavior. Tell me which BRs you want tests for and I will add them.
