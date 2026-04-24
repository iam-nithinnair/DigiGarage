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
    
    // Type slowly to ensure React state updates correctly
    await searchInput.pressSequentially('Skyline', { delay: 100 });
    
    // Wait for the filtering to settle. 
    // Instead of waitForTimeout, we wait for the non-matching elements to disappear
    // or for the count to be specific if we know the database.
    // 'Mazda Autozam' should not be visible.
    await expect(page.locator('article', { hasText: 'Mazda Autozam' })).not.toBeVisible();
    
    const visibleCards = page.locator('article:visible');
    const count = await visibleCards.count();
    
    expect(count).toBeGreaterThan(0);
    
    for (let i = 0; i < count; i++) {
      const card = visibleCards.nth(i);
      const title = await card.locator('h3').textContent();
      const series = await card.locator('span').first().textContent();
      const combinedText = `${title} ${series}`.toLowerCase();
      
      expect(combinedText).toContain('skyline');
    }
  });

  test('series filter should work', async ({ page }) => {
    const filter = page.locator('select');
    await filter.selectOption('HW Exotics');
    
    // Wait for 'Mazda Autozam' (HW Dream Garage) to disappear
    await expect(page.locator('article', { hasText: 'Mazda Autozam' })).not.toBeVisible();
    
    const visibleCards = page.locator('article:visible');
    const count = await visibleCards.count();
    
    expect(count).toBeGreaterThan(0);
    
    for (let i = 0; i < count; i++) {
      await expect(visibleCards.nth(i)).toContainText(/HW Exotics/i);
    }
  });
});
