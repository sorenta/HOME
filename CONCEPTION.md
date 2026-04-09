## Statusa atjauninājums pēc pilnā audita (2026-04-07)

Šis CONCEPTION dokuments paliek kā produkta virziena plāns, bet zemāk ir pievienotas korekcijas, kas balstītas uz reālo koda bāzes auditu.

### Kritiskās korekcijas (jāņem vērā pirms nākamajiem feature darbiem)

1. Drošība: diagnostikas endpoints `src/app/api/openai/test/route.ts` ir noņemts no aktīvā koda, lai samazinātu uzbrukuma virsmu production.
2. Integrācija: Google Fit callback plūsma vairs nav redirect-only; tā veic token exchange un saglabā tokenus `user_google_fit_tokens`.
3. Konfigurācija: env nosaukums standartizēts uz `OPENAI_API_KEY` dokumentācijā un konfigurācijas failos.
4. UX regressions: `src/components/layout/module-shell.tsx` atpakaļ pogas saturs ir tukšs (jālabo pirms plašiem UI polish darbiem).
5. Cleanup: auditā identificēti vairāki nelietoti faili `src/components/*` un `src/lib/*`; tos ieteicams dzēst pa mazām partijām ar verifikāciju.

### Prioritāšu secība pēc audita

1. Security hardening
2. Google Fit callback completion
3. Unused code cleanup
4. Testu pārklājuma paplašināšana
5. Tikai tad jauni vizuālie/tematiskie paplašinājumi

### Piezīme par šo plānu

Ja kāda sadaļa tālāk šajā failā ir pretrunā ar aktuālo repozitorija stāvokli, par avotu jāuzskata:

- faktiskais kods `src/`
- SQL migrācijas `supabase/`
- detalizētais audits failā `7. aprilis 26`

---

🟢 1. FĀZE — Tailwind v4 migrācija (CSS-first config) [IZPILDĪTS]
Statuss: migrācija jau ir ieviesta.

#	Validācija	Esošais stāvoklis
1.1	`globals.css` imports	Izmantots `@import "tailwindcss"` (TW4 sintakse)
1.2	Tokenu reģistrācija	Aktīvs `@theme` bloks CSS failā
1.3	Legacy config	`tailwind.config.ts` nav nepieciešams un netiek lietots kā aktīvs avots
1.4	Layer pārbaude	`@layer base` un saistītie stili darbojas
1.5	Būves stāvoklis	Tālāk jāuztur regulāra `next build` verifikācija pirms release
🟡 2. FĀZE — Iekšējo lapu tēmu adaptācija
Problēma: README apraksta, ka "katrai tēmai jācaurvij viss produkts", bet šobrīd tikai Dashboard un Settings lieto tēmu-specifiskus izkārtojumus. Pārējie moduļi (Finance, Kitchen, Events, Reset, Pharmacy) izmanto vienu un to pašu ModuleShell bez tēmu variācijām.
#	Uzdevums	Detaļas
2.1	Paplašināt ModuleShell	Pievienot tēmu-atkarīgu satura zone loģiku (forge-rail, botanical-shelf, pulse-poster, lucent-float, hive-cluster) — līdzīgi kā DashboardHomeLayout jau dara
2.2	Finance lapa	Forge: odometra efekts skaitļiem (Framer Motion), Forge izkārtojums. Botanical: organiskās šūnas. Pulse: bold apmales + komiksu ēnas
2.3	Kitchen lapa	Tēmu-specifiska inventāra saraksta vizualizācija
2.4	Reset lapa	Tēmu-specifisks aura glow + check-in formu stils
2.5	Events lapa	Kalendāra grid adaptācija pa tēmām
2.6	Pharmacy lapa	Medikamentu karšu stils pa tēmām
🟡 3. FĀZE — Mikrointerakcijas pa tēmām
Problēma: README detalizēti apraksta unikālas mikrointerakcijas katrai tēmai, bet lielākā daļa vēl neeksistē.

#	Uzdevums	Detaļas
3.1	LUCENT: "Rīta Dusa"	Fona elementi pulsē (opacity 0.6→0.9). Moduļi "atritinās" kā kokvilnas audums (Framer Motion spring: lēns, gaisīgs)
3.2	HIVE: "Bites Darbs"	Uzdevuma pabeigšanas animācija (bite aiznes punktu). Pogas nospiešana → medus viļņu ripple blakus astoņstūros
3.3	PULSE: "Komiksu Sprādziens"	"BUM!", "WOW!" teksts ar spring animāciju pie Save/Done. Hover → jitter efekts elementiem
3.4	FORGE: "Dzinēja Jauda"	Sarkana skenēšanas līnija pie app atvēršanas. Glow pulsē tukšgaitas ritmā. Odometra griešanās skaitļiem
3.5	BOTANICAL: "Asnu Augšana"	Ielādes animācija (asnītis → lapa). Border-radius morphing (dzīva auga sajūta) — jau daļēji eksistē .theme-organic
🟡 4. FĀZE — Svētku Virsvara (Holiday Override)
Problēma: Sezonālā sistēma eksistē (10 svētki, collectibles, rewards), bet README aprakstītās pilnās svētku pārņemšanas nav implementētas.

