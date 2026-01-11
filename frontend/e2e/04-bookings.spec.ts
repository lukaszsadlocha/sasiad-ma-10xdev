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
  goToMyBookings,
  goToMyItemsRequests,
  approveBooking,
  rejectBooking,
  confirmHandover,
  confirmReturn,
} from './helpers/booking.helper';

/**
 * E2E Tests for Bookings (US-008, US-009, US-010)
 * Tests booking creation, approval/rejection, handover, and return
 */

test.describe('Booking Management', () => {
  let ownerEmail: string;
  let ownerPassword: string;
  let borrowerEmail: string;
  let borrowerPassword: string;
  let itemName: string;

  test.beforeEach(async ({ page, context }) => {
    // Setup: Create two users in the same community

    // User A (Owner): Register and create community
    const owner = generateTestUser('owner');
    ownerEmail = owner.email;
    ownerPassword = owner.password;

    await registerUser(page, owner);

    const community = generateTestCommunity('Osiedle Rezerwacji');
    await createCommunity(page, community);

    // Add an item
    const item = generateTestItem('Młot Udarowy');
    itemName = item.name;
    await addItem(page, item);

    // Generate invite link
    const inviteLink = await generateInviteLink(page);

    // Logout owner
    await logoutUser(page);

    // User B (Borrower): Register via invite link
    const borrower = generateTestUser('borrower');
    borrowerEmail = borrower.email;
    borrowerPassword = borrower.password;

    const token = inviteLink.split('/invite/')[1];
    await page.goto(`/invite/${token}`);

    await page.getByLabel(/email/i).fill(borrower.email);
    await page.getByLabel(/hasło(?!\s+ponownie)/i).first().fill(borrower.password);
    await page.getByLabel(/powtórz hasło|hasło ponownie/i).fill(borrower.password);
    await page.getByLabel(/imię|preferowana nazwa/i).fill(borrower.preferredName);
    await page.getByRole('checkbox', { name: /akceptuję|zgadzam się/i }).check();
    await page.getByRole('button', { name: /zarejestruj|dołącz/i }).click();

    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should create a booking request (US-008)', async ({ page }) => {
    // Borrower is already logged in
    // Find and open item
    await openItemDetails(page, itemName);

    // Create booking
    const booking = generateTestBooking();
    await createBooking(page, booking);

    // Verify booking was created
    await goToMyBookings(page);
    await expect(page.getByText(itemName)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/oczekujące|pending/i)).toBeVisible({ timeout: 5000 });
  });

  test('should approve booking request (US-009)', async ({ page }) => {
    // Borrower creates booking
    await openItemDetails(page, itemName);
    const booking = generateTestBooking();
    await createBooking(page, booking);

    // Logout borrower
    await logoutUser(page);

    // Login as owner
    await loginUser(page, ownerEmail, ownerPassword);

    // Go to requests page
    await goToMyItemsRequests(page);

    // Approve booking
    await approveBooking(page, itemName);

    // Verify status changed
    await expect(page.getByText(/zatwierdzone|approved/i)).toBeVisible({ timeout: 5000 });
  });

  test('should reject booking request (US-009)', async ({ page }) => {
    // Borrower creates booking
    await openItemDetails(page, itemName);
    const booking = generateTestBooking();
    await createBooking(page, booking);

    // Logout borrower
    await logoutUser(page);

    // Login as owner
    await loginUser(page, ownerEmail, ownerPassword);

    // Go to requests page
    await goToMyItemsRequests(page);

    // Reject booking with reason
    await rejectBooking(page, itemName, 'Przedmiot jest akurat zajęty w tym terminie');

    // Verify status changed
    await expect(page.getByText(/odrzucone|rejected/i)).toBeVisible({ timeout: 5000 });

    // Verify borrower sees rejection
    await logoutUser(page);
    await loginUser(page, borrowerEmail, borrowerPassword);
    await goToMyBookings(page);

    await expect(page.getByText(/odrzucone|rejected/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/zajęty w tym terminie/i)).toBeVisible({ timeout: 5000 });
  });

  test('should confirm item handover (US-010)', async ({ page }) => {
    // Borrower creates booking
    await openItemDetails(page, itemName);
    const booking = generateTestBooking();
    await createBooking(page, booking);

    // Owner approves
    await logoutUser(page);
    await loginUser(page, ownerEmail, ownerPassword);
    await goToMyItemsRequests(page);
    await approveBooking(page, itemName);

    // Owner confirms handover
    await confirmHandover(page, itemName);

    // Verify status changed to "W trakcie"
    await expect(page.getByText(/w trakcie|in progress/i)).toBeVisible({ timeout: 5000 });

    // Verify item status changed to "Wypożyczony"
    await page.goto('/items');
    const itemCard = page.locator(`text=${itemName}`).locator('..').locator('..');
    await expect(itemCard.getByText(/wypożyczony|borrowed/i)).toBeVisible({ timeout: 5000 });
  });

  test('should confirm item return (US-010)', async ({ page }) => {
    // Full flow: Create → Approve → Handover → Return

    // Borrower creates booking
    await openItemDetails(page, itemName);
    const booking = generateTestBooking();
    await createBooking(page, booking);

    // Owner approves
    await logoutUser(page);
    await loginUser(page, ownerEmail, ownerPassword);
    await goToMyItemsRequests(page);
    await approveBooking(page, itemName);

    // Owner confirms handover
    await confirmHandover(page, itemName);

    // Owner confirms return
    await confirmReturn(page, itemName);

    // Verify status changed to "Zwrócone"
    await expect(page.getByText(/zwrócone|returned/i)).toBeVisible({ timeout: 5000 });

    // Verify item status changed back to "Dostępny"
    await page.goto('/items');
    const itemCard = page.locator(`text=${itemName}`).locator('..').locator('..');
    await expect(itemCard.getByText(/dostępny|available/i)).toBeVisible({ timeout: 5000 });
  });

  test('should validate booking dates', async ({ page }) => {
    await openItemDetails(page, itemName);

    // Click Rezerwuj
    await page.getByRole('button', { name: /rezerwuj/i }).click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // Try to set "date to" before "date from"
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(tomorrow.getDate() + 1);

    // Set date to before date from
    await page.getByLabel(/data od/i).fill(formatDateForInput(dayAfter));
    await page.getByLabel(/data do/i).fill(formatDateForInput(tomorrow));

    // Try to submit
    await page.getByRole('button', { name: /wyślij|zarezerwuj/i }).click();

    // Should show validation error
    await expect(
      page.getByText(/data zwrotu.*późniejsza|invalid date/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('should limit booking duration to 14 days', async ({ page }) => {
    await openItemDetails(page, itemName);

    await page.getByRole('button', { name: /rezerwuj/i }).click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + 1);

    const end = new Date(start);
    end.setDate(start.getDate() + 20); // 20 days (exceeds limit)

    await page.getByLabel(/data od/i).fill(formatDateForInput(start));
    await page.getByLabel(/data do/i).fill(formatDateForInput(end));

    await page.getByRole('button', { name: /wyślij|zarezerwuj/i }).click();

    // Should show validation error
    await expect(
      page.getByText(/maksymalnie 14|maximum 14|zbyt długi/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('should show booking history', async ({ page }) => {
    // Create multiple bookings
    await openItemDetails(page, itemName);
    const booking = generateTestBooking();
    await createBooking(page, booking);

    // Go to my bookings page
    await goToMyBookings(page);

    // Verify booking is listed with all details
    await expect(page.getByText(itemName)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/oczekujące|pending/i)).toBeVisible({ timeout: 5000 });

    // Should show dates
    const dateText = await page.textContent('body');
    expect(dateText).toContain(booking.dateFrom.getDate().toString());
  });
});

/**
 * Helper to format date for input fields (YYYY-MM-DD)
 */
function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
