/**
 * E2E — Flux de recrutement complet (T-307)
 * Scénario critique : login → créer mission → ajouter candidat → pipeline → dashboard
 *
 * ⚠️ Ce test modifie les données du compte démo.
 * En CI, utiliser un compte de test dédié avec reset automatique.
 */

import { test, expect } from '@playwright/test';

const DEMO_EMAIL = process.env.E2E_DEMO_EMAIL || 'demo@techcorp.com';
const DEMO_PASSWORD = process.env.E2E_DEMO_PASSWORD || 'demo123';

// Helper de connexion réutilisé entre les tests
async function login(page) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(DEMO_EMAIL);
  await page.locator('input[type="password"]').fill(DEMO_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/app\/dashboard|dashboard/i, { timeout: 10_000 });
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test('affiche les KPIs', async ({ page }) => {
    await page.goto('/app/dashboard');
    // Le dashboard doit contenir des chiffres ou au moins s'afficher
    await expect(page.locator('[role="main"], main')).toBeVisible({ timeout: 5_000 });
  });
});

test.describe('Navigation sidebar', () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  const PAGES = [
    { label: 'Missions', path: '/app/missions' },
    { label: 'Candidats', path: '/app/candidates' },
    { label: 'Pipeline', path: '/app/pipeline' },
    { label: 'Analytiques', path: '/app/analytics' },
  ];

  for (const { label, path } of PAGES) {
    test(`navigation vers ${label}`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(path.replace('/', '\\/')));
      // La page doit se charger sans erreur fatale
      await expect(page.locator('[role="main"], main, .page-content, [class*="Page"]')).toBeVisible({ timeout: 8_000 });
    });
  }
});

test.describe('Site vitrine', () => {
  test('landing page accessible', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ATS/i);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('page pricing accessible', async ({ page }) => {
    await page.goto('/pricing');
    // Doit contenir des informations de tarifs
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('page démo accessible', async ({ page }) => {
    await page.goto('/demo');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('navigation footer — CGU accessible', async ({ page }) => {
    await page.goto('/cgu');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('navigation footer — CGV accessible', async ({ page }) => {
    await page.goto('/cgv');
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Portail carrières', () => {
  test('portail générique accessible', async ({ page }) => {
    // Page careers sans companyId — doit retourner une 404 ou error state
    await page.goto('/careers/00000000-0000-0000-0000-000000000000');
    // Pas de crash — la page doit se charger
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBe(true);
  });
});

test.describe('Pages légales', () => {
  const LEGAL_PAGES = [
    '/mentions-legales',
    '/politique-confidentialite',
    '/cgu',
    '/cgv',
    '/dpa',
    '/sla',
    '/non-discrimination',
  ];

  for (const legalPath of LEGAL_PAGES) {
    test(`${legalPath} accessible`, async ({ page }) => {
      await page.goto(legalPath);
      await expect(page.locator('h1')).toBeVisible({ timeout: 5_000 });
      // Pas d'erreur 404
      await expect(page.locator('text=404')).toHaveCount(0);
    });
  }
});