#	Uzdevums	Detaļas
4.1	Tēmu bloķēšana svētkos	Ja aktīvs svētku periods → ThemeProvider bloķē tēmu izvēli, piespiedu svētku vizuāls
4.2	❄️ Ziemassvētki	Canvas sniegpārslu animācija, dāvanu kastes bento, zvaniņa skaņa pogām
4.3	🐣 Lieldienas	Pasteļtoņi, zāle apakšā, slēptās olas ar konfeti — daļēji eksistē (HiddenSeasonalCollectible, HomeRollingEgg, SpringRabbitCompanion)
4.4	🇱🇻 Latvijas Svētki	Lielvārdes jostas motīvi, karmīnsarkanā krāsa, karoga auduma tekstūra fonā
4.5	Personalizēts sveiciens	Dashboard galvgalī: "Priecīgus Ziemassvētkus, [Vārds]!" — PeakHolidayCard jau eksistē, jāpaplašina
🟢 5. FĀZE — Formu un ievades tematizācija
#	Uzdevums	Detaļas
5.1	Tēmu-specifiski input stili	Focus ring, border, background pa tēmām (Forge: neon red glow, Pulse: thick black border, Botanical: organic radius)
5.2	Pogu stili pa tēmām	Forge: metālisks gradients, Hive: medus ripple, Pulse: bold shadow offset
5.3	Validācijas vizuālā atgriezeniskā saite	Kļūdu stāvokļi adaptēti katrai tēmai
🟢 6. FĀZE — Ambientā animācija uzlabojumi
#	Uzdevums	Detaļas
6.1	ThemeAmbientChrome paplašināšana	Šobrīd glow + grain. Pievienot: Lucent opacity pulsāciju, Forge sarkano skenēšanas līniju, Hive heksagonālo fona musturu
6.2	Kustību fizika uzlabojumi	Precīzāki Framer Motion spring parametri katrai tēmai (Lucent: lēns/gaisīgs, Forge: straujš/mehānisks) — daļēji eksistē transitionForTheme()
🔵 7. FĀZE — PWA & Deployment
#	Uzdevums	Detaļas
7.1	PWA manifests	manifest.json + sw.js jau eksistē — pārbaudīt pilnīgumu
7.2	Vercel deployment	Konfigurēt production deploy
7.3	Mobilā testēšana	Vizuālie testi uz iOS Safari / Android Chrome
🔵 8. FĀZE — AI paplašināšana
#	Uzdevums	Detaļas
8.1	BYOK paplašināšana	Kitchen + Finance + Reset jau izmanto BYOK. Nākamais solis: paplašināt AI uz citiem moduļiem (piem., Pharmacy savietojamības skaidrojumi)
8.2	AI atslēgu pārvaldība	Ievade tikai Settings, glabāšana server-side (Supabase Vault + `public.user_kitchen_ai`) per-user. Paplašināt UX (skaidrāks statuss, on/off gate)
1. FĀZE (Tailwind v4 migrācija)    ← pabeigta
2. FĀZE (Iekšējo lapu tēmas)       ← README galvenā prasība
3. FĀZE (Mikrointerakcijas)         ← Vizuālā burvība
5. FĀZE (Formu tematizācija)        ← UX konsekvence
4. FĀZE (Svētku virsvara)           ← Sezonāls prioritāte
6. FĀZE (Ambientā animācija)        ← Polish
7. FĀZE (PWA & Deploy)              ← Produkcija
8. FĀZE (AI paplašināšana)

────────────────────────────────────────────────────────────────
## 1. MAPJU UN FAILU STRUKTŪRA (FILE TREE)
────────────────────────────────────────────────────────────────

