# SEO Audita Ziņojums (Maestro-style)
**Datums:** 2026. gada 13. aprīlis
**Projekts:** H:O (HomeOS)

---

## 1. Meta tagi un Brendings
### Atklājumi
- **Globālie Metadati (`src/app/layout.tsx`):**
    - **Virsraksts (Title):** "H:O" ir pārāk īss un neinformatīvs. Trūkst atslēgvārdu.
    - **Apraksts (Description):** Funkcionāls, bet nepieciešams uzlabot CTA (Click-Through Rate).
    - **Social Sharing:** Pilnībā trūkst Open Graph (`og:*`) un Twitter Card tagu.
    - **Kanoniskās saites (Canonical):** Nav ieviestas, kas var radīt dublēta satura risku.
- **Mārketinga lapa (`marketing-site/index.html`):**
    - **Virsraksts:** "H:O | HomeOS" ir labāks, bet trūkst augstas intensitātes atslēgvārdu latviešu valodā (piem., "mājsaimniecības vadība").
- **Sadaļu Metadati:** Lapām kā `/finance` un `/kitchen` trūkst unikālu metadatu, tās manto vājo globālo virsrakstu.

### Ietekme
- **Zema:** Meklēšanas rezultātos lapa izskatās nepabeigta.
- **Vidēja:** Zems klikšķu skaits no sociālajiem tīkliem un meklētājprogrammām.

---

## 2. Strukturētie dati (Schema.org)
### Atklājumi
- **Statuss:** **KRITISKI TRŪKST**. Projektā netika atrasts neviens JSON-LD skripts.
- **Ieteikums:** Ieviest `SoftwareApplication` shēmu mārketinga lapai un galvenajam layoutam.

---

## 3. Pārlūkojamība (Crawlability)
### Atklājumi
- **Robots.txt & Sitemap:** Trūkst abi. Meklētājiem ir grūtāk indeksēt visas lietotnes sadaļas.
- **Hreflang:** Trūkst tagu, kas sasaistītu LV un ENG versijas mārketinga lapā.

---

## 4. Veiktspēja un Core Web Vitals (CWV)
### Atklājumi
- **Fontu pārpilnība:** Tiek ielādētas **10 dažādas fontu saimes**. Tas būtiski ietekmē LCP (Largest Contentful Paint) un CLS (Cumulative Layout Shift).
- **Smagas atkarības:** `three.js` un `Spline` izmantošana dashboardā var palielināt TTI (Time to Interactive) uz mobilajām ierīcēm.

---

## 5. Iekšējās saites un Pieejamība
### Atklājumi
- **Statuss:** **LABS**. Tiek izmantoti Next.js `Link` komponenti, navigācija ir pārlūkojama. ARIA labeli un tulkojumi navigācijā ir korekti.

---

## Remediation Plāns

### 1. fāze: Pamati (Augsta prioritāte)
- [ ] Izveidot `src/app/robots.ts` un `src/app/sitemap.ts`.
- [ ] Atjaunināt `src/app/layout.tsx` ar pilnu metadatu komplektu (Title, OG, Twitter, Canonical).
- [ ] Pievienot unikālus metadatus galvenajām sadaļām.

### 2. fāze: Rich Results (Vidēja prioritāte)
- [ ] Ieviest JSON-LD strukturētos datus.
- [ ] Pievienot `hreflang` saites valodu pārslēgšanai.

### 3. fāze: Optimizācija (Ilgtermiņa)
- [ ] Konsolidēt fontus (samazināt no 10 uz 2-3).
- [ ] Veikt live-site testēšanu ar PageSpeed Insights.
