import { Page, expect } from '@playwright/test';

/**
 * Helper functions for booking operations in E2E tests
 */

export interface TestBooking {
  dateFrom: Date;
  dateTo: Date;
  note?: string;
}

/**
 * Generate a test booking with dates in the future
 */
export function generateTestBooking(): TestBooking {
  const today = new Date();
  const dateFrom = new Date(today);
  dateFrom.setDate(today.getDate() + 2); // Start in 2 days

  const dateTo = new Date(dateFrom);
  dateTo.setDate(dateFrom.getDate() + 5); // 5 days duration

  return {
    dateFrom,
    dateTo,
    note: `Testowa rezerwacja utworzona ${new Date().toLocaleString()}`,
  };
}

/**
 * Create a booking for an item (from item details page)
 */
export async function createBooking(page: Page, booking: TestBooking): Promise<void> {
  // Should be on item details page
  // Click "Rezerwuj" button
  await page.getByRole('button', { name: /rezerwuj|book/i }).click();

  // Wait for modal to appear
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

  // Fill date from
  const dateFromInput = page.getByLabel(/data od|od kiedy/i);
  await dateFromInput.fill(formatDateForInput(booking.dateFrom));

  // Fill date to
  const dateToInput = page.getByLabel(/data do|do kiedy/i);
  await dateToInput.fill(formatDateForInput(booking.dateTo));

  // Fill note if provided
  if (booking.note) {
    const noteTextarea = page.getByLabel(/notatka|uwagi/i);
    await noteTextarea.fill(booking.note);
  }

  // Submit booking
  await page.getByRole('button', { name: /wyślij prośbę|zarezerwuj/i }).click();

  // Wait for confirmation
  await expect(page.getByText(/prośba wysłana|rezerwacja utworzona/i)).toBeVisible({
    timeout: 5000,
  });
}

/**
 * Navigate to "My Bookings" page (as borrower)
 */
export async function goToMyBookings(page: Page): Promise<void> {
  await page.goto('/my-bookings');
  await expect(page.getByText(/moje wypożyczenia/i)).toBeVisible({ timeout: 5000 });
}

/**
 * Navigate to "My Items Requests" page (as owner)
 */
export async function goToMyItemsRequests(page: Page): Promise<void> {
  await page.goto('/my-items-requests');
  await expect(page.getByText(/prośby o moje przedmioty|prośby oczekujące/i)).toBeVisible({
    timeout: 5000,
  });
}

/**
 * Approve a booking request (as owner)
 */
export async function approveBooking(page: Page, itemName: string): Promise<void> {
  // Should be on my-items-requests page
  // Find the booking card for the item
  const bookingCard = page.locator(`text=${itemName}`).locator('..').locator('..');

  // Click approve button
  await bookingCard.getByRole('button', { name: /akceptuj|approve/i }).click();

  // Wait for status change
  await expect(page.getByText(/zatwierdzone|approved/i)).toBeVisible({ timeout: 5000 });
}

/**
 * Reject a booking request (as owner)
 */
export async function rejectBooking(
  page: Page,
  itemName: string,
  reason?: string
): Promise<void> {
  // Should be on my-items-requests page
  const bookingCard = page.locator(`text=${itemName}`).locator('..').locator('..');

  // Click reject button
  await bookingCard.getByRole('button', { name: /odrzuć|reject/i }).click();

  // Wait for modal
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

  // Fill rejection reason if provided
  if (reason) {
    await page.getByLabel(/powód|reason/i).fill(reason);
  }

  // Confirm rejection
  await page.getByRole('button', { name: /potwierdź|confirm/i }).click();

  // Wait for status change
  await expect(page.getByText(/odrzucone|rejected/i)).toBeVisible({ timeout: 5000 });
}

/**
 * Confirm item handover (as owner)
 */
export async function confirmHandover(page: Page, itemName: string): Promise<void> {
  // Should be on my-items-requests page
  const bookingCard = page.locator(`text=${itemName}`).locator('..').locator('..');

  // Click confirm handover button
  await bookingCard.getByRole('button', { name: /potwierdź przekazanie|confirm handover/i }).click();

  // Wait for modal confirmation
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

  // Confirm in modal
  await page.getByRole('button', { name: /potwierdź|confirm|tak|yes/i }).click();

  // Wait for status change
  await expect(page.getByText(/w trakcie|in progress/i)).toBeVisible({ timeout: 5000 });
}

/**
 * Confirm item return (as owner)
 */
export async function confirmReturn(page: Page, itemName: string): Promise<void> {
  // Should be on my-items-requests page
  const bookingCard = page.locator(`text=${itemName}`).locator('..').locator('..');

  // Click confirm return button
  await bookingCard.getByRole('button', { name: /potwierdź zwrot|confirm return/i }).click();

  // Wait for modal confirmation
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

  // Confirm in modal
  await page.getByRole('button', { name: /potwierdź|confirm|tak|yes/i }).click();

  // Wait for status change
  await expect(page.getByText(/zwrócone|returned/i)).toBeVisible({ timeout: 5000 });
}

/**
 * Helper to format date for input fields (YYYY-MM-DD)
 */
function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