```
HOME/
├── AGENTS.md                         # AI aģentu instrukcijas
├── CLAUDE.md                         # Claude instrukcijas
├── CONCEPTION.md                     # ← ŠIS FAILS — pilns plāns
├── README.md                         # Produkta filozofija un vīzija
├── package.json                      # Next 16.2.2, React 19, TW4, Framer Motion 12
├── tsconfig.json
├── next.config.ts
├── next-env.d.ts
├── tailwind.config.ts                # nav repozitorijā; TW4 kodols ir `src/app/globals.css`
├── postcss.config.mjs                # @tailwindcss/postcss
├── eslint.config.mjs
│
├── public/
│   ├── manifest.json                 # PWA manifests
│   ├── sw.js                         # Service Worker
│   └── *.svg                         # Statiskie attēli
│
├── supabase/                         # SQL migrācijas (tikai fails = nav piemērots)
│   ├── schema.sql                    # Pamata shēma (profiles, households, ...)
│   ├── household_kitchen_ai.sql      # BYOK per-user migrācija (`user_kitchen_ai` + RLS + backfill)
│   ├── finance_policies.sql          # RLS finanšu tabulām
│   ├── pharmacy_policies.sql         # RLS aptieciņai
│   ├── kitchen_*.sql                 # Kitchen insert/move/realtime politikas
│   ├── household_*.sql               # Household migrācijas, RLS, RPC, fix
│   ├── events_tasks_*.sql            # Kalendāra/uzdevumu sync + delete politikas
│   ├── reset_*.sql                   # Check-in, wellness sync, daily signals, empathy
│   ├── legal_consents.sql            # GDPR piekrišanas tabula
│   ├── settings_preferences_sync.sql # Preferences sync
│   ├── profile_special_dates.sql     # Birthday / name day kolonnas
│   └── shopping_items_category.sql   # Kategoriju kolonna shopping tabulā
│
└── src/
    ├── app/                          # Next.js App Router — lapas & API
    │   ├── layout.tsx                # Root layout (11 fonti, AppProviders, ThemeBottomNav)
    │   ├── page.tsx                  # "/" → <RequireAuth><BentoDashboard/></RequireAuth>
    │   ├── loading.tsx               # Suspense fallback
    │   ├── globals.css               # ⚠️ Vēl @tailwind v3 + @layer + tēmu CSS tokeni
    │   ├── icon.tsx                  # Dinamisks favicon
    │   ├── apple-icon.tsx            # Apple Touch Icon
    │   │
    │   ├── auth/page.tsx             # Ienākt / Reģistrēties
    │   ├── calendar/page.tsx         # Redirect → /events
    │   ├── events/page.tsx           # Kalendārs, notikumi, uzdevumi
    │   ├── finance/page.tsx          # Maks, rēķini, transakcijas
    │   ├── household/page.tsx        # Izveidot/pievienoties mājsaimniecībai
    │   ├── kitchen/page.tsx          # Inventārs, grozs, AI šefpavārs
    │   ├── pharmacy/page.tsx         # Medikamentu inventārs
    │   ├── profile/page.tsx          # Profils, medaļas, īpašie datumi
    │   ├── reset/page.tsx            # Labsajūta, check-in, quit streak, body tracking
    │   ├── settings/page.tsx         # Tēma, valoda, BYOK, notifikācijas, GDPR
    │   ├── legal/privacy/page.tsx    # Privātuma politika
    │   │
    │   └── api/                      # Server-side API routes
    │       ├── ai/verify/route.ts    # BYOK atslēgas verifikācija
    │       ├── ai/finance/route.ts   # BYOK AI finanšu ieteikumi (per-user key)
    │       ├── ai/reset/route.ts     # BYOK AI labsajūtas ieteikumi (per-user key)
    │       ├── kitchen/credentials/route.ts    # BYOK key save/delete (Vault + user_kitchen_ai)
    │       ├── kitchen/meals/route.ts          # AI maltīšu ieteikumi
    │       ├── (removed) openai/test/route.ts  # diagnostikas route noņemta drošības dēļ
    │       └── integrations/google-fit/        # Google Fit OAuth (authorize/callback/status)
    │
    ├── components/
    │   ├── ui/                       # Primitīvi (nav biznesa loģikas)
    │   │   ├── glass-panel.tsx        # GlassPanel — tēmu-adaptīvs konteiners
    │   │   ├── section-heading.tsx    # SectionHeading — sekciju virsraksts
    │   │   ├── status-pill.tsx        # StatusPill — krāsains statusa badge
    │   │   └── metric-card.tsx        # MetricCard — ciparu kartīte
    │   │
    │   ├── providers/                # React Context provideri
    │   │   ├── app-providers.tsx      # ← Saknes kompozīcija (I18n→Theme→Auth→Seasonal)
    │   │   ├── auth-provider.tsx      # useAuth() — user, profile, session, signOut
    │   │   ├── theme-provider.tsx     # useTheme() — themeId, setThemeId
    │   │   ├── seasonal-provider.tsx  # useSeasonal() — collectibles, rewards
    │   │   ├── theme-profile-sync.tsx # Sinhronizē ierīces tēmu ar profilu
    │   │   └── profile-load-error-bar.tsx # Profila ielādes kļūdas josla
    │   │
    │   ├── dashboard/                # Sākuma ekrāna komponenti
    │   │   ├── bento-dashboard.tsx     # ← Galvenais Dashboard konteiners
    │   │   ├── bento-tile.tsx          # Moduļa plīte (featured/compact)
    │   │   ├── dashboard-home-layout.tsx # Tēmu-specifisko izkārtojumu orkestrs
    │   │   ├── household-water-widget.tsx # Ūdens sacensība ar medaļām
    │   │   ├── time-of-day-notice-card.tsx # Diennakts laika kartīte
    │   │   ├── peak-holiday-card.tsx   # Svētku sveiciens
    │   │   └── seasonal-home-banner.tsx # Sezonālais baneris
    │   │
    │   ├── layout/                   # Strukturālie apvalki
    │   │   ├── module-shell.tsx        # Iekšējo lapu apvalks (header + back + content)
    │   │   ├── global-corner-actions.tsx # Augšējā stūra ātrās darbības
    │   │   └── forge/forge-inner.tsx   # Forge tēmas izkārtojuma primitīvi
    │   │
    │   ├── navigation/
    │   │   └── theme-bottom-nav.tsx    # Fiksēta apakšas navigācija (6 moduļi)
    │   │
    │   ├── auth/
    │   │   ├── auth-screen.tsx         # Sign in / Sign up forma
    │   │   ├── auth-welcome-modal.tsx  # Pirmreizējais Welcome modālis
    │   │   └── require-auth.tsx        # Auth gate (wrap vai redirect)
    │   │
    │   ├── household/
    │   │   ├── household-onboarding.tsx # Create/Join household
    │   │   ├── household-summary.tsx   # Mājsaimniecības kartīte (compact/full)
    │   │   ├── household-members-list.tsx # Biedru saraksts
    │   │   └── qr-join-scanner.tsx     # QR kameras skeneris
    │   │
    │   ├── kitchen/
    │   │   ├── kitchen-ai-panel.tsx     # AI šefpavārs + atslēgu pārvaldība
    │   │   └── kitchen-onboarding-survey.tsx # Sākotnējā kategoriju aptauja
    │   │
    │   ├── reset/
    │   │   ├── reset-wellness-onboarding.tsx # Mērķu aptauja (quit + body)
    │   │   ├── reset-quit-streak.tsx    # Quit taimeri (dzīvā laika atskaite)
    │   │   ├── reset-body-tracking.tsx  # Svara un mērījumu izsekošana
    │   │   ├── reset-training-plan.tsx  # Treniņu plāns (bulk/lean nedēļas)
    │   │   ├── reset-daily-signals-form.tsx # Privātie dienas signāli
    │   │   ├── reset-aura-glow.tsx      # Score vizualizācija
    │   │   └── reset-health-sources-panel.tsx # Google Fit / Samsung Health
    │   │
    │   ├── seasonal/
    │   │   ├── hidden-seasonal-collectible.tsx # Slēptie savācamie objekti
    │   │   ├── seasonal-badge-card.tsx  # Progresa kartīte profilā
    │   │   └── seasonal-reward-modal.tsx # Balvas atvēršanas modālis
    │   │
    │   ├── spring/
    │   │   ├── home-rolling-egg.tsx     # Lieldienu olu duelis
    │   │   ├── spring-rabbit-companion.tsx # Zaķa maskots
    │   │   └── pussy-willow-frame.tsx   # Pavasara vizuāls rāmis
    │   │
    │   ├── theme/
    │   │   ├── theme-ambient-chrome.tsx # Ambientā glow + grain virsvara
    │   │   └── forge-icons.tsx         # Forge SVG stroke ikonas
    │   │
    │   ├── billing/
    │   │   └── household-plan-card.tsx  # Plāna kartīte (Free/Premium)
    │   │
    │   ├── branding/
    │   │   └── app-mark.tsx            # H:0 logo
    │   │
    │   ├── legal/
    │   │   └── cookie-consent-bar.tsx  # GDPR piekrišanas josla
    │   │
    │   ├── pwa/
    │   │   ├── pwa-install-prompt.tsx  # PWA instalācijas uzvedne
    │   │   └── pwa-provider.tsx        # PWA konteksts
    │   │
    │   └── ThemeSwitcher.tsx           # Tēmu izvēles UI
    │
    └── lib/                           # Biznesa loģika, tipi, utilītas
        ├── theme-logic.ts              # ← 5 tēmu manifesti, CSS tokenu ģenerēšana
        ├── haptic.ts                   # Haptic feedback (vibration API)
        ├── date-format.ts              # Datumu formatēšana (lv/en)
        ├── demo-data.ts                # Demo datu tipi
        ├── bento-usage.ts              # Adaptīvā Bento secība (moduleVisits)
        ├── dashboard-time.ts           # Diennakts laika noteikšana
        │
        ├── household.ts                # Household + HouseholdMember CRUD
        ├── household-activity.ts       # Aktivitāšu plūsma (ActivityFeedRow)
        ├── household-water-local.ts    # Ūdens dati localStorage (HouseholdWaterV1)
        ├── household-water-sync.ts     # Ūdens sync ar Supabase
        ├── household-kitchen-ai.ts     # Mājsaimniecības AI atslēgu metadata
        │
        ├── finance.ts                  # FixedCostRecord, FinanceTransactionRecord
        ├── kitchen.ts                  # KitchenInventoryRecord, ShoppingRecord
        ├── kitchen-autofill.ts         # Autofill ieteikumi no vēstures
        ├── kitchen-categories.ts       # 8 kategoriju slugi
        ├── kitchen-onboarding.ts       # Onboarding aptaujas kategorijas
        ├── pharmacy.ts                 # PharmacyInventoryRecord
        │
        ├── events-planner.ts           # PlannerEvent, PlannerTask
        ├── events-sync.ts              # Supabase sync notikumiem/uzdevumiem
        │
        ├── reset-wellness.ts           # ← WellnessGoal, QuitGoal, BodyGoal, ResetWellnessV1
        ├── reset-wellness-sync.ts      # Wellness state sync ar Supabase
        ├── reset-checkin.ts            # Lokālais check-in (max 3/dienā)
        ├── reset-checkin-sync.ts       # Check-in submit uz Supabase + aura
        ├── reset-daily-signals.ts      # Soļi, ekrāna laiks, meditācija, mood, enerģija
        ├── reset-notes-crypto.ts       # Privāto piezīmju šifrēšana (AES-GCM)
        │
        ├── seasonal-home.ts            # 10 sezonālo tēmu definīcijas + fāzes
        ├── seasonal-easter-placement.ts # Deterministiska olu pozicionēšana
        ├── seasonal-visuals.ts         # SVG sprites + stili pa sezonām
        │
        ├── openai.ts                   # OpenAI klienta utilītas
        ├── ai/keys.ts                  # AiProvider tipa definīcija
        │
        ├── billing/plans.ts            # HouseholdPlan, SubscriptionStatus, PlanFeature
        │
        ├── i18n/
        │   ├── dictionaries.ts         # ~800+ tulkojumu atslēgas (lv + en)
        │   └── i18n-context.tsx         # useI18n() — locale, setLocale, t()
        │
        ├── legal/
        │   ├── consent-storage.ts      # StoredConsent localStorage
        │   ├── privacy-policy.ts       # Politikas sekcijas (LV/EN)
        │   └── record-consent.ts       # Piekrišanas ierakstīšana Supabase
        │
        └── supabase/
            └── client.ts               # getBrowserClient() — Supabase singleton
```

