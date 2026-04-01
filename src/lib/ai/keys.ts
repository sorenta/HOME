/** Client-side BYOK storage helpers (see Settings). */

export type AiProvider = "gemini" | "openai";

export const STORAGE_KEYS = {
  gemini: "majapps-api-key-gemini",
  openai: "majapps-api-key-openai",
} as const;

export function getProviderKeyFromStorage(provider: AiProvider): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEYS[provider]);
  } catch {
    return null;
  }
}

export function setProviderKeyInStorage(provider: AiProvider, value: string) {
  if (typeof window === "undefined") return;
  try {
    if (value) localStorage.setItem(STORAGE_KEYS[provider], value);
    else localStorage.removeItem(STORAGE_KEYS[provider]);
  } catch {
    /* ignore */
  }
}

export function removeProviderKeyFromStorage(provider: AiProvider) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEYS[provider]);
  } catch {
    /* ignore */
  }
}

export function getKeyLastFour(value: string): string {
  const normalized = value.trim();
  return normalized.length >= 4 ? normalized.slice(-4) : normalized;
}

export function maskKey(value: string): string {
  const lastFour = getKeyLastFour(value);
  return lastFour ? `••••${lastFour}` : "";
}

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

export function getGeminiKeyFromStorage(): string | null {
  return getProviderKeyFromStorage("gemini");
}

export function getOpenAIKeyFromStorage(): string | null {
  return getProviderKeyFromStorage("openai");
}
