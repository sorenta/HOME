/**
 * BYOK provider typing + input validation.
 * Keys are stored server-side via Supabase Vault and are never persisted in browser storage.
 */

export type AiProvider = "gemini" | "openai";

export function validateProviderKey(provider: AiProvider, value: string): string | null {
  const normalized = value.trim();

  if (!normalized) return "missing";

  if (provider === "gemini") {
    return normalized.length >= 20 ? null : "invalid_gemini";
  }

  if (!normalized.startsWith("sk-") || normalized.length < 20) {
    return "invalid_openai";
  }

  return null;
}
