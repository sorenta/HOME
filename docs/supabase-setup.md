# Supabase setup

Project ref: ftybjidkiagrptgoffsq

## App env vars

Use these values in `.env.local` (local dev) and in your deployment environment:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ftybjidkiagrptgoffsq.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_96ZHHfUfwzRAQxnT13ATmg_Y0yOauMM
```

## Direct connection string

Use this template when you need a direct PostgreSQL connection:

```txt
postgresql://postgres:[YOUR-PASSWORD]@db.ftybjidkiagrptgoffsq.supabase.co:5432/postgres
```

## CLI setup commands

```bash
supabase login
supabase init
supabase link --project-ref ftybjidkiagrptgoffsq
```

Note: `supabase link` requires a valid Supabase access token (`supabase login`).
