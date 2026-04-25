import { test, expect } from '@playwright/test';

test.describe('Discover Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/DigiGarage/discover');
  });

  test('should display search controls', async ({ page }) => {
    await expect(page.getByPlaceholder(/Search entire history/i)).toBeVisible();
  });

  test('global wiki search should fetch results', async ({ page }) => {
    // Increase timeout for this specific test as it relies on an external API
    test.setTimeout(60000);
    
    const searchInput = page.getByPlaceholder(/Search entire history/i);
    await searchInput.pressSequentially('Twin Mill', { delay: 100 });
    
    // Use a broad locator to wait for results
    const results = page.locator('article');
    await expect(results.first()).toBeVisible({ timeout: 45000 });
    
    const visibleCards = page.locator('article:visible');
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0);
    
    // Check if at least one result contains our query
    const content = await page.innerText('main');
    expect(content.toLowerCase()).toContain('twin mill');
  });
});
