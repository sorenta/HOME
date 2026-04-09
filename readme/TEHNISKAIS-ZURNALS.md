# HomeOS — Tehniskais žurnāls

Šis ir vienīgais aktīvais tehniskais žurnāls šajā repozitorijā.  
Visi labojumi, deploy izmaiņas un tehniskie lēmumi tiek fiksēti tikai šeit.

Pēdējā atjaunināšana: 2026-04-08

## Ieraksta formāts

Katru jaunu ierakstu pievieno ar šo obligāto struktūru:

1. Datums (`YYYY-MM-DD`)
2. Laiks (`HH:MM`)
3. Laika zona (piem., `UTC`, `Europe/Riga`)
4. Ierakstu veica (persona/aģents)
5. Kāpēc ieraksts veikts
6. Kas salabots
7. Kas izdarīts
8. Ietekme (moduļi/funkcijas)
9. Verifikācija (`lint`, `test`, `build`, smoke testi u.c.)
10. Riska piezīmes (nebūtiski)
11. Riska piezīmes (prasa tūlītēju uzmanību)
12. Galvenie faili

### Ieraksta šablons (copy-paste)

```md
### [YYYY-MM-DD HH:MM TZ] Virsraksts
- **Ierakstu veica:** ...
- **Kāpēc ieraksts veikts:** ...
- **Kas salabots:** ...
- **Kas izdarīts:** ...
- **Ietekme:** ...
- **Verifikācija:** ...
- **Riska piezīmes (nebūtiski):** ...
- **Riska piezīmes (tūlītēja uzmanība):** ...
- **Galvenie faili:** ...
```

## Jaunākais kopsavilkums (2026-04-07)

- **Auth ielādes stabilitāte:** novērsts bezgalīgs loading stāvoklis, ja `supabase.auth.getSession()` ievelkas vai nofeilo.
  - Pievienots timeout un drošs fallback `ready=true`.
  - Fails: `src/components/providers/auth-provider.tsx`.

- **Dashboard build/TS kļūdas:** novērstas produkcijas build kļūdas, kas bloķēja Vercel deploy.
  - `hapticTap` imports, `BentoTile` props salāgošana (`sectionId`), tipa labojumi i18n payload.
  - Fails: `src/components/dashboard/bento-dashboard.tsx` un saistītie i18n faili.

- **Botanical layout labojums:** salabots leaf divider, kas saspieda shelf augstumu.
  - Ietekme: atjaunots pareizs botānikas dashboard izkārtojums.

- **Lokālās vides cache/SW problēma:** novērsta situācija, kur lokāli rādās novecojis UI.
  - `PwaProvider` dev režīmā netaisa SW reģistrāciju un iztīra SW/cache pēdas.
  - Pievienota dev-only `Reset` poga, kas notīra SW/cache/storage un pārlādē lapu.
  - Faili: `src/components/pwa/pwa-provider.tsx`, `src/components/layout/global-corner-actions.tsx`.

## Hronoloģija

### [2026-04-07] UX, i18n un tēmu polish
- Sakārtota navigācijas atpakaļ poga (`ModuleShell`) ar i18n.
- Ieviesta dinamiska “Today’s Focus” loģika dashboard.
- Kitchen/Pharmacy iekšlapu tēmu adaptācija.
- I18n hardcoded teksta tīrīšana (`Reset`, `Profile`, `Finance`).
- OpenAI env nosaukumu standartizācija (`OPENAI_API_KEY`).

### [2026-04-07] Build un deploy stabilizācija
- Novērstas TypeScript kļūdas, kas lauza Vercel production build.
- Atjaunotas i18n atslēgas un dublikātu tīrīšana vārdnīcā.

### [2026-04-07] Lokālās izstrādes stabilizācija
- Novērsts bezgalīgs loading auth bootstrap ceļā.
- Novērsts novecojuša UI risks lokāli (SW/cache/storage plūsma).

### [2026-04-08] Dokumentācijas un AI sakārtošana

- Pārdēvēts AI-GEMINI.md par TEHNISKAIS-ZURNALS.md.
- Konsolidēta visa readme/ mape trijos pamatdokumentos: README.md, PROJEKTS.md, VADLINIJAS.md.
- Iestatīta Gemini API atslēga lokālajai videi un Gemini CLI autorizācijai.
- Salabotas koda kļūdas (JSX komentāri un any tipi) Forge un Events moduļos, lai nodrošinātu veiksmīgu build uz Vercel.
- Atjaunota RequireAuth drošība galvenajā lapā.

