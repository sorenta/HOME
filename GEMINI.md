# HomeOS (majapps)

## Project Overview
HomeOS is a mobile-first household coordination and private wellness platform. It combines shared household management (Kitchen, Finance, Events, Pharmacy) with private individual tracking (RESET module) and AI support. The application is built with a strong emphasis on a "Theme-first" design philosophy, featuring 5 distinct visual worlds (Lucent, Hive, Pulse, Forge, Botanical) and seasonal overrides.

## Key Technologies
- **Framework:** Next.js 16 (App Router), React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4, Framer Motion, Three.js
- **Backend & Database:** Supabase (PostgreSQL, Auth, Row Level Security, Vault)
- **Testing:** Jest (Unit), Playwright (E2E)
- **AI Integration:** Google GenAI, Vertex AI (BYOK - Bring Your Own Key)

## Building and Running
The project uses `npm` as its package manager.

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Run unit tests (Jest)
npm test

# Run End-to-End tests (Playwright)
npm run test:e2e

# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```

## Development Conventions & Guidelines

### Environment Variables
- **CRITICAL:** Always use the `src/lib/supabase/env.ts` helper instead of accessing `process.env` directly.
- The application implements a "hard-fail" environment strategy; it will not start if critical variables are missing.
- Required variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`.

### Architecture & Data Flow
- **Direct Database Access:** Business logic and database operations (Supabase client calls) are abstracted into service files within `src/lib/` (e.g., `src/lib/finance.ts`).
- **API Routes:** Next.js API Routes (`src/app/api/...`) are strictly reserved for specific external integrations (like AI with BYOK or OAuth callbacks) where server-side execution and Vault secret management are required.
- **Security (RLS-first):** Data access is strictly controlled at the database level using Supabase Row Level Security (RLS). Data is scoped either to a shared `household_id` or to an individual `user_id` (especially for the RESET module). No table is published without appropriate RLS policies.
- **Database Migrations:** All SQL schema definitions and migrations are located in the `supabase/` directory.

### Internationalization (i18n)
- The project uses a custom i18n solution.
- Dictionaries are maintained in `src/lib/i18n/dictionaries.ts` (supports "lv" and "en").
- Use the `useI18n()` hook from `src/lib/i18n/i18n-context.tsx` in React components.

### AI Agent Workflow
When modifying the codebase, adhere to the following workflow:
1. **Check Risks:** Review active risks in `readme/VADLINIJAS.md`.
2. **Identify Module:** Understand the architectural layers in `readme/PROJEKTS.md`.
3. **Security:** Use `src/lib/supabase/env.ts` for any new API routes.
4. **Verification:** Always run `npm run lint`, `npm test`, and `npm run build` to verify changes before concluding a task.
5. **Documentation:** Append a detailed history of technical changes, fixes, and deploy notes to `readme/TEHNISKAIS-ZURNALS.md` after completing a task.