────────────────────────────────────────────────────────────────
## 2. TEHNISKIE "CONTRACT" (INTERFEISI UN TIPI)
────────────────────────────────────────────────────────────────

### 2.1 Tēmu sistēma (`src/lib/theme-logic.ts`)

```ts
type ThemeId = "forge" | "botanical" | "pulse" | "lucent" | "hive";
type LayoutDensity = "compact" | "standard" | "comfortable" | "airy";
type ThemeMotion = "organic" | "snappy" | "soft";
type HomeScreenLayout =
  | "forge-rail" | "botanical-shelf" | "pulse-poster"
  | "lucent-float" | "hive-cluster";

type ThemeManifestV2 = {
  id: ThemeId;
  labelKey: string;             // i18n atslēga
  emoji: string;
  colors: ThemeColorsV2;        // 34 semantiskie tokeni
  fonts: ThemeFontsV2;          // { ui, display }
  radius: ThemeRadiusV2;        // card, button, input, nav, chip
  spacing: ThemeSpacingV2;      // sectionScale, basePx
  layoutDensity: LayoutDensity;
  motion: ThemeMotion;
  homeScreenLayout: HomeScreenLayout;
  ui: ThemeUiChromeV2;          // backgroundImage, panelHighlight, tileShadow, ...
};

// 34 krāsu tokeni (ThemeColorsV2):
// background, backgroundSecondary, surface, surface2, card, cardElevated,
// textPrimary, textSecondary, textMuted, border, borderStrong,
// accent, accentHover, accentSoft, success, warning, danger, info,
// buttonPrimary, buttonPrimaryText, buttonSecondary, buttonSecondaryText,
// inputBackground, inputBorder, focusRing,
// navBackground, navActive, navInactive,
// heroGlow, panelShadow, authBackground, authCard, authBorder
```

### 2.2 Autentifikācija (`src/components/providers/auth-provider.tsx`)

```ts
type Profile = {
  id: string;
  display_name: string | null;
  household_id: string | null;
  role_label: string | null;
  preferred_locale: string;
  theme_id: string;
  reset_score: number;
  birthday_at?: string | null;
  name_day_at?: string | null;
};

// useAuth() hook atgriež:
type AuthContextValue = {
  ready: boolean;
  user: User | null;              // Supabase User
  session: Session | null;        // Supabase Session
  profile: Profile | null;
  profileLoadError: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};
```

### 2.3 Mājsaimniecība (`src/lib/household.ts`)

```ts
type Household = {
  id: string;
  name: string;
  qr_code: string | null;
  subscription_type: string;      // "free" | "premium"
  subscription_status?: string | null;
  billing_provider?: string | null;
  trial_ends_at?: string | null;
  current_period_ends_at?: string | null;
  member_count?: number;
};

type HouseholdMember = {
  id: string;
  display_name: string | null;
  role_label: string | null;
  is_me: boolean;
};
```

### 2.4 Finanses (`src/lib/finance.ts`)

```ts
type FixedCostRecord = {
  id: string;
  label: string;
  amount: number;
  due_day: number | null;         // 1–31
  category: string | null;
  is_active: boolean;
};

type FinanceTransactionRecord = {
  id: string;
  fixed_cost_id: string | null;   // piesaiste rēķinam
  direction: "income" | "expense";
  amount: number;
  label: string;
  happened_at: string;            // ISO timestamp
  metadata: { category?: string } | null;
};
```