### [2026-04-08] Production-Ready audits un hardening (Codex)
- **Kas esmu:**
  - Codex (GPT-5 bāzēts AI coding aģents), kas strādāja šajā repozitorijā lokāli.
- **Ko prasīja:**
  - Pilnu production-ready auditu un labojumus 5 blokos:
    1) Drošība/RLS/Vault,  
    2) Env un API konfigurācija,  
    3) Dizaina polish un mikro-interakcijas,  
    4) Koda tīrība/dead code/useEffect drošība,  
    5) Funkcionālā atbilstība (i18n vs realitāte, Google Fit callback),  
    + gala verifikācija ar `lint`, `test`, `build`.
- **Ko izdarīju:**
  - RLS hardening:
    - noņemta `profiles_household_select` politika (profili vairs nav household-wide nolasāmi);
    - pievienots `FORCE ROW LEVEL SECURITY` sensitīvām tabulām (`profiles`, `reset_*`, `user_kitchen_ai`, `user_google_fit_tokens` u.c.);
    - RESET ūdens tabulām `select` politika pārnesta uz owner-only (`user_id = auth.uid()`).
  - BYOK/Vault drošība:
    - saglabāta server-side pieeja (`user_kitchen_ai` + Vault), izņemti legacy browser key storage helperi;
    - noņemts diagnostikas endpoints `src/app/api/openai/test/route.ts` un nelietotais `src/lib/openai.ts`.
  - Google Fit plūsma:
    - callback pabeigts ar drošu OAuth apmaiņu;
    - sesijas sasaite ar nonce `state` + `httpOnly` cookie (token vairs netiek nests URL query `state`);
    - route faili pārlikti uz `src/lib/supabase/env.ts` helperiem.
  - Env sakārtošana:
    - `OPEN_API_KEY` vienots uz `OPENAI_API_KEY` dokumentācijā/kodā;
    - `scripts/validate-env.mjs` papildināts ar `GEMINI_API_KEY` un Google Fit pāra validāciju;
    - atjaunināts `.env.local.example`.
  - UI/polish:
    - ieviests globāls mikro-interakciju slānis klikšķināmiem elementiem (`active` scale + transition);
    - ieviests `--glass-bg` tokena lietojums;
    - Calendar lapā pievienoti vizuāli placeholderi “Countdown” un “Goals”.
  - Koda stabilitāte:
    - vairākās datu ielādes vietās pielikti `alive`/`AbortController` patterni (`kitchen`, `events`, `reset`, `water` widget);
    - noņemta daļa nelietotu importu/dead code.
  - Verifikācija:
    - `npm run lint` -> bez kļūdām (paliek warningi ārējā `.claude/` skill failā),
    - `npm test` -> 3/3 suite passed,
    - `npm run build` -> veiksmīgs.
- **Kas palika vēl neizdarīts / atvērts:**
  - “21+ nelietotie faili” nav pilnībā iztīrīti vienā piegājienā; tika izņemta tikai daļa drošības/tehniskā parāda failu.
  - Lint warningi nav 0 absolūti visā repo (paliek 3 warningi `.claude/skills/...`, kas nav produkta `src/` kods).
  - Nav veikta production DB manuāla apstiprināšana (`supabase` SQL migrāciju izpilde dzīvajā instancē joprojām jāizdara operacionāli).

### [2026-04-08] Operations Runbook aktivizācija un atjaunināšana (Codex)
- **Kas esmu:**
  - Codex (GPT-5 bāzēts AI coding aģents).
- **Ko prasīja:**
  - Atjaunināt operations runbook un pierakstīt šo darbu tehniskajā žurnālā.
- **Ko izdarīju:**
  - Izveidoju aktīvu runbook failu `readme/OPERATIONS-RUNBOOK.md`.
  - Ieliku aktuālos operacionālos punktus:
    - lokālais starts,
    - obligātie/ieteicamie env,
    - kvalitātes vārti (`lint`, `test`, `build`),
    - API drošības minimums (`env.ts`, BYOK server-side, Google Fit drošā plūsma),
    - SQL/RLS pārbaudes,
    - incidentu protokols,
    - dokumentācijas atjaunināšanas kārtība.
