import { defineConfig, devices } from '@playwright/test'

// E2E_BASE_URL lets you point at a running staging server.
// Default: localhost:3000. If your dev server is on 3001, set E2E_BASE_URL=http://localhost:3001.
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    // Reuse whatever is already running locally; in CI always start fresh.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
