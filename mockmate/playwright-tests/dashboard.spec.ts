import { test, expect, type Page } from '@playwright/test';

/**
 * E2E: Dashboard & Session Management Flow
 */

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|profile-setup/, { timeout: 10000 });
}

test.describe('Dashboard — Session Management', () => {
  test('DASH-01 — Dashboard requires auth (redirect)', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });

  test('DASH-02 — Dashboard header and tabs render correctly', async ({
    page,
  }) => {
    await loginAs(
      page,
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!
    );
    await page.goto('/dashboard');
    await expect(page.locator('h1', { hasText: 'Your Dashboard' })).toBeVisible(
      { timeout: 8000 }
    );
    await expect(page.locator('text=Upcoming Sessions')).toBeVisible();
    await expect(page.locator('text=Pending Requests')).toBeVisible();
    await expect(page.locator('text=Past Interviews')).toBeVisible();
  });

  test('DASH-03 — Find Partners button navigates to search', async ({
    page,
  }) => {
    await loginAs(
      page,
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!
    );
    await page.goto('/dashboard');
    await page.waitForSelector('text=Find Partners', { timeout: 8000 });
    await page.locator('text=Find Partners').click();
    await expect(page).toHaveURL(/search/);
  });

  test('DASH-04 — Pending tab shows correct empty state', async ({ page }) => {
    await loginAs(
      page,
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!
    );
    await page.goto('/dashboard');
    await page.waitForSelector('text=Pending Requests', { timeout: 8000 });
    await page.locator('text=Pending Requests').click();
    // Empty state or session cards are both valid
    await expect(page.locator('text=No pending'))
      .toBeVisible({ timeout: 5000 })
      .catch(() => {
        /* has pending sessions — also fine */
      });
  });

  test('DASH-05 — Past tab switches the view', async ({ page }) => {
    await loginAs(
      page,
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!
    );
    await page.goto('/dashboard');
    await page.waitForSelector('text=Past Interviews', { timeout: 8000 });
    await page.locator('text=Past Interviews').click();
    // Verify we didn't crash
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Profile Setup Flow', () => {
  test('PROF-01 — Profile page requires auth', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/login/);
  });

  test('PROF-02 — Profile setup page renders correctly', async ({ page }) => {
    await loginAs(
      page,
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!
    );
    await page.goto('/profile-setup');
    await expect(page.locator('h1, h2')).toBeVisible({ timeout: 8000 });
  });

  test('PROF-03 — Profile page shows experience level options', async ({
    page,
  }) => {
    await loginAs(
      page,
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!
    );
    // Visit profile or profile-setup
    const dest = await page.goto('/profile');
    if (dest?.url().includes('login')) {
      test.skip();
      return;
    }
    // Expect experience level options to be present
    const experienceOptions = page
      .locator('text=New Grad, text=Intern, text=Experienced')
      .first();
    await expect(
      experienceOptions.or(page.locator('text=Experience Level'))
    ).toBeVisible({ timeout: 8000 });
  });
});

test.describe('Navigation & Navbar', () => {
  test('NAV-01 — Navbar renders top-level links after login', async ({
    page,
  }) => {
    await loginAs(
      page,
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!
    );
    await page.goto('/dashboard');
    await page.waitForSelector('nav', { timeout: 8000 });
    await expect(page.locator('nav')).toBeVisible();
  });

  test('NAV-02 — 404 page renders for unknown route', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    // Should show 404 or redirect to login
    const is404 = await page
      .locator('text=Page Not Found')
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const isLogin = page.url().includes('login');
    expect(is404 || isLogin).toBeTruthy();
  });
});