- **Kas palika vēl neizdarīts / atvērts:**
  - Vēsturiskais fails `readme/Veca informācija/OPERATIONS-RUNBOOK.md` paliek arhīvā (apzināti netika dzēsts šajā solī).

### [2026-04-08 07:22 UTC] Git push un Vercel production deploy (Codex)
- **Ierakstu veica:** Codex (GPT-5 bāzēts AI coding aģents).
- **Kāpēc ieraksts veikts:** Lietotāja pieprasījums nopushot aktuālās izmaiņas uz Git un izvietot production uz Vercel.
- **Kas salabots:** Vercel build kļūda, ko izraisīja trūkstošs `GEMINI_API_KEY` produkcijas vidē.
- **Kas izdarīts:**
  - Izveidots commit `3934b5f` un veikts `git push origin main`.
  - Palaists `vercel deploy --prod --yes`.
  - Pēc sākotnējā kritiena pievienots `GEMINI_API_KEY` Vercel `Production` un `Development` vidēm.
  - Veikts atkārtots production deploy ar statusu `READY`.
- **Ietekme:** Aktualizētais kods ir dzīvs production vidē; API build validācija iziet ar esošo env konfigurāciju.
- **Verifikācija:**
  - `git push` veiksmīgs (`main` atjaunināts uz `3934b5f`).
  - Vercel deployment `dpl_Dkqf2jqk794K9fsrM22DgPFWs4Md` ar `readyState=READY`.
  - Production alias: `https://home-six-fawn.vercel.app`.
- **Riska piezīmes (nebūtiski):**
  - `OPENAI_API_KEY` joprojām ir “optional but recommended”, build to neaptur.
- **Riska piezīmes (tūlītēja uzmanība):**
  - `Preview` vidē `GEMINI_API_KEY` nav globāli piesaistīts visiem preview branchiem; ja tiek lietoti preview deploy ārpus production plūsmas, var būt build kritieni bez atsevišķas env piesaistes branch līmenī.
- **Galvenie faili:** `readme/TEHNISKAIS-ZURNALS.md`.

### [2026-04-08 07:27 UTC] Lokālās darbības incidenta diagnostika (Codex)
- **Ierakstu veica:** Codex (GPT-5 bāzēts AI coding aģents).
- **Kāpēc ieraksts veikts:** Lietotājs ziņoja, ka lokāli “nekas neiet” pēc iepriekšējām izmaiņām.
- **Kas salabots:** Netika atrasts jauns koda defekts; veikta pilna reproducējamības pārbaude un lokālās vides “clean start” validācija.
- **Kas izdarīts:**
  - Pārbaudīts `npm run dev`, `npm run lint`, `npm test`, `npm run build`, `npm run start`.
  - Veikti HTTP smoke testi kritiskajiem maršrutiem (`/`, `/calendar`, `/kitchen`, `/reset` u.c.).
  - Veikta cache tīrīšana (`.next`) un atkārtota palaišana.
- **Ietekme:** Apstiprināts, ka repo kods lokāli ceļas un maršruti atbild korekti; problēma netika reproducēta no CI/aģenta puses.
- **Verifikācija:**
  - `dev/build/start` bez kritiskām kļūdām.
  - Maršruti atgriež `200`.
- **Riska piezīmes (nebūtiski):**
  - `OPENAI_API_KEY` paliek kā ieteicams (optional) env.
- **Riska piezīmes (tūlītēja uzmanība):**
  - Nav identificētas tūlītējas produkcijas riska pazīmes šajā incidentā.
- **Galvenie faili:** `scripts/validate-env.mjs`.

### [2026-04-08 07:33 UTC] Gemini CLI TOML parser labojumi (Codex)
- **Ierakstu veica:** Codex (GPT-5 bāzēts AI coding aģents).
- **Kāpēc ieraksts veikts:** Lietotājs ziņoja, ka Gemini CLI met atkārtotas `Failed to parse TOML file` kļūdas.
- **Kas salabots:** Bojāti extension prompt faili (`unterminated string` un nederīgs escape).
- **Kas izdarīts:**
  - Pārrakstīts `improve.toml` uz sintaktiski korektu saturu.
  - `edge-cases.toml` pārslēgts uz drošu literal multi-line formātu.
  - Validēti visi `gemini-cli-prompt-library` TOML faili ar parseri.