### 2.5 Virtuve (`src/lib/kitchen.ts`)

```ts
type KitchenInventoryRecord = {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  expiry_date: string | null;     // ISO date
  status: "in_stock" | "low_stock" | "expiring" | "out" | "expired";
  category?: string | null;
};

type ShoppingRecord = {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  status: "open" | "picked" | "archived";
  category?: string | null;
  is_ai?: boolean;
};

type KitchenCategorySlug =
  | "dairy" | "bakery" | "meat" | "veg"
  | "frozen" | "dry" | "drinks" | "other";
```

### 2.6 Notikumi (`src/lib/events-planner.ts`)

```ts
type PlannerEvent = {
  id: string;
  title: string;
  date: string;                   // YYYY-MM-DD
  style: "shared" | "personal";
};

type PlannerTask = {
  id: string;
  title: string;
  assigneeId: string;
  assigneeName: string;
  dueDate: string;                // YYYY-MM-DD
  done: boolean;
};
```

### 2.7 RESET / Labsajūta (`src/lib/reset-wellness.ts`)

```ts
type QuitSubkind = "sugar" | "coffee" | "smoking" | "custom";

type QuitGoal = {
  id: string;
  kind: "quit";
  subkind: QuitSubkind;
  customLabel?: string;
  startedAt: string;              // ISO timestamp
};

type BodyGoal = {
  id: string;
  kind: "body";
  mode: "weight_loss" | "bulk" | "lean";
};

type WellnessGoal = QuitGoal | BodyGoal;

type ResetWellnessV1 = {
  version: 1;
  onboardingDone: boolean;
  goals: WellnessGoal[];
  measurements: MeasurementEntry[];  // { id, at, area: BodyArea, valueCm }
  weighIns: WeighInEntry[];          // { id, at, kg }
  trainingWeekIndex: number;         // 0–3 cikla nedēļa
};

type BodyArea = "waist" | "hips" | "chest" | "arm" | "thigh";
type ResetAuraLevel = "low" | "steady" | "high";
```

### 2.8 Dienas signāli (`src/lib/reset-daily-signals.ts`)

```ts
type ResetDailySignalsRow = {
  id: string;
  user_id: string;
  logged_on: string;              // YYYY-MM-DD
  steps: number | null;
  screen_minutes: number | null;
  meditation_minutes: number | null;
  mood: number | null;            // 1–5
  energy: number | null;          // 1–5
  private_notes: string | null;   // šifrēts: "v1:[ciphertext]"
};
```

### 2.9 Aptieciņa (`src/lib/pharmacy.ts`)

```ts
type PharmacyInventoryRecord = {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  expiry_date: string | null;
  status: "ok" | "warning" | "critical";
};
```

### 2.10 Ūdens sacensība (`src/lib/household-water-local.ts`)

```ts
type WaterAchievementCounts = { gold: number; silver: number; bronze: number };

type HouseholdWaterV1 = {
  version: 1;
  scopeId: string;                // household_id vai "personal:{userId}"
  goalMl: number;                 // noklusējums: 2000
  byDate: Record<string, Record<string, number>>;  // YYYY-MM-DD → memberId → ml
  achievements: Record<string, WaterAchievementCounts>;
  settledForDay: string[];
};
```

### 2.11 Sezonālā sistēma (`src/lib/seasonal-home.ts`)

```ts
type SeasonalThemeId =
  | "easter" | "valentine" | "christmas" | "newyear"
  | "midsummer" | "state" | "womensday" | "mensday"
  | "birthday" | "nameday";

type SeasonalThemePhase = "lead" | "peak" | "after";

type SeasonalTheme = {
  id: SeasonalThemeId;
  seasonKey: string;              // unikāls sezonas atslēga
  phase: SeasonalThemePhase;
};

// 9 savākšanas vietas:
const SEASONAL_COLLECTIBLE_SPOTS = [
  "home", "household", "finance", "reset",
  "kitchen", "pharmacy", "events", "profile", "settings"
] as const;
```

### 2.12 i18n (`src/lib/i18n/`)

```ts
type Locale = "lv" | "en";

// useI18n() hook:
type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string>) => string;
};
```

### 2.13 Billing (`src/lib/billing/plans.ts`)

```ts
type HouseholdPlan = "free" | "premium";
type SubscriptionStatus = "active" | "trial" | "past_due" | "canceled";
type PlanFeature =
  | "ai_byok" | "kitchen_realtime" | "household_basic"
  | "finance_basic" | "events_basic"
  | "pharmacy_ai" | "advanced_insights"
  | "premium_themes" | "shared_automations";
```

### 2.14 UI primitīvu kontrakti

```ts
// GlassPanel — tēmu-adaptīvs konteiners
type GlassPanelProps = { children: ReactNode; className?: string };

// StatusPill — statusa badge
type StatusPillProps = {
  tone: "good" | "neutral" | "warn" | "critical";
  children: ReactNode;
  className?: string;
};

// SectionHeading — sekcijas virsraksts
type SectionHeadingProps = { title: string; badge?: string; badgeTone?: string };

// MetricCard — ciparu kartīte
type MetricCardProps = { label: string; value: string };

// ModuleShell — iekšējo lapu apvalks
type ModuleShellProps = {
  title: string;
  moduleId?: ModuleId;
  children: ReactNode;
  requireAuth?: boolean;
  shellVariant?: "default" | "forge";
};

// BentoTile — Dashboard moduļa plīte
type BentoTileTier = "compact" | "featured";
type BentoTileProps = {
  href: string;
  title: string;
  emoji: string;
  themeId: ThemeId;
  tier: BentoTileTier;
  colSpan?: number;
  highlight?: boolean;
  attention?: boolean;
};

// DashboardHomeLayout — tēmu izkārtojumu orkestrs
type DashboardHomeSlots = {
  header: ReactNode;
  modules: ReactNode;
  metrics: ReactNode;
  notice: ReactNode;
  householdSummary: ReactNode;
  water: ReactNode;
  householdPanel: ReactNode;
  feed: ReactNode;
};
```

