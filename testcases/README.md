# Test Cases Documentation

This folder contains documentation for test cases in the CloudRush application.

## Test Files Location

All test files are located in: **`frontend/src/test/`**

### Available Test Suites

1. **TC-AUTH-001**: Verify "Sign In" button visibility on Landing Page
   - File: [frontend/src/test/TC-AUTH-001.test.tsx](../frontend/src/test/TC-AUTH-001.test.tsx)
   - Tests: 6 passing ✅

2. **TC-REV-PEN**: Review Pending Bookings (CSA Features)
   - File: [frontend/src/test/TC-REV-PEN.test.tsx](../frontend/src/test/TC-REV-PEN.test.tsx)
   - Tests: 13 passing ✅

3. **TC-VER-PAY**: Verify Payment Status (CSA Features)
   - File: [frontend/src/test/TC-VER-PAY.test.tsx](../frontend/src/test/TC-VER-PAY.test.tsx)
   - Tests: 20 passing ✅

4. **TC-TRK-UPD-PAY**: Track and Update Payment Status (CSA Features)
   - File: [frontend/src/test/TC-TRK-UPD-PAY.test.tsx](../frontend/src/test/TC-TRK-UPD-PAY.test.tsx)
   - Tests: 19 passing ✅

---

## How to Run Tests

### Run All Tests
```bash
cd frontend
pnpm test
```

### Run Specific Test Suite
```bash
# Run authentication tests
pnpm test TC-AUTH-001

# Run CSA review pending tests
pnpm test TC-REV-PEN

# Run payment verification tests
pnpm test TC-VER-PAY

# Run track and update payment tests
pnpm test TC-TRK-UPD-PAY

# Run tests from home page
pnpm test home
```

### Run Tests with UI (Interactive)
```bash
pnpm test:ui
```

### Run Tests Once (CI Mode)
```bash
pnpm test:run
```

---

## TC-AUTH-001: Verify "Sign In" button visibility on Landing Page

### Test Description
Verifies that the "Sign In" button is clearly visible at the top right corner of the Landing Page when the user is not logged in.

### Test Type
**Unit Test** (React Component Testing with Vitest + React Testing Library)

### Prerequisites
1. Device is connected to the internet
2. User is on the Landing Page (not logged in)

### Test Steps
**Step 1:** Open the application URL (Landing Page)
- **Expected:** The Landing Page loads successfully

**Step 2:** Observe the top right corner of the header
- **Expected:** The "Sign In" button is displayed

### Expected Result
The "Sign In" button is clearly visible at the top right corner of the page.

### Test Coverage
The unit test suite includes:

1. **Landing Page Load Test**: Verifies the page loads with CloudRush branding
2. **Sign In Button Visibility**: Checks button is present, visible, and enabled
3. **Complete Integration Test**: Full TC-AUTH-001 verification including:
   - Landing page loads successfully
   - Sign In button is in the DOM
   - Button is visible and enabled
   - Button is within navigation element
   - Button has correct text content
4. **Additional Tests**:
   - Verifies "Get Started" button exists alongside Sign In
   - Confirms CloudRush branding in navigation
   - Validates button hierarchy for unauthenticated users

### Technology Stack
- **Framework**: Vitest
- **Testing Library**: React Testing Library (@testing-library/react)
- **Assertions**: @testing-library/jest-dom
- **Environment**: jsdom (simulated browser environment)
- **Language**: TypeScript

### Benefits of Unit Testing
- ✅ **Faster execution** (no browser startup overhead)
- ✅ **More reliable** (no flaky network/timing issues)
- ✅ **Better debugging** (component-level isolation)
- ✅ **Runs in CI/CD** (no browser dependencies)
- ✅ **Test React state/props** directly
- ✅ **Mock Auth0** for consistent testing

### Notes
- Auth0 is mocked to simulate unauthenticated state
- Tests run in isolated jsdom environment
- No actual browser or Auth0 connection required
- Tests can run in parallel for speed

---

## TC-REV-PEN: Review Pending Bookings (CSA Features)

### Test Description
Verifies CSA (Customer Service Agent) functionality for reviewing and managing pending bookings with various statuses.

### Test Type
**Unit/Integration Test** (React Component Testing with Vitest + React Testing Library)

### Test Cases Included

#### TC-REV-PEN-001: Verify Contact Customer for Incomplete Booking
**Prerequisites:**
1. CSA logged in
2. Filter bookings by status "Pending"
3. Select a booking with incomplete status (missing passenger info or payment)