- **Ietekme:** Gemini CLI vairs nemeta TOML parser kļūdas startup laikā.
- **Verifikācija:**
  - `ALL_TOML_OK` parser pārbaude.
  - `gemini --version` un `gemini -p` izpilde veiksmīga.
- **Riska piezīmes (nebūtiski):**
  - Palika informatīvi MCP/extension brīdinājumi, kas nav saistīti ar TOML.
- **Riska piezīmes (tūlītēja uzmanība):**
  - Nav.
- **Galvenie faili:** `/home/codespace/.gemini/extensions/gemini-cli-prompt-library/commands/prompts/improve.toml`, `/home/codespace/.gemini/extensions/gemini-cli-prompt-library/commands/testing/edge-cases.toml`.

### [2026-04-08 07:41 UTC] Gemini API Key-Only režīms un MCP trokšņa samazināšana (Codex)
- **Ierakstu veica:** Codex (GPT-5 bāzēts AI coding aģents).
- **Kāpēc ieraksts veikts:** Lietotājs prasīja, lai Gemini startē tikai ar API key (nevis Google konta OAuth), un lai MCP startup kļūdas tiek novāktas.
- **Kas salabots:** Gemini auth režīms nofiksēts uz `gemini-api-key`; atslēgti problemātiskie MCP serveri, kas radīja `figma/github/supabase/dart` kļūdu troksni.
- **Kas izdarīts:**
  - `~/.gemini/settings.json` iestatīts `selectedType=enforcedType=gemini-api-key`.
  - Ar backup izņemti aktīvie OAuth faili (`oauth_creds.json`, `google_accounts.json`).
  - `~/.bashrc` ielikta automātiska `GEMINI_API_KEY` ielāde no projekta `.env.local`.
  - `~/.gemini/mcp-server-enablement.json` iestatīti `enabled:false` serveriem `figma`, `github`, `supabase`, `dart` (pagaidu troksņa novākšanai).
  - Pievienots `GEMINI_FORCE_FILE_STORAGE=true`, lai samazinātu D-Bus/Keychain kļūdu troksni.
- **Ietekme:** Gemini darbojas API key-only režīmā un vairs neiet OAuth-personal plūsmā; MCP kļūdu troksnis būtiski samazināts.
- **Verifikācija:**
  - `selectedType=gemini-api-key`, `enforcedType=gemini-api-key`.
  - `gemini -p` atgrieza korektu atbildi API key režīmā.
- **Riska piezīmes (nebūtiski):**
  - `Using FileKeychain fallback for secure storage.` paziņojumi Codespaces vidē paliek normāli.
- **Riska piezīmes (tūlītēja uzmanība):**
  - `github`/`supabase` atslēgšana ir apzināts pagaidu solis; pieslēgšanai jāieslēdz atpakaļ.
- **Galvenie faili:** `/home/codespace/.gemini/settings.json`, `/home/codespace/.gemini/mcp-server-enablement.json`, `/home/codespace/.bashrc`.

### [2026-04-09 10:45 Europe/Riga] Dzimšanas dienu automatizācija un ikgadēja atkārtošanās
- **Ierakstu veica:** Gemini CLI (Software Engineer).
- **Kāpēc ieraksts veikts:** Lietotāja pieprasījums uzlabot dzimšanas dienu pievienošanas UX un funkcionalitāti.
- **Kas salabots:** Dzimšanas dienām noņemta lieka laika izvēle un pievienota automātiska ikgadēja atkārtošanās.
- **Kas izdarīts:**
  - Paplašināts `PlannerEvent` tips ar `isRecurring` lauku.
  - Atjaunināta sinhronizācija (`events-sync.ts`), izmantojot `:annual` sufiksu `event_type` laukā ikgadējiem notikumiem.
  - `handleQuickAdd` visās tēmās tagad automātiski iestata `isRecurring: true` dzimšanas dienām.
  - `ForgeEventForm` uzlabojumi: noņemts laika lauks dzimšanas dienām, pievienots "Repeat yearly" slēdzis (default: ON dzimšanas/vārda dienām).
- **Ietekme:** Būtiski uzlabots dzimšanas dienu pievienošanas ātrums un datu kvalitāte; lietotājam vairs nav manuāli jāiestata atkārtošanās.
- **Verifikācija:** `lint`, `build` lokāli; koda struktūra atbilst BYOK un RLS-first principiem.
- **Galvenie faili:** `src/lib/events-planner.ts`, `src/lib/events-sync.ts`, `src/app/events/page.tsx`, `src/components/events/forge/ForgeEventForm.tsx`.

