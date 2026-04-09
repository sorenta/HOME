# Operations Runbook

Pēdējā atjaunināšana: 2026-04-07

## 1) Lokālais starts

1. Instalē atkarības
- `npm install`

2. Izveido env failu
- `cp .env.local.example .env.local`

3. Obligātie env
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

4. Palaid app
- `npm run dev`
- Atver `http://localhost:3000`

## 2) Kvalitātes komandas

- Lint: `npm run lint`
- Testi: `npm test`
- Build: `npm run build`

Ieteikums pirms merge:
1. lint
2. tests
3. build

## 3) SQL / Supabase plūsma

- SQL faili ir `supabase/` mapē.
- BYOK pamatfails: `supabase/household_kitchen_ai.sql`
- Domēnu faili: `finance_*`, `kitchen_*`, `events_*`, `reset_*`, `pharmacy_*`, `legal_*`, `settings_*`.

Ieteikums:
- Pirms schema izmaiņām izveido migrācijas failu ar skaidru nosaukumu.
- Pēc izmaiņām validē RLS ietekmi katram modulim.

## 4) Deploy orientieri

Vēsturiskie release dokumenti ir mapē `readme/Veca informācija/`.

Aktīvie orientieri:

- `README.md` (šīs mapes centrālais indekss)
- `KNOWN-RISKS-AND-DECISIONS.md`
- `TEHNISKAIS-ZURNALS.md` (vienīgais tehniskais žurnāls)

## 5) Incidentu minimālais protokols

Ja kaut kas lūzt production:
1. Identificē skarto moduli un route.
2. Pārbaudi env pieejamību.
3. Pārbaudi auth/session un RLS piekļuves ceļu.
4. Pārbaudi pēdējās SQL izmaiņas.
5. Repro lokāli ar minimālu scenāriju.
6. Fiksē root cause + atjaunini dokumentāciju.

## 6) Dokumentācijas uzturēšanas protokols

Ja darbs skar dokumentāciju:

1. Atjaunini saturu attiecīgajā failā.
2. Pārbaudi terminoloģiju pret `GLOSSARY.md`.
3. Pievieno paveikto `TEHNISKAIS-ZURNALS.md`.
4. Pārbaudi, ka nav dublējoša informācija starp failiem.
