import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests-e2e',
  timeout: 30 * 1000,
  retries: 0,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    headless: true,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});


