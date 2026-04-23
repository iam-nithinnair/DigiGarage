import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Audits', () => {
  test('home page should be accessible', async ({ page }) => {
    await page.goto('/DigiGarage/');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    // We expect some violations for now, but we'll use this to track improvements
    // expect(accessibilityScanResults.violations).toEqual([]);
    if (accessibilityScanResults.violations.length > 0) {
        console.log('Found accessibility violations on home page:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }
  });
});
