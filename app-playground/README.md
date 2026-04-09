# H:O App Playground

Šī ir atsevišķa, statiska smilškaste pašai H:O aplikācijai.

Mērķis:
- testēt layout un app sajūtu bez izmaiņām īstajā Next.js produktā
- brīvi meklēt jaunu dashboard vai iekšlapu virzienu
- ātri pārslēgt tēmas un ekrānus vienā failu komplektā

## Kas kur atrodas

- `index.html` — galvenais karkass un kontroles panelis
- `styles.css` — visas krāsas, layout, motīvu virzieni un virsmu stili
- `script.js` — statiskais saturs katram skatam un tēmu/ekrānu pārslēgšana

## Kā atvērt lokāli

No repo saknes:

```bash
python3 -m http.server 4173
```

Tad atver:

```text
http://localhost:4173/app-playground/
```

## Ko šis nedara

- tas neizmanto Next.js
- tas nav pieslēgts Supabase
- tas nemaina īsto H:O aplikāciju

Tas ir domāts tikai vizuālai un strukturālai eksperimentēšanai.
