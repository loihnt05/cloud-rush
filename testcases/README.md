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

---

## Test Results Summary

### Overall Statistics
- **Total Test Suites**: 2
- **Total Tests**: 19 passing ✅
- **Test Duration**: ~1.3s
- **Pass Rate**: 100%

### Breakdown by Test Suite
| Test Suite | File | Tests | Status |
|-----------|------|-------|--------|
| TC-AUTH-001 | TC-AUTH-001.test.tsx | 6 | ✅ All Passing |
| TC-REV-PEN | TC-REV-PEN.test.tsx | 13 | ✅ All Passing |

### Latest Test Run Output
```
Test Files  2 passed (2)
     Tests  19 passed (19)
  Duration  1.32s
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
