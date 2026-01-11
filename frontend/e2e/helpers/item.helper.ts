import { Page, expect } from '@playwright/test';
import * as path from 'path';

/**
 * Helper functions for item operations in E2E tests
 */

export interface TestItem {
  name: string;
  category: string;
  description: string;
  photoPath?: string;
}

/**
 * Generate a unique test item
 */
export function generateTestItem(prefix: string = 'Przedmiot'): TestItem {
  const timestamp = Date.now();
  const categories = [
    'Narzędzia ogrodowe',
    'Narzędzia budowlane',
    'Sprzęt dziecięcy',
    'Sport',
    'Elektronika',
    'Książki',
    'Kuchnia',
    'Inne',
  ];

  return {
    name: `${prefix} Test ${timestamp}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    description: `Testowy przedmiot dodany ${new Date().toLocaleString()}`,
  };
}

/**
 * Create a test image file for upload
 */
export function getTestImagePath(): string {
  // Create a simple test image path (you should have a test image in e2e/fixtures)
  return path.resolve(__dirname, '../fixtures/test-image.jpg');
}

/**
 * Add a new item via UI
 */
export async function addItem(page: Page, item: TestItem): Promise<void> {
  // Navigate to add item page
  await page.goto('/add-item');

  // Fill form
  await page.getByLabel(/nazwa/i).fill(item.name);

  // Select category
  await page.getByLabel(/kategoria/i).click();
  await page.getByRole('option', { name: item.category }).click();

  await page.getByLabel(/opis/i).fill(item.description);

  // Upload photo if provided
  if (item.photoPath) {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(item.photoPath);

    // Wait for preview to appear
    await page.waitForSelector('img[alt*="preview"]', { timeout: 5000 });
  }

  // Submit
  await page.getByRole('button', { name: /dodaj|zapisz|opublikuj/i }).click();

  // Wait for redirect to items list or dashboard
  await page.waitForURL(/\/(items|dashboard|my-items)/, { timeout: 10000 });

  // Verify item was created
  await expect(page.getByText(item.name)).toBeVisible({ timeout: 5000 });
}

/**
 * Search for an item by name
 */
export async function findItemByName(page: Page, itemName: string): Promise<void> {
  // Navigate to items page
  await page.goto('/items');

  // Find item card
  await expect(page.getByText(itemName)).toBeVisible({ timeout: 5000 });
}

/**
 * Open item details
 */
export async function openItemDetails(page: Page, itemName: string): Promise<void> {
  // Navigate to items page if not already there
  if (!page.url().includes('/items')) {
    await page.goto('/items');
  }

  // Click on item card
  await page.getByText(itemName).click();

  // Wait for details page to load
  await page.waitForURL(/\/items\/\d+/, { timeout: 5000 });

  // Verify we're on the details page
  await expect(page.getByText(itemName)).toBeVisible({ timeout: 5000 });
}

/**
 * Mark item as unavailable
 */
export async function markItemAsUnavailable(page: Page): Promise<void> {
  // Should be on item details page
  await page.getByRole('button', { name: /oznacz jako niedostępny/i }).click();

  // Wait for status to update
  await expect(page.getByText(/niedostępny/i)).toBeVisible({ timeout: 5000 });
}

/**
 * Mark item as available
 */
export async function markItemAsAvailable(page: Page): Promise<void> {
  // Should be on item details page
  await page.getByRole('button', { name: /oznacz jako dostępny/i }).click();

  // Wait for status to update
  await expect(page.getByText(/dostępny/i)).toBeVisible({ timeout: 5000 });
}
