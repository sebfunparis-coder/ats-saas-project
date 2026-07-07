/**
 * E2E — Authentification (T-307)
 * Scénarios : inscription → login → accès dashboard → déconnexion
 *
 * ⚠️ Ces tests nécessitent un compte de démonstration valide.
 * Configurer via les variables d'environnement E2E_DEMO_EMAIL / E2E_DEMO_PASSWORD
 * (en CI) ou utiliser les comptes démo hardcodés (en local).
 */

import { test, expect } from '@playwright/test';

const DEMO_EMAIL = process.env.E2E_DEMO_EMAIL || 'demo@techcorp.com';
const DEMO_PASSWORD = process.env.E2E_DEMO_PASSWORD || 'demo123';

test.describe('Authentification', () => {
  test('page de login accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/ATS/i);
    await expect(page.locator('form')).toBeVisible();
  });

  test('connexion avec compte démo', async ({ page }) => {
    await page.goto('/login');

    // Remplir le formulaire
    await page.locator('input[type="email"]').fill(DEMO_EMAIL);
    await page.locator('input[type="password"]').fill(DEMO_PASSWORD);
    await page.locator('button[type="submit"]').click();

    // Après connexion réussie → redirection vers le dashboard
    await page.waitForURL(/app\/dashboard|dashboard/i, { timeout: 10_000 });
    await expect(page.locator('h1, [role="main"]')).toBeVisible();
  });

  test('erreur avec mauvais mot de passe', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill(DEMO_EMAIL);
    await page.locator('input[type="password"]').fill('wrong-password-12345');
    await page.locator('button[type="submit"]').click();

    // Un message d'erreur doit apparaître
    const errorMsg = page.locator('[role="alert"], .error, [class*="error"]');
    await expect(errorMsg).toBeVisible({ timeout: 5_000 });
  });

  test('accès protégé redirige vers login', async ({ page }) => {
    await page.goto('/app/dashboard');
    // Sans être connecté, on doit être redirigé vers /login
    await expect(page).toHaveURL(/login/i, { timeout: 5_000 });
  });
});
