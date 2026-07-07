/**
 * Playwright E2E Configuration — T-307
 *
 * Tests E2E pour les scénarios critiques ATS Ultimate.
 * Lance contre l'app en mode dev (port 3000) ou contre une URL de staging.
 *
 * Prérequis pour lancer localement :
 *   1. npm run dev (dans un autre terminal)
 *   2. npx playwright test
 *
 * En CI : configurer BASE_URL vers l'environnement de staging.
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['line'],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
  ],

  // Lance le dev server automatiquement si pas déjà démarré
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
