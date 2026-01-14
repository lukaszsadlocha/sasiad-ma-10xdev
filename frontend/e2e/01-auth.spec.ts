import { test, expect } from '@playwright/test';
import { generateTestUser, registerUser, loginUser, logoutUser } from './helpers/auth.helper';

/**
 * E2E Tests for Authentication (US-001)
 * Tests registration, login, and logout functionality
 */

test.describe('Authentication', () => {
  test('should register a new user successfully', async ({ page }) => {
    const user = generateTestUser('auth_test');

    await registerUser(page, user);

    // Verify we're on dashboard or create-community page
    expect(page.url()).toMatch(/\/(dashboard|create-community)/);

    // Verify user name is displayed (first occurrence is enough)
    await expect(page.getByText(user.preferredName).first()).toBeVisible({ timeout: 5000 });
  });

  test('should login with existing user', async ({ page }) => {
    // First register a user
    const user = generateTestUser('login_test');
    await registerUser(page, user);

    // Logout
    await logoutUser(page);

    // Login again
    await loginUser(page, user.email, user.password);

    // Verify we're on dashboard
    expect(page.url()).toContain('/dashboard');
    await expect(page.getByText(user.preferredName).first()).toBeVisible({ timeout: 5000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/email/i).fill('nonexistent@test.com');
    await page.getByLabel(/hasło/i).fill('WrongPassword123!');

    await page.getByRole('button', { name: /zaloguj/i }).click();

    // Should show error message
    await expect(page.getByText(/nieprawidłowy|błąd|error/i)).toBeVisible({ timeout: 5000 });

    // Should stay on login page
    expect(page.url()).toContain('/login');
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/register');

    const user = generateTestUser('password_test');

    await page.getByLabel(/email/i).fill(user.email);

    // Try weak password
    await page.getByLabel(/^hasło$/i).fill('weak');

    await page.getByLabel(/imię|preferowana nazwa/i).fill(user.preferredName);

    await page.getByRole('checkbox', { name: /akceptuję|zgadzam się/i }).check();

    // Try to submit
    await page.getByRole('button', { name: /zarejestruj|utwórz konto/i }).click();

    // Should show validation error
    await expect(
      page.getByText(/hasło musi zawierać|minimum 8|wielką literę|cyfrę/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('should require terms acceptance', async ({ page }) => {
    await page.goto('/register');

    const user = generateTestUser('terms_test');

    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/^hasło$/i).fill(user.password);
    await page.getByLabel(/potwierdź hasło|powtórz hasło|hasło ponownie/i).fill(user.password);
    await page.getByLabel(/imię|preferowana nazwa/i).fill(user.preferredName);

    // Don't check the terms checkbox

    // Try to submit
    await page.getByRole('button', { name: /zarejestruj|utwórz konto/i }).click();

    // Should show validation error or prevent submission
    // (implementation depends on frontend validation)
    // Either the button is disabled or an error message appears
    const isStillOnRegister = page.url().includes('/register');
    expect(isStillOnRegister).toBeTruthy();
  });

  test('should logout successfully', async ({ page }) => {
    // Register and login
    const user = generateTestUser('logout_test');
    await registerUser(page, user);

    // Logout
    await logoutUser(page);

    // Verify we're on login page
    expect(page.url()).toContain('/login');

    // Try to access dashboard (should redirect to login)
    await page.goto('/dashboard');
    await page.waitForURL(/\/login/, { timeout: 5000 });
  });
});
