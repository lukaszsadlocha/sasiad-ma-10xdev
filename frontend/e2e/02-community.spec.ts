import { test, expect } from '@playwright/test';
import { generateTestUser, registerUser } from './helpers/auth.helper';
import {
  generateTestCommunity,
  createCommunity,
  generateInviteLink,
  joinCommunityViaLink,
} from './helpers/community.helper';

/**
 * E2E Tests for Community Management (US-002, US-003, US-004)
 * Tests community creation, invite links, and joining
 */

test.describe('Community Management', () => {
  test('should create a new community (US-002)', async ({ page }) => {
    // Register user
    const user = generateTestUser('community_creator');
    await registerUser(page, user);

    // Create community
    const community = generateTestCommunity('Osiedle Testowe');
    await createCommunity(page, community);

    // Verify community is displayed on dashboard
    await expect(page.getByText(community.name)).toBeVisible({ timeout: 5000 });

    // Verify user is admin (can see admin features)
    await expect(page.getByRole('button', { name: /wygeneruj link|zaproś/i })).toBeVisible({
      timeout: 5000,
    });
  });

  test('should generate invite link (US-003)', async ({ page }) => {
    // Register user and create community
    const user = generateTestUser('invite_generator');
    await registerUser(page, user);

    const community = generateTestCommunity('Osiedle Zaproszenia');
    await createCommunity(page, community);

    // Generate invite link
    const inviteLink = await generateInviteLink(page);

    // Verify link format
    expect(inviteLink).toMatch(/\/invite\/[a-f0-9-]+/i);
  });

  test('should join community via invite link (US-004)', async ({ page, context }) => {
    // User A: Create community and get invite link
    const userA = generateTestUser('user_a');
    await registerUser(page, userA);

    const community = generateTestCommunity('Osiedle Wspólne');
    await createCommunity(page, community);

    const inviteLink = await generateInviteLink(page);

    // Logout user A
    await page.getByRole('button', { name: /wyloguj/i }).click();

    // User B: Register with invite link
    const userB = generateTestUser('user_b');

    // Navigate to invite page
    const token = inviteLink.split('/invite/')[1];
    await page.goto(`/invite/${token}`);

    // Should show community name
    await expect(page.getByText(community.name)).toBeVisible({ timeout: 5000 });

    // Register through invite flow
    await page.getByLabel(/email/i).fill(userB.email);
    await page.getByLabel(/hasło(?!\s+ponownie)/i).first().fill(userB.password);
    await page.getByLabel(/powtórz hasło|hasło ponownie/i).fill(userB.password);
    await page.getByLabel(/imię|preferowana nazwa/i).fill(userB.preferredName);
    await page.getByRole('checkbox', { name: /akceptuję|zgadzam się/i }).check();
    await page.getByRole('button', { name: /zarejestruj|dołącz/i }).click();

    // Should redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Verify user B is in the community
    await expect(page.getByText(community.name)).toBeVisible({ timeout: 5000 });

    // User B should not be admin (no invite button)
    await expect(page.getByRole('button', { name: /wygeneruj link|zaproś/i })).not.toBeVisible();
  });

  test('should prevent joining multiple communities (MVP constraint)', async ({ page }) => {
    // User creates and joins first community
    const user = generateTestUser('multi_community');
    await registerUser(page, user);

    const community1 = generateTestCommunity('Pierwsze Osiedle');
    await createCommunity(page, community1);

    // Create second community in another browser context
    const page2 = await page.context().newPage();
    const admin2 = generateTestUser('admin2');
    await registerUser(page2, admin2);

    const community2 = generateTestCommunity('Drugie Osiedle');
    await createCommunity(page2, community2);

    const inviteLink2 = await generateInviteLink(page2);
    await page2.close();

    // Try to join second community with first user
    const token2 = inviteLink2.split('/invite/')[1];
    await page.goto(`/invite/${token2}`);

    // Should show error (already in a community)
    await expect(
      page.getByText(/już należysz|already member|jedna społeczność/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('should show community details on dashboard', async ({ page }) => {
    // Register and create community
    const user = generateTestUser('dashboard_test');
    await registerUser(page, user);

    const community = generateTestCommunity('Osiedle Dashboard');
    await createCommunity(page, community);

    // Verify dashboard shows:
    // - Community name
    await expect(page.getByText(community.name)).toBeVisible({ timeout: 5000 });

    // - Admin status or member count (if implemented)
    // - Navigation to items
    await expect(page.getByRole('link', { name: /przedmioty|items|przeglądaj/i })).toBeVisible({
      timeout: 5000,
    });
  });
});
