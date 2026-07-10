// Global setup for Playwright tests
// This file runs once before all tests to prepare the test environment

import { chromium } from '@playwright/test';

async function globalSetup() {
  console.log('🚀 Starting global test setup...');

  // Launch browser for setup tasks
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Verify application is running
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    console.log('✅ Application is accessible');

    // Setup test database state (if needed)
    await setupTestDatabase(page);

    // Create test users (if needed)
    await createTestUsers(page);

    // Clean up any existing test data
    await cleanupTestData(page);

    console.log('✅ Global setup completed successfully');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function setupTestDatabase(page) {
  // Reset test database to known state
  // This would typically call a test database reset endpoint
  console.log('🗄️  Setting up test database...');

  try {
    // Example: Reset database via API endpoint
    await page.request.post('http://localhost:5173/api/test/reset-db', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-admin-token'
      }
    });
    console.log('✅ Test database reset complete');
  } catch (error) {
    console.log('⚠️  Database reset not available, continuing with existing data');
  }
}

async function createTestUsers(page) {
  // Ensure test users exist with proper permissions
  console.log('👥 Creating test users...');

  const testUsers = [
    {
      email: 'officer@test.com',
      password: 'password123',
      name: 'Test Officer',
      role: 'officer'
    },
    {
      email: 'judge@test.com',
      password: 'password123',
      name: 'Test Judge',
      role: 'judge'
    },
    {
      email: 'member@test.com',
      password: 'password123',
      name: 'Test Member',
      role: 'member'
    }
  ];

  for (const user of testUsers) {
    try {
      // Create user via API or registration flow
      await page.request.post('http://localhost:5173/api/test/create-user', {
        data: user,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Created test user: ${user.email}`);
    } catch (error) {
      console.log(`⚠️  User ${user.email} may already exist, continuing...`);
    }
  }
}

async function cleanupTestData(page) {
  // Clean up any existing test competitions or entries
  console.log('🧹 Cleaning up existing test data...');

  try {
    await page.request.delete('http://localhost:5173/api/test/cleanup', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-admin-token'
      }
    });
    console.log('✅ Test data cleanup complete');
  } catch (error) {
    console.log('⚠️  Test cleanup not available, continuing...');
  }
}

export default globalSetup;