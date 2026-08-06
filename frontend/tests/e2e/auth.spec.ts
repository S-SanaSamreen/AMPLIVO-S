import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('should navigate to login page and show validation errors', async ({ page }) => {
    await page.goto('/login');
    
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Login/i);

    // Click the submit button without filling fields
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify validation errors appear
    await expect(page.getByText(/invalid email address/i)).toBeVisible();
  });

  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/register');
    
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Register/i);

    // Click the submit button
    await page.getByRole('button', { name: /create account/i }).click();

    // Verify validation errors appear
    await expect(page.getByText(/invalid email address/i)).toBeVisible();
  });
});
