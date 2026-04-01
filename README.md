# Mājas / HomeOS

Mobile-first mājsaimniecības lietotnes starteris ar `Next.js App Router`, `Tailwind v4`,
`Framer Motion` un `Supabase` integrācijas bāzi.

## Kas jau ir izveidots

- Adaptīvs Bento dashboard ar moduļiem: `Kalendārs`, `Finanses`, `RESET`, `Virtuve`, `Aptieciņa`, `Notikumi`
- `Profils` un `Iestatījumi`
- Trīs tēmas ar fontu un kustības loģiku
- `LV/EN` lokalizācijas slānis
- Lokāli glabāts `BYOK` iestatījumu demo
- `Supabase` starter shēma ar `RLS` bāzi
- `PWA` manifests un automātiski ģenerēta app ikona

## Projekta struktūra

```text
src/
  app/                  Next.js routes, layout, icons, loading
  components/
    dashboard/          Home dashboard un navigācija
    layout/             Kopīgie moduļu ietvari
    providers/          Theme + i18n provideri
    ui/                 Atkārtoti lietojami UI bloki
  lib/
    ai/                 BYOK helperi
    demo-data.ts        Reāliem ekrāniem paredzēti demo dati
    i18n/               Tulkojumi un locale context
    supabase/           Browser client factory
    theme-logic.ts      Lietotnes manifestam līdzīga tēmu definīcija
supabase/
  schema.sql            Tabulas, RLS un starter politikas
```

## Palaišana

```bash
npm install
npm run dev
```

Atver `http://localhost:3000`.

## Vides mainīgie

Kopē `.env.example` uz `.env.local` un aizpildi:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Supabase

Starter SQL atrodas `supabase/schema.sql`.

Ieteicamā secība:

1. Izveido Supabase projektu.
2. Palaid `schema.sql`.
3. Ieslēdz Auth.
4. Pievieno `.env.local`.
5. Aizstāj `demo-data.ts` ar reāliem query un realtime subscription slāņiem.

## Nākamie soļi

- Pievienot Supabase Auth un lietotāju onboarding
- Savienot dashboard un moduļus ar reāliem datiem
- Izveidot QR household invite plūsmu
- Pievienot push notifications un service worker
- Ieviest server-side AI proxy vai drošu lietotāja atslēgu glabāšanu
