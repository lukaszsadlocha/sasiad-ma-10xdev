# E2E Tests - Sąsiad-Ma

End-to-End tests for the Sąsiad-Ma application using Playwright.

## 📋 Test Structure

```
e2e/
├── helpers/               # Helper functions for tests
│   ├── auth.helper.ts    # Authentication helpers
│   ├── community.helper.ts # Community management helpers
│   ├── item.helper.ts    # Item management helpers
│   ├── booking.helper.ts # Booking/reservation helpers
│   └── message.helper.ts # Messaging helpers
├── fixtures/             # Test fixtures (images, data)
│   ├── test-image.jpg    # Test image for uploads (YOU NEED TO ADD THIS)
│   └── README.md
├── 01-auth.spec.ts       # Authentication tests (US-001)
├── 02-community.spec.ts  # Community tests (US-002, US-003, US-004)
├── 03-items.spec.ts      # Item management tests (US-005, US-006, US-007)
├── 04-bookings.spec.ts   # Booking tests (US-008, US-009, US-010)
├── 05-messages.spec.ts   # Messaging tests (US-011)
└── 06-full-flow.spec.ts  # Critical path test (complete flow)
```

## 🚀 Running Tests

### Prerequisites

1. **Backend must be running** on `http://localhost:5000`
2. **Database must be accessible** (Supabase PostgreSQL)
3. **Test image** must exist at `e2e/fixtures/test-image.jpg`

### Install Playwright Browsers

First time only:

```bash
npx playwright install
```

This downloads Chromium, Firefox, and WebKit browsers.

### Run All Tests

```bash
npm run test:e2e
```

### Run Tests in UI Mode (Recommended for Development)

```bash
npm run test:e2e:ui
```

This opens Playwright UI where you can:
- See tests running in real-time
- Debug failed tests
- Inspect locators
- View traces

### Run Tests in Headed Mode (See Browser)

```bash
npm run test:e2e:headed
```

### Run Specific Test File

```bash
npx playwright test e2e/01-auth.spec.ts
```

### Run Tests with Debug Mode

```bash
npx playwright test --debug
```

### Run Only the Critical Flow Test

```bash
npx playwright test e2e/06-full-flow.spec.ts
```

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## 🎯 Test Coverage

### Authentication (01-auth.spec.ts)
- ✅ User registration with validation
- ✅ User login
- ✅ Password requirements validation
- ✅ Terms acceptance requirement
- ✅ Logout functionality
- ✅ Protected routes

### Community Management (02-community.spec.ts)
- ✅ Create community (US-002)
- ✅ Generate invite link (US-003)
- ✅ Join via invite link (US-004)
- ✅ MVP constraint: 1 user = 1 community
- ✅ Dashboard community display

### Item Management (03-items.spec.ts)
- ✅ Add item without photo (US-005)
- ✅ Add item with photo (US-005)
- ✅ Browse items list (US-006)
- ✅ View item details (US-007)
- ✅ Mark item unavailable/available
- ✅ Item status badges
- ✅ Form validation

### Booking Management (04-bookings.spec.ts)
- ✅ Create booking request (US-008)
- ✅ Approve booking (US-009)
- ✅ Reject booking with reason (US-009)
- ✅ Confirm handover (US-010)
- ✅ Confirm return (US-010)
- ✅ Date validation
- ✅ 14-day duration limit
- ✅ Booking history

### Messaging (05-messages.spec.ts)
- ✅ Send message between users (US-011)
- ✅ Receive and reply to messages
- ✅ Start conversation from item
- ✅ Conversation list with last message
- ✅ Message length validation (1000 chars)
- ✅ Empty message prevention
- ✅ Chronological message history

### Full Flow (06-full-flow.spec.ts)
- ✅ **Complete critical path** (PRD Section 7.9):
  1. Register User A
  2. Create community
  3. Generate invite link
  4. Register User B via invite
  5. User A adds item
  6. User B books item
  7. User A approves booking
  8. Exchange messages
  9. User A confirms handover
  10. User A confirms return
