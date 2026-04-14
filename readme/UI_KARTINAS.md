# UI un Kartiņu Vadlīnijas (HomeOS)

Pēdējā atjaunināšana: 2026-04-13

Šis dokuments skaidro, kādus komponenšu veidus (kartiņas) lietot dažādās lapās un kā to izskats automātiski adaptējas katrai tēmai (motīvam).

---

## 1. Kartiņu (Komponenšu) Veidi

Projektā ir 3 galvenie kartiņu bloki, kas satur informāciju:

1. **`BentoTile` (Sākuma ekrāna flīzes)**
   * **Pielietojums:** Tikai un vienīgi Dashboard (Sākumlapā), lai veidotu "Bento box" stila izkārtojumu.
   * **Varianti:** `compact` (mazas, vienā rindā) un `featured` (lielas, izceļ svarīgāko informāciju).
   * **Īpašība:** Satur sevī animācijas un klikšķa (haptic) efektus, pārejot uz moduli.

2. **`MetricCard` (Statistikas kartiņa)**
   * **Pielietojums:** Visās iekšlapās, kur jārāda konkrēti cipari (Finance - konta atlikums; Kitchen - izmestās pārtikas procents).
   * **Varianti:** `default` (standarta bloks), `compact` (maza rindas šūna), `emphasis` (liels galvenais rādītājs).
   * **Īpašība:** Cipariem (value) tiek pielietots fontu tēmas stils (piem., Forge tas izskatās kā mašīnas odometrs).

3. **`GlassPanel` (Satura konteiners / Apvalks)**
   * **Pielietojums:** Iekšlapās (Events, Reset, Settings, Pharmacy, Kitchen), lai grupētu sarakstus, formas vai tekstus vienā lielā, smukā blokā.
   * **Īpašība:** Kalpo par vizuālo robežu starp aplikācijas fonu un pašu saturu. Sākotnēji tas tika veidots kā "stikla" efekts, taču tagad tas pilnībā transformējas atkarībā no tēmas (tas nav obligāti "stiklains").

---

## 2. Kā kartiņas izskatās katrā Motīvā (Tēmā)

Kartiņām nav "hardcoded" krāsu. Tās automātiski maina savu dizainu atkarībā no aktīvās tēmas.

* ☁️ **LUCENT (Maigums)**
   * **Izskats:** Ļoti noapaļoti stūri (`2.5rem` - `3rem`), virsmas izskatās kā maigs, matēts kokvilnas papīrs (balts/krēmīgs tonis ar iekšēju izgaismojumu). Tas vairs nav parasts "stikls", bet drīzāk fiziska, pūkaina materiāla imitācija.
   * **Ēnas:** Izteikti mīkstas, lielas un gaišas ēnas (`shadow-[0_30px_60px_-15px...]`), radot sajūtu, ka kartiņa lēni planē virs fona.
* 🐝 **HIVE (Struktūra)**
  * **Izskats:** Cietas struktūras, biezas apmales (`border-4`).
   * **Ekrāna odziņas un Animācijas:** Lielajām `BentoTile` kartiņām augšpusē ir oranžs "medus vāciņš" ar **dzīviem, animētiem medus pilieniem** (izmantojot 3 dažādus ātruma un aizkaves ritmus `dripSlow`, `dripMed`, `dripFast`, lai radītu organisku šķidruma krišanu). Tāpat atbalsta bites lidojuma spārnu animāciju. `GlassPanel` stūros parādās rotēti astoņstūri. Pogu kustība ir "lipīga" un atsperīga (`stiffness: 380`).
   * *Piezīme:* Iekšlapās fons ir pilnīgi tīrs (nav bišu šūnu rakstu fonā), lai netraucētu sarakstu un formu lasīšanu. Ekrāna odziņas darbojas tikai kopējos komponentos.
* 💥 **PULSE (Pop-Art)**
   * **Izskats:** 4px melnas apmales visām kartiņām, lai izskatītos kā no komiksa.
   * **Ēnas un Animācijas:** Cietas, nobīdītas ēnas bez izplūduma (`6px_6px_0px_#000`). Pieskaroties kartiņai telefonā, tā nedaudz palecas. Kustības fizika ir asākā starp visām tēmām (`stiffness: 520`), kas nozīmē, ka elementi ekrānā burtiski "izlec" vai uzsprāgst. Lielajām kartiņām ir animētas "Pow" uzlīmes. 
   * *Piezīme:* Iekšlapu foni ir monohromi, neizmantojot skaļus punktētus vai strīpainus fonus (halftone effects netiek renderēti pilnā ekrānā, tikai darbību klikšķos kā "BAM!").
* 🛠️ **FORGE (Jauda)**
   * **Izskats:** Metālisks tumšums (`bg-black/20` vai `bg-black/60`), smalkas `white/5` apmales.
   * **Ekrāna odziņas un Animācijas:** Pievienotas aparatūras stila detaļas — sarkanas skenēšanas līnijas (`maj-forge-neon-pulse`) un neona spidometru adatas. Piespiežot kartiņu, tiek atsegts "taustāms" sarkanā stikla mirdzums. Animāciju fizika (`stiffness: 450, damping: 24`) atdarina strauju un asu mehāniskas vadības pults pogas klikšķi.
   * *Piezīme:* Iekšlapās dominē īsts "OLED Black" fons, dzēšot jebkādus skenēšanas lāzerus pār visu ekrānu. Datiem ir jābūt viegli uztveramiem.
* 🌿 **BOTANICAL (Daba)**
   * **Izskats:** Organiskas kartiņu aprises ar maigu fona gaismiņu (balts `inset shadow`).
   * **Ekrāna odziņas un Animācijas:** Robežas nav asas, izceļas dabas zaļie toņi, atgādinot auga lapu. Animāciju fizika ir maigi vidēja (`stiffness: 280`), nodrošinot elpojošu un nesteidzīgu interakciju.
   * *Piezīme:* Iekšlapās fons ir statisks un relaksējošs "parchment" (smilšpapīra/pergamenta) tonis, bez peldošām augu daļiņām.
* **Dashboard (/)**: Tiek likts no `BentoTile`. Aktīvākie moduļi (Kā Finance vai Events) izmanto `featured` (lielas) kartiņas ar tēmu vizuālajiem efektiem.
* **Finance (/finance)**: Augšā atrodas Wallet Hero (naudas maku saturs), kas izmanto `MetricCard` (ar `emphasis` variantu naudai). Saraksti (Transakcijas) tiek ietīti iekš `GlassPanel`.
* **Events (/events)**: Katras nedēļas kalendārs un gaidāmie notikumi stāv lielā `GlassPanel`.
* **Kitchen (/kitchen)** un **Pharmacy (/pharmacy)**: Skaitļi (inventāra lielums) stāv iekš `MetricCard`, bet produktu saraksti tiek iepakoti iekš `GlassPanel`.
* **Reset (/reset)**: Labsajūtas forma un čats ar AI izmanto `GlassPanel`, kurā iekšā pogas un slīdņi pārņem attiecīgās tēmas krāsas (Pulse ir melnbaltas ar košiem akcentiem, Botanica - zaļganas).

*(Piezīme izstrādātājiem: Neveidojiet jaunas `<div className="bg-white rounded-lg shadow-md">` kartiņas iekšlapās. Vienmēr izmantojiet `<GlassPanel>` satura ietīšanai, lai nepazaudētu tēmu atbalstu!)*