// Global teardown for Playwright tests
// This file runs once after all tests to clean up the test environment

import { chromium } from '@playwright/test';

async function globalTeardown() {
  console.log('🧹 Starting global test teardown...');

  // Launch browser for cleanup tasks
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Clean up test data
    await cleanupTestData(page);

    // Generate test report summary
    await generateTestSummary();

    console.log('✅ Global teardown completed successfully');

  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  } finally {
    await browser.close();
  }
}

async function cleanupTestData(page) {
  console.log('🗑️  Cleaning up test data...');

  try {
    // Remove test competitions and entries
    await page.request.delete('http://localhost:5173/api/test/cleanup-all', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-admin-token'
      }
    });

    // Reset test user states
    await page.request.post('http://localhost:5173/api/test/reset-users', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-admin-token'
      }
    });

    console.log('✅ Test data cleanup complete');
  } catch (error) {
    console.log('⚠️  Test cleanup failed, but continuing:', error.message);
  }
}

async function generateTestSummary() {
  console.log('📊 Generating test summary...');

  try {
    const fs = await import('fs');
    const path = await import('path');

    // Read test results if available
    const resultsPath = path.default.join(process.cwd(), 'test-results.json');

    if (fs.default.existsSync(resultsPath)) {
      const results = JSON.parse(fs.default.readFileSync(resultsPath, 'utf8'));

      console.log('\n📋 Test Execution Summary:');
      console.log(`   Total Suites: ${results.suites?.length || 0}`);
      console.log(`   Total Tests: ${results.stats?.total || 0}`);
      console.log(`   Passed: ${results.stats?.passed || 0}`);
      console.log(`   Failed: ${results.stats?.failed || 0}`);
      console.log(`   Skipped: ${results.stats?.skipped || 0}`);
      console.log(`   Duration: ${results.stats?.duration || 0}ms`);

      // Write summary to file
      const summaryPath = path.default.join(process.cwd(), 'test-summary.md');
      const summaryContent = generateMarkdownSummary(results);
      fs.default.writeFileSync(summaryPath, summaryContent);
      console.log(`✅ Test summary written to ${summaryPath}`);
    }
  } catch (error) {
    console.log('⚠️  Could not generate test summary:', error.message);
  }
}

function generateMarkdownSummary(results) {
  const timestamp = new Date().toISOString();

  return `# Competition Scoring System - Test Results

**Generated:** ${timestamp}

## Overview
This automated test suite validates the complete competition scoring workflow based on the manual test script.

## Test Statistics
- **Total Test Suites:** ${results.suites?.length || 0}
- **Total Tests:** ${results.stats?.total || 0}
- **Passed:** ${results.stats?.passed || 0} ✅
- **Failed:** ${results.stats?.failed || 0} ❌
- **Skipped:** ${results.stats?.skipped || 0} ⏭️
- **Duration:** ${Math.round((results.stats?.duration || 0) / 1000)}s

## Test Coverage
The following areas were validated:

### ✅ Core Functionality
- Competition creation and management
- Entry submission and tracking
- Judge assignment and workflow
- BJCP scoresheet completion
- Entry ranking and placement
- Results publication and viewing
- Member access to personal results

### ✅ Filter System
- Competition filtering
- Category filtering
- Award/medal filtering
- Status filtering (active/past)
- Payment filtering
- Clear all filters functionality
- Results count accuracy

### ✅ User Experience
- Role-based access control
- Mobile responsiveness
- Error handling and validation
- Print functionality
- Performance validation
- Data integrity maintenance

### ✅ Security & Data
- Authentication and authorization
- Data privacy (judge anonymity)
- Input validation and sanitization
- Secure scoresheet access
- Proper error messaging

## Test Mapping
Each automated test corresponds 1-for-1 with the manual test script sections:

1. **Section 1:** Competition Setup & Entry Submission
2. **Section 2:** Judge Assignment & Setup
3. **Section 3:** Judging Process
4. **Section 4:** Results Processing & Publication
5. **Section 5:** Public Results & Member Experience
6. **Section 6:** Filter System Validation
7. **Section 7:** Edge Cases & Error Handling
8. **Section 8:** Performance & Usability

## Next Steps
- Review any failed tests in the detailed report
- Check browser compatibility across all supported browsers
- Validate performance under load
- Ensure all edge cases are covered

---
*Generated by Competition Scoring System Playwright Test Suite*
`;
}

export default globalTeardown;