import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // 1. Dodamies uz autorizācijas lapu
  await page.goto('/auth');

  // 2. Atrodam e-pasta un paroles ievades laukus (parasti pēc input tipa)
  // Ja tev ir specifiski ID vai nosaukumi, tos var norādīt (piem., 'input[name="email"]')
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  
  // Ievadām tavus testa lietotāja datus
  await emailInput.fill('test@test.com');
  await passwordInput.fill('test123456');

  // 3. Atrodam "Pieslēgties" (Submit) pogu un noklikšķinām
  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();

  // 4. Gaidām, kamēr Supabase mūs autorizē un Next.js pārvirza uz sākumlapu '/'
  await page.waitForURL('**/', { timeout: 15000 });

  // Pārliecināmies, ka esam iekšā (piem., meklējam kādu Sākuma ekrāna elementu)
  // Piemēram, tavu jauno Pielāgot ekrānu pogu vai Galveno apvalku
  await expect(page.locator('#main-content')).toBeVisible({ timeout: 10000 });

  // 5. Saglabājam pārlūkprogrammas stāvokli (cookies, localStorage ar Supabase žetoniem)
  await page.context().storageState({ path: authFile });
});
