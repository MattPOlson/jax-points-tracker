# Competition Scoring System - Playwright Test Suite

This comprehensive test suite validates the complete competition scoring workflow using Playwright automated testing. Each test corresponds 1-for-1 with the manual test script sections, ensuring complete coverage of all functionality.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Application running at `http://localhost:5173`
- Test database with proper user accounts

### Installation
```bash
# Install Playwright dependencies
npm install

# Install browser engines
npm run test:install
```

### Running Tests
```bash
# Run all tests headlessly
npm test

# Run tests with browser UI visible
npm run test:headed

# Run tests with interactive UI
npm run test:ui

# Debug tests step by step
npm run test:debug

# View test results report
npm run test:report
```

## 📋 Test Coverage

### Complete Manual Test Script Automation
This Playwright suite provides **1-for-1 automation** of every test case in `COMPETITION_SCORING_TEST_SCRIPT.md`:

#### ✅ Section 1: Competition Setup & Entry Submission
- **1.1** Competition Creation (Officer Account)
- **1.2** Entry Submission (Member Account)
- **1.3** Verify Entries (Officer Account)

#### ✅ Section 2: Judge Assignment & Setup
- **2.1** Judge Assignment (Officer Account)
- **2.2** Judging Dashboard Setup (Officer Account)

#### ✅ Section 3: Judging Process
- **3.1** Judge Login & Assignment Verification
- **3.2** Entry Judging - Scoresheet Completion
- **3.3** Ranking Entries (Judge Account)

#### ✅ Section 4: Results Processing & Publication
- **4.1** Results Review (Officer Account)
- **4.2** Results Publication (Officer Account)

#### ✅ Section 5: Public Results & Member Experience
- **5.1** Public Results Viewing
- **5.2** Member Results Access

#### ✅ Section 6: Filter System Validation
- **6.1** My Entries Filtering (Member Account)

#### ✅ Section 7: Edge Cases & Error Handling
- **7.1** Incomplete Judging Scenarios
- **7.2** Data Validation Testing
- **7.3** Permission Testing

#### ✅ Section 8: Performance & Usability
- **8.1** Mobile Responsiveness
- **8.2** Print Functionality

## 🔧 Test Configuration

### Test Data
The test suite uses predefined test data that matches the manual script:

**Competition:**
- Name: "Test Homebrew Competition 2024"
- Description: "Annual club competition"
- Entry deadline: 7 days from test run
- Judging date: 10 days from test run

**Test Entries:**
1. **Hoppy Pale Ale** (18A - Blonde Ale) - Expected 2nd place (41/50)
2. **Dark Porter** (20A - American Porter) - Expected 1st place (46/50)
3. **Belgian Wit** (24A - Witbier) - Expected 3rd place (34/50)

**Test Users:**
- `officer@test.com` - Officer/Admin permissions
- `judge@test.com` - Judge permissions
- `member@test.com` - Regular member permissions

### Browser Support
Tests run across multiple browsers:
- ✅ Chromium (Chrome/Edge)
- ✅ Firefox
- ✅ WebKit (Safari)
- ✅ Mobile Chrome
- ✅ Mobile Safari

## 📊 Test Results & Reporting

### Automated Reports
- **HTML Report:** Interactive test results with screenshots and videos
- **JSON Report:** Machine-readable results for CI/CD integration
- **JUnit XML:** Compatible with most CI systems

### Test Evidence
- Screenshots on failure
- Videos of failed test runs
- Execution traces for debugging
- Performance metrics

## 🛠 Test Maintenance

### Test Data Management
```javascript
// Test data is defined in tests/test-helpers.js
export const TEST_DATA = {
  competition: { /* competition data */ },
  entries: [ /* test entry data */ ],
  users: { /* test user accounts */ }
};
```

### Adding New Tests
1. Follow the existing test structure in `tests/competition-scoring.spec.js`
2. Use helper functions from `tests/test-helpers.js`
3. Maintain 1-for-1 mapping with manual test cases
4. Include proper assertions and error handling

