# H:O Marketing Site

Atsevišķs, statisks reklāmas landing projekts HomeOS / H:O produktam.

Šī landing lapa ir veidota kā klientu uzrunājošs produkta stāsts ar:

- hero sekciju un produkta pozicionējumu
- ieguvumu, auditorijas un moduļu blokiem
- produktu salīdzinājumu “pirms / ar H:O”
- emocionālo “kā tas jūtas” slāni
- teaseru/cinema sekciju ar animētiem video placeholder virzieniem
- pricing sekciju ar `2 mēneši bez maksas` piedāvājumu un premium cenu
- tematisko pasauļu un tehnoloģiskā pamata prezentāciju
- FAQ un interešu formu, kas atver sagatavotu `mailto:` pieteikumu

## Faili

- `index.html` — landing lapas struktūra
- `styles.css` — pilnais vizuālais stils
- `script.js` — theme preview pārslēgšana, scroll reveal animācijas un interešu formas `mailto` handoff

## Kā palaist lokāli

Vienkāršākais variants:

1. Atver `index.html` pārlūkā

Vai palaid ar lokālu serveri no repo saknes:

```bash
python3 -m http.server 4173
```

Tad atver:

```text
http://localhost:4173/marketing-site/
```

## Piezīme

Šī mape ir pilnīgi atsevišķa no galvenās aplikācijas un nepārveido esošo Next.js projektu.

## Atjauninājumi (2026-04-07)

Papildus ieviesti mājaslapas kvalitātes uzlabojumi:

- sticky topbar ar `is-scrolled` vizuālo stāvokli
- mobilā navigācija ar menu toggle (`aria-expanded`, `Esc`, klikšķis ārpus)
- aktīvās sekcijas indikācija galvenes navigācijā skrollējot
- pieejamības uzlabojumi: `skip-link`, `focus-visible`, reduced-motion fallback
- papildu launch paziņojuma josla lapas augšpusē
