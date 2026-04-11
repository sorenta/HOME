/**
 * BYOK provider typing + input validation.
 * Keys are stored server-side via Supabase Vault and are never persisted in browser storage.
 */

export type AiProvider = "gemini" | "openai" | "deepseek" | "grok";

export function validateProviderKey(provider: AiProvider, value: string): string | null {
  const normalized = value.trim();

  if (!normalized) return "missing";

  if (provider === "gemini") {
    // Gemini keys can be long strings
    return normalized.length >= 20 ? null : "invalid_gemini";
  }

  // OpenAI, DeepSeek, Grok (x.ai) keys usually start with sk-
  if (provider === "openai" || provider === "deepseek" || provider === "grok") {
    if (!normalized.startsWith("sk-") || normalized.length < 20) {
      return `invalid_${provider}`;
    }
  }

  return null;
}