### 2.15 Provider hierarhija (saknes kompozīcija)

```
AppProviders (src/components/providers/app-providers.tsx)
│
├── I18nProvider         → useI18n()     — locale, t()
│   └── ThemeProvider    → useTheme()    — themeId, setThemeId
│       ├── AuthProvider → useAuth()     — user, profile, session
│       │   └── SeasonalProvider → useSeasonal() — collectibles, rewards
│       ├── ThemeProfileSync    (sinhronizē tēmu ar Supabase profilu)
│       ├── ProfileLoadErrorBar (profila ielādes kļūdas josla)
│       ├── ThemeAmbientChrome  (ambientā glow + grain)
│       ├── {children}          (lapa)
│       ├── AuthWelcomeModal    (pirmreizējais sveiciens)
│       ├── PwaProvider         (PWA instalācijas uzvedne)
│       └── CookieConsentBar    (GDPR piekrišana)
```

────────────────────────────────────────────────────────────────
## 3. PRIORITĀŠU SECĪBA (MILESTONES)
────────────────────────────────────────────────────────────────

### M0 — Tehnoloģiskais pamats (nav lietotāja ietekme, bet bloķē visu)
| # | Uzdevums | Acceptance Criteria |
|---|----------|---------------------|
| M0.1 | Tailwind v4 CSS-first migrācija | `@import "tailwindcss"` globals.css, `@theme {}` bloks, `tailwind.config.ts` dzēsts, `next build` bez kļūdām |
| M0.2 | Pārbaudīt visus 5 tēmu tokenus | Katrs `data-theme` pareizi ielādē krāsas, radius, shadow — vizuāls screenshot tests |
| M0.3 | `@layer base` / `@layer components` saderība | Visi `.maj-*` klases un `:root[data-theme]` darbojas kā pirms migrācijas |

### M1 — RESET moduļa pilnveidošana (galvenā biznesa vērtība)
| # | Uzdevums | Acceptance Criteria |
|---|----------|---------------------|
| M1.1 | Onboarding aptaujas paplašināšana | Papildus esošajiem (quit: sugar/coffee/smoking/custom, body: weight_loss/bulk/lean) — pievienot: `cardio` (skriešana/peldēšana), `flexibility` (joga/stretching). Jauni `BodyGoal.mode` varianti |
| M1.2 | Parametru anketa pēc mērķa izvēles | Ja `bulk/lean/cardio` → jautāt: pašreizējais svars, mērķa svars, treniņu pieredze (beginner/intermediate/advanced), pieejamās dienas nedēļā (3/4/5/6). Saglabāt `ResetWellnessV1.userParams` |
| M1.3 | AI treniņu plāna ģenerēšana | Izmantojot BYOK atslēgu (Gemini/OpenAI): nosūtīt parametrus → saņemt personalizētu nedēļas plānu ar dienām, vingrinājumiem, sērijām, atkārtojumiem, pauzēm. Saglabāt `ResetWellnessV1.generatedPlan` |
| M1.4 | Statisks fallback plāns (ja nav AI) | Ja nav API atslēgas: rādīt esošo BULK_WEEK / LEAN_WEEK + jaunu CARDIO_WEEK / FLEX_WEEK konstanti no i18n |
| M1.5 | Vizuālais progress — Quit Streak | Papildus taimeram: vizuālais progresa gredzens (SVG arc) + milestone atzīmes (1d, 3d, 7d, 14d, 30d, 90d). Kartīte ar "🎉 7 dienas bez cukura!" |
| M1.6 | Vizuālais progress — Treniņi | Nedēļas kalendāra josla ar atzīmētām dienām (✓ veikts / ○ plānots / — atpūta). Progress: "4/5 treniņi šonedēļ" |
| M1.7 | Vizuālais progress — Ķermeņa mērķi | Svara grafiks ar mērķa līniju (Goal line). "Atlikuši 3.2 kg līdz mērķim" teksts. Mērījumu salīdzinājums (šī vs pirmā nedēļa) |
| M1.8 | Miega izsekošana | Jauni lauki `ResetDailySignalsRow`: `sleep_start`, `sleep_end`. Aprēķins: miega ilgums, kvalitāte (subjektīvā 1-5 skala). Ietekmē RESET score |
| M1.9 | Nedēļas/mēneša tendences grafiks | SVG līnijas grafiks (kā `WeighSparkline`, bet uz mood, enerģiju, soļiem) ar 7d/30d pārslēgu |
| M1.10 | Elpošanas vingrinājums | 60s animēts aplis (izplešas 4s ieelpa, saraujas 4s izelpa). Pabeidzot: +2 score bonus. Framer Motion `animate` |

### M2 — Moduļu satura papildinājumi
| # | Uzdevums | Acceptance Criteria |
|---|----------|---------------------|
| M2.1 | Finance: Krājumu mērķi (Savings Goals) | Jauns tips `SavingsGoal { id, label, targetAmount, currentAmount }`. UI: progress bārs, +/- summas pievienošana. i18n gatavs (`finance.goals` jau eksistē) |
| M2.2 | Finance: Mēneša budžeta grafiks | SVG bāru grafiks — izdevumi pa kategorijām vs budžeta limiti |
| M2.3 | Finance: Rēķinu rediģēšana + dzēšana | Inline edit formas + dzēšanas poga ar apstiprinājumu |
| M2.4 | Kitchen: Ēdienreižu plānotājs (Meal Planner) | 7 dienu grid: brokastis/pusdienas/vakariņas. AI var aizpildīt. Auto-ģenerē iepirkumu sarakstu no trūkstošajām sastāvdaļām |
| M2.5 | Kitchen: "Drīz beigsies" brīdinājumi | Top-3 saraksts ar vienībām kuru `expiry_date < today + 3d`. Rādīt Dashboard fokusa kartītē |
| M2.6 | Events: Atpakaļskaitīšana (Countdown) | `calendar.countdown` i18n jau eksistē. UI: līdz X dienām kartīte ar skaitli un iebūvētu animāciju |
| M2.7 | Events: Atkārtojošie notikumi | Jauns lauks `PlannerEvent.recurrence: "none" | "weekly" | "biweekly" | "monthly"`. Auto-ģenerē instances |
| M2.8 | Pharmacy: Lietošanas grafiks + devu izsekošana | Jauns tips `DoseSchedule { times_per_day, with_food, notes }`. UI: dienas čekboksu rinda |
| M2.9 | Household: Lomu pārvaldība | `role: "admin" | "member" | "guest"`. Admin var: dzēst biedrus, mainīt nosaukumu, pārvaldīt atslēgas |
| M2.10 | Profile: Sezonālo talismanu kolekcija | Profilā rāda visus savāktos seasonal reward talismanus pa sezonām |

