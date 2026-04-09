# Sveiks, Claude Code, esmu Codex un konstatēju:

Šajā repozitorijā galvenā nestabilitāte bija saistīta ar Supabase vides mainīgo nekonsekvenci starp lokālo izstrādi, Next.js build laiku un Vercel vidi.

Praksē tas izpaudās kā periodiska kļūda:
- `Supabase nav konfigurēts ...`

Lietotāja sajūta bija “ik pa laikam strādā, ik pa laikam nestrādā”, jo:
- kodā tika izmantoti divi publiskās atslēgas varianti (`NEXT_PUBLIC_SUPABASE_ANON_KEY` un `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`) ar fallback loģiku;
- `NEXT_PUBLIC_*` vērtības tiek “nofiksētas” build/start brīdī;
- Vercel vidē sākotnēji env bija tukši;
- dev serveris ne vienmēr tika pilnībā pārstartēts pēc env izmaiņām.

## 1) Konstatētās problēmas

1. Env nosaukumu dublēšanās (`ANON_KEY` vs `PUBLISHABLE_DEFAULT_KEY`) radīja driftu starp failiem, CI un runtime.
2. Nebija centralizēta Supabase env nolasīšanas helpera, tāpēc katrā route bija sava variācija.
3. Nebija stingra pre-start/pre-build validācija, kas aptur procesu, ja env trūkst.
4. Dokumentācijā un workflow failos bija vecā nomenklatūra, kas veicināja sajukumu.

## 2) Ko es mainīju

### 2.1. Vienots Supabase env modelis kodā

Pievienots jauns helperis:
- `src/lib/supabase/env.ts`

Tas definē vienotu avotu:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side gadījumiem)

Un noņem fallback atkarību no `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 2.2. API/klienta faili pārslēgti uz helperi

Atjaunināti faili:
- `src/lib/supabase/client.ts`
- `src/app/api/ai/finance/route.ts`
- `src/app/api/ai/reset/route.ts`
- `src/app/api/kitchen/credentials/route.ts`
- `src/app/api/kitchen/meals/route.ts`
- `src/app/api/openai/test/route.ts`
- `src/app/api/integrations/google-fit/callback/route.ts`

### 2.3. Hard-fail validācija pie `dev/build/start`

Pievienots:
- `scripts/validate-env.mjs`

Un `package.json` skriptos:
- `predev`
- `prebuild`
- `prestart`

Ja trūkst obligātie env, komanda uzreiz apstājas ar skaidru kļūdu sarakstu.

### 2.4. Dokumentācija/CI saskaņota ar jauno standartu

Atjaunināti:
- `.env.local.example`
- `README.md`
- `readme/OPERATIONS-RUNBOOK.md`
- `docs/supabase-setup.md`
- `.github/workflows/deploy.yml`
- `src/lib/i18n/dictionaries.ts` (kļūdas teksts)

## 3) Ko panācu

1. Novērsta periodiskā Supabase konfigurācijas kļūda no nomenklatūras drift.
2. Ieviesu “fail-fast” mehānismu, kas neļauj palaist `dev/build/start` ar nekorektu env.
3. Samazināts risks, ka lokāli strādā, bet deploy neiet (un otrādi).
4. Vienots “source of truth” Supabase publiskajai atslēgai visā kodā.

## 4) Pārbaudes rezultāti

Palaistas un veiksmīgas:
- `npm run predev` -> `[env:dev] OK`
- `npm run lint` -> 0 errors (ir 4 esoši warnings, nav saistīti ar šo env refactor)
- `npm test -- --runInBand` -> 3/3 suite, 33/33 tests
- `npm run build` -> success (esošie CSS warnings paliek, nav kritiski)

Papildus validācija:
- bez `.env.local` faila `validate-env.mjs` korekti failo ar missing env sarakstu.

## 5) Svarīgas piezīmes nākamajam AI

1. Ja parādās jauns route/API ar Supabase klientu, izmanto `src/lib/supabase/env.ts` helperi, nevis tiešu `process.env` lasīšanu.
2. Neatjauno `NEXT_PUBLIC_SUPABASE_ANON_KEY` fallback loģiku kodā.
3. Vercel pusē env jābūt ieliktiem vismaz `Production` un `Development`; ja vajag preview deploy testus, pārbaudi `Preview` branch-scoped env konfigurāciju dashboardā.
4. Pēc env izmaiņām vienmēr jābūt jaunam procesam (`dev` restart / jauns deploy), jo `NEXT_PUBLIC_*` tiek inlinēts build laikā.

## 6) Komandas piezīme

Mēs tiešām strādājam vienā komandā. Ja gribi, nākamajā solī vari paņemt “Preview env branch mapping” sakārtošanu Vercel dashboard līmenī kā atsevišķu housekeeping uzdevumu.
