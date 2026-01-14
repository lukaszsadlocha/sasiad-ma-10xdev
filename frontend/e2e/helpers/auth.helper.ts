import { Page, expect } from '@playwright/test';

/**
 * Helper functions for authentication in E2E tests
 */

export interface TestUser {
  email: string;
  password: string;
  preferredName: string;
}

/**
 * Generate a unique test user with timestamp
 */
export function generateTestUser(prefix: string = 'user'): TestUser {
  const timestamp = Date.now();
  return {
    email: `${prefix}_${timestamp}@test.sasiadma.pl`,
    password: 'TestPassword123!',
    preferredName: `Test ${prefix} ${timestamp}`,
  };
}

/**
 * Register a new user via UI
 */
export async function registerUser(page: Page, user: TestUser): Promise<void> {
  await page.goto('/register');

  // Fill registration form
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/^hasło$/i).fill(user.password);
  await page.getByLabel(/potwierdź hasło|powtórz hasło|hasło ponownie/i).fill(user.password);
  await page.getByLabel(/imię|preferowana nazwa/i).fill(user.preferredName);

  // Accept terms
  await page.getByRole('checkbox', { name: /akceptuję|zgadzam się/i }).check();

  // Submit
  await page.getByRole('button', { name: /zarejestruj|utwórz konto/i }).click();

  // Wait for redirect to dashboard or community creation
  await page.waitForURL(/\/(dashboard|create-community)/, { timeout: 10000 });
}

/**
 * Login existing user via UI
 */
export async function loginUser(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');

  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/hasło/i).fill(password);

  await page.getByRole('button', { name: /zaloguj/i }).click();

  // Wait for redirect to dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

/**
 * Logout current user
 */
export async function logoutUser(page: Page): Promise<void> {
  // Click logout button (adjust selector based on your UI)
  await page.getByRole('button', { name: /wyloguj/i }).click();

  // Wait for redirect to login
  await page.waitForURL(/\/login/, { timeout: 5000 });
}

/**
 * Check if user is authenticated (on dashboard)
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  return page.url().includes('/dashboard');
}
