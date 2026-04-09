# Release Summary — 2026-04-06

## Identitāte

- Commit: `b81171fd948152775b08735460798165f518c001`
- Ziņa: `Refine reset experience and align theme token classes`
- Scope: `63 files changed, 1517 insertions, 565 deletions`

## Galvenās izmaiņas

### 1. RESET sadaļas pārbūve

- RESET dashboard pārtaisīts no vienkārša statiska pārskata uz pilnvērtīgu centru ar fokus-karti, ātrajām darbībām un reāliem šodienas signāliem.
- Pievienots miega ieraksts ar `bedtime` un `wake time` laukiem.
- Pievienots trendu panelis ar 7 un 30 dienu skatu noskaņojumam, enerģijai, soļiem un miegam.
- Pievienota quit streak restart plūsma ar atkāpes iemesla saglabāšanu.
- Pievienota dziļāka integrācija ar body tracking, training plan, health sources un AI paneli.

### 2. RESET datu un Supabase slānis

- `reset_daily_signals` modelim pievienoti miega lauki `sleep_bedtime` un `sleep_wake_time`.
- `reset_wellness_goals` modelim pievienoti `last_slip_at` un `last_slip_reason`.
- Paplašināti klienta helperi vēstures nolasīšanai un miega ilguma aprēķinam.
- Paplašināta lokālā un Supabase sinhronizācija jaunajiem laukiem.

### 3. Teksti un lokalizācija

- Pievienotas jaunas LV un EN vārdnīcas atslēgas miega blokam, trendiem, quit streak restartam, body tracking un training plan blokiem.

### 4. Tailwind / theme tokenu normalizācija

- Daudzos komponentos vecā sintakse `text-[color:var(--mainīgais)]`, `bg-[color:var(--mainīgais)]`, `rounded-[var(--mainīgais)]` tika pārnesta uz jaunāku tokenu sintaksi kā `text-(--color-text)`, `bg-(--color-surface)`, `rounded-(--radius-card)`.
- Šīs izmaiņas skar RESET, dashboard, household, profile, kitchen, finance, seasonal, spring, layout un UI komponentus.

## Tehniski svarīgākie faili

- `src/components/reset/reset-dashboard.tsx`
- `src/components/reset/reset-daily-signals-form.tsx`
- `src/components/reset/reset-quit-streak.tsx`
- `src/components/reset/reset-trends-panel.tsx`
- `src/lib/reset-daily-signals.ts`
- `src/lib/reset-wellness-sync.ts`
- `src/lib/reset-wellness.ts`
- `src/lib/i18n/dictionaries.ts`
- `supabase/reset_daily_signals.sql`
- `supabase/reset_wellness_sync.sql`

## Dokumentācijas atjauninājums

- Root `README.md` papildināts ar piezīmi par RESET sync SQL failiem, kas jāpalaiž, lai jaunie lauki būtu DB pusē.