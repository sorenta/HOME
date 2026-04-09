# Known Risks And Decisions

Šis dokuments satur kritiskos punktus, kas AI jāzina pirms jebkādām lielām izmaiņām.

Pēdējā atjaunināšana: 2026-04-07

## 1) Aktīvie riski

### Augstā prioritāte

1. **OpenAI env naming**
   - Fails: `src/lib/openai.ts`
   - Risks: kods lieto `OPENAI_API_KEY`, bet standarts ir `OPENAI_API_KEY` — var radīt deploy konfigurācijas kļūdas.
   - Darbība: pārbaudīt un vienot nosaukumu visā kodā + Vercel env.

2. **Testu pārklājuma risks**
   - Risks: pie lielām izmaiņām pieaug regresiju iespēja.
   - Darbība: pakāpeniski pievienot API route un domēna loģikas testus ar prioritāti kritiskajiem moduļiem.

3. **Google Fit tokens glabāšana**
   - Jaunais fails: `supabase/google_fit_tokens.sql`
   - Risks: SQL migrācija jāpalaiž production Supabase instancē, citādi token upsert kļūdos.
   - Darbība: apstiprināt, ka `user_google_fit_tokens` tabula eksistē production DB.

### Vidējā prioritāte

4. **Nelietotais kods**
   - Audita laikā identificēti 21+ komponenti un lib faili bez aktīvām atsaucēm.
   - Risks: tehniskais parāds, lielāka orientācijas grūtība.
   - Darbība: dzēst pa mazām partijām, katru reizi ar lint + test + build.

5. **Calendar lapa — placeholder**
   - Risks: tukšs placeholder redzams lietotājiem.
   - Darbība: paslēpt no navigācijas līdz implementācijai vai pievienot "drīzumā" stāvokli.

6. **BYOK teksti Settings lapā**
   - Risks: UI teksti var neatspoguļot server-side Vault modeli.
   - Darbība: pārskatīt un saskaņot ar faktisko BYOK plūsmu.

## 2) Pieņemtie tehniskie lēmumi

| Lēmums | Pamatojums |
|--------|-----------|
| BYOK glabāšana server-side (Supabase Vault) | API atslēga netiek glabāta klientā — tikai server-side caur `user_kitchen_ai` |
| Supabase env caur `src/lib/supabase/env.ts` | Vienots "source of truth" — neizmanto `process.env` tieši API routes |
| Hard-fail env validācija | `scripts/validate-env.mjs` aptur dev/build/start, ja env trūkst |
| Theme-first dizains | 5 tematiskās pasaules ir core UX — UI pielāgojas tēmai visā app |
| Mobile-first izpildījums | Primārā ierīce ir telefons |
| RLS-first datu drošība | Privātie un household dati stingri nodalīti ar Supabase RLS politikām |

## 3) Darbu prioritāte

1. OpenAI env naming vienošana
2. Google Fit token migrācijas apstiprināšana production
3. Testu pārklājuma palielināšana
4. Nelietotā koda tīrīšana
5. Calendar lapas lēmums (paslēpt vai pabeigt)
6. BYOK tekstu saskaņošana

## 4) Verifikācijas noteikums

Pirms riska atzīmēšanas kā “labots”, jābūt:

1. Koda izmaiņai attiecīgajā failā
2. Repro/validācijas piezīmei
3. Atjauninātam dokumentācijas ierakstam
