// Test Helper Functions for Competition Scoring System
// Shared utilities and helpers for Playwright tests

import { expect } from '@playwright/test';

// =============================================================================
// Constants and Configuration
// =============================================================================

export const TEST_CONFIG = {
  baseUrl: 'http://localhost:5173',
  timeout: {
    short: 5000,
    medium: 10000,
    long: 30000
  },
  users: {
    officer: {
      email: 'officer@test.com',
      password: 'password123',
      name: 'Test Officer',
      role: 'officer'
    },
    judge: {
      email: 'judge@test.com',
      password: 'password123',
      name: 'Test Judge',
      role: 'judge'
    },
    member: {
      email: 'member@test.com',
      password: 'password123',
      name: 'Test Member',
      role: 'member'
    }
  }
};

export const TEST_DATA = {
  competition: {
    name: 'Test Homebrew Competition 2024',
    description: 'Annual club competition',
    getDates() {
      const today = new Date();
      return {
        entryDeadline: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        judgingDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000)
      };
    }
  },
  entries: [
    {
      name: 'Hoppy Pale Ale',
      category: '18A - Blonde Ale',
      notes: 'Late hopped with Citra',
      scores: {
        aroma: { score: 10, max: 12, comments: 'Citrus hop aroma, clean malt backbone' },
        appearance: { score: 3, max: 3, comments: 'Clear golden color, good head retention' },
        flavor: { score: 16, max: 20, comments: 'Balanced hop flavor, slight astringency' },
        mouthfeel: { score: 4, max: 5, comments: 'Medium body, appropriate carbonation' },
        overall: { score: 8, max: 10, comments: 'Well-executed pale ale, minor flaws' },
        total: 41,
        judgeNotes: 'Good example of style with room for improvement',
        descriptors: ['hoppy', 'balanced'],
        expectedPlacement: 2
      }
    },
    {
      name: 'Dark Porter',
      category: '20A - American Porter',
      notes: 'Roasted malt character',
      scores: {
        aroma: { score: 11, max: 12, comments: 'Rich roasted malt, chocolate notes' },
        appearance: { score: 3, max: 3, comments: 'Dark brown, tan head' },
        flavor: { score: 18, max: 20, comments: 'Excellent roasted character, well balanced' },
        mouthfeel: { score: 5, max: 5, comments: 'Perfect body and carbonation' },
        overall: { score: 9, max: 10, comments: 'Outstanding porter' },
        total: 46,
        judgeNotes: 'Excellent example of American Porter',
        descriptors: ['roasted', 'balanced', 'smooth'],
        expectedPlacement: 1
      }
    },
    {
      name: 'Belgian Wit',
      category: '24A - Witbier',
      notes: 'Traditional spicing',
      scores: {
        aroma: { score: 9, max: 12, comments: 'Spice present but muted, some tartness' },
        appearance: { score: 2, max: 3, comments: 'Cloudy white, thin head' },
        flavor: { score: 14, max: 20, comments: 'Spicing evident but unbalanced' },
        mouthfeel: { score: 3, max: 5, comments: 'Light body, over-carbonated' },
        overall: { score: 6, max: 10, comments: 'Needs work on balance' },
        total: 34,
        judgeNotes: 'Style elements present but execution needs improvement',
        descriptors: ['spicy', 'tart'],
        expectedPlacement: 3
      }
    }
  ]
};

// =============================================================================
// Authentication Helpers
// =============================================================================

/**
 * Login user by role
 * @param {Page} page - Playwright page object
 * @param {string} userType - 'officer', 'judge', or 'member'
 */
export async function loginUser(page, userType) {
  const user = TEST_CONFIG.users[userType];
  if (!user) {
    throw new Error(`Unknown user type: ${userType}`);
  }

  await page.goto(`${TEST_CONFIG.baseUrl}/login`);

  // Wait for login form to load
  await page.waitForSelector('[data-testid="email-input"]', { timeout: TEST_CONFIG.timeout.medium });

  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);
  await page.click('[data-testid="login-button"]');

  // Wait for successful login redirect
  await page.waitForFunction(
    () => {
      const url = window.location.href;
      return url.includes('/dashboard') || url.includes('/judge') || url.includes('/officers');
    },
    { timeout: TEST_CONFIG.timeout.long }
  );

  // Verify user is logged in
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
}

/**
 * Logout current user
 * @param {Page} page - Playwright page object
 */
export async function logoutUser(page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');

  // Wait for redirect to login page
  await page.waitForFunction(
    () => {
      const url = window.location.href;
      return url.includes('/login') || url === TEST_CONFIG.baseUrl + '/';
    },
    { timeout: TEST_CONFIG.timeout.medium }
  );
}

// =============================================================================
// Navigation Helpers
// =============================================================================

/**
 * Navigate to page with authentication check
 * @param {Page} page - Playwright page object
 * @param {string} path - Path to navigate to
 * @param {string} userType - User type for authentication
 */
