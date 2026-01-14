import { Page, expect } from '@playwright/test';

/**
 * Helper functions for community operations in E2E tests
 */

export interface TestCommunity {
  name: string;
  description?: string;
}

/**
 * Generate a unique test community
 */
export function generateTestCommunity(prefix: string = 'Osiedle'): TestCommunity {
  const timestamp = Date.now();
  return {
    name: `${prefix} Test ${timestamp}`,
    description: `Testowa społeczność utworzona ${new Date().toLocaleString()}`,
  };
}

/**
 * Create a new community via UI
 */
export async function createCommunity(
  page: Page,
  community: TestCommunity,
  userCredentials?: { email: string; password: string }
): Promise<void> {
  // Navigate to create community page
  await page.goto('/create-community');

  // Fill form
  await page.getByLabel(/nazwa/i).fill(community.name);

  if (community.description) {
    await page.getByLabel(/opis/i).fill(community.description);
  }

  // Wait for API call to complete
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/communities') && response.request().method() === 'POST',
    { timeout: 10000 }
  );

  // Submit
  await page.getByRole('button', { name: /utwórz|stwórz|zapisz/i }).click();

  // Wait for API response
  const response = await responsePromise;
  const responseStatus = response.status();

  if (responseStatus !== 201 && responseStatus !== 200) {
    const responseBody = await response.text();
    throw new Error(`Failed to create community: ${responseStatus} - ${responseBody}`);
  }

  // Wait for success message or redirect
  const successMessage = page.getByText(/społeczność została utworzona/i);
  if (await successMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
    // Wait for the success message to disappear (auto-redirect)
    await successMessage.waitFor({ state: 'hidden', timeout: 5000 });
  }

  // Wait for redirect to dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });

  // WORKAROUND: AuthContext doesn't refresh user data from backend after community creation
  // (it only loads from localStorage which has stale data without communityId)
  // Solution: logout and login again to force fresh data from backend
  if (userCredentials) {
    // Import login/logout helpers
    const { loginUser, logoutUser } = await import('./auth.helper');

    await logoutUser(page);
    await loginUser(page, userCredentials.email, userCredentials.password);

    // Now dashboard should show community data
  } else {
    // Without credentials, we can't re-login, so just reload and hope for the best
    await page.reload();
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  }
}

/**
 * Generate and copy invite link
 */
export async function generateInviteLink(page: Page): Promise<string> {
  // Look for the invite link button on dashboard
  await page.getByRole('button', { name: /wygeneruj link|zaproś|invite/i }).click();

  // Wait for modal to appear
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

  // Extract the invite link from the modal
  const inviteLinkElement = page.locator('input[readonly]').or(
    page.locator('text=/invite\\/[a-f0-9-]+/i')
  );

  await expect(inviteLinkElement).toBeVisible({ timeout: 5000 });

  const inviteLink = await inviteLinkElement.first().inputValue().catch(async () => {
    // If it's not an input, try to get text content
    return await inviteLinkElement.first().textContent() || '';
  });

  // Close modal
  await page.keyboard.press('Escape');

  return inviteLink;
}

/**
 * Join community via invite link
 */
export async function joinCommunityViaLink(page: Page, inviteLink: string): Promise<void> {
  // Extract token from link
  const token = inviteLink.split('/invite/')[1];

  if (!token) {
    throw new Error(`Invalid invite link: ${inviteLink}`);
  }

  // Navigate to invite page
  await page.goto(`/invite/${token}`);

  // Wait for community info to load
  await expect(page.getByText(/dołączasz do/i)).toBeVisible({ timeout: 5000 });

  // Click join button (for already logged in users)
  const joinButton = page.getByRole('button', { name: /dołącz|join/i });

  if (await joinButton.isVisible()) {
    await joinButton.click();

    // Wait for redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  }
}
