# HomeOS Sistēmas Arhitektūra un Standarti

Pēdējā atjaunināšana: 2026-04-13

Šis dokuments kalpo kā tehniskā atsauce un "likumu grāmata" (Rulebook) kodēšanas fāzē, lai uzturētu konsekvenci datubāzes relācijās, datu apstrādē un lokalizācijā.

---

## 1. Datu bāzes shēma un Relācijas (Supabase)

Lietotnes pamatā ir privāto un koplietojamo (Household) datu nošķiršana, izmantojot Supabase Row Level Security (RLS).

### Galvenās tabulas un saites:
*   `auth.users`: Supabase iebūvētā lietotāju tabula.
*   `public.profiles`: 1-to-1 relācija ar `auth.users`. Satur lietotāja izvēlēto tēmu, valodu, dzimšanas dienu un privātuma preferences (`reset_privacy_level`).
*   `public.households`: Mājsaimniecības pamata dati (nosaukums, QR uzaicinājuma kods, abonementa statuss).
*   `public.household_members`: M-to-M (Many-to-Many) saist-tabula starp `households` un `auth.users`. Satur lietotāja lomu (`owner`, `member`) un granulāras privātuma atļaujas (`can_see_finance`, `can_see_reset_mood` utt.).

### Datu piederība (Scope):
*   **Household Scope**: Tabulās (piem., `finance_transactions`, `shopping_items`) ieraksti tiek piesaistīti `household_id`. RLS politikas nodrošina, ka datus redz tikai mājsaimniecības locekļi.
*   **Individual Scope**: Specifiskās tabulās, piemēram, `inventory_items` (moduļiem Kitchen vai Pharmacy) vai `calendar_events`, eksistē `visibility` vai `owner_scope` kolonnas, kas ļauj atzīmēt ierakstus kā `individual` / `private`.
*   **Reset Modulis (Pilnīgs privātums)**: `reset_checkins` piesaistīti tieši `user_id`. `reset_metrics` tabulā ir `visibility` (piem., `mood_only`), kas var atļaut mājsaimniecībai redzēt tikai kopējo noskaņojumu, bet slēpj privātās piezīmes.

---

## 2. Datu plūsma (Data Fetching / Mutations)

Projekts paļaujas uz **tiešiem Supabase klienta izsaukumiem** gan no klienta (Client Components), gan servera, abstrahējot tos servisu failos.

*   **API / Servisu slānis (`src/lib/*.ts`)**: Visa biznesa loģika datubāzes vaicājumiem atrodas izolētos failos mapē `src/lib/` (piemēram, `finance.ts`, `kitchen.ts`, `events-sync.ts`).
    *   *Piemērs*: `supabase.from("fixed_costs").insert(...)`
*   **Next.js API Routes (`src/app/api/...`)**: Tiek izmantoti tikai specifiskiem ārējiem izsaukumiem (piemēram, AI integrācijām ar BYOK atslēgām, Google Fit OAuth callback apstrādei) drošības un server-side noslēpumu (`Vault`) pārvaldības dēļ.

---

## 3. Internacionalizācija (i18n)

Lietotne izmanto custom (pašrakstītu) i18n risinājumu.

*   **Vārdnīcas lokācija**: `src/lib/i18n/dictionaries.ts`
    *   Tiek uzturēts `Record<Locale, Record<string, string>>` objekts (atbalstītās valodas: `"lv"`, `"en"`).
    *   Tekstu pievienošana: Jauns teksts fiziski jāieraksta `dictionaries.ts` failā abās valodās.
*   **Lietošana komponentēs**: Tiek izmantots `useI18n()` hook no `src/lib/i18n/i18n-context.tsx`.
    *   *Piemērs*:
      ```tsx
      import { useI18n } from "@/lib/i18n/i18n-context";
      // ...
      const { t } = useI18n();
      return <button>{t("household.create.submit")}</button>;
      ```

---

## 4. Testēšana (Vadlīnijas)

Projektā ir pieejami divu veidu testi:
1.  **Vienību testi (Jest)**: Failu nosaukumi beidzas ar `.test.ts`. Tie jāveido kritiskai biznesa loģikai iekš `src/lib/` (piemēram, matemātikai, notikumu plānošanai, datumu formatēšanai).
2.  **E2E testi (Playwright)**: Konfigurēti caur `playwright.config.ts`, domāti pilnām lietotāja plūsmām. Prioritāte ir kritiskajiem moduļiem (Pieteikšanās, Mājsaimniecības pievienošanās).