export async function navigateAsUser(page, path, userType) {
  await loginUser(page, userType);
  await page.goto(`${TEST_CONFIG.baseUrl}${path}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Get competition ID from current page context
 * @param {Page} page - Playwright page object
 * @returns {Promise<string>} Competition ID
 */
export async function getCompetitionId(page) {
  // Try to extract from URL first
  const url = page.url();
  const urlMatch = url.match(/\/competitions?\/(\d+)/);
  if (urlMatch) {
    return urlMatch[1];
  }

  // Try to get from data attribute
  const competitionElement = page.locator('[data-competition-id]').first();
  if (await competitionElement.count() > 0) {
    return await competitionElement.getAttribute('data-competition-id');
  }

  // Fallback: navigate to competitions list and get first competition
  await page.goto(`${TEST_CONFIG.baseUrl}/officers/manage-competitions`);
  const competitionLink = page.locator(`text=${TEST_DATA.competition.name}`).first();
  await competitionLink.click();

  const newUrl = page.url();
  const newMatch = newUrl.match(/\/(\d+)/);
  return newMatch?.[1] || '1';
}

// =============================================================================
// Form Helpers
// =============================================================================

/**
 * Fill competition creation form
 * @param {Page} page - Playwright page object
 * @param {Object} competitionData - Competition data
 */
export async function fillCompetitionForm(page, competitionData = TEST_DATA.competition) {
  const dates = competitionData.getDates();

  await page.fill('[data-testid="competition-name"]', competitionData.name);
  await page.fill('[data-testid="competition-description"]', competitionData.description);
  await page.fill('[data-testid="entry-deadline"]', dates.entryDeadline.toISOString().split('T')[0]);
  await page.fill('[data-testid="judging-date"]', dates.judgingDate.toISOString().split('T')[0]);

  // Ensure proper checkbox states
  await page.uncheck('[data-testid="results-published"]');
  await page.check('[data-testid="competition-active"]');
}

/**
 * Fill entry submission form
 * @param {Page} page - Playwright page object
 * @param {Object} entryData - Entry data
 */
export async function fillEntryForm(page, entryData) {
  await page.selectOption('[data-testid="competition-select"]', { label: TEST_DATA.competition.name });
  await page.fill('[data-testid="beer-name"]', entryData.name);
  await page.selectOption('[data-testid="bjcp-category"]', { label: entryData.category });
  await page.fill('[data-testid="beer-notes"]', entryData.notes);
}

/**
 * Fill BJCP scoresheet form
 * @param {Page} page - Playwright page object
 * @param {Object} scores - Score data
 */
export async function fillScoresheetForm(page, scores) {
  // Fill all score sections
  await page.fill('[data-testid="aroma-score"]', scores.aroma.score.toString());
  await page.fill('[data-testid="aroma-comments"]', scores.aroma.comments);

  await page.fill('[data-testid="appearance-score"]', scores.appearance.score.toString());
  await page.fill('[data-testid="appearance-comments"]', scores.appearance.comments);

  await page.fill('[data-testid="flavor-score"]', scores.flavor.score.toString());
  await page.fill('[data-testid="flavor-comments"]', scores.flavor.comments);

  await page.fill('[data-testid="mouthfeel-score"]', scores.mouthfeel.score.toString());
  await page.fill('[data-testid="mouthfeel-comments"]', scores.mouthfeel.comments);

  await page.fill('[data-testid="overall-score"]', scores.overall.score.toString());
  await page.fill('[data-testid="overall-comments"]', scores.overall.comments);

  await page.fill('[data-testid="judge-notes"]', scores.judgeNotes);

  // Select descriptors
  for (const descriptor of scores.descriptors) {
    await page.check(`[data-testid="descriptor-${descriptor}"]`);
  }
}

// =============================================================================
// Validation Helpers
// =============================================================================

/**
 * Validate entry appears in list
 * @param {Page} page - Playwright page object
 * @param {Object} entryData - Entry data to validate
 */
export async function validateEntryInList(page, entryData) {
  await expect(page.locator(`text=${entryData.name}`)).toBeVisible();

  if (entryData.category) {
    await expect(page.locator(`text=${entryData.category}`)).toBeVisible();
  }

  if (entryData.notes) {
    await expect(page.locator(`text=${entryData.notes}`)).toBeVisible();
  }
}

/**
 * Validate scoresheet data display
 * @param {Page} page - Playwright page object
 * @param {Object} scores - Score data to validate
 */
export async function validateScoresheetDisplay(page, scores) {
  // Validate total score
  await expect(page.locator(`text=${scores.total}`)).toBeVisible();

  // Validate judge notes
  await expect(page.locator(`text=${scores.judgeNotes}`)).toBeVisible();

  // Validate descriptors
  for (const descriptor of scores.descriptors) {
    await expect(page.locator(`text=${descriptor}`)).toBeVisible();
  }

  // Validate individual scores
  await expect(page.locator(`text=${scores.aroma.score}`)).toBeVisible();
  await expect(page.locator(`text=${scores.appearance.score}`)).toBeVisible();
  await expect(page.locator(`text=${scores.flavor.score}`)).toBeVisible();
  await expect(page.locator(`text=${scores.mouthfeel.score}`)).toBeVisible();
  await expect(page.locator(`text=${scores.overall.score}`)).toBeVisible();
}

/**
 * Validate award placement
 * @param {Page} page - Playwright page object
 * @param {string} entryName - Entry name
 * @param {number} placement - Expected placement (1, 2, 3)
 */
export async function validateAwardPlacement(page, entryName, placement) {
  const medalEmojis = { 1: '🥇', 2: '🥈', 3: '🥉' };
  const medal = medalEmojis[placement];

  if (medal) {
    const entryCard = page.locator(`[data-testid="entry-${entryName}"]`);
    await expect(entryCard.locator(`text=${medal}`)).toBeVisible();
  }
}

// =============================================================================
// Wait Helpers
// =============================================================================

/**
 * Wait for element with custom timeout
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {number} timeout - Timeout in milliseconds
 */
export async function waitForElement(page, selector, timeout = TEST_CONFIG.timeout.medium) {
  await page.waitForSelector(selector, { timeout });
}

/**
 * Wait for navigation to complete
 * @param {Page} page - Playwright page object
 * @param {string} expectedUrl - Expected URL pattern
 */
export async function waitForNavigation(page, expectedUrl) {
  await page.waitForFunction(
    (url) => window.location.href.includes(url),
    expectedUrl,
    { timeout: TEST_CONFIG.timeout.medium }
  );
}

// =============================================================================
// Data Management Helpers
// =============================================================================

/**
 * Clean up test data via API
 * @param {Page} page - Playwright page object
 */
export async function cleanupTestData(page) {
  try {
    await page.request.delete(`${TEST_CONFIG.baseUrl}/api/test/cleanup`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-admin-token'
      }
    });
  } catch (error) {
    console.log('Test cleanup not available, continuing...');
  }
}

/**
 * Create test competition via API
 * @param {Page} page - Playwright page object
 * @returns {Promise<string>} Competition ID
 */
export async function createTestCompetition(page) {
  try {
    const response = await page.request.post(`${TEST_CONFIG.baseUrl}/api/test/create-competition`, {
      data: TEST_DATA.competition,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    return result.id;
  } catch (error) {
    console.log('API competition creation not available, using UI flow...');
    return null;
  }
}

// =============================================================================
// Mobile Testing Helpers
// =============================================================================

/**
 * Set mobile viewport and test responsive layout
 * @param {Page} page - Playwright page object
 * @param {string} device - Device type ('mobile', 'tablet')
 */
export async function testMobileLayout(page, device = 'mobile') {
  const viewports = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 }
  };

  await page.setViewportSize(viewports[device]);

  // Verify mobile-responsive elements are visible
  await expect(page.locator('[data-testid="mobile-responsive"]')).toBeVisible();
}

// =============================================================================
// Error Handling Helpers
// =============================================================================

/**
 * Expect and handle validation errors
 * @param {Page} page - Playwright page object
 * @param {string} errorMessage - Expected error message
 */
export async function expectValidationError(page, errorMessage) {
  const errorElement = page.locator('[data-testid="validation-error"], [data-testid="error-message"]');
  await expect(errorElement).toBeVisible();

  if (errorMessage) {
    await expect(errorElement).toContainText(errorMessage);
  }
}

/**
 * Expect access denied response
 * @param {Page} page - Playwright page object
 */
export async function expectAccessDenied(page) {
  // Check for various access denied patterns
  const accessDeniedSelectors = [
    '[data-testid="access-denied"]',
    '[data-testid="unauthorized"]',
    'text=Access Denied',
    'text=Unauthorized',
    'text=403'
  ];

  let found = false;
  for (const selector of accessDeniedSelectors) {
    if (await page.locator(selector).count() > 0) {
      await expect(page.locator(selector)).toBeVisible();
      found = true;
      break;
    }
  }

  if (!found) {
    // Check URL for redirect to login or unauthorized page
    await expect(page).toHaveURL(/\/login|\/unauthorized|\/access-denied|\/403/);
  }
}

// =============================================================================
// Performance Testing Helpers
// =============================================================================

/**
 * Measure page load time
 * @param {Page} page - Playwright page object
 * @param {string} url - URL to test
 * @returns {Promise<number>} Load time in milliseconds
 */
export async function measurePageLoadTime(page, url) {
  const startTime = Date.now();
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  const endTime = Date.now();

  return endTime - startTime;
}

/**
 * Test form submission performance
 * @param {Page} page - Playwright page object
 * @param {Function} submitAction - Function that performs the submission
 * @returns {Promise<number>} Submission time in milliseconds
 */
export async function measureFormSubmissionTime(page, submitAction) {
  const startTime = Date.now();
  await submitAction();
  await page.waitForSelector('[data-testid="success-message"], [data-testid="error-message"]');
  const endTime = Date.now();

  return endTime - startTime;
}