import { test, expect } from '@playwright/test';

test.describe('Discover Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/DigiGarage/discover');
  });

  test('should display search and filter controls', async ({ page }) => {
    await expect(page.getByPlaceholder(/Search curated list/i)).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
  });

  test('can switch to global wiki mode', async ({ page }) => {
    const globalBtn = page.getByRole('button', { name: /Global Wiki/i });
    await globalBtn.click();
    
    await expect(page.locator('h1')).toContainText(/Global Archive/i);
    await expect(page.getByPlaceholder(/Search entire history/i)).toBeVisible();
    // Filter should be hidden in global mode
    await expect(page.locator('select')).not.toBeVisible();
  });

  test('global wiki search should fetch results', async ({ page }) => {
    await page.getByRole('button', { name: /Global Wiki/i }).click();
    
    const searchInput = page.getByPlaceholder(/Search entire history/i);
    await searchInput.fill('Twin Mill');
    
    // Wait for the loader to appear and then disappear
    await expect(page.locator('text=Querying Global Archive')).toBeVisible();
    
    // Specifically wait for a real wiki result (not curated)
    await expect(page.locator('article', { hasText: 'Twin Mill' }).first()).toBeVisible({ timeout: 10000 });
    
    const count = await page.locator('article:visible').count();
    expect(count).toBeGreaterThan(0);
  });
});