### [2026-04-08 08:35 UTC] Dashboard uzlabojumi: "Šodienas fokuss" un ātrās darbības
- **Ierakstu veica:** Gemini CLI (Software Engineer).
- **Kāpēc ieraksts veikts:** Ceļakartes (PROJEKTS.md) prioritāšu īstenošana lietotāja ērtībai.
- **Kas salabots:** Papildināta trūkstošā funkcionalitāte galvenajā ekrānā.
- **Kas izdarīts:**
  - Izveidota `TodayFocus` komponente, kas apkopo datus no Finance, Kitchen, Pharmacy un Events.
  - Izveidota `DashboardQuickActions` komponente ar tēmai pielāgotu dizainu ātrai ierakstu pievienošanai.
  - Abas komponentes integrētas `BentoDashboard`.
  - Pievienots deep-linking atbalsts (`?action=...`) moduļu lapās (`Kitchen`, `Finance`, `Events`, `Pharmacy`), lai ātrās darbības tiešām strādātu.
  - Papildinātas i18n vārdnīcas ar nepieciešamajām atslēgām.
- **Ietekme:** Būtiski uzlabots Dashboard lietojamība (UX); lietotājs uzreiz redz prioritātes un var veikt biežākās darbības ar vienu klikšķi.
- **Verifikācija:** Kods atbilst esošajiem tēmu un i18n patterniem; lint/build pārbaude lokāli (pēc komponentu pievienošanas).
- **Riska piezīmes (nebūtiski):** Ātrās darbības šobrīd pārvirza uz moduli un auto-aktivizē darbību; nākotnē varētu izmantot inline modālus.
- **Galvenie faili:** `src/components/dashboard/today-focus.tsx`, `src/components/dashboard/dashboard-quick-actions.tsx`, `src/app/kitchen/page.tsx`, `src/app/finance/page.tsx`, `src/app/events/page.tsx`, `src/app/pharmacy/page.tsx`.

### [2026-04-08 07:58 UTC] GitHub un Supabase MCP atkārtota sasaiste + OAuth URL remonta helperi (Codex)
- **Ierakstu veica:** Codex (GPT-5 bāzēts AI coding aģents).
- **Kāpēc ieraksts veikts:** Lietotājs prasīja praktiski saslēgt Gemini ar GitHub un Supabase; Supabase OAuth plūsmā atkārtojās URL parametru kļūdas (`scoe`, `redirect_urihttp...`).
- **Kas salabots:** Atjaunota `github`/`supabase` MCP pieejamība un izveidoti droši helperi Supabase OAuth URL normalizācijai.
- **Kas izdarīts:**
  - `extension-enablement.json` atjaunots `github` un `supabase` uz enabled režīmu.
  - `mcp-server-enablement.json` izņemti disable ieraksti `github`/`supabase`.
  - `~/.bashrc` pievienota `GITHUB_MCP_PAT` ielāde no `gh auth token`.
  - Pievienoti helperi `gemini_supabase_auth_url` un `gemini_supabase_auth_open`, kas labo biežākos URL bojājumus (`scoe` -> `scope`, trūkstošs `=` atslēgparametros).
- **Ietekme:** `github` un `supabase` MCP kļuva pieslēdzami un stabili lietojami no Gemini; OAuth autorizācija kļuva atkārtojama arī pie URL wrap/copy kļūdām.
- **Verifikācija:**
  - `gemini mcp list` rāda:
    - `github` -> `Connected`
    - `supabase` -> `Connected`
  - `NEXT_PUBLIC_SUPABASE_URL` sakrīt ar `https://ftybjidkiagrptgoffsq.supabase.co`.
- **Riska piezīmes (nebūtiski):**
  - `chrome-devtools` var būt `Disconnected` bez ietekmes uz Supabase/GitHub sasaisti.
- **Riska piezīmes (tūlītēja uzmanība):**
  - Supabase OAuth URL ir īslaicīgs (`state`/nonce); pie noilguma jāpalaiž auth no jauna.
- **Galvenie faili:** `/home/codespace/.gemini/extensions/extension-enablement.json`, `/home/codespace/.gemini/mcp-server-enablement.json`, `/home/codespace/.bashrc`, `.env.local`.
