import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Audits', () => {
  const disabledRules = ['color-contrast', 'button-name', 'heading-order'];

  test('home page should be accessible', async ({ page }) => {
    await page.goto('/DigiGarage/');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(disabledRules)
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('discover page should be accessible', async ({ page }) => {
    await page.goto('/DigiGarage/discover');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(disabledRules)
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('developer page should be accessible', async ({ page }) => {
    await page.goto('/DigiGarage/developer');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(disabledRules)
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
