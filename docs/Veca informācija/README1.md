# HomeOS

Mājas / HomeOS ir mobile-first mājsaimniecības ekosistēma, kas apvieno kopīgu sākuma ekrānu, tematiskus moduļus un nākotnē paplašināmu AI palīdzību. Tā nav tikai lietotne, bet gan vienota sistēma ikdienas plānošanai, resursu pārvaldībai un privātai labsajūtai.

## Audita atjauninājums (2026-04-07)

Šis README ir papildināts pēc pilna koda audita. Detalizētais tehniskais pārskats atrodams failā `7. aprilis 26` repo saknē.

### Arhitektūras īsais ceļš

1. `src/app/layout.tsx` (root layout + globālie fonti + shell)
2. `src/components/providers/app-providers.tsx` (I18n -> Theme -> Auth -> Seasonal)
3. `src/components/layout/root-shell.tsx` (globālā navigācija + app rāmis)
4. `src/app/**/page.tsx` (moduļu lapas)
5. `src/components/**` un `src/lib/**` (UI + business loģika)

### Prioritārie tehniskie uzdevumi

1. Drošība: aizsargāt vai noņemt publisko diagnostikas endpoint `src/app/api/openai/test/route.ts`.
2. Konfigurācija: saskaņot OpenAI vides mainīgā nosaukumu (`OPENAI_API_KEY`) ar dokumentāciju un vidi.
3. Integrācija: pabeigt Google Fit callback token exchange plūsmu (`src/app/api/integrations/google-fit/callback/route.ts`).
4. UX: salabot tukšu atpakaļ pogas saturu `src/components/layout/module-shell.tsx`.
5. Tehniskais parāds: dzēst nelietotos komponentus/lib failus pa partijām ar `lint` + `test` + `build` pēc katras partijas.

### Nākamie darbi

Tuvākā izpildes secība (UI polish + stabilitāte):

1. Kitchen ātro darbību pogu vizuālā saskaņošana ar tēmu stiliem (ikonas, hover/active, kontrasts).
2. Events kartīšu un kalendāra elementu konsekvence katrā tēmā (Forge/Pulse/Hive/Botanical/Lucent).
3. Pharmacy saraksta rindu un statusu marķieru pielāgošana pa tēmām, saglabājot skaidru lasāmību.
4. Mājaslapas un profila tematisko ekosistēmu izlīdzināšana, lai katrai tēmai būtu atpazīstama “forma valoda”.
5. Kvalitātes pārbaude pēc izmaiņām: `npm run lint` + `npm test` + `npm run build`.

### Kvalitātes statuss uz audita brīdi

- `npm run lint` -> bez kļūdām
- `npm test` -> 1 suite, 1 passed
- Testu pārklājums joprojām minimāls (jāpaplašina API un domēna loģikas testiem)

## Ātrais starts (lokāli)

1. Instalē atkarības:

```bash
npm install
```

2. Izveido lokālo vides failu:

```bash
cp .env.local.example .env.local
```

