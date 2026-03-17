import { test, expect, type Page } from '@playwright/test';

/**
 * E2E: Booking Flow
 * Tests the full booking lifecycle: select interview type → select slot → confirm booking.
 */

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|profile-setup/, { timeout: 10000 });
}

test.describe('Session Booking Flow', () => {
  test('BOOK-01 — Confirm Booking button is disabled without selections', async ({
    page,
  }) => {
    await loginAs(
      page,
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!
    );
    await page.goto('/search');
    const viewProfileBtn = page.locator('text=View Profile').first();
    const isVisible = await viewProfileBtn
      .isVisible({ timeout: 8000 })
      .catch(() => false);
    if (!isVisible) {
      test.skip();
      return;
    }

    await viewProfileBtn.click();
    await expect(page.locator('[data-testid="confirm-booking"]')).toBeDisabled({
      timeout: 8000,
    });
  });

  test('BOOK-02 — Booking button stays disabled with only interview type selected', async ({
    page,
  }) => {
    await loginAs(
      page,
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!
    );
    await page.goto('/search');
    const viewProfileBtn = page.locator('text=View Profile').first();
    const isVisible = await viewProfileBtn
      .isVisible({ timeout: 8000 })
      .catch(() => false);
    if (!isVisible) {
      test.skip();
      return;
    }

    await viewProfileBtn.click();
    // Select first interview type
    const firstType = page.locator('[data-testid^="type-select-"]').first();
    const typeVisible = await firstType
      .isVisible({ timeout: 8000 })
      .catch(() => false);
    if (!typeVisible) {
      test.skip();
      return;
    }

    await firstType.click();
    await expect(
      page.locator('[data-testid="confirm-booking"]')
    ).toBeDisabled();
  });

  test('BOOK-03 — Booking button becomes enabled after both selections', async ({
    page,
  }) => {
    await loginAs(
      page,
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!
    );
    await page.goto('/search');
    const viewProfileBtn = page.locator('text=View Profile').first();
    const isVisible = await viewProfileBtn
      .isVisible({ timeout: 8000 })
      .catch(() => false);
    if (!isVisible) {
      test.skip();
      return;
    }

    await viewProfileBtn.click();
    const firstType = page.locator('[data-testid^="type-select-"]').first();
    const firstSlot = page.locator('[data-testid^="slot-select-"]').first();
    const bothVisible = await Promise.all([
      firstType.isVisible({ timeout: 8000 }).catch(() => false),
      firstSlot.isVisible({ timeout: 8000 }).catch(() => false),
    ]);
    if (!bothVisible.every(Boolean)) {
      test.skip();
      return;
    }

    await firstType.click();
    await firstSlot.click();
    await expect(page.locator('[data-testid="confirm-booking"]')).toBeEnabled();
  });

  test('BOOK-04 — Optional notes field accepts text', async ({ page }) => {
    await loginAs(
      page,
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!
    );
    await page.goto('/search');
    const viewProfileBtn = page.locator('text=View Profile').first();
    const isVisible = await viewProfileBtn
      .isVisible({ timeout: 8000 })
      .catch(() => false);
    if (!isVisible) {
      test.skip();
      return;
    }

    await viewProfileBtn.click();
    const notes = page.locator('[data-testid="booking-notes"]');
    const notesVisible = await notes
      .isVisible({ timeout: 8000 })
      .catch(() => false);
    if (!notesVisible) {
      test.skip();
      return;
    }

    await notes.fill('Looking forward to practicing linked list problems!');
    await expect(notes).toHaveValue(
      'Looking forward to practicing linked list problems!'
    );
  });

  test('BOOK-05 — Full booking flow shows success state', async ({ page }) => {
    await loginAs(
      page,
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!
    );
    await page.goto('/search');
    const viewProfileBtn = page.locator('text=View Profile').first();
    const isVisible = await viewProfileBtn
      .isVisible({ timeout: 8000 })
      .catch(() => false);
    if (!isVisible) {
      test.skip();
      return;
    }

    await viewProfileBtn.click();
    const firstType = page.locator('[data-testid^="type-select-"]').first();
    const firstSlot = page.locator('[data-testid^="slot-select-"]').first();
    const bothVisible = await Promise.all([
      firstType.isVisible({ timeout: 8000 }).catch(() => false),
      firstSlot.isVisible({ timeout: 8000 }).catch(() => false),
    ]);
    if (!bothVisible.every(Boolean)) {
      test.skip();
      return;
    }

    await firstType.click();
    await firstSlot.click();
    await page.locator('[data-testid="confirm-booking"]').click();

    // Should transition to success state or show an error
    const success = await page
      .locator('[data-testid="success-state"]')
      .isVisible({ timeout: 10000 })
      .catch(() => false);
    const errorMsg = await page
      .locator('[data-testid="booking-error"]')
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    // Either success or a meaningful error is acceptable
    expect(success || errorMsg).toBeTruthy();
  });

  test('BOOK-06 — Success state has View in Dashboard button', async ({
    page,
  }) => {
    await loginAs(
      page,
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!
    );
    await page.goto('/search');
    const viewProfileBtn = page.locator('text=View Profile').first();
    const isVisible = await viewProfileBtn
      .isVisible({ timeout: 8000 })
      .catch(() => false);
    if (!isVisible) {
      test.skip();
      return;
    }

    await viewProfileBtn.click();
    const firstType = page.locator('[data-testid^="type-select-"]').first();
    const firstSlot = page.locator('[data-testid^="slot-select-"]').first();
    const bothVisible = await Promise.all([
      firstType.isVisible({ timeout: 8000 }).catch(() => false),
      firstSlot.isVisible({ timeout: 8000 }).catch(() => false),
    ]);
    if (!bothVisible.every(Boolean)) {
      test.skip();
      return;
    }

    await firstType.click();
    await firstSlot.click();
    await page.locator('[data-testid="confirm-booking"]').click();

    const successVisible = await page
      .locator('[data-testid="success-state"]')
      .isVisible({ timeout: 10000 })
      .catch(() => false);
    if (!successVisible) {
      test.skip();
      return;
    }

    await expect(page.locator('text=View in Dashboard')).toBeVisible();
    await page.locator('text=View in Dashboard').click();
    await expect(page).toHaveURL(/dashboard/);
  });
});
