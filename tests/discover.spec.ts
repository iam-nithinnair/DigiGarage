import { test, expect } from '@playwright/test';

test.describe('Discover Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/DigiGarage/discover');
  });

  test('should display search controls', async ({ page }) => {
    // Updated placeholder to match actual UI text
    await expect(page.getByPlaceholder(/Search archive/i)).toBeVisible();
  });

  test('should show models by default on load', async ({ page }) => {
    // Wait for the initial global fetch
    const results = page.locator('article');
    await expect(results.first()).toBeVisible({ timeout: 30000 });
    
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });

  test('global wiki search should fetch results', async ({ page }) => {
    test.setTimeout(60000);
    
    const searchInput = page.getByPlaceholder(/Search archive/i);
    await searchInput.fill('');
    await searchInput.pressSequentially('Twin Mill', { delay: 100 });
    
    // Wait for results
    const results = page.locator('article');
    await expect(results.first()).toBeVisible({ timeout: 45000 });
    
    const visibleCards = page.locator('article:visible');
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0);
    
    const content = await page.innerText('main');
    expect(content.toLowerCase()).toContain('twin mill');
  });
});
