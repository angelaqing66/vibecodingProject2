import { test, expect } from '@playwright/test';

test.describe('MockMate Core Layout Validation', () => {
    test('has standard landing rendering components securely mapped', async ({ page }) => {
        await page.goto('http://localhost:3000');

        // Test base expectation that the page successfully booted NextAuth sign-in
        await expect(page).toHaveTitle(/Sign In \| MockMate/);

        // Check if the mockmate logo / title is printed within the DOM tree
        const text = page.locator('text=Sign in to your account');
        await expect(text).toBeVisible();
    });
});
