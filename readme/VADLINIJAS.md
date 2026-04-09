# Darba Vadlīnijas un Noteikumi (HomeOS)

Pēdējā atjaunināšana: 2026-04-08

---

## 1. Lokālais Starts un Vide

### Ātrās komandas:
- `npm install` — instalēt atkarības.
- `npm run dev` — palaist izstrādes serveri (`localhost:3000`).
- `npm test` — palaist testus.
- `npm run lint` — pārbaudīt koda stilu.
- `npm run build` — pārbaudīt production būvi.

### Vides mainīgie (`.env.local`):
**OBLIGĀTI** izmantot `src/lib/supabase/env.ts` helperi, nevis `process.env`.
Nepieciešami:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side funkcijām)
- `GEMINI_API_KEY` (server-side AI verifikācijām)

Ieteicami:
- `OPENAI_API_KEY` (ja nepieciešami OpenAI server-side diagnostikas/fallback scenāriji)
- `GOOGLE_FIT_OAUTH_CLIENT_ID` + `GOOGLE_FIT_OAUTH_CLIENT_SECRET` (abi kopā, ja ieslēdz Google Fit OAuth)

---

## 2. AI Darba Plūsma (Mandatory for Agents)

Strādājot pie projekta, AI aģentam jāievēro šī secība:
1.  **Pārbaudi riskus**: Izlasi šī dokumenta sadaļu "Aktīvie riski".
2.  **Identificē moduli**: Skati arhitektūras slāņus `PROJEKTS.md`.
3.  **Drošība**: Izmanto `src/lib/supabase/env.ts` visiem jauniem API routes.
4.  **Verifikācija**: Pirms pabeigšanas palaid `lint`, `test` un `build`.
5.  **Dokumentācija**: Atjaunini šo failu, ja mainās lēmumi, un pieraksti paveikto `TEHNISKAIS-ZURNALS.md`.

---

## 3. Aktīvie Riski un Tehniskie Lēmumi

### Aktīvie Riski:
- **OpenAI env naming**: Nosaukums standartizēts uz `OPENAI_API_KEY`; jāpārliecinās, ka Vercel/lokālā vide izmanto tieši šo nosaukumu.
- **Google Fit tokens**: `user_google_fit_tokens` tabula jāapstiprina production DB.
- **Testu pārklājums**: Minimāls — prioritāte kritiskajiem moduļiem.

### Pieņemtie Tehniskie Lēmumi (Immutable):
- **BYOK server-side**: API atslēgas nekad netiek glabātas klientā, tikai Supabase Vault.
- **Hard-fail env**: Aplikācija nepalaižas, ja trūkst kritiskie vides mainīgie.
- **Theme-first**: Dizains tiek diktēts no centralizētiem tēmu tokeniem.
- **RLS-first**: Neviena tabula netiek publicēta bez atbilstošām RLS politikām.

---

## 4. Operacionālie Protokoli

### SQL / Migrācijas:
- Visi SQL faili atrodas `supabase/` mapē.
- Pirms schema izmaiņām validē RLS ietekmi katram modulim.

### Incidenti (Production):
1. Identificē moduli un maršrutu.
2. Pārbaudi env pieejamību un Auth sesiju.
3. Pārbaudi pēdējās SQL migrācijas.
4. Labo, verificē un atjaunini šo dokumentu.