**Test Steps:**
- **Step 1**: Review booking details and identify missing info
- **Step 2**: Contact customer (simulated) to request details/payment
- **Step 3**: Update booking status to "Confirmed" after customer provides details

**Expected Result:** CSA can identify incomplete bookings, contact customers, and confirm bookings after completion.

**Tests**: 4 (3 steps + 1 complete flow)

---

#### TC-REV-PEN-002: Verify Cancel Incomplete Booking (No Contact)
**Prerequisites:**
1. CSA logged in
2. Select a booking with incomplete status

**Test Steps:**
- **Step 1**: CSA decides NOT to contact customer
- **Step 2**: Click "Cancel Booking" and system processes cancellation

**Expected Result:** System allows immediate cancellation, status updates to "cancelled", and seats are released.

**Tests**: 3 (2 steps + 1 complete flow)

---

#### TC-REV-PEN-003: Verify Confirm Pending Booking
**Prerequisites:**
1. CSA logged in
2. Booking is pending but complete (paid/filled)

**Test Steps:**
- **Step 1**: Click "Confirm Booking" to initiate confirmation

**Expected Result:** System updates booking status to "confirmed".

**Tests**: 2 (1 step + 1 complete flow)

---

### Additional Tests
4 error handling and edge case tests:
- Display error when booking fetch fails
- Don't show confirm button for already confirmed bookings
- Handle API error when confirming booking
- Handle API error when cancelling booking

### Test Coverage Summary
- **TC-REV-PEN-001**: 4 tests ✅
- **TC-REV-PEN-002**: 3 tests ✅
- **TC-REV-PEN-003**: 2 tests ✅
- **Additional**: 4 tests ✅

**Total**: 13 test scenarios, all passing

### Technology Stack
- **Framework**: Vitest
- **Testing Library**: React Testing Library
- **Mocking**: Vitest mocks for axios API calls
- **Environment**: jsdom

### Mock Data Structure
Tests use realistic booking data structures matching backend models:
- Incomplete bookings (no passengers/payments)
- Complete pending bookings (ready to confirm)
- Confirmed bookings
- Cancelled bookings

### Benefits
- ✅ Tests CSA workflows without backend dependency
- ✅ Validates booking status transitions
- ✅ Tests error handling and edge cases
- ✅ Fast execution (no API calls)
- ✅ Isolated component testing

### Business Rules Validated
- **BR43.1**: CSA can contact customer for incomplete bookings
- **BR43.2**: CSA can cancel incomplete bookings without contact
- **BR43.3**: CSA can confirm complete pending bookings
C-VER-PAY: Verify Payment Status (CSA Features)

### Test Description
Verifies CSA (Customer Service Agent) functionality for verifying and managing payment statuses with different payment states.

### Test Type
**Unit/Integration Test** (React Component Testing with Vitest + React Testing Library)

### Test Cases Included

#### TC-VER-PAY-001: Verify Action for "Verified" Payment
**Prerequisites:**
1. CSA viewing a booking
2. payment_status is "verified"

**Test Steps:**
- **Step 1**: Check system status shows "Verified"
- **Step 2**: Verify seat status is blocked/booked

**Expected Result:** System automatically marks booking_flight_status as "paid" and blocks seat selection.

**Tests**: 3 (2 steps + 1 complete flow)

---

#### TC-VER-PAY-002: Verify Action for "Pending" Payment - Already Paid
**Prerequisites:**
1. CSA viewing a booking
2. payment_status is "pending"

**Test Steps:**
- **Step 1**: Check with traveler (simulated) - traveler confirms payment made
- **Step 2**: Re-check/refresh payment_status updates to verified

**Expected Result:** System marks booking_flight_status as "paid" and blocks seat selection.

**Tests**: 3 (2 steps + 1 complete flow)

---

#### TC-VER-PAY-003: Verify Action for "Pending" Payment - Not Paid
**Prerequisites:**
1. CSA viewing a booking
2. payment_status is "pending"

**Test Steps:**
- **Step 1**: Check with traveler - traveler has not paid
- **Step 2**: Click "Send Reminder" and email is sent

**Expected Result:** System sends payment reminder email to traveler.

**Tests**: 3 (2 steps + 1 complete flow)

---

#### TC-VER-PAY-004: Verify Action for "Failed" Payment - Retry
**Prerequisites:**
1. CSA viewing a booking
2. payment_status is "failed"

**Test Steps:**
- **Step 1**: Check with traveler - traveler wants to retry
- **Step 2**: Initiate new payment and new transaction ID generated

**Expected Result:** System creates a new payment attempt.

**Tests**: 3 (2 steps + 1 complete flow)

