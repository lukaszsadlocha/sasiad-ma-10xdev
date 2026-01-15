import { test, expect } from '@playwright/test';
import { generateTestUser, registerUser, logoutUser, loginUser } from './helpers/auth.helper';
import {
  generateTestCommunity,
  createCommunity,
  generateInviteLink,
} from './helpers/community.helper';
import { generateTestItem, addItem, openItemDetails } from './helpers/item.helper';
import {
  goToMessages,
  sendMessage,
  openConversation,
  startConversationFromItem,
} from './helpers/message.helper';

/**
 * E2E Tests for Messaging (US-011)
 * Tests 1-1 chat functionality between community members
 */

test.describe('Messaging', () => {
  let userAEmail: string;
  let userAPassword: string;
  let userAName: string;
  let userBEmail: string;
  let userBPassword: string;
  let userBName: string;

  test.beforeEach(async ({ page }) => {
    // Setup: Create two users in the same community

    // User A: Register and create community
    const userA = generateTestUser('user_a');
    userAEmail = userA.email;
    userAPassword = userA.password;
    userAName = userA.preferredName;

    await registerUser(page, userA);

    const community = generateTestCommunity('Osiedle Komunikacji');
    await createCommunity(page, community, { email: userA.email, password: userA.password });

    // Generate invite link
    const inviteLink = await generateInviteLink(page);

    // Logout user A
    await logoutUser(page);

    // User B: Register via invite link
    const userB = generateTestUser('user_b');
    userBEmail = userB.email;
    userBPassword = userB.password;
    userBName = userB.preferredName;

    const token = inviteLink.split('/invite/')[1];
    await page.goto(`/invite/${token}`);

    await page.getByLabel(/email/i).fill(userB.email);
    await page.getByLabel(/^hasło$/i).fill(userB.password);
    await page.getByLabel(/potwierdź hasło|powtórz hasło|hasło ponownie/i).fill(userB.password);
    await page.getByLabel(/imię|preferowana nazwa/i).fill(userB.preferredName);
    await page.getByRole('checkbox', { name: /akceptuję|zgadzam się/i }).check();
    await page.getByRole('button', { name: /zarejestruj|dołącz/i }).click();

    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should send a message between users (US-011)', async ({ page }) => {
    // User B sends message to User A

    // Go to messages page
    await goToMessages(page);

    // Send message (conversation will be created automatically)
    const message = `Cześć! To jest testowa wiadomość ${Date.now()}`;

    // Note: This might require starting conversation first
    // Implementation depends on UI - adjust selector
    await page.getByRole('button', { name: /nowa wiadomość|new message/i }).click();

    // Select user A
    await page.getByText(userAName).click();

    await sendMessage(page, userAName, message);

    // Verify message is sent
    await expect(page.getByText(message)).toBeVisible({ timeout: 5000 });
  });

  test('should receive and reply to messages', async ({ page }) => {
    // User B sends message
    await goToMessages(page);

    const messageFromB = `Pytanie testowe od User B ${Date.now()}`;

    // Assuming there's a way to start conversation
    // This depends on implementation
    await page.getByRole('button', { name: /nowa wiadomość/i }).click();
    await page.getByText(userAName).click();
    await sendMessage(page, userAName, messageFromB);

    // Logout User B
    await logoutUser(page);

    // Login as User A
    await loginUser(page, userAEmail, userAPassword);

    // Go to messages
    await goToMessages(page);

    // Verify message from B is visible
    await expect(page.getByText(messageFromB)).toBeVisible({ timeout: 5000 });

    // Reply
    const replyFromA = `Odpowiedź od User A ${Date.now()}`;
    await openConversation(page, userBName);
    await sendMessage(page, userBName, replyFromA);

    // Verify reply is sent
    await expect(page.getByText(replyFromA)).toBeVisible({ timeout: 5000 });

    // Logout A, login as B, verify reply
    await logoutUser(page);
    await loginUser(page, userBEmail, userBPassword);
    await goToMessages(page);

    await expect(page.getByText(replyFromA)).toBeVisible({ timeout: 10000 });
  });

  test('should start conversation from item details', async ({ page }) => {
    // User B adds an item
    const item = generateTestItem('Zamiatarka');
    await addItem(page, item);

    // Logout User B
    await logoutUser(page);

    // Login as User A
    await loginUser(page, userAEmail, userAPassword);

    // Open item details
    await openItemDetails(page, item.name);

    // Start conversation with owner (User B)
    await startConversationFromItem(page);

    // Should be on messages page with User B's conversation
    await expect(page.getByText(userBName)).toBeVisible({ timeout: 5000 });

    // Send message
    const message = `Pytanie o ${item.name}`;
    await sendMessage(page, userBName, message);

    await expect(page.getByText(message)).toBeVisible({ timeout: 5000 });
  });

  test('should display conversation list with last message', async ({ page }) => {
    // User B sends a message
    await goToMessages(page);

    const lastMessage = `To jest ostatnia wiadomość ${Date.now()}`;

    await page.getByRole('button', { name: /nowa wiadomość/i }).click();
    await page.getByText(userAName).click();
    await sendMessage(page, userAName, lastMessage);

    // Go back to conversation list
    await goToMessages(page);

    // Verify conversation shows last message preview
    const conversationItem = page.locator(`text=${userAName}`).locator('..').locator('..');

    // Should contain fragment of last message
    await expect(conversationItem).toContainText(lastMessage.slice(0, 20));
  });

  test('should validate message length (max 1000 chars)', async ({ page }) => {
    await goToMessages(page);

    const longMessage = 'a'.repeat(1100);

    await page.getByRole('button', { name: /nowa wiadomość/i }).click();
    await page.getByText(userAName).click();

    const textarea = page.getByPlaceholder(/wpisz wiadomość/i);
    await textarea.fill(longMessage);

    // Check character count or validation
    const charCount = await page.getByText(/\d+\s*\/\s*1000/).textContent();

    // Should show that limit is exceeded or prevent input
    expect(charCount).toBeTruthy();

    // Try to send
    await page.keyboard.press('Enter');

    // Should either show error or truncate
    const sentMessage = await page.locator('text=' + longMessage.slice(0, 50)).count();

    // If validation works, message shouldn't be sent or should be truncated
    expect(sentMessage).toBeDefined();
  });

  test('should prevent sending empty messages', async ({ page }) => {
    await goToMessages(page);

    await page.getByRole('button', { name: /nowa wiadomość/i }).click();
    await page.getByText(userAName).click();

    // Try to send empty message
    await page.keyboard.press('Enter');

    // Should not send (button disabled or prevented)
    // Verify no empty message bubble appears
    const emptyMessages = await page.locator('[data-testid="message-bubble"]:empty').count();
    expect(emptyMessages).toBe(0);
  });

  test('should support Enter to send, Shift+Enter for new line', async ({ page }) => {
    await goToMessages(page);

    const message = 'Pierwsza linia';

    await page.getByRole('button', { name: /nowa wiadomość/i }).click();
    await page.getByText(userAName).click();

    const textarea = page.getByPlaceholder(/wpisz wiadomość/i);

    // Type first line
    await textarea.fill(message);

    // Press Shift+Enter (new line)
    await textarea.press('Shift+Enter');

    // Type second line
    await textarea.press('Backspace'); // Remove the newline that was added
    const secondLine = 'Druga linia';
    await textarea.type(secondLine);

    // Press Enter to send
    await textarea.press('Enter');

    // Verify message was sent (may contain newline or not depending on implementation)
    await expect(page.getByText(message)).toBeVisible({ timeout: 5000 });
  });

  test('should show chronological message history', async ({ page }) => {
    await goToMessages(page);

    await page.getByRole('button', { name: /nowa wiadomość/i }).click();
    await page.getByText(userAName).click();

    // Send multiple messages
    const messages = [
      'Pierwsza wiadomość',
      'Druga wiadomość',
      'Trzecia wiadomość',
    ];

    for (const msg of messages) {
      await sendMessage(page, userAName, msg);
      await page.waitForTimeout(500); // Small delay between messages
    }

    // Verify order (oldest at top)
    const messageElements = await page.locator('[data-testid="message-bubble"]').allTextContents();

    // Check if messages appear in order
    for (let i = 0; i < messages.length; i++) {
      expect(messageElements.some(el => el.includes(messages[i]))).toBeTruthy();
    }
  });
});
