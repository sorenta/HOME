# HomeOS Projekta Dokumentācija (Vīzija un Arhitektūra)

Pēdējā atjaunināšana: 2026-04-08

---

## 1. Koncepcija un Mērķis

HomeOS ir **mobile-first** mājsaimniecības platforma, kas apvieno ikdienas koordināciju, privāto labsajūtu un AI atbalstu vienā pieredzē.

### Produkta pīlāri:
- **Mobile-first**: Primārais lietojums telefonā; desktop ir paplašinājums.
- **Theme-first dizains**: 5 tematiskās pasaules (`lucent`, `hive`, `pulse`, `forge`, `botanical`) ietekmē ne tikai krāsas, bet arī formas, ritmu un kustību.
- **Privātuma nodalījums**: Household dati ir koplietojami, RESET un sensitīvie dati ir privāti.
- **RLS-first drošība**: Datu piekļuve tiek kontrolēta DB līmenī ar Supabase RLS politikām.
- **BYOK AI**: AI atslēgas ir per-user un tiek glabātas server-side (Vault).

---

## 2. Dizaina Filozofija (Theme Worlds)

Dizaina noteikums: identitāte ir konsekvence visos ekrānos, nevis tikai Dashboard.

1.  **LUCENT (Kokvilnas maigums)**: Mīkstas formas, ultra-noapaļoti stūri, lēna "Rīta Dusa" pulsācija.
2.  **HIVE (Bento Strops)**: Astoņstūru (octagon) klipēšana, dzintara dzeltenais, medus viļņošanās efekts.
3.  **PULSE (Pop-Art Enerģija)**: 4px melnas apmales, nobīdītas ēnas, "komiksu sprādziena" animācijas.
4.  **FORGE (Industriāls)**: Metāliski gradienti, sarkans neons, mehāniska odometra skaitļu maiņa.
5.  **BOTANICAL (Dabas Ritms)**: Sūnu zaļais, organiski asimetriskas formas, "asnu augšanas" animācijas.

**Sezonālā sistēma (Holiday Override)**: Svētkos (Ziemassvētki, Lieldienas, 18. nov) sistēma automātiski pārslēdzas uz svētku vizuālo portālu.

---

## 3. Tehniskā Arhitektūra

### Slāņu modelis:
- **App layer (`src/app`)**: Route lapas, layout, loading, API routes.
- **UI layer (`src/components`)**: Domēna komponentes + UI primitīvi + provideri.
- **Domain layer (`src/lib`)**: Biznesa loģika, datu operācijas, i18n, integrācijas. Skatīt detalizētāk [ARHITEKTURA.md](ARHITEKTURA.md).
- **Data layer (`supabase/*.sql`)**: Shēma, RLS politikas, migrācijas.

### Provider ķēde (`src/components/providers/app-providers.tsx`):
`I18nProvider` → `ThemeProvider` → `ThemeActionEffectsProvider` → `AuthProvider` → `SeasonalProvider`.

---

## 4. Moduļu apskats un Nākotnes Plāns

| Modulis | Pašreizējā Loma | Ideālais Plāns (Prioritātes) |
|---|---|---|
| **Dashboard** | Prioritāšu centrs | "Šodienas fokuss" kartīte, Ātrās darbības pogas |
| **Kitchen** | Inventārs, iepirkumi, AI | Meal Planner, Barcode skenēšana, Termiņu brīdinājumi |
| **Finance** | Bilance, rēķini | Kopīgie mērķi (Savings Goals), Auto-transakcijas |
| **Events** | Kalendārs, uzdevumi | Atpakaļskaitīšana (Countdown), Atkārtojošie notikumi |
| **RESET** | Privāta labsajūta | Miega izsekošana, Tendences grafiki, Elpošanas vingrinājumi |
| **Pharmacy** | Medikamentu uzskaite | Lietošanas grafiks, Devu izsekošana, Brīdinājumi |

---

## 5. Glosārijs un Terminoloģija

- **Household**: Koplietojamā mājsaimniecības vienība.
- **BYOK**: Bring Your Own Key (per-user AI atslēga).
- **Vault**: Supabase drošā server-side slepeno vērtību glabāšana.
- **Bento dashboard**: Sākuma ekrāna flīžu izkārtojums.
- **RLS**: Row Level Security piekļuves kontrole.