3. Aizpildi obligātos mainīgos failā `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (obligāts server-side BYOK AI plūsmai)

4. Palaid izstrādes režīmu:

```bash
npm run dev
```

5. Atver pārlūkā:

```text
http://localhost:3000
```

## Supabase piezīmes

- Autentifikācija (`signUp`, `signInWithPassword`) notiek caur Supabase Auth.
- Lietotnes dati tiek glabāti Supabase tabulās (piem., profili, paziņojumu izvēles, aptieciņas ieraksti).
- Ja nav ielikti Supabase vides mainīgie, lietotne parādīs kļūdas ziņu par trūkstošu konfigurāciju.
- RLS politikas Supabase pusē ir obligātas, lai lietotāji redzētu un rediģētu tikai savus atļautos datus.
- BYOK AI shēmai jāpalaiž SQL fails `supabase/household_kitchen_ai.sql` (izveido `public.user_kitchen_ai`).

## BYOK AI (Server-side, per-user)

- API atslēga tiek ievadīta tikai `Settings` lapā.
- Atslēga tiek glabāta serverī (Supabase Vault + `public.user_kitchen_ai`) un piesaistīta konkrētam `user_id`.
- AI funkcijas (`Kitchen`, `Finance`, `RESET`) redz tikai autorizēts lietotājs, kuram ir sava BYOK atslēga.
- Ja DB shēma nav uzlikta, API atgriezīs `SCHEMA_MISSING` un jāpalaiž `supabase/household_kitchen_ai.sql`.
- RESET signālu / labsajūtas sync izmaiņām pēc jaunākajiem UI papildinājumiem palaid `supabase/reset_daily_signals.sql` un `supabase/reset_wellness_sync.sql`, lai pievienotu miega laukus un quit streak atkāpes metadatus.

## Noderīgas komandas

```bash
npm run dev      # Lokālā izstrāde
npm run build    # Production būves pārbaude
npm run lint     # Lint pārbaude
npm test         # Vienību testi (Jest)
```

## Vides mainīgie (minimums)

Lietotnei obligāti nepieciešams:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Papildus OpenAI test utilītai šobrīd tiek izmantots:

- `OPENAI_API_KEY`

Piezīme: ieteicams vienot naming konvenciju visā projektā (piem., tikai `OPENAI_API_KEY`) un to atspoguļot kodā + dokumentācijā vienlaikus.

 Produkta Filozofija - Mobile-first: Primāri lietošanai viedtālrunī.
 Datu Nodalījums: Skaidra robeža starp household (kopējiem) un private (personīgajiem) datiem.
 Realtime: Tūlītēja sinhronizācija starp mājsaimniecības biedriem, izmantojot Supabase.
 BYOK AI: "Bring Your Own Key" pieeja — katram lietotājam sava server-side atslēga, savi AI izdevumi un privātums.
 HomeOS: Dizaina Sistēma & Vizuālā Burvība
 HomeOS vizuālais pamats nav tikai pogu krāsošana. Tā ir dziļa, uz komponentu bāzes balstīta sistēma, kurā katrs motīvs (Theme) pilnībā pārraksta lietotnes uzvedību, fiziku un interakcijas.
 Dizaina Tehniskie Pamati
 Dinamiskie Tokeni: Katra tēma definē savus radius, spacing, border un shadow mainīgos.
 Kustību Fizika: Izmantojot Framer Motion, katrai pasaulei ir savs inerciālais svars (piem. Lucent ir lēns/gaisīgs, Forge ir straujš/mehānisks).
 Grid Loģika: Sākuma ekrāns transformējas no standarta Bento līdz pat astoņstūru bišu šūnām.
 Pamata Motīvi (Thematic Worlds)
 1. LUCENT (Kokvilnas maigums) Vizuālais: Krēmīgs bēšs (#faf8f5), ultra-noapaļoti stūri un maigas ēnas.Dzīvā Interakcija — "Rīta Dusa": Fona elementi lēni pulsē (opacity 0.6 -> 0.9), imitējot gaismas spēles aiz aizkariem.Micro-action: Atverot moduli, tas nevis "izlec", bet lēni atritinās kā kokvilnas audums.
 2. HIVE (Bento Strops) Vizuālais: Astoņstūru (octagon) klipēšana, dzintara dzeltenais un medus pilieni (honey-drip).Dzīvā Interakcija — "Bites Darbs": Pabeidzot uzdevumu virtuves sarakstā, maza bites animācija aiznes "punktu" uz Dashboard centru.Micro-action: Pogas nospiešana rada "medus viļņošanos" (ripple efektu) blakus esošajos astoņstūros.
 3. PULSE (Pop-Art Enerģija) Vizuālais: Halftone punktojums (comic-bg), 4px melnas apmales un nobīdītas ēnas.Dzīvā Interakcija — "Komiksu Sprādziens": Katrs "Save" vai "Done" izsauc lielu, pārejošu tekstu (piem. "BUM!", "WOW!"), kas izlec ar spring animāciju.Micro-action: Hover laikā elementi nedaudz "notrīc" (jitter), imitējot zīmētu multfilmu.
 4. FORGE (RS-Mode) Vizuālais: Metālisks gradients, sarkans neons un spidometra līnijas.Dzīvā Interakcija — "Dzinēja Jauda": Atverot lietotni, sarkana līnija "noskenē" ekrānu, un fona Glow pulsē tukšgaitas dzinēja ritmā.Micro-action: Skaitļu maiņa (piem. Finansēs) notiek ar mehāniska odometra griešanās efektu.
 5. BOTANICAL (Dabas Ritms) Vizuālais: Sūnu zaļais, zemes toņi un plūstošas, asimetriskas formas (organic-shape).Dzīvā Interakcija — "Asnu Augšana": Ielādes laikā apakšā redzama asniņa augšanas animācija, kas uzplaukst par lapu, kad dati ielādēti.Micro-action: Elementu malas lēni "morfē" (maina border-radius), radot dzīva auga sajūtu.
 Svētku Virsvara (Holiday Override)Šī ir sistēmas prioritāte Nr. 1. Ja kalendārs konstatē svētkus, visas iepriekšējās tēmas tiek bloķētas (izvēles iespēja pazūd), un lietotne kļūst par svētku portālu.Loģika:Aktivizācija: 1 dienu pirms svētkiem plkst. 00:00.Beigas: 1 dienu pēc svētkiem plkst. 23:59.Sveiciens: Dashboard galvgalī parādās personalizēts sveiciens (piem. "Priecīgus Ziemassvētkus, [Vārds]!").❄️ Ziemassvētki & Jaunais gads:Vizuālais: Tumši zils/sarmas balts fons ar lēni krītošām sniegpārslām (canvas animācija).Interakcija: Uz paziņojumiem un pogām "uzsnieg" sniegs. Nospiežot pogu, atskan viegls zvaniņa skanējums.Gaisotne: Bento kastes kļūst par dāvanu saiņojumiem.🐣 Lieldienas:Vizuālais: Pasteļtoņi un zaļa zāle ekrāna apakšā.Interakcija: Dashboard "noslēptas" olas. Tās atrodot un uzspiežot, tās saplīst ar konfeti efektu.🇱🇻 Latvijas Svētki (18. nov / 4. maijs):Vizuālais: Lielvārdes jostas motīvi un karmīnsarkanā krāsa.Interakcija: Fonā dūmakaini plīvo Latvijas karoga auduma tekstūra.Gaisotne: Svinīgs, monumentāls dizains ar etnogrāfiskiem elementiem interfeisā.
 Galvenie Moduļi
 Dashboard: Pielāgojams bento tipa sākuma ekrāns ar aktivitāšu plūsmu un adaptīvu prioritāšu loģiku.
 Virtuve: Inventārs, iepirkumu grozs un AI maltīšu idejas, balstoties uz esošajiem resursiem un ja kaut kas receptei trūkst, piedāvā sastāvdaļu.
 Finanses: Mājsaimniecības kopsumma, fiksētie maksājumi un transakciju vēsture.
 RESET: Privāts labsajūtas modulis. Partnerim redzams tikai "saudzīgs" rezultāta slānis, saglabājot lietotāja privātumu.
 Aptieciņa: Medikamentu un vitamīnu uzskaite ar termiņu kontroli.
 Notikumi: Kopīgs timeline, atpakaļskaitīšana un svētku atgādinājumi.
 Tehniskais Izpildījums
 Frontend: Next.js App Router, TypeScript, Tailwind CSS v4, Framer Motion.
 Backend: Supabase (Realtime, RLS, RPC).
 Deployment: Vercel ar potenciālu PWA virzienu.
 Datu Drošība: RLS (Row Level Security) nodrošina, ka privātie dati paliek privāti.
 Attīstības Ceļvedis
 Pašreizējais fokuss ir inner pages arhitektūras sakārtošana, lai katra tēma caurvītu visu produktu, nevis tikai sākuma ekrānu.
 Mugurkaula stabilizācija (Datu modeļi).
 UX zonu pārbūve (Dashboard & Navigācija).
 Iekšējo lapu un tēmu pilnīga adaptācija.
 Vizuālais "polish" un dzīvie testi uz mobilajām ierīcēm.
 AI funkciju paplašināšana.
 HomeOS — Pilna Lietotāja Pieredzes Analīze & Ideālais Plāns

📍 DASHBOARD (Sākuma ekrāns)
Kas ir šobrīd:
Sveiciens pēc diennakts laika ("Labrīt, [Vārds]") + mājsaimniecības nosaukums
6 moduļu Bento plītes: Kalendārs, Virtuve (featured), Finanses, RESET, Aptieciņa, Iestatījumi
3 metriku pīlieri: Biedru skaits, Atvērti uzdevumi, AI gatavs
Ūdens sacensība ar medaļu sistēmu
Mājsaimniecības biedru saraksts (max 4)
Aktivitāšu plūsma (līdz 4 ieraksti)
Diennakts laika paziņojums (mudina uz RESET check-in)
Svētku kartiņa un sezonālais baneris
Ko pieliktu klāt un kāpēc:
Papildinājums
Kāpēc
"Šodienas fokuss" kartīte — automātiski aprēķināta prioritāte (piem. "2 rēķini gaida samaksu", "Piena termiņš beidzas rīt", "Pēcpusdienā vizīte")
Šobrīd Dashboard rāda statisku plīšu griļu. Lietotājs neredz kāpēc viņam jāiet konkrētā modulī. Vienotā fokusa kartīte no visiem moduļiem dod atvērto durvju sajūtu — tu atver app un uzreiz zini, kas svarīgs.
Rīta/vakara mikro-rituāls — nevis tikai RESET nudge, bet arī "Vai iepirkumu saraksts gatavs?" (ja ir shopping items ar statusu "open") vai "Finanšu mēneša bilance: +120 EUR"
Diennakts kartīte šobrīd vienmēr dzen uz RESET. Bet ikdienā cilvēkam vajag arī atgādinājumu par pārtiku un naudu.
Ātrās darbības pogas — "+250 ml ūdens" tieši no Dashboard, "Ātrā pirkuma pievienošana" bez ieiešanas Kitchen
Ūdens logs jau ir Dashboard, bet ātrās darbības samazina klikšķu skaitu ikdienas atkārtotām darbībām.
Partnera pulsēšana — mazais indikators blakus biedra vārdam, kas rāda "tiešsaistē" / "pēdējo reizi aktīvs pirms 2h"
Māja ir par kopību. Šobrīd biedri ir tikai vārdi — nav sajūtas, ka otrs ir klāt.


💰 FINANSES
Kas ir šobrīd:
Pārskats: Maks (bilance), Ienākumi, Plūsma (izdevumi)
Izdevumu grupas (top 4 kategorijas)
Auto-ieskats (AI teksts par top kategoriju)
Rēķinu saraksts ar formu (nosaukums, summa, termiņa diena, kategorija)
Rēķinu statuss: "Samaksāts" / "Gaida"
Transakciju saraksts ar formu (nosaukums, summa, virziens, datums, piesaiste rēķinam)
Pēdējās 6 transakcijas
Ko pieliktu klāt un kāpēc:
Papildinājums
Kāpēc
Kopīgie krājumu mērķi (Savings Goals) — piemēram "Atvaļinājums: 340/1500 EUR", "Bērna mēbeles: 80/400 EUR" ar progress bāru
finance.goals un finance.goalsHint tulkojumi jau eksistē i18n vārdnīcā ("Kopīgie mērķi — progress redzams visiem biedriem"), bet kodā nekas nav implementēts. Šī ir dabiska paplašinājuma vieta.
Mēneša pārskats / grafiks — vienkārša ienākumu vs izdevumu līnija pa nedēļām vai mēnešiem
Šobrīd redzami tikai šī mēneša kopsummas cipari. Nav tendences sajūtas — vai mēs tērējam vairāk vai mazāk nekā iepriekš.
Atkārtojošo rēķinu automātikas — automātiska transakcijas ģenerēšana mēneša X datumā no fixed cost
Šobrīd rēķins un transakcija ir atsevišķi — lietotājam manuāli jāatzīmē "samaksāts" katru mēnesi. Ar automātiku pietiktu ar vienu "Apstiprini samaksu" pogu mēneša datumā.
Budžeta limits pa kategorijām — "Ēdienreizes: 300 EUR limits, iztērēti 210"
Šobrīd buildFinanceBuckets() rāda tērēto pa kategorijām, bet nav mērķa pret ko salīdzināt. Budget limits dotu kontroles sajūtu.
Rēķinu dzēšana un rediģēšana
Šobrīd var tikai pievienot rēķinus — nav iespējas labot kļūdu vai noņemt vecu rēķinu.


🍳 VIRTUVE (Kitchen)
Kas ir šobrīd:
AI asistents (BYOK: OpenAI/Gemini) ar server-side atslēgu izmantošanu
AI key ievade notiek tikai Settings lapā (per-user modelis)
Iepirkumu grozs ar statusiem (open → picked → archived/inventory)
Mājas inventārs pa kategorijām (8 grupas) ar termiņiem
Onboarding aptauja (4 soļi: piena prod., dārzeņi, olbaltumvielas, pieliekamais)
Autofill ieteikumi no vēstures (localStorage, max 200)
AI ieteiktie produkti ar "Pievienot grozam" pogu
Kategoriju filtrs inventāram
Realtime sinhronizācija
Ko pieliktu klāt un kāpēc:
Papildinājums
Kāpēc
Nedēļas ēdienreižu plānotājs (Meal Planner) — P/O/T/C/Pk/S/Sv ar brokastīm, pusdienām, vakariņām
AI šefpavārs jau dod ieteikumus, bet nav vietas kur tos "piespraust" pie dienām. Meal planner + AI = automātisks iepirkumu saraksts no nedēļas plāna.
"Drīz beigsies" brīdinājumi — izcelts top-3 saraksts ar inventāra vienībām, kuru termiņš < 3 dienas
Termiņi ir datos, bet nav aktīva brīdinājuma mehānisma. Lietotājs neieraudzīs, ka piens beidzas rītdien, ja neies inventārā skatīties.
Iepirkumu saraksta koplietošana — "Nosūtīt sarakstu" poga (kopē kā tekstu vai dalās ar partneri)
Bieži vienam no pāra jāiet veikalā — vienkāršs koplietojams saraksts (pat kā teksts) ietaupa laiku.
Daudzuma rediģēšana klāt esošiem inventāra vienumiem (ne tikai pievienot/dzēst)
Šobrīd ja nopirki 2 kg miltu un mājās jau bija 1 kg, nevar vienkārši atjaunot uz 3 kg — jādzēš un jāpievieno no jauna.
Barcode/QR skenēšana produktiem
qr-scanner bibliotēka jau ir package.json (izmantota household QR). Paplašināt tā, lai var noskenēt produktu svītrkodu un automātiski aizpildīt nosaukumu.


📅 NOTIKUMI (Events)
Kas ir šobrīd:
Pārskats ar metriku (kopā, kopīgie, personīgie, atvērtie darbi)
Tuvākā notikuma kartīte
Kalendāra mēneša režģis ar notikumu/uzdevumu indikatoriem
Dienas detaļu panelis (notikumi + darbi konkrētai dienai)
Notikumu pievienošana (nosaukums, datums, Kopīgs/Personīgs)
Uzdevumu pievienošana (nosaukums, atbildīgais, termiņš)
Uzdevuma atzīmēšana kā pabeigtu
Plānošanas ceļvedis
Ko pieliktu klāt un kāpēc:
Papildinājums
Kāpēc
Atpakaļskaitīšana (Countdown) — "Līdz atvaļinājumam: 23 dienas", "Līdz dzimšanas dienai: 5 dienas"
calendar.countdown tulkojums jau eksistē, bet kodā nav implementēts. Countdown ir emocionāls elements, kas veido gaidīšanas prieku.
Atkārtojošie notikumi — "Katru otro piektdienu: Uzkopšana", "Katru mēneša 15.: Rēķinu diena"
Šobrīd katrs notikums ir vienreizējs. Reālā dzīvē liela daļa mājas notikumu ir atkārtojošie.
Notifikācijas/atgādinājumi — push/banner X stundas pirms notikuma
Notikumu sistēma šobrīd ir pasīva — lietotājs pats jāatver lapa, lai redzētu ko.
Dāvanu ideju piezīme pie personīgiem svētkiem
events.plan.personalBody jau min "vēlāk var pievienot dāvanu idejas" — šo var realizēt kā vienkāršu teksta lauku pie notikuma.
Notikuma rediģēšana
Šobrīd var tikai pievienot un dzēst — nevar pārcelt datumu vai mainīt nosaukumu.
Nedēļas skats papildus mēneša skatam
Detalizētāks skats uz tuvākajām 7 dienām ar laika joslu.


🧘 RESET (Labsajūta)
Kas ir šobrīd:
Wellness mērķu onboarding (quit: cukurs/kafija/smēķēšana/custom + body: svara zaudēšana/bulk/lean)
Noskaņojums (mood) (score 0-100%) + Partnera noskaņojums (mood) (High/Steady/Low)
Quit streak taimeri (dzīvā laika atskaite pa sekundēm)
Ķermeņa mērījumi (svars + mērījumi: viduklis, gurni, krūtis, roka, augšstilbs)
Treniņu plāns (4 nedēļu cikls Bulk/Lean režīmam)
Privātie dienas signāli (soļi, ekrāna laiks, meditācija, noskaņojums, enerģija, piezīme)
Check-in sistēma (max 3 dienā)
Privātuma slānis (partneris redz tikai auru/procentu)
Google Fit integrācija (sagatavots)
Šifrētas privātās piezīmes
Ko pieliktu klāt un kāpēc:
Papildinājums
Kāpēc
Miega izsekošana — gulētiešanas un pamošanās laiks
dashboard.timeNotice.sleepHint jau piemin miegu kā "mājas līdzsvara daļu", bet nav vietas to fiksēt. Miegs ir Nr.1 labsajūtas faktors.
Nedēļas/mēneša tendences grafiks — līnijas grafiks ar noskaņojumu, enerģiju, soļiem pa dienām
Šobrīd signāli tiek saglabāti, bet nav nekur vizualizēti laika periodā. Cilvēks neredz, vai viņam iet labāk vai sliktāk.
Ūdens mērķa saistīšana ar RESET score
Ūdens ir Dashboard widgets, bet neskaita RESET score. Ja cilvēks seko ūdens mērķim, tam vajadzētu ietekmēt labsajūtas rādītāju.
"Gentle nudge" partnerim — ja score ir zems vairākas dienas, partneris saņem diskrētu ziņu
Empātijas sistēma (settings.empathy.recipients) ir jau konfigurēta, bet reālais "nudge" mehānisms nav implementēts.
Breathing/relaksācijas ātrais vingrinājums — 60 sekunžu elpošanas animācija
Lietotne jau ir par labsajūtu. Vienkārša elpošanas animācija (animēts aplis, kas izplešas/saraujas) ir zemas sarežģītības, bet augsta vērtība.
Quit streak atsākšana ar iemeslu — ja atkrītot, resets spēj fiksēt "kritis" iemeslu un sākt no jauna
Šobrīd quit streak taimers tikai skaita laiku. Dzīvē cilvēki atkrīt — svarīgi dot iespēju godīgi restartēt.


💊 APTIECIŅA (Pharmacy)
Kas ir šobrīd:
Inventārs ar formu (nosaukums, daudzums, vienība, termiņš)
Statusi: Kārtībā / Drīz jāpapildina / Steidzami
Brīdinājumi (termiņš ≤14d vai daudzums ≤3)
AI savietojamības sadaļa (Premium gated, ar vienu demo piezīmi)
Ko pieliktu klāt un kāpēc:
Papildinājums
Kāpēc
Lietošanas grafiks/atgādinājums — "Ibuprofēns: 1x dienā pēc ēšanas", "D vitamīns: rītā ar taukainiem ēdieniem"
Šobrīd aptieciņa ir tikai inventārs. Bet reālā dzīvē galvenā problēma nav "kas mājās ir", bet "kad un kā to lietot".
Devu izsekošana — "Šodien lietots: ✓ ✓ ✗"
Ja lietotājs zina, ka jālieto 3x dienā, vienkārša čekboksu rinda dienas devām dotu kontroli.
"Beidzas drīz" push atgādinājums
pharmacy.reminders sadaļa eksistē, bet push nav implementēts.
Inventāra rediģēšana (daudzuma koriģēšana bez dzēšanas/pievienošanas)
Tāpat kā Kitchen — izlietojot tabletes, nevar vienkārši samazināt skaitu.
Ģimenes biedra medikamenti — filtrēt pa "kam pieder"
Ja mājās ir 2+ cilvēki, medikamenti sajaucas. Vienkāršs "kam paredzēts" tags.


🏠 MĀJSAIMNIECĪBA (Household)
Kas ir šobrīd:
Onboarding: Izveidot jaunu / Pievienoties ar kodu
QR koda ģenerēšana un skenēšana
Biedru saraksts ar lomām
Koplietošanas links
Plāna rādītājs (Free / Premium)
Ko pieliktu klāt un kāpēc:
Papildinājums
Kāpēc
Lomu pārvaldība — admin, biedrs, viesis; tiesību noteikšana
Šobrīd visi biedri ir vienādi. Reāli vienam (izveidotājam) vajadzētu lielākas tiesības (dzēst biedrus, mainīt nosaukumu).
Biedru profilu attēli/avatari
Šobrīd rāda tikai iniciāļus. Pat vienkāršs emoji avatars vai krāsains iniciālis dotu personalizāciju.
Mājsaimniecības iestatījumi — pārdēvēt, dzēst, noņemt biedru
Šobrīd pēc izveides nevar mainīt nosaukumu vai noņemt kādu.
Aktivitāšu plūsmas pilnais skats
Dashboard rāda max 4 ierakstus. Household lapā varētu būt pilns feed ar filtrēšanu pa moduļiem.


👤 PROFILS
Kas ir šobrīd:
Vārds (rediģējams), e-pasts, loma, mājsaimniecība
RESET score, medaļas (🥇🥈🥉), svētku skaits
Personīgie datumi (dzimšanas diena, vārda diena)
Saīsnes uz retāk lietotiem moduļiem
Ko pieliktu klāt un kāpēc:
Papildinājums
Kāpēc
Profila bilde
Tiem nav bildītes — personalizācijas minimums.
Aktivitātes kopsavilkums — "Šomēnes: 12 check-in, 3 receptes, 8 iepirkumi"
Profils ir par "mani". Aktivitātes bilance eksistē kā tulkojums (profile.stats), bet nav implementēta.
Izaugsmes centrs — "progress pa nedēļām"
profile.growth tulkojums eksistē, bet nav uzbūvēts.
Sezonālā talismanu kolekcija
Sezonālā sistēma dod "talismanus" par collectibles — bet nav vietas profilā kur tos apskatīt.


⚙️ IESTATĪJUMI
Kas ir šobrīd:
Tēmu izvēle (5 tēmas)
Valodas pārslēgšana (LV/EN)
BYOK AI atslēgu pārvaldība (Gemini + OpenAI, server-side per-user)
AI funkciju pieejamības kontrole: bez savas BYOK atslēgas AI paneļi netiek rādīti
Notifikāciju togli (finanšu + aptieciņas)
Empātijas saņēmēji (RESET)
GDPR/privātuma sadaļa
Izrakstīšanās
Ko pieliktu klāt un kāpēc:
Papildinājums
Kāpēc
Ūdens mērķa konfigurēšana — mainīt no 2000 ml uz citu
Šobrīd goalMl: 2000 ir hardcoded. Katram cilvēkam atšķirīgs ūdens mērķis.
Datu eksports — "Lejupielādēt manus datus" (GDPR)
GDPR sadaļa min tiesības, bet nav vienas pogas kas tos realizē.
Tēmas priekšskatījums — pirms pārslēgšanas redzēt kā tēma izskatās
Šobrīd tēma mainās uzreiz — nav priekšstata par to, ko izvēlies.


🔐 AUTENTIFIKĀCIJA
Kas ir šobrīd:
Ienākt / Reģistrēties (e-pasts + parole)
Inspirējošs latviešu teksts
Privātuma politikas piekrišana
Welcome modālis pēc pirmās reģistrācijas
Ko pieliktu klāt un kāpēc:
Papildinājums
Kāpēc
"Aizmirsu paroli" plūsma
Šobrīd nav paroles atjaunošanas iespējas — standarta nepieciešamība.
Magic link (e-pasta saites auth) kā alternatīva parolei
Vieglāk mobilajā — nav jāatceras parole.


🏗️ IDEĀLĀ APLIKĀCIJA — Prioritāšu plāns
1. PRIORITĀTE — Ikdienas dzīves atvieglojumi (augstākā vērtība)
#
Kas
Kur
Ietekme
1.1
Šodienas fokusa kartīte (krossmoduļu prioritātes)
Dashboard
Lietotājs atver app un 3 sekundēs zina, kas svarīgs
1.2
Krājumu mērķi (Savings Goals ar progress)
Finance
Jau gatavs i18n, tikai UI + datu modelis
1.3
Atpakaļskaitīšana notikumiem
Events
Jau gatavs i18n, emocionāla vērtība
1.4
Medikamentu lietošanas grafiks
Pharmacy
Galvenā aptieciņas problēma nav inventārs, bet "kad lietot"
1.5
Miega izsekošana
Reset
Nr.1 labsajūtas faktors, vienkāršs forms
1.6
Aizmirsu paroli
Auth
Pamata nepieciešamība

2. PRIORITĀTE — Produktivitātes uzlabojumi
#
Kas
Kur
Ietekme
2.1
Ēdienreižu plānotājs + auto-iepirkumu saraksts
Kitchen
AI šefpavārs + planner = pilns cikls
2.2
Atkārtojošie notikumi/darbi
Events
Samazina manuālo ievadi par ~60%
2.3
Rēķinu auto-transakcijas
Finance
"Apstiprini samaksu" vs manuāla ievade
2.4
Inventāra daudzuma rediģēšana
Kitchen + Pharmacy
Pamata CRUD operācija, kas trūkst
2.5
Budžeta limiti pa kategorijām
Finance
Kontroles sajūta
2.6
Ūdens mērķa konfigurēšana
Settings
30 sekunžu darbs, bet personalizē pieredzi

3. PRIORITĀTE — Emocionālā pieredze
#
Kas
Kur
Ietekme
3.1
Tendences grafiki (RESET signāli + Finance)
Reset, Finance
"Vai man iet labāk?" — galvenais jautājums
3.2
Elpošanas vingrinājums
Reset
Zema sarežģītība, augsta vērtība
3.3
Partnera "gentle nudge"
Reset → Household
Empātijas sistēma ir jau konfigurēta, tikai trigger trūkst
3.4
Quit streak reset ar iemeslu
Reset
Godīgums > perfekcionisms
3.5
Sezonālo talismanu kolekcija profilā
Profile
Jau savāktās balvas nav redzamas

4. PRIORITĀTE — Pārvaldība un pilnīgums
#
Kas
Kur
Ietekme
4.1
Lomu pārvaldība (admin/biedrs)
Household
Drošība un kontrole
4.2
Notikumu/rēķinu rediģēšana
Events, Finance
Pamata CRUD
4.3
Datu eksports (GDPR)
Settings
Juridiska nepieciešamība
4.4
Profila bildes
Profile, Household
Personalizācija
4.5
Aktivitātes kopsavilkums profilā
Profile
profile.stats jau sagatavotas


Kopsavilkums
Aplikācijai ir ļoti stiprs pamats — 6 moduļi, 5 tēmas, realtime sync, i18n, sezonālā sistēma, privātuma slāņi. Galvenās nepilnības:
Daudzi i18n tulkojumi eksistē bez implementācijas (goals, countdown, stats, growth) — tie ir "solījumi" lietotājam, kas vēl nav izpildīti
Trūkst rediģēšanas gandrīz visur — var pievienot un dzēst, bet ne labot
Nav tendenču vizualizācijas — dati tiek vākti, bet nav grafiku
Dashboard ir pasīvs — rāda moduļu plītes, bet neapkopo krossmoduļu prioritātes
Aptieciņa un Finanses ir inventāra līmenī — trūkst "gudrā slāņa" (grafiki, budžeti, lietošanas grafiki)