---

#### TC-VER-PAY-005: Verify Action for "Failed" Payment - Cancel
**Prerequisites:**
1. CSA viewing a booking
2. payment_status is "failed"

**Test Steps:**
- **Step 1**: Check with traveler - traveler does not retry
- **Step 2**: Click "Cancel Payment" and seat becomes available

**Expected Result:** System cancels the payment record and releases the seat.

**Tests**: 3 (2 steps + 1 complete flow)

---

### Additional Tests
5 error handling and edge case tests:
- Display error when booking/seat fetch fails
- Handle API error when verifying payment
- Handle API error when sending reminder email
- Handle API error when retrying payment
- Handle booking without seat assignment

### Test Coverage Summary
- **TC-VER-PAY-001**: 3 tests ✅
- **TC-VER-PAY-002**: 3 tests ✅
- **TC-VER-PAY-003**: 3 tests ✅
- **TC-VER-PAY-004**: 3 tests ✅
- **TC-VER-PAY-005**: 3 tests ✅
- **Additional**: 5 tests ✅

**Total**: 20 test scenarios, all passing

### Technology Stack
- **Framework**: Vitest
- **Testing Library**: React Testing Library
- **Mocking**: Vitest mocks for axios API calls
- **Environment**: jsdom

### Mock Data Structure
Tests use realistic payment and booking data structures:
- Verified payment bookings (paid, seat booked)
- Pending payment bookings (awaiting confirmation)
- Failed payment bookings (retry or cancel options)
- Seat status (available, reserved, booked)

### Benefits
- ✅ Tests payment workflows without backend/payment gateway dependency
- ✅ Validates payment status transitions and seat management
- ✅ Tests error handling for payment operations
- ✅ Fast execution (no actual API/payment calls)
- ✅ Isolated component testing with mocked data

### Business Rules Validated
- **BR44.4**: Verified payment automatically marks booking as "paid" and blocks seat
- **BR44.5**: Pending payment can be updated to verified when traveler confirms
- **BR44.6**: Pending payment triggers reminder email if not paid
- **BR44.7**: Failed payment allows retry with new transaction ID
- **BR44.8**: Failed payment can be cancelled, releasing the seat

---

## TC-TRK-UPD-PAY: CSA Track and Update Payment Status

### Test Description
Tests the CSA workflow for tracking payment status with payment gateway integration, updating payment status with validation rules, and filtering/viewing payments by date or date range.

### Prerequisites
- CSA is logged in with appropriate permissions
- Payment gateway API endpoints are available  
- Payments with different statuses exist in the system
- Access to Payment Dashboard

### Test Cases

#### TC-TRK-PAY-001: Verify Track Completed Payment
**Description:** CSA tracks a completed payment and marks the booking as verified.

- **Step 1**: View Payment Details - Status is visible

**Expected Result:** CSA successfully views payment details and marks booking_flight_status as "verified".

**Tests**: 2 (1 step + 1 complete flow)

**Business Rule**: BR45.9

#### TC-TRK-PAY-002: Verify Track Pending Payment
**Description:** CSA tracks a pending payment and checks gateway status.

- **Step 1**: Check Gateway /payment-gateway - Gateway status retrieved

**Expected Result:** System retrieves gateway status and waits for final status from payment gateway.

**Tests**: 2 (1 step + 1 complete flow)

**Business Rule**: BR45.10

#### TC-UPD-PAY-001: Verify Invalid Status Transition (Refunded -> Pending)
**Description:** System prevents invalid payment status transitions.

- **Step 1**: Attempt to change status to "Pending" - Input selected

**Expected Result:** System displays error "Invalid transition" and blocks the update.

**Tests**: 2 (1 step + 1 complete flow)

**Business Rule**: BR46.11

#### TC-UPD-PAY-002: Verify Update to "Completed"
**Description:** CSA updates payment status to completed with automatic booking verification.

- **Step 1**: Confirm status change - Update processed

**Expected Result:** booking_flight_status becomes "verified"; Receipt email sent; Success notification sent.

**Tests**: 2 (1 step + 1 complete flow)

**Business Rule**: BR47.12

#### TC-UPD-PAY-003: Verify Update to "Refunded"
**Description:** CSA updates payment status to refunded, triggering refund process.

- **Step 1**: Confirm status change - Update processed

**Expected Result:** System triggers "Process Refund" flow.

**Tests**: 2 (1 step + 1 complete flow)

**Business Rule**: BR47.13

#### TC-VIEW-PAY-001: Verify Filter Payments by Date
**Description:** CSA filters payments on dashboard by specific date.