### Test Environment Setup
```javascript
// Global setup runs before all tests
test.beforeEach(async ({ page }) => {
  // Clean test environment
  await cleanupTestData(page);
});

test.afterEach(async ({ page }) => {
  // Cleanup after each test
  await resetTestState(page);
});
```

## 🎯 Specific Test Scenarios

### Authentication Flow Testing
```javascript
test('User Authentication', async ({ page }) => {
  await loginUser(page, 'officer');
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

  await logoutUser(page);
  await expect(page).toHaveURL(/\/login/);
});
```

### BJCP Scoresheet Validation
```javascript
test('Scoresheet Completion', async ({ page }) => {
  await loginUser(page, 'judge');
  await fillScoresheetForm(page, TEST_DATA.entries[0].scores);
  await page.click('[data-testid="submit-scoresheet"]');

  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

### Filter System Testing
```javascript
test('Entry Filtering', async ({ page }) => {
  await loginUser(page, 'member');
  await page.selectOption('[data-testid="award-filter"]', '🥇 1st Place');

  await expect(page.locator('text=Dark Porter')).toBeVisible();
  await expect(page.locator('[data-testid="filtered-entries"]')).toHaveCount(1);
});
```

## 🔍 Debugging Tests

### Debug Mode
```bash
# Run specific test with debugger
npm run test:debug -- --grep "Competition Creation"

# Run single test file
npm run test:debug tests/competition-scoring.spec.js
```

### Common Issues & Solutions

**Issue:** Test timeouts
```javascript
// Solution: Increase timeout for slow operations
await page.waitForSelector('[data-testid="element"]', { timeout: 30000 });
```

**Issue:** Element not found
```javascript
// Solution: Wait for element to be available
await page.waitForLoadState('networkidle');
await expect(page.locator('[data-testid="element"]')).toBeVisible();
```

**Issue:** Authentication failures
```javascript
// Solution: Verify test user credentials and permissions
const user = TEST_CONFIG.users.officer;
await page.fill('[data-testid="email-input"]', user.email);
```

## 📈 Performance Testing

### Load Time Validation
```javascript
test('Page Performance', async ({ page }) => {
  const loadTime = await measurePageLoadTime(page, '/competitions/results');
  expect(loadTime).toBeLessThan(3000); // 3 second max
});
```

### Form Submission Performance
```javascript
test('Scoresheet Submission Speed', async ({ page }) => {
  const submitTime = await measureFormSubmissionTime(page, async () => {
    await page.click('[data-testid="submit-scoresheet"]');
  });
  expect(submitTime).toBeLessThan(2000); // 2 second max
});
```

## 🚨 CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test:install
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 📝 Test Checklist

Before running the full test suite, ensure:

- [ ] Application is running at `http://localhost:5173`
- [ ] Test database is properly seeded
- [ ] Test user accounts exist with correct permissions
- [ ] All required BJCP categories are available
- [ ] Network connectivity is stable

## 🤝 Contributing

When adding new tests:

1. **Follow naming conventions:** `test('Section X.Y: Test Description', ...)`
2. **Use helper functions:** Import from `tests/test-helpers.js`
3. **Include proper cleanup:** Reset test state after each test
4. **Add assertions:** Validate expected results thoroughly
5. **Document edge cases:** Include comments for complex test logic

## 📞 Support

For test-related issues:

1. **Check logs:** Review test output and browser console
2. **Run debug mode:** Use `npm run test:debug` for step-by-step execution
3. **Review recordings:** Check videos and screenshots of failed tests
4. **Verify test data:** Ensure test environment is properly configured

---

**🎯 Goal:** Achieve 100% automation coverage of the manual test script while maintaining reliability, performance, and maintainability.

**📊 Success Metrics:**
- All manual test cases automated
- Test suite runs in under 10 minutes
- 99%+ test reliability
- Cross-browser compatibility validated
- Mobile responsiveness verified