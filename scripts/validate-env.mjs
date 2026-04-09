import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

const modeArg = process.argv.find((arg) => arg.startsWith("--mode="));
const mode = modeArg?.slice("--mode=".length) || "runtime";

loadEnvConfig(process.cwd());

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GEMINI_API_KEY",
];

const recommended = ["OPENAI_API_KEY"];

const linkedPairs = [
  ["GOOGLE_FIT_OAUTH_CLIENT_ID", "GOOGLE_FIT_OAUTH_CLIENT_SECRET"],
];

const missing = required.filter((name) => {
  const value = process.env[name];
  return typeof value !== "string" || value.trim().length === 0;
});

const pairErrors = [];
for (const [left, right] of linkedPairs) {
  const leftSet = typeof process.env[left] === "string" && process.env[left].trim().length > 0;
  const rightSet = typeof process.env[right] === "string" && process.env[right].trim().length > 0;
  if (leftSet !== rightSet) {
    pairErrors.push(`${left} and ${right} must be set together.`);
  }
}

if (missing.length > 0 || pairErrors.length > 0) {
  console.error(`[env:${mode}] Missing required environment variables:`);
  for (const name of missing) {
    console.error(`- ${name}`);
  }
  for (const message of pairErrors) {
    console.error(`- ${message}`);
  }
  console.error(
    "Set these in project-root .env.local (local) and in Vercel Project Environment Variables (deploy).",
  );
  process.exit(1);
}

const missingRecommended = recommended.filter((name) => {
  const value = process.env[name];
  return typeof value !== "string" || value.trim().length === 0;
});

if (missingRecommended.length > 0) {
  console.warn(`[env:${mode}] Optional but recommended variables are missing:`);
  for (const name of missingRecommended) {
    console.warn(`- ${name}`);
  }
}

console.log(`[env:${mode}] OK`);
