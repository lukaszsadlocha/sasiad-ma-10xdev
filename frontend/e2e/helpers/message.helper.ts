import { Page, expect } from '@playwright/test';

/**
 * Helper functions for messaging operations in E2E tests
 */

/**
 * Navigate to messages page
 */
export async function goToMessages(page: Page): Promise<void> {
  await page.goto('/messages');
  await expect(page.getByText(/wiadomości|messages/i)).toBeVisible({ timeout: 5000 });
}

/**
 * Send a message to a user (from messages page)
 */
export async function sendMessage(page: Page, recipientName: string, message: string): Promise<void> {
  // Find conversation with recipient or click on their name
  const conversationItem = page.getByText(recipientName).first();

  if (await conversationItem.isVisible()) {
    await conversationItem.click();
  }

  // Wait for chat window to load
  await page.waitForSelector('textarea', { timeout: 5000 });

  // Type message
  await page.getByPlaceholder(/wpisz wiadomość|napisz/i).fill(message);

  // Send message (Enter or button)
  await page.keyboard.press('Enter');

  // Verify message appears in chat
  await expect(page.getByText(message)).toBeVisible({ timeout: 5000 });
}

/**
 * Start conversation from item details page
 */
export async function startConversationFromItem(page: Page): Promise<void> {
  // Should be on item details page
  await page.getByRole('button', { name: /wyślij wiadomość|message/i }).click();

  // Wait for redirect to messages page
  await page.waitForURL(/\/messages/, { timeout: 5000 });
}

/**
 * Verify message received (from another user)
 */
export async function verifyMessageReceived(page: Page, messageText: string): Promise<void> {
  // Should be on messages page or refresh it
  if (!page.url().includes('/messages')) {
    await page.goto('/messages');
  } else {
    await page.reload();
  }

  // Wait for message to appear
  await expect(page.getByText(messageText)).toBeVisible({ timeout: 10000 });
}

/**
 * Open conversation with specific user
 */
export async function openConversation(page: Page, userName: string): Promise<void> {
  // Navigate to messages if not already there
  if (!page.url().includes('/messages')) {
    await page.goto('/messages');
  }

  // Click on conversation
  await page.getByText(userName).first().click();

  // Wait for chat window to be active
  await page.waitForSelector('textarea', { timeout: 5000 });
}
