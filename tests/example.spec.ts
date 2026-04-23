import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/THE DIGITAL CURATOR/);
});

test('navbar links are visible', async ({ page }) => {
  await page.goto('/');

  // Check if Home link is visible
  await expect(page.getByRole('link', { name: /Home/i })).toBeVisible();
  // Check if Collection link is visible
  await expect(page.getByRole('link', { name: /Collection/i })).toBeVisible();
});
