import { test, expect } from '@playwright/test';

test.describe('Discover Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/DigiGarage/discover');
  });

  test('should display search and filter controls', async ({ page }) => {
    await expect(page.getByPlaceholder(/Search by casting or series/i)).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
  });

  test('search should filter results', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search by casting or series/i);
    await searchInput.fill('Skyline');
    
    // Give it a moment to filter
    await page.waitForTimeout(1000);
    
    const visibleCards = page.locator('article:visible');
    const count = await visibleCards.count();
    
    expect(count).toBeGreaterThan(0);
    
    for (let i = 0; i < count; i++) {
      await expect(visibleCards.nth(i)).toContainText(/Skyline/i);
    }
  });
});
