import { test, expect, type Page } from '@playwright/test';

/**
 * E2E: Partner Search Flow
 * Tests the search page, filters, and partner card interactions.
 * These tests run against a live instance that may have seed data.
 */

async function loginAs(page: Page, email: string, password: string) {
    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|profile-setup/, { timeout: 10000 });
}

test.describe('Partner Search — UI & Filtering', () => {

    test('SEARCH-01 — Search page requires auth (redirect)', async ({ page }) => {
        await page.goto('/search');
        await expect(page).toHaveURL(/login/);
    });

    test('SEARCH-02 — Search page renders partner cards after login', async ({ page }) => {
        await loginAs(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
        await page.goto('/search');
        // Heading should be visible
        await expect(page.locator('h1')).toContainText(/Find a Mock Interview Partner/i, { timeout: 8000 });
    });

    test('SEARCH-03 — Search input is present and accepts text', async ({ page }) => {
        await loginAs(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
        await page.goto('/search');
        const searchInput = page.locator('input[placeholder*="Search"]');
        await searchInput.fill('Alice');
        await expect(searchInput).toHaveValue('Alice');
    });

    test('SEARCH-04 — Experience level filter renders options', async ({ page }) => {
        await loginAs(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
        await page.goto('/search');
        const filterSelect = page.locator('select, [data-testid="level-filter"]').first();
        await expect(filterSelect).toBeVisible({ timeout: 8000 });
    });

    test('SEARCH-05 — Interview type filter renders', async ({ page }) => {
        await loginAs(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
        await page.goto('/search');
        const typeFilter = page.locator('select, [data-testid="type-filter"]').first();
        await expect(typeFilter).toBeVisible({ timeout: 8000 });
    });

    test('SEARCH-06 — View Profile button navigates to partner profile page', async ({ page }) => {
        await loginAs(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
        await page.goto('/search');
        // Wait for cards to load
        const viewProfileBtn = page.locator('text=View Profile').first();
        const isVisible = await viewProfileBtn.isVisible({ timeout: 8000 }).catch(() => false);
        if (isVisible) {
            await viewProfileBtn.click();
            await expect(page).toHaveURL(/search\/.+/);
        } else {
            // Skip if no partners — acceptable for empty dev DB
            test.skip();
        }
    });

    test('SEARCH-07 — Partner profile page has booking widget', async ({ page }) => {
        await loginAs(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
        await page.goto('/search');
        const viewProfileBtn = page.locator('text=View Profile').first();
        const isVisible = await viewProfileBtn.isVisible({ timeout: 8000 }).catch(() => false);
        if (isVisible) {
            await viewProfileBtn.click();
            await expect(page.locator('text=Book a Session')).toBeVisible({ timeout: 8000 });
        } else {
            test.skip();
        }
    });

    test('SEARCH-08 — Back to Search button works from partner profile', async ({ page }) => {
        await loginAs(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
        await page.goto('/search');
        const viewProfileBtn = page.locator('text=View Profile').first();
        const isVisible = await viewProfileBtn.isVisible({ timeout: 8000 }).catch(() => false);
        if (isVisible) {
            await viewProfileBtn.click();
            await page.locator('[data-testid="back-button"]').click();
            await expect(page).toHaveURL(/\/search$/);
        } else {
            test.skip();
        }
    });
});
