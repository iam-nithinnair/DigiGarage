import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/DigiGarage/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/THE DIGITAL CURATOR/);
});

test('navbar links are visible', async ({ page }) => {
  await page.goto('/DigiGarage/');

  // Check if Home link is visible in nav
  await expect(page.locator('nav').getByRole('link', { name: /Home/i })).toBeVisible();
  // Check if Collection link is visible in nav
  await expect(page.locator('nav').getByRole('link', { name: /Collection/i })).toBeVisible();
});