- ✅ Booking rejection flow

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)

- **Base URL**: `http://localhost:5173` (frontend)
- **Timeout**: 15 seconds per action
- **Retries**: 2 on CI, 0 locally
- **Workers**: 1 (sequential execution for state-dependent tests)
- **Browsers**: Chromium (primary), Firefox and WebKit available
- **Artifacts**: Screenshots and videos on failure

### Environment Variables

Tests use the same `.env` file as the frontend:

```bash
VITE_API_BASE_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🐛 Debugging Tips

### 1. Use Playwright Inspector

```bash
npx playwright test --debug
```

Step through tests line by line.

### 2. Use Trace Viewer

Tests automatically record traces on failure:

```bash
npx playwright show-trace test-results/.../trace.zip
```

### 3. Slow Down Tests

Add to test:

```typescript
test.use({ launchOptions: { slowMo: 500 } });
```

### 4. Take Screenshots

```typescript
await page.screenshot({ path: 'debug.png' });
```

### 5. Console Logs

```typescript
page.on('console', msg => console.log(msg.text()));
```

## ⚠️ Important Notes

### Test Isolation

Each test should be independent:
- ✅ Tests create their own users
- ✅ Tests create their own communities
- ✅ Tests clean up after themselves (via unique names)
- ❌ Don't rely on data from previous tests

### Test Data

All test data uses timestamps for uniqueness:
- Emails: `user_1234567890@test.sasiadma.pl`
- Names: `Test User 1234567890`
- Communities: `Osiedle Test 1234567890`

This prevents conflicts between test runs.

### Backend State

Tests require a clean backend instance. If tests fail due to duplicate data:
1. Clear test data from database
2. Or use a separate test database

## 📈 Success Metrics (PRD Section 6.2)

These E2E tests validate the Micro-MVP success criteria:

- ✅ Users can register and login
- ✅ Communities can be created and joined
- ✅ Items can be added with photos
- ✅ Bookings can be created and managed
- ✅ Full booking cycle works (request → approve → handover → return)
- ✅ Messages can be exchanged
- ✅ Email notifications trigger (mocked in tests)

## 🎯 CI/CD Integration

Add to `.github/workflows/frontend-ci-cd.yml`:

```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run E2E Tests
  run: npm run test:e2e
  env:
    VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

- name: Upload Playwright Report
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30
```

## 📝 Writing New Tests

### Template

```typescript
import { test, expect } from '@playwright/test';
import { generateTestUser, registerUser } from './helpers/auth.helper';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const user = generateTestUser('test');

    // Act
    await registerUser(page, user);

    // Assert
    await expect(page.getByText(user.preferredName)).toBeVisible();
  });
});
```

### Best Practices

1. **Use semantic locators**: `getByRole`, `getByLabel`, `getByText`
2. **Avoid CSS selectors**: Use data-testid if needed
3. **Wait for elements**: Use `expect().toBeVisible()` instead of `waitForTimeout`
4. **Group related tests**: Use `test.describe` blocks
5. **Add timeouts**: Use `{ timeout: 5000 }` for slow operations
6. **Log progress**: Add console.log for debugging complex flows

## 🔗 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Generator](https://playwright.dev/docs/codegen) - `npx playwright codegen http://localhost:5173`
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)

## ✅ Checklist Before Running

- [ ] Backend is running on `http://localhost:5000`
- [ ] Frontend is running on `http://localhost:5173`
- [ ] Database is accessible (Supabase)
- [ ] Test image exists at `e2e/fixtures/test-image.jpg`
- [ ] Playwright browsers installed (`npx playwright install`)
- [ ] `.env` file configured

## 🎉 Success!

If all tests pass, your Micro-MVP is working correctly! 🚀

See `06-full-flow.spec.ts` for the complete critical path validation.