### M3 — Dashboard: Šodienas fokusa kartīte
| # | Uzdevums | Acceptance Criteria |
|---|----------|---------------------|
| M3.1 | Kross-moduļu prioritāšu dzinējs | Jauna `lib/dashboard-focus.ts`: apkopo signālus no Finance (nesamaksāti rēķini), Kitchen (beidzas termiņi), Pharmacy (zems atlikums), Events (šodienas uzdevumi), Reset (check-in gaida). Atgriež sakārtotu `FocusItem[]` |
| M3.2 | Dashboard Focus kartīte | Jauns komponents `DashboardFocusCard` — rāda top-3 prioritātes ar ikonu, tekstu un navigācijas saiti |
| M3.3 | Ātrās darbības pogas | "+250 ml ūdens" un "Ātrā pievienošana grozam" tieši no Dashboard |

### M4 — Iekšējo lapu tēmu adaptācija (vizuālais slānis)
| # | Uzdevums | Acceptance Criteria |
|---|----------|---------------------|
| M4.1 | `ModuleShell` tēmu-atkarīgs content wrapper | Kā `DashboardHomeLayout`: forge → ForgeZone/ForgeDeckList; botanical → shelf ar labels; pulse → bold borders; lucent → float+blur; hive → octagon clips |
| M4.2 | Finance tēmu adaptācija | Forge: odometra animācija ciparu maiņā (Framer `AnimatePresence`). Botanical: organiskās šūnas. Pulse: 4px borders + shadow offset |
| M4.3 | Kitchen tēmu adaptācija | Inventāra saraksts adaptēts katrai tēmai (Forge: rindas ar neon indikatoriem, Botanical: kartītes ar zaļiem akcentiem) |
| M4.4 | Reset tēmu adaptācija | Aura glow animācija pēc tēmas (Forge: sarkans pulss, Botanical: zaļa mirdzēšana, Pulse: halftone gredzens) |
| M4.5 | Events tēmu adaptācija | Kalendāra šūnu stils: Hive → octagon šūnas, Forge → tumšas šūnas ar neon aktīvo, Pulse → bold kontūras |
| M4.6 | Pharmacy tēmu adaptācija | Medikamentu kartīšu stils pa tēmām |

### M5 — Mikrointerakcijas un ambient
| # | Uzdevums | Acceptance Criteria |
|---|----------|---------------------|
| M5.1 | LUCENT: lēna opacity pulsācija fona elementiem | CSS `@keyframes lucent-pulse` ar `opacity: 0.6→0.9`, 4s cikls |
| M5.2 | HIVE: medus ripple efekts pogām | Framer Motion radial gradient animācija no nospiešanas punkta |
| M5.3 | PULSE: "BUM!" / "WOW!" teksts pie Save | `AnimatePresence` + `motion.span` ar `scale: [0, 1.3, 1]` spring |
| M5.4 | FORGE: odometra griešanās ciparu maiņā | Framer Motion `y` animācija ciparu kolonām (kā mehānisks odometrs) |
| M5.5 | BOTANICAL: border-radius morphing | CSS `animation: theme-morph 8s` (jau eksistē `.theme-organic`, paplašināt uz vairāk elementiem) |
| M5.6 | ThemeAmbientChrome paplašināšana | Lucent: opacity pulss, Forge: sarkana scan līnija, Hive: hex fona musturs |

### M6 — Svētku virsvara
| # | Uzdevums | Acceptance Criteria |
|---|----------|---------------------|
| M6.1 | Svētku tēmu bloķēšana | `ThemeProvider`: ja `SeasonalTheme.phase === "peak"` → ignorēt lietotāja tēmu, piespiest svētku vizuālu |
| M6.2 | Ziemassvētku virsvara | Canvas sniegpārslas, Bento kastes → dāvanu saiņojums, zvaniņa skaņa |
| M6.3 | Latvijas svētku virsvara | Lielvārdes jostas CSS musturs, karmīnsarkanā krāsa, karoga audums fonā |

### M7 — Formu tematizācija
| # | Uzdevums | Acceptance Criteria |
|---|----------|---------------------|
| M7.1 | Input stili pa tēmām | `globals.css`: `.maj-input--forge` (neon glow), `--pulse` (4px border), `--botanical` (organic radius), `--lucent` (blur), `--hive` (octagon) |
| M7.2 | Pogu stili pa tēmām | Forge: metālisks gradient, Pulse: bold shadow, Hive: medus ripple, Botanical: leaf shape, Lucent: glass |

### M8 — PWA, Deployment, Auth uzlabojumi
| # | Uzdevums | Acceptance Criteria |
|---|----------|---------------------|
| M8.1 | "Aizmirsu paroli" plūsma | Supabase `resetPasswordForEmail()` + recovery page |
| M8.2 | Magic link auth | Supabase `signInWithOtp()` kā alternatīva parolei |
| M8.3 | PWA manifest validācija | Visas ikonas, `theme_color` per aktīvo tēmu, `display: standalone` |
| M8.4 | Vercel production deploy | `vercel.json` vai Vercel dashboard konfigurācija |

### M9 — AI paplašināšana
| # | Uzdevums | Acceptance Criteria |
|---|----------|---------------------|
| M9.1 | RESET AI treniņu plāns | API route `api/reset/training-plan` → BYOK atslēga → personalizēts plāns |
| M9.2 | Finance AI ieteikumi | Automātiski ieskati ("Šomēnes +15% pārtikai vs iepriekšējo") |
| M9.3 | Pharmacy AI savietojamības padomi | Medikamentu interakciju analīze no inventāra |

────────────────────────────────────────────────────────────────
## 4. KRITISKIE LIKUMI (CONSTRAINTS)
────────────────────────────────────────────────────────────────

