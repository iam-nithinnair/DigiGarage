import { test, expect } from '@playwright/test';

test.describe('Authentication UI', () => {
  test('login page has all required elements', async ({ page }) => {
    await page.goto('/DigiGarage/login');
    
    // Check for title and subtitle
    await expect(page.locator('h1')).toHaveText(/Welcome Back/i);
    
    // Check for form fields
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    
    // Check for sign in button
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
    
    // Check for link to signup
    await expect(page.getByRole('link', { name: /Sign Up/i })).toBeVisible();
  });

  test('signup page has all required elements', async ({ page }) => {
    await page.goto('/DigiGarage/signup');
    
    // Check for main heading
    await expect(page.locator('h1')).toHaveText(/ENGINEERED FOR/i);
    
    // Check for form fields
    await expect(page.locator('input[name="full_name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirm_password"]')).toBeVisible();
    
    // Check for Create Account button
    await expect(page.getByRole('button', { name: /Create Account/i })).toBeVisible();
  });
});
