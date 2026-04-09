# Production Check — 2026-04-06

## Deploy

- Production URL: `https://home-six-fawn.vercel.app`
- Inspect URL: `https://vercel.com/sorentas-projects/home/EAgT9PAsR1WAUPaPPLZ8DUXTgJMm`
- Deploy statuss: veiksmīgs

## Pārbaudīts publiski

### Sākumlapa

- Lapa ielādējas.
- Autentifikācijas ievads redzams korekti.
- Netika konstatēta acīmredzama publiska renderēšanas kļūda HTML līmenī.

### RESET lapa

- Lapa ielādējas.
- RESET route eksistē un rāda pareizu virsrakstu un aprakstu.
- Neautentificētam lietotājam korekti redzams auth gate ar saiti uz `/auth`.
- Netika konstatēts publisks 404, tukšs ekrāns vai salūzusi route struktūra.

## Ierobežojumi šajā pārbaudē

- Bez testa konta production vidē nevarēju pilnvērtīgi pārbaudīt autentificēto RESET plūsmu.
- Tāpēc nav manuāli apstiprināts production līmenī:
  - miega lauku saglabāšana;
  - trendu datu nolasīšana no Supabase;
  - quit streak restart ar iemeslu;
  - AI paneļa autorizēta darbība;
  - health source savienojumu reālā plūsma.

## Kas jau ir apstiprināts lokāli / tehniski

- `npm run lint` iziet bez kļūdām.
- Supabase migrācija jaunajiem RESET laukiem tika uzlikta.
- DB līmenī apstiprināti lauki:
  - `reset_daily_signals.sleep_bedtime`
  - `reset_daily_signals.sleep_wake_time`
  - `reset_wellness_goals.last_slip_at`
  - `reset_wellness_goals.last_slip_reason`

## Ieteicamā manuālā smoke pārbaude ar test kontu

1. Pieslēgties production vidē.
2. Atvērt `/reset`.
3. Saglabāt šodienas signālus ar miega laikiem.
4. Pārbaudīt, vai trendu panelis sāk rādīt datus.
5. Izveidot vai izmantot quit goal un atzīmēt `Mark a slip`.
6. Pārbaudīt, vai streak tiek restartēts un iemesls saglabājas.
7. Pārbaudīt, vai body tracking un AI panelis uzvedas korekti.