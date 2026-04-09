# AI Start Here — HomeOS

Šis ir sākuma punkts jebkuram AI aģentam, kas strādā šajā repozitorijā.

Pēdējā atjaunināšana: 2026-04-07

## 1) Projekta kodols

HomeOS ir mobile-first mājsaimniecības lietotne ar moduļiem:
- Dashboard
- Kitchen
- Finance
- Events
- RESET (labsajūta)
- Pharmacy
- Household
- Settings / Profile

Tehniskais pamats:
- Frontend: Next.js App Router + React + TypeScript
- Styling: Tailwind v4 (CSS-first, `@theme inline`)
- Backend: Supabase (Auth, DB, RLS, Realtime, Vault)
- AI: BYOK (per-user atslēgas server-side caur Supabase Vault)

## 2) Kur sākt lasīt kodu

1. `src/app/layout.tsx` — globālais ieejas punkts (layout + providers + shell)
2. `src/components/providers/app-providers.tsx` — provider ķēde (I18n → Theme → Auth → Seasonal)
3. `src/components/layout/root-shell.tsx` — app rāmis un bottom nav
4. `src/app/page.tsx` — dashboard sākums
5. `src/app/<modulis>/page.tsx` — katra moduļa ieejas punkts
6. `src/lib/*` — business loģika un datu operācijas

## 3) Obligātie dokumenti

| Dokuments | Saturs |
|-----------|--------|
| `ARCHITECTURE.md` | Slāņi, provider ķēde, route/API kartējums |
| `KNOWN-RISKS-AND-DECISIONS.md` | Aktīvie riski un pieņemtie tehniskie lēmumi |
| `OPERATIONS-RUNBOOK.md` | Kā palaist, testēt, pārbaudīt, reaģēt incidentos |
| `GLOSSARY.md` | Domēna termini un saīsinājumi |
| `CONCEPTION.md` | Produkta koncepcija, tēmas, roadmap |

## 4) Kritiskās zināšanas par env

**Obligāti izmantot `src/lib/supabase/env.ts` helper** — nevis `process.env` tieši.

Obligātie env mainīgie:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side API routes)

**Nav atgriezt** `NEXT_PUBLIC_SUPABASE_ANON_KEY` fallback loģiku — tā tika izņemta ar iemeslu.

Pēc env izmaiņām — obligāts pilns process restart (NEXT_PUBLIC_* tiek inlinēts build laikā).

## 5) Darba secība AI aģentam

Ieteicamā secība:
1. Izlasi `KNOWN-RISKS-AND-DECISIONS.md`.
2. Pārbaudi, vai skartais modulis ir aprakstīts `ARCHITECTURE.md`.
3. Izmanto `src/lib/supabase/env.ts` visiem jauniem Supabase API routes.
4. Palaid: `npm run lint` + `npm test` + `npm run build`.
5. Atjaunini dokumentāciju, ja mainās arhitektūra, env vai drošības lēmumi.
6. Reģistrē paveikto `TEHNISKAIS-ZURNALS.md` (vienīgais tehniskais žurnāls), ja darbs skar kodu vai dokumentāciju.
