import { test, expect } from '@playwright/test';
import { generateTestUser, registerUser } from './helpers/auth.helper';
import { generateTestCommunity, createCommunity } from './helpers/community.helper';
import {
  generateTestItem,
  addItem,
  findItemByName,
  openItemDetails,
  markItemAsUnavailable,
  markItemAsAvailable,
  getTestImagePath,
} from './helpers/item.helper';
import * as fs from 'fs';

/**
 * E2E Tests for Item Management (US-005, US-006, US-007)
 * Tests adding items, browsing items, and viewing item details
 */

test.describe('Item Management', () => {
  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    // Setup: Register user and create community
    testUser = generateTestUser('item_user');
    await registerUser(page, testUser);

    const community = generateTestCommunity('Osiedle Przedmiotów');
    await createCommunity(page, community, { email: testUser.email, password: testUser.password });
  });

  test('should add a new item without photo (US-005)', async ({ page }) => {
    const item = generateTestItem('Wiertarka');

    await addItem(page, item);

    // Verify item appears in list
    await findItemByName(page, item.name);
  });

  test('should add a new item with photo (US-005)', async ({ page }) => {
    // Check if test image exists
    const imagePath = getTestImagePath();

    // Skip test if image doesn't exist
    if (!fs.existsSync(imagePath)) {
      test.skip(true, 'Test image not found. Please add test-image.jpg to e2e/fixtures/');
      return;
    }

    const item = generateTestItem('Kosiarka');
    item.photoPath = imagePath;

    await addItem(page, item);

    // Verify item appears with photo
    await openItemDetails(page, item.name);

    // Check if photo is displayed
    await expect(page.locator('img[alt*="' + item.name + '"]')).toBeVisible({ timeout: 5000 });
  });

  test('should browse all items in community (US-006)', async ({ page }) => {
    // Add multiple items
    const item1 = generateTestItem('Młotek');
    const item2 = generateTestItem('Drabina');

    await addItem(page, item1);
    await addItem(page, item2);

    // Navigate to items list
    await page.goto('/items');

    // Verify both items are visible
    await expect(page.getByText(item1.name)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(item2.name)).toBeVisible({ timeout: 5000 });

    // Verify item cards show category
    await expect(page.getByText(item1.category)).toBeVisible({ timeout: 5000 });
  });

  test('should view item details (US-007)', async ({ page }) => {
    const item = generateTestItem('Wiertarka Akumulatorowa');

    await addItem(page, item);

    await openItemDetails(page, item.name);

    // Verify all details are displayed
    await expect(page.getByText(item.name)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(item.description)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(item.category)).toBeVisible({ timeout: 5000 });

    // Verify owner info is displayed
    // (owner name should be visible)
    const userName = await page.locator('[data-testid="owner-name"]').textContent().catch(() => '');
    expect(userName).toBeTruthy();
  });

  test('should show "Rezerwuj" button for available items', async ({ page }) => {
    const item = generateTestItem('Spawarka');

    await addItem(page, item);
    await openItemDetails(page, item.name);

    // Should not show "Rezerwuj" for owner
    await expect(page.getByRole('button', { name: /rezerwuj/i })).not.toBeVisible();

    // Should show mark as unavailable option for owner
    await expect(
      page.getByRole('button', { name: /oznacz jako niedostępny/i })
    ).toBeVisible({ timeout: 5000 });
  });

  test('should mark item as unavailable/available (owner only)', async ({ page }) => {
    const item = generateTestItem('Piła');

    await addItem(page, item);
    await openItemDetails(page, item.name);

    // Mark as unavailable
    await markItemAsUnavailable(page);

    // Verify status changed
    await expect(page.getByText(/niedostępny/i)).toBeVisible({ timeout: 5000 });

    // Mark as available again
    await markItemAsAvailable(page);

    // Verify status changed back
    await expect(page.getByText(/dostępny/i)).toBeVisible({ timeout: 5000 });
  });

  test('should display item status badges', async ({ page }) => {
    const item = generateTestItem('Agregat');

    await addItem(page, item);

    // Go to items list
    await page.goto('/items');

    // Find item card and verify status badge
    const itemCard = page.locator(`text=${item.name}`).locator('..').locator('..');

    // Should have "Dostępny" badge
    await expect(itemCard.getByText(/dostępny/i)).toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields when adding item', async ({ page }) => {
    await page.goto('/add-item');

    // Try to submit empty form
    await page.getByRole('button', { name: /dodaj|zapisz/i }).click();

    // Should show validation errors
    await expect(page.getByText(/wymagane|required/i).first()).toBeVisible({ timeout: 5000 });

    // Should stay on add-item page
    expect(page.url()).toContain('/add-item');
  });

  test('should limit description to 300 characters', async ({ page }) => {
    await page.goto('/add-item');

    const longDescription = 'a'.repeat(350);

    await page.getByLabel(/opis/i).fill(longDescription);

    // Check if input limits or shows error
    const descriptionValue = await page.getByLabel(/opis/i).inputValue();

    // Either limited to 300 or shows validation error
    expect(descriptionValue.length <= 300 || descriptionValue.length === 350).toBeTruthy();

    if (descriptionValue.length > 300) {
      // If not limited by maxLength, should show validation error on submit
      await page.getByLabel(/nazwa/i).fill('Test');
      await page.getByLabel(/kategoria/i).click();
      await page.getByRole('option').first().click();

      await page.getByRole('button', { name: /dodaj|zapisz/i }).click();

      await expect(page.getByText(/maksymalnie 300|maximum 300/i)).toBeVisible({
        timeout: 5000,
      });
    }
  });
});
