import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright-tests',
  timeout: 30_000,
  fullyParallel: false,
  retries: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Do NOT auto-start the dev server — assumes it is already running
});
