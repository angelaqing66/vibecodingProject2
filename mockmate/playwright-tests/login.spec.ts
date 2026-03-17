import { test, expect } from '@playwright/test';

/**
 * E2E: Authentication Flow
 * Tests the full login/signup lifecycle for MockMate.
 */
test.describe('Authentication — Login & Signup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('AUTH-01 — Login page renders correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Sign In \| MockMate/);
    await expect(page.locator('text=Sign in to your account')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('AUTH-02 — Login page has Sign Up link', async ({ page }) => {
    const signupLink = page.locator('a[href="/signup"]');
    await expect(signupLink).toBeVisible();
  });

  test('AUTH-03 — Login shows error on invalid credentials', async ({
    page,
  }) => {
    await page.fill('input[name="email"]', 'notareal@user.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    // Expect an error message to appear
    await expect(page.locator('text=Invalid credentials')).toBeVisible({
      timeout: 5000,
    });
  });

  test('AUTH-04 — Login form validates empty fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    // HTML5 required validation — browser prevents submission
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeFocused();
  });

  test('AUTH-05 — Sign Up page renders correctly', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('text=Create your account')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('AUTH-06 — Unauthenticated user is redirected from /dashboard to /login', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });

  test('AUTH-07 — Unauthenticated user is redirected from /search to /login', async ({
    page,
  }) => {
    await page.goto('/search');
    await expect(page).toHaveURL(/login/);
  });

  test('AUTH-08 — Unauthenticated user is redirected from /profile to /login', async ({
    page,
  }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/login/);
  });

  test('AUTH-09 — Unauthenticated user is redirected from /admin to /login', async ({
    page,
  }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/login/);
  });
});
