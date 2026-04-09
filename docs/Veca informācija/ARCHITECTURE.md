# HomeOS Architecture

Pēdējā atjaunināšana: 2026-04-07

## 1) Slāņu modelis

1. App layer (`src/app`)
Atbildība: route lapas, layout, loading, API routes.

2. UI layer (`src/components`)
Atbildība: domēna komponentes + koplietojamie UI primitīvi + provideri.

3. Domain layer (`src/lib`)
Atbildība: biznesa loģika, datu operācijas, i18n, helperi, integrācijas.

4. Data layer (`supabase/*.sql`)
Atbildība: shēma, RLS politikas, migrācijas.

## 2) Runtime ceļš

1. `src/app/layout.tsx`
2. `src/components/providers/app-providers.tsx`
3. `src/components/layout/root-shell.tsx`
4. `src/app/**/page.tsx`
5. `src/components/**` + `src/lib/**`

## 3) Provider ķēde

`AppProviders` secība:

1. `I18nProvider`
2. `ThemeProvider`
3. `ThemeActionEffectsProvider`
4. `AuthProvider`
5. `SeasonalProvider`
6. Papildslāņi: `ThemeProfileSync`, `ProfileLoadErrorBar`, `ThemeAmbientChrome`, `PwaProvider`, `CookieConsentBar`

## 4) Galvenie moduļu maršruti

- `/` — Dashboard
- `/auth` — autentifikācija
- `/events` — notikumi un plānošana
- `/finance` — finanses
- `/household` — mājsaimniecība
- `/kitchen` — virtuve
- `/pharmacy` — aptieciņa
- `/profile` — profils
- `/reset` — labsajūta
- `/settings` — iestatījumi
- `/legal/privacy` — privātuma politika

## 5) Galvenie API maršruti

- `src/app/api/ai/verify/route.ts`
- `src/app/api/ai/finance/route.ts`
- `src/app/api/ai/reset/route.ts`
- `src/app/api/kitchen/credentials/route.ts`
- `src/app/api/kitchen/meals/route.ts`
- `src/app/api/integrations/google-fit/*`
- `src/app/api/openai/test/route.ts`

## 6) Datu un drošības principi

- Auth: Supabase Auth (`user`, `session`).
- BYOK: server-side modelis (`user_kitchen_ai` + Vault).
- RLS: obligāts visām sensitīvajām tabulām.
- Privātuma nodalījums: private vs household dati.

## 7) Arhitektūras lēmumu avoti

- Aktīvie riski/lēmumi: `KNOWN-RISKS-AND-DECISIONS.md`
- Operacionālie soļi: `OPERATIONS-RUNBOOK.md`
- Terminoloģija: `GLOSSARY.md`
