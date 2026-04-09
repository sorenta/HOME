# Operations Runbook (HomeOS)

Pēdējā atjaunināšana: 2026-04-08

## 1) Lokālais starts

1. Instalē atkarības
- `npm install`

2. Izveido env failu
- `cp .env.local.example .env.local`

3. Obligātie env
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

4. Ieteicamie/env pēc vajadzības
- `OPENAI_API_KEY` (papildu server-side scenārijiem)
- `GOOGLE_FIT_OAUTH_CLIENT_ID` + `GOOGLE_FIT_OAUTH_CLIENT_SECRET` (abi kopā)

5. Palaid app
- `npm run dev`
- Atver `http://localhost:3000`

## 2) Kvalitātes vārti

- Lint: `npm run lint`
- Testi: `npm test`
- Build: `npm run build`

Ieteikums pirms merge:
1. `lint`
2. `test`
3. `build`

## 3) API un drošības minimums

- API route konfigurācijā izmantot `src/lib/supabase/env.ts` helperus, nevis tiešu `process.env`.
- BYOK atslēgas glabājas server-side (Supabase Vault + `public.user_kitchen_ai`), nevis browser storage.
- Google Fit OAuth plūsmā sesijas sasaite tiek veikta ar nonce `state` + `httpOnly` cookie.
- Diagnostikas route ar sensitīvu informāciju neturēt publiski pieejamu production.

## 4) SQL / Supabase plūsma

- SQL faili atrodas `supabase/`.
- Pirms un pēc migrācijām pārbaudīt:
  - vai tabulām ir `ENABLE RLS`,
  - vai sensitīviem datiem ir owner-only politikas,
  - vai nav accidental household-wide piekļuves privātajiem datiem.

## 5) Incidentu minimālais protokols

Ja production ir incidents:
1. Identificē moduli un konkrēto route.
2. Pārbaudi env pieejamību.
3. Pārbaudi auth/session ceļu.
4. Pārbaudi RLS politikas un jaunākās SQL migrācijas.
5. Repro lokāli ar minimālu scenāriju.
6. Fiksē root cause un dokumentē izmaiņas.

## 6) Dokumentācijas protokols

Pēc būtiskām izmaiņām:
1. Atjaunini šo runbook, ja mainās operacionālie soļi.
2. Atjaunini `VADLINIJAS.md`, ja mainās noteikumi/riski.
3. Pievieno ierakstu `TEHNISKAIS-ZURNALS.md`.
