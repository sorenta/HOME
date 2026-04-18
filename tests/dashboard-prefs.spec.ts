import { test, expect } from '@playwright/test';

test.describe('Dashboard Preferences (Sākuma ekrāna pielāgošana)', () => {
  
  test('Lietotājs var paslēpt Ūdens patēriņa logrīku un tas saglabājas', async ({ page }) => {
    // 1. Dodamies uz sākumlapu (tā kā esam ielogoti caur auth.setup.ts, mēs uzreiz redzēsim Sākuma ekrānu)
    await page.goto('/');

    // 2. Noklikšķinām uz pogas "Pielāgot ekrānu"
    // Atrodam pogu un sagaidām, kamēr tā ir pieejama
    const customizeButton = page.locator('button:has-text("Pielāgot ekrānu")');
    await customizeButton.waitFor({ state: 'visible' });
    await customizeButton.click();

    // 3. Modālais logs atveras
    const modalHeader = page.locator('h2:has-text("Pielāgot sākuma ekrānu")');
    await expect(modalHeader).toBeVisible();

    // 4. Meklējam un pārbaudām checkbox "Ūdens patēriņš (Biometrija)"
    const waterCheckbox = page.locator('label:has-text("Ūdens patēriņš") >> input[type="checkbox"]');
    
    // Tā kā mēs gribam pārbaudīt, ka tas "paslēpj", nodrošinām, ka tas sākumā ir atķeksēts
    // (Šī komanda garantē, ka tas ir ieslēgts pirms mēs to izslēdzam testā)
    await waterCheckbox.check();
    
    // 5. Mēs PĀRSVIPOJAM / NOŅEMAM ĶEKSI, lai paslēptu ūdens biometriju
    await waterCheckbox.uncheck();

    // 6. Saglabājam un aizveram (klikšķinam attiecīgo pogu modālajā logā)
    const saveButton = page.locator('button:has-text("Saglabāt un Aizvērt")');
    await saveButton.click();

    // 7. Pārliecināmies, ka modālais logs ir aizvērts
    await expect(modalHeader).not.toBeVisible();

    // 8. GALVENAIS TESTS: Pārbaudām rezultātu - Ūdens/Biometrijas sektoram NEvajadzētu eksistēt lapā
    const waterSectorHeader = page.locator('span:has-text("Biometrija un resursi")');
    await expect(waterSectorHeader).not.toBeVisible();
    
    // 9. Pārbaudām aizkulišu (LocalStorage) datus, lai pārliecinātos, ka tava jaunā loģika `dashboard-prefs.ts` darbojas
    const prefsJson = await page.evaluate(() => localStorage.getItem('maj-dashboard-prefs-v1'));
    // LocalStorage jābūt stringam ar `"showWater":false`
    expect(prefsJson).toContain('"showWater":false');
  });

});