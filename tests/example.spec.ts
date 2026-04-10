import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Pārbaudām, vai lapa ielādējas (pēc vajadzības pielāgojiet tekstu)
  // Šis ir piemērs, kas pārbauda, vai lapa nav tukša
  const body = await page.locator('body');
  await expect(body).toBeVisible();
});
