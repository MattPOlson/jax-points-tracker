// Basic Navigation Test - No Authentication Required
// This test validates that the Playwright configuration is working correctly

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5174';

test.describe('Basic Navigation Tests', () => {
  test('Homepage loads successfully', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check that the page loads and shows the JAX Member Portal
    await expect(page.locator('text=JAX MEMBER PORTAL')).toBeVisible();
    await expect(page.locator('text=Have Fun Brew Better Beer!')).toBeVisible();
  });

  test('Login page loads and shows form elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Wait for form to load
    await page.waitForSelector('input[placeholder="Your email address"]');

    // Verify form elements are present
    await expect(page.locator('input[placeholder="Your email address"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Your password"]')).toBeVisible();
    await expect(page.locator('text=Sign in')).toBeVisible();

    // Verify form can be filled (without submitting)
    await page.fill('input[placeholder="Your email address"]', 'test@example.com');
    await page.fill('input[placeholder="Your password"]', 'testpassword');

    // Verify the values were filled
    await expect(page.locator('input[placeholder="Your email address"]')).toHaveValue('test@example.com');
    await expect(page.locator('input[placeholder="Your password"]')).toHaveValue('testpassword');
  });

  test('Form selectors match application structure', async ({ page }) => {
    // Test competition creation form selectors (if accessible without auth)
    await page.goto(`${BASE_URL}/officers/manage-competitions/create`);

    // This might redirect to login, which is expected behavior
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      await expect(page.locator('text=JAX MEMBER PORTAL')).toBeVisible();
      console.log('✅ Correctly redirected to login for protected route');
    } else {
      // If somehow accessible, test the form selectors
      await expect(page.locator('#name')).toBeVisible();
      await expect(page.locator('#description')).toBeVisible();
    }
  });
});