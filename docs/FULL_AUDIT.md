# H:O Projekta Audita Ziņojums (Maestro-style)
**Pēdējā atjaunināšana:** 2026. gada 13. aprīlis

---

## DAĻA 1: SEO Audits
- **Meta tagi:** "H:O" ir pārāk īss; trūkst sociālo tīklu (OG) tagu.
- **Strukturētie dati:** **KRITISKI TRŪKST**. Nav JSON-LD skriptu.
- **Pārlūkojamība:** Trūkst `robots.txt` un `sitemap.xml`.

---

## DAĻA 2: Drošības Audits
- **[VULN-001] Mājsaimniecības biedru piekļuve (Augsta prioritāte):** RLS noteikumi nepārbauda `can_see_*` atļaujas.
- **[VULN-002] Neaizsargāta AI pārbaudes adrese:** `/api/ai/verify` pieejama bez pieteikšanās.
- **Slepenie dati:** RESET piezīmju atslēga glabājas `localStorage`.

---

## DAĻA 3: Piekļūstamības Audits
- **[A11Y-003] Mikro-teksti (Augsta prioritāte):** Izmantoti pārāk mazi fonti (8px-10px).
- **Struktūra:** Trūkst `<main>` taga un "ātrās pārejas" saites.
- **Paziņojumi:** Kļūdu ziņojumi netiek nolasīti balsī (trūkst `aria-live`).

---

## DAĻA 4: Veiktspējas Audits (Performance)
- **[PERF-001] Fontu bloķēšana (Kritiski):** Tiek lādētas **10 fontu saimes**, kas bremzē LCP (14.9s).
- **[PERF-002] Bibliotēku svars:** `three.js` un `Spline` lādējas galvenajā pakotnē, palielinot TTI (17.0s).
- **[PERF-003] Animāciju slodze:** Pārāk daudz bezgalīgu `framer-motion` animāciju.

---

## Remediation (Uzlabojumu) Plāns

### 1. fāze: Kritiskie labojumi (TŪLĪT)
- [ ] **Drošība:** Salabot RLS noteikumus mājsaimniecības datiem.
- [ ] **Performance:** Samazināt fontu skaitu no 10 uz 2-3.
- [ ] **A11y:** Ieviest `<main>` tagu un pamatstruktūru.

### 2. fāze: Redzamība un Lietojamība (AUGSTA prioritāte)
- [ ] **SEO:** Izveidot `robots.txt` un `sitemap.ts`.
- [ ] **Performance:** Ieviest "Lazy loading" smagajām bibliotēkām.
- [ ] **A11y:** Palielināt minimālo fonta izmēru līdz 12px.

### 3. fāze: Strukturētie dati un Pulēšana (Vidēja prioritāte)
- [ ] **SEO:** Ieviest JSON-LD strukturētos datus.
- [ ] **Drošība:** Ierobežot piekļuvi AI pārbaudes adresei.
- [ ] **Performance:** Optimizēt animāciju cilpas.