- **Step 1**: Select a specific date - Date filter applied

**Expected Result:** System retrieves and displays all payments made on that specific date.

**Tests**: 2 (1 step + 1 complete flow)

**Business Rule**: BR48.14

#### TC-VIEW-PAY-002: Verify Filter Payments by Date Range
**Description:** CSA filters payments on dashboard by date range.

- **Step 1**: Select a date range (Start - End) - Range filter applied

**Expected Result:** System retrieves and displays all payments within that period.

**Tests**: 2 (1 step + 1 complete flow)

**Business Rule**: BR48.15

---

### Additional Tests
5 error handling and edge case tests:
- Display error when payment fetch fails
- Handle gateway API error for pending payment
- Display no payments message when filter returns empty
- Handle API error when filtering payments
- Block other invalid transitions (completed -> pending)

### Test Coverage Summary
- **TC-TRK-PAY-001**: 2 tests ✅
- **TC-TRK-PAY-002**: 2 tests ✅
- **TC-UPD-PAY-001**: 2 tests ✅
- **TC-UPD-PAY-002**: 2 tests ✅
- **TC-UPD-PAY-003**: 2 tests ✅
- **TC-VIEW-PAY-001**: 2 tests ✅
- **TC-VIEW-PAY-002**: 2 tests ✅
- **Additional**: 5 tests ✅

**Total**: 19 test scenarios, all passing

### Technology Stack
- **Framework**: Vitest
- **Testing Library**: React Testing Library
- **Mocking**: Vitest mocks for axios API calls and payment gateway
- **Environment**: jsdom

### Mock Data Structure
Tests use realistic payment and gateway data structures:
- Completed payment with gateway response
- Pending payment awaiting gateway status
- Refunded payment with refund date
- Payment lists for date filtering

### Benefits
- ✅ Tests payment tracking without backend/gateway dependency
- ✅ Validates payment status transition rules
- ✅ Tests payment filtering and dashboard features
- ✅ Fast execution (no actual API/gateway calls)
- ✅ Isolated component testing with mocked data

### Business Rules Validated
- **BR45.9**: Completed payment allows marking booking as verified
- **BR45.10**: Pending payment checks gateway for status updates
- **BR46.11**: Invalid status transitions are blocked with error messages
- **BR47.12**: Update to completed triggers booking verification and receipt email
- **BR47.13**: Update to refunded triggers refund process flow
- **BR48.14**: Filter payments by specific date on dashboard
- **BR48.15**: Filter payments by date range on dashboard

---

## Test Results Summary

### Overall Statistics
- **Total Test Suites**: 4
- **Total Tests**: 58 passing ✅
- **Test Duration**: ~1.5s
- **Pass Rate**: 100%

### Breakdown by Test Suite
| Test Suite | File | Tests | Status |
|-----------|------|-------|--------|
| TC-AUTH-001 | TC-AUTH-001.test.tsx | 6 | ✅ All Passing |
| TC-REV-PEN | TC-REV-PEN.test.tsx | 13 | ✅ All Passing |
| TC-VER-PAY | TC-VER-PAY.test.tsx | 20 | ✅ All Passing |
| TC-TRK-UPD-PAY | TC-TRK-UPD-PAY.test.tsx | 19 | ✅ All Passing |

### Latest Test Run Output
```
Test Files  4 passed (4)
     Tests  58 passed (58)
  Duration  1.46s
```

---

## Development Workflow

### Adding New Test Cases

1. Create a new test file in `frontend/src/test/`
   ```bash
   touch frontend/src/test/TC-YOUR-ID.test.tsx
   ```

2. Follow the existing test pattern:
   ```typescript
   import { describe, it, expect, vi } from 'vitest';
   import { render, screen } from '@testing-library/react';
   
   describe('TC-YOUR-ID: Test Description', () => {
     it('should test something', () => {
       // Your test code
     });
   });
   ```

3. Run your tests:
   ```bash
   cd frontend
   pnpm test TC-YOUR-ID
   ```

### Best Practices
- ✅ Use descriptive test names
- ✅ Include test case ID in describe block
- ✅ Mock external dependencies (API, Auth0, etc.)
- ✅ Test one thing per test case
- ✅ Use arrange-act-assert pattern
- ✅ Add console.log for step verification
- ✅ Include JSDoc comments with prerequisites

---

## CI/CD Integration

Tests can be run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: |
    cd frontend
    pnpm install
    pnpm test:run
```

All tests run in headless mode with no browser dependencies, making them perfect for automated pipelines.
