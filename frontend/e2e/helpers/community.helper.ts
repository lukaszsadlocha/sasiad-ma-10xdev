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
export async function createCommunity(page: Page, community: TestCommunity): Promise<void> {
  // Navigate to create community page
  await page.goto('/create-community');

  // Fill form
  await page.getByLabel(/nazwa/i).fill(community.name);

  if (community.description) {
    await page.getByLabel(/opis/i).fill(community.description);
  }

  // Submit
  await page.getByRole('button', { name: /utwórz|stwórz|zapisz/i }).click();

  // Wait for redirect to dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });

  // Verify community was created
  await expect(page.getByText(community.name)).toBeVisible({ timeout: 5000 });
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
