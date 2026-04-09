# HomeOS Conception

Pēdējā atjaunināšana: 2026-04-07

## 1) Mērķis

HomeOS ir mobile-first mājsaimniecības platforma, kas apvieno ikdienas koordināciju, privāto labsajūtu un AI atbalstu vienā pieredzē.

Mērķis:

- samazināt ikdienas frikciju mājsaimniecībā;
- nodrošināt skaidru robežu starp private un household datiem;
- nodrošināt konsekventu, tēmu-balstītu UX visā produktā.

## 2) Produkta pīlāri

1. Mobile-first izpildījums
- Primārais lietojums telefonā; desktop ir paplašinājums.

2. Theme-first dizains
- 5 tematiskās pasaules (`lucent`, `hive`, `pulse`, `forge`, `botanical`) ietekmē ne tikai krāsas, bet arī formas, ritmu un kustību.

3. Privātuma nodalījums
- Household dati ir koplietojami, RESET un sensitīvie dati ir privāti.

4. RLS-first drošība
- Datu piekļuve tiek kontrolēta DB līmenī ar Supabase RLS politikām.

5. BYOK AI
- AI atslēgas ir per-user un tiek glabātas server-side.

## 3) Moduļu loma produktā

- Dashboard: prioritāšu centrs un ieejas punkts visiem moduļiem.
- Kitchen: inventārs, iepirkumi, AI maltīšu atbalsts.
- Finance: bilance, rēķini, transakcijas.
- Events: kopīgais kalendārs un uzdevumi.
- RESET: privāts labsajūtas modulis.
- Pharmacy: medikamentu uzskaite un termiņu kontrole.
- Household: biedri, lomas, koplietošanas konteksts.
- Settings/Profile: personalizācija, valoda, tēmas, BYOK.

## 4) Dizaina virziens

Katrai tēmai jābūt atpazīstamai “forma valodai”:

- Lucent: mīkstas formas, vieglums, gaisīga telpa.
- Hive: šūnu ritms, strukturētas ģeometrijas akcents.
- Pulse: kontrasts, biezas apmales, enerģiska tipogrāfija.
- Forge: precīzs, industriāls, instrumentu estētika.
- Botanical: organiski kontūras un mierīgs ritms.

Dizaina noteikums:

- identitāte ir konsekvence visos ekrānos, nevis tikai Dashboard.

## 5) Tehniskais virziens

- Frontend: Next.js App Router + React + TypeScript.
- Styling: Tailwind v4 (`@theme inline`) + semantiskie CSS tokeni.
- Backend: Supabase (Auth, DB, RLS, Realtime, Vault).
- Integrācijas: Google Fit OAuth (ar drošu token glabāšanu DB).

## 6) Prioritātes (nākamās iterācijas)

1. Theme konsekvence iekšlapās
- Kitchen, Events, Pharmacy vizuālā izlīdzināšana pa tēmām.

2. Tekstu konsekvence
- i18n atslēgu jēgas salāgošana ar UI copy un dokumentāciju.

3. Risku samazināšana
- OpenAI env naming vienošana.
- Google Fit token tabulas klātbūtnes pārbaude production DB.

4. Kvalitātes bāze
- kritisko ceļu testu pārklājuma palielināšana.

## 7) Izpildes princips

Visas izmaiņas jāveic pa mazām partijām ar verifikāciju:

1. Kods vai saturs
2. Lint/tests/build (ja attiecas)
3. Dokumentācijas atjaunināšana
4. Riska statusa precizēšana

## 8) Saistītie dokumenti

- `AI-START-HERE.md` — AI darba secība.
- `ARCHITECTURE.md` — tehniskā struktūra.
- `KNOWN-RISKS-AND-DECISIONS.md` — riski un lēmumi.
- `OPERATIONS-RUNBOOK.md` — operacionālie soļi.
- `GLOSSARY.md` — terminoloģijas avots.
- `TEHNISKAIS-ZURNALS.md` — vienīgais aktīvais tehniskais žurnāls (labojumi, deploy un tehniskās piezīmes).
