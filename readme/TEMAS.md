# H:O Tematiskās Pasaules (Dizaina Sistēma)

Tēmas H:O aplikācijā nav tikai krāsu paletes. Tās ir **"Pasaules"**, kas definē lietotāja noskaņojumu un interakcijas veidu.

---

## ☁️ LUCENT (Rīta Dusa)
*Mērķis: Miers, skaidrība, gaisīgums.*

- **Filozofija**: Lietotne kā mīksts kokvilnas audums. Nekā asu, nekā steidzīga.
- **Vizuālie elementi**: Ultra-noapaļoti stūri (`radius: 3rem`), maigi pasteļtoņi, `backdrop-blur` stikla efekti.
- **Kustība (Motion)**: Lēna, inerciāla. Elementi "uzpeld" vai "atritinās".
- **Lietojums**: Ideāla rīta rutīnai un mierīgai plānošanai.

---

## 🐝 HIVE (Bento Strops)
*Mērķis: Efektivitāte, kopdarbs, struktūra.*

- **Filozofija**: Māja kā perfekti sakārtots bišu strops. Katram elementam sava šūna.
- **Vizuālie elementi**: Astoņstūru (octagon) formas, dzeltenā un dzintara krāsa, heksagonāli fona raksti.
- **Kustība (Motion)**: "Sticky" un atsperīga. Pogas nospiešana rada "medus viļņa" efektu kaimiņu šūnās.
- **Lietojums**: Mājsaimniecības kopīgo darbu organizēšanai.

---

## 💥 PULSE (Pop-Art Enerģija)
*Mērķis: Jautrība, tūlītēja rīcība, drosme.*

- **Filozofija**: Dzīve kā komikss. Katrs sasniegums ir "BUM!" vai "WOW!".
- **Vizuālie elementi**: 4px melnas apmales, izteiktas nobīdītas ēnas (comic-style), košas krāsas.
- **Kustība (Motion)**: Snappy (strauja). Elementi "izlec" vai "uzsprāgst" (spring bounce).
- **Lietojums**: Motivācijai, iepirkumu sarakstiem, aktīvai dienai.

---

## 🛠️ FORGE (Dzinēja Jauda)
*Mērķis: Kontrole, jauda, precizitāte.*

- **Filozofija**: Lietotne kā futūristiska vadības pults. Tu esi savas mājas kapteinis.
- **Vizuālie elementi**: Metāliski tumši foni, sarkans neons, režģu (grid) līnijas, skenēšanas efekti.
- **Kustība (Motion)**: Mehāniska, robotiska. Skaitļi mainās kā fizisks odometrs.
- **Lietojums**: Finanšu kontrolei un nopietnai datu analīzei.

---

## 🌿 BOTANICAL (Dabas Ritms)
*Mērķis: Augšana, ilgtspēja, organiska plūsma.*

- **Filozofija**: Māja kā dzīvs organisms. Viss aug un mainās.
- **Vizuālie elementi**: Asimetriskas formas (border-morphing), sūnu zaļie toņi, augu tekstūras.
- **Kustība (Motion)**: Organiska. Ielādes laikā elementi "izaug" no asna par lapu.
- **Lietojums**: Labsajūtai (RESET) un pārtikas krājumu vadībai.

---

## 🛠 Tehniskā ieviešana
Katrai tēmai jābūt redzamai caur:
1.  **CSS mainīgajiem** (`globals.css` - `--color-accent`, `--radius-card`).
2.  **Layout Zones** (`ModuleShell` - katrai tēmai savs fonu/apmalu stils).
3.  **Animāciju fiziku** (`transitionForTheme(themeId)`).
4.  **Skaņu efektiem** (nākotnē).