### 4.1 Tehnoloģiskie ierobežojumi

| Likums | Iemesls |
|--------|---------|
| **Next.js 16 App Router ONLY** | Nav `pages/` direktorija. Visi routes ir `app/`. `"use client"` direktīva obligāta klienta komponentiem. |
| **Tailwind CSS v4 (pēc M0)** | CSS-first config (`@import "tailwindcss"` + `@theme {}`). Nav `tailwind.config.ts`. Nav `@apply`. |
| **React 19** | `use()`, `useFormStatus()`, `useOptimistic()` pieejami. Server Components pēc noklusējuma. |
| **TypeScript strict** | `"strict": true` tsconfig. Visi publiskie tipi eksportēti no `src/lib/`. Nav `any`. |
| **Framer Motion 12** | Animācijām lietot `motion.*` komponentus. Spring parametri no `ThemeMotion` (organic/snappy/soft). |
| **Nav ārējas UI bibliotēkas** | Nav shadcn, Radix, MUI. Visi primitīvi ir `src/components/ui/`. Stils caur TW utility + CSS mainīgajiem. |

### 4.2 Datu un drošības likumi

| Likums | Iemesls |
|--------|---------|
| **Supabase RLS vienmēr ieslēgts** | Katra jauna tabula OBLIGĀTI ar Row Level Security politiku. Lietotājs redz tikai savas / savas mājsaimniecības rindas. |
| **BYOK atslēgas glabājas server-side (per-user)** | Atslēga ievadāma tikai `Settings`. Glabāšana: Supabase Vault + `public.user_kitchen_ai` (`user_id`, `provider`, `vault_secret_id`, `key_last_four`). API routes lasa atslēgu server-side per request; pilnā atslēga netiek logota. |
| **RESET privāto datu nodalījums** | Partneris/biedrs redz TIKAI auru (score %, auraLevel). Nekad neredz: soļus, ekrāna laiku, meditāciju, mood, enerģiju, piezīmes, quit detaļas, ķermeņa mērījumus. |
| **Privātās piezīmes šifrētas** | `reset-notes-crypto.ts`: AES-GCM šifrēšana pirms Supabase upload. Atslēga glabājas ierīcē — citā telefonā vecās piezīmes nelasāmas. |
| **GDPR consent pirms analytics** | `CookieConsentBar` jārāda. Tikai `essentialOnly` (auth, settings) bez piekrišanas. Analytics tikai ar eksplicītu opt-in. |

### 4.3 Stila un UX likumi

| Likums | Iemesls |
|--------|---------|
| **Mobile-first** | Visi izkārtojumi sākas no `min-width: 0`. Desktop ir paplašinājums, nevis pamats. `min-height: 100dvh`. |
| **Tēma caurvij VISU** | Katrs UI elements OBLIGĀTI lieto `var(--color-*)` tokenus, nevis hardcoded krāsas. Izņēmums: sezonālās virsvaras (`theme-honey-drip` u.c. dekoratīvie). |
| **`data-theme` atribūts uz `<html>`** | Tēmu pārslēgšana notiek caur `ThemeProvider`, kas iestata `data-theme`, `data-layout-density`, `data-theme-motion`, `data-home-layout` uz root. CSS reaģē uz šiem atribūtiem. |
| **i18n OBLIGĀTS visam tekstam** | Nav hardcoded LV vai EN teksta komponentos. Viss caur `t("key")`. Jaunas atslēgas pievieno ABĀS vārdnīcās (lv + en). |
| **`GlassPanel` kā sekciju konteiners** | Visas satura sekcijas iekšējās lapās wrappē ar `GlassPanel`. Tas nodrošina tēmu-adaptīvas apmales, ēnas un fonu. |
| **`StatusPill` statusiem** | Visi statusa indikatori (paid/pending, ok/warning/critical, open/picked) lieto `StatusPill` ar pareizo `tone`. |
| **Haptic feedback interaktīviem elementiem** | `hapticTap()` izsaukums pie pogām, navigācijas, tēmu pārslēgšanas. Import no `src/lib/haptic.ts`. |
| **`prefers-reduced-motion` respektēšana** | Visas CSS animācijas ar `@media (prefers-reduced-motion: reduce) { animation: none; }`. Framer Motion: `useReducedMotion()`. |

### 4.4 Failu organizācijas likumi

| Likums | Iemesls |
|--------|---------|
| **Lapa = `src/app/{module}/page.tsx`** | Viena lapa per moduli. Nav nested routes (izņemot `legal/privacy`). |
| **Komponents = `src/components/{domain}/{name}.tsx`** | Grupēti pa domēniem (dashboard, reset, kitchen, ...). Nav `components/shared/`. |
| **Loģika = `src/lib/{domain}.ts` vai `src/lib/{domain}-{feature}.ts`** | Tīra loģika bez JSX. Eksportē tipus un funkcijas. Nav Supabase importu UI komponentos — tikai caur `lib/`. |
| **SQL = `supabase/{feature}.sql`** | Katra migrācija atsevišķā failā. Nosaukums apraksta mērķi. Nav numurētas migrācijas — idempotenti skripti. |
| **Jauns modulis = jauns `lib/{module}.ts` + jauns `components/{module}/` + jauns `app/{module}/page.tsx`** | Trīs faili minimal. i18n atslēgas abās vārdnīcās. SQL ja vajag Supabase tabulu. |

### 4.5 Build & CI likumi

| Likums | Iemesls |
|--------|---------|
| **`next build` VIENMĒR jāiziet bez kļūdām** | Pirms jebkura commit: `next build` clean. Nav `// @ts-ignore`, nav `eslint-disable` bez pamatojuma. |
| **Nav `@apply` Tailwind** | Tailwind v4 neatbalsta `@apply` tajā pašā līmenī. Stils tikai caur utility klases vai CSS mainīgajiem `@layer` blokos. |
| **Nav `"use server"` eksportu no klienta failiem** | Server actions tikai `app/api/` routes vai atsevišķos `lib/` failos ar `"use server"` augšā. |
| **Imports: absolūtie ceļi `@/`** | `@/components/...`, `@/lib/...`. Nav relatīvu `../../` importu starp domēniem. |
