import { test, expect } from '@playwright/test';
import { generateTestUser, registerUser, logoutUser, loginUser } from './helpers/auth.helper';
import {
  generateTestCommunity,
  createCommunity,
  generateInviteLink,
} from './helpers/community.helper';
import { generateTestItem, addItem, openItemDetails } from './helpers/item.helper';
import {
  generateTestBooking,
  createBooking,
  goToMyItemsRequests,
  approveBooking,
  confirmHandover,
  confirmReturn,
} from './helpers/booking.helper';
import { goToMessages, sendMessage } from './helpers/message.helper';

/**
 * E2E Test: Complete Application Flow
 *
 * This test covers the entire user journey from PRD (Section 7.9):
 * 1. Register User A
 * 2. Create community
 * 3. Generate invite link
 * 4. Register User B via invite
 * 5. User A adds item
 * 6. User B books item
 * 7. User A approves booking
 * 8. Exchange messages
 * 9. User A confirms handover
 * 10. User A confirms return
 *
 * This is the critical validation flow for the Micro-MVP.
 */

test.describe('Full Application Flow (Critical Path)', () => {
  test('should complete full borrowing cycle', async ({ page, context }) => {
    test.setTimeout(120000); // 2 minutes timeout for full flow

    // ========================================
    // STEP 1: Register User A (Owner)
    // ========================================
    console.log('Step 1: Registering User A (Owner)...');

    const userA = generateTestUser('owner_full_flow');
    await registerUser(page, userA);

    console.log(`✓ User A registered: ${userA.email}`);

    // ========================================
    // STEP 2: Create Community
    // ========================================
    console.log('Step 2: Creating community...');

    const community = generateTestCommunity('Osiedle Full Test');
    await createCommunity(page, community);

    await expect(page.getByText(community.name)).toBeVisible({ timeout: 5000 });
    console.log(`✓ Community created: ${community.name}`);

    // ========================================
    // STEP 3: Generate Invite Link
    // ========================================
    console.log('Step 3: Generating invite link...');

    const inviteLink = await generateInviteLink(page);

    expect(inviteLink).toMatch(/\/invite\/[a-f0-9-]+/i);
    console.log(`✓ Invite link generated: ${inviteLink}`);

    // ========================================
    // STEP 4: Add Item (User A)
    // ========================================
    console.log('Step 4: Adding item...');

    const item = generateTestItem('Wiertarka Full Test');
    await addItem(page, item);

    await expect(page.getByText(item.name)).toBeVisible({ timeout: 5000 });
    console.log(`✓ Item added: ${item.name}`);

    // Logout User A
    await logoutUser(page);

    // ========================================
    // STEP 5: Register User B via Invite (Borrower)
    // ========================================
    console.log('Step 5: Registering User B (Borrower) via invite...');

    const userB = generateTestUser('borrower_full_flow');

    const token = inviteLink.split('/invite/')[1];
    await page.goto(`/invite/${token}`);

    await expect(page.getByText(community.name)).toBeVisible({ timeout: 5000 });

    await page.getByLabel(/email/i).fill(userB.email);
    await page.getByLabel(/hasło(?!\s+ponownie)/i).first().fill(userB.password);
    await page.getByLabel(/powtórz hasło|hasło ponownie/i).fill(userB.password);
    await page.getByLabel(/imię|preferowana nazwa/i).fill(userB.preferredName);
    await page.getByRole('checkbox', { name: /akceptuję|zgadzam się/i }).check();
    await page.getByRole('button', { name: /zarejestruj|dołącz/i }).click();

    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.getByText(community.name)).toBeVisible({ timeout: 5000 });

    console.log(`✓ User B registered and joined: ${userB.email}`);

    // ========================================
    // STEP 6: User B Books Item
    // ========================================
    console.log('Step 6: User B creating booking...');

    await openItemDetails(page, item.name);

    const booking = generateTestBooking();
    await createBooking(page, booking);

    console.log('✓ Booking created');

    // Logout User B
    await logoutUser(page);

    // ========================================
    // STEP 7: User A Approves Booking
    // ========================================
    console.log('Step 7: User A approving booking...');

    await loginUser(page, userA.email, userA.password);

    await goToMyItemsRequests(page);

    await expect(page.getByText(item.name)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/oczekujące|pending/i)).toBeVisible({ timeout: 5000 });

    await approveBooking(page, item.name);

    await expect(page.getByText(/zatwierdzone|approved/i)).toBeVisible({ timeout: 5000 });
    console.log('✓ Booking approved');

    // ========================================
    // STEP 8: Exchange Messages
    // ========================================
    console.log('Step 8: Exchanging messages...');

    // User A sends message to User B
    await goToMessages(page);

    const messageFromA = `Cześć ${userB.preferredName}! Możesz odebrać przedmiot jutro.`;

    // Find conversation or start new one
    await page.getByText(userB.preferredName).first().click();
    await page.getByPlaceholder(/wpisz wiadomość/i).fill(messageFromA);
    await page.keyboard.press('Enter');

    await expect(page.getByText(messageFromA)).toBeVisible({ timeout: 5000 });
    console.log('✓ Message from A sent');

    // Logout User A
    await logoutUser(page);

    // User B replies
    await loginUser(page, userB.email, userB.password);
    await goToMessages(page);

    await expect(page.getByText(messageFromA)).toBeVisible({ timeout: 10000 });

    const messageFromB = 'Świetnie! Dziękuję, do zobaczenia!';
    await page.getByText(userA.preferredName).first().click();
    await page.getByPlaceholder(/wpisz wiadomość/i).fill(messageFromB);
    await page.keyboard.press('Enter');

    await expect(page.getByText(messageFromB)).toBeVisible({ timeout: 5000 });
    console.log('✓ Message from B sent');

    // Logout User B
    await logoutUser(page);

    // ========================================
    // STEP 9: User A Confirms Handover
    // ========================================
    console.log('Step 9: User A confirming handover...');

    await loginUser(page, userA.email, userA.password);
    await goToMyItemsRequests(page);

    await confirmHandover(page, item.name);

    await expect(page.getByText(/w trakcie|in progress/i)).toBeVisible({ timeout: 5000 });
    console.log('✓ Handover confirmed');

    // Verify item status changed to "Wypożyczony"
    await page.goto('/items');
    const itemCard = page.locator(`text=${item.name}`).locator('..').locator('..');
    await expect(itemCard.getByText(/wypożyczony|borrowed/i)).toBeVisible({ timeout: 5000 });
    console.log('✓ Item status: Borrowed');

    // ========================================
    // STEP 10: User A Confirms Return
    // ========================================
    console.log('Step 10: User A confirming return...');

    await goToMyItemsRequests(page);

    await confirmReturn(page, item.name);

    await expect(page.getByText(/zwrócone|returned/i)).toBeVisible({ timeout: 5000 });
    console.log('✓ Return confirmed');

    // Verify item status changed back to "Dostępny"
    await page.goto('/items');
    const updatedItemCard = page.locator(`text=${item.name}`).locator('..').locator('..');
    await expect(updatedItemCard.getByText(/dostępny|available/i)).toBeVisible({
      timeout: 5000,
    });
    console.log('✓ Item status: Available');

    // ========================================
    // FINAL VERIFICATION
    // ========================================
    console.log('Final verification...');

    // User B should see booking as "Zwrócone" in history
    await logoutUser(page);
    await loginUser(page, userB.email, userB.password);

    await page.goto('/my-bookings');
    await expect(page.getByText(item.name)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/zwrócone|returned/i)).toBeVisible({ timeout: 5000 });

    console.log('✓✓✓ FULL FLOW COMPLETED SUCCESSFULLY ✓✓✓');
    console.log('');
    console.log('Summary:');
    console.log(`- User A (Owner): ${userA.email}`);
    console.log(`- User B (Borrower): ${userB.email}`);
    console.log(`- Community: ${community.name}`);
    console.log(`- Item: ${item.name}`);
    console.log('- Booking: Created → Approved → Handover → Return');
    console.log('- Messages: Exchanged successfully');
    console.log('');
    console.log('🎉 Micro-MVP Critical Flow VALIDATED! 🎉');
  });

  test('should handle booking rejection flow', async ({ page }) => {
    test.setTimeout(90000); // 1.5 minutes

    console.log('Testing rejection flow...');

    // Setup: Register users, create community, add item
    const userA = generateTestUser('owner_reject');
    await registerUser(page, userA);

    const community = generateTestCommunity('Osiedle Reject');
    await createCommunity(page, community);

    const item = generateTestItem('Przedmiot Reject');
    await addItem(page, item);

    const inviteLink = await generateInviteLink(page);
    await logoutUser(page);

    // User B joins and books
    const userB = generateTestUser('borrower_reject');
    const token = inviteLink.split('/invite/')[1];
    await page.goto(`/invite/${token}`);

    await page.getByLabel(/email/i).fill(userB.email);
    await page.getByLabel(/hasło(?!\s+ponownie)/i).first().fill(userB.password);
    await page.getByLabel(/powtórz hasło|hasło ponownie/i).fill(userB.password);
    await page.getByLabel(/imię|preferowana nazwa/i).fill(userB.preferredName);
    await page.getByRole('checkbox', { name: /akceptuję|zgadzam się/i }).check();
    await page.getByRole('button', { name: /zarejestruj|dołącz/i }).click();

    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    await openItemDetails(page, item.name);
    const booking = generateTestBooking();
    await createBooking(page, booking);

    await logoutUser(page);

    // User A rejects with reason
    await loginUser(page, userA.email, userA.password);
    await goToMyItemsRequests(page);

    const rejectionReason = 'Niestety przedmiot jest zajęty w tym terminie';

    const bookingCard = page.locator(`text=${item.name}`).locator('..').locator('..');
    await bookingCard.getByRole('button', { name: /odrzuć|reject/i }).click();

    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.getByLabel(/powód|reason/i).fill(rejectionReason);
    await page.getByRole('button', { name: /potwierdź|confirm/i }).click();

    await expect(page.getByText(/odrzucone|rejected/i)).toBeVisible({ timeout: 5000 });

    console.log('✓ Booking rejected');

    // Verify User B sees rejection with reason
    await logoutUser(page);
    await loginUser(page, userB.email, userB.password);

    await page.goto('/my-bookings');
    await expect(page.getByText(/odrzucone|rejected/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(rejectionReason)).toBeVisible({ timeout: 5000 });

    console.log('✓ User B sees rejection reason');
    console.log('✓✓✓ REJECTION FLOW COMPLETED ✓✓✓');
  });
});
