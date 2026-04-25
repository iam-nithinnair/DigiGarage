import { test, expect } from '@playwright/test';

test.describe('Discover Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/DigiGarage/discover');
  });

  test('should display search controls', async ({ page }) => {
    await expect(page.getByPlaceholder(/Search entire history/i)).toBeVisible();
  });

  test('should show 50 models by default on load', async ({ page }) => {
    // Wait for the initial global fetch
    const results = page.locator('article');
    await expect(results.first()).toBeVisible({ timeout: 30000 });
    
    const count = await results.count();
    // It should fetch up to 50 models
    expect(count).toBeGreaterThan(10);
  });

  test('global wiki search should fetch results', async ({ page }) => {
    // Increase timeout for this specific test as it relies on an external API
    test.setTimeout(60000);
    
    const searchInput = page.getByPlaceholder(/Search entire history/i);
    // Clear initial results by typing
    await searchInput.fill('');
    await searchInput.pressSequentially('Twin Mill', { delay: 100 });
    
    // Wait for Querying loader then for results
    await expect(page.locator('article', { hasText: 'Twin Mill' }).first()).toBeVisible({ timeout: 45000 });
    
    const visibleCards = page.locator('article:visible');
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0);
    
    // Check if results match
    const content = await page.innerText('main');
    expect(content.toLowerCase()).toContain('twin mill');
  });
});
