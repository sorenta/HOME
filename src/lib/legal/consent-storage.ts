import { PRIVACY_POLICY_VERSION } from "@/lib/legal/privacy-policy";

export const CONSENT_STORAGE_KEY = "majapps-consent-v1";

export type StoredConsent = {
  v: number;
  policyVersion: string;
  essentialAck: boolean;
  analytics: boolean;
  ts: string;
};

export function readStoredConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<StoredConsent>;
    if (p.v !== 1 || !p.policyVersion || typeof p.essentialAck !== "boolean") {
      return null;
    }
    return {
      v: 1,
      policyVersion: p.policyVersion,
      essentialAck: p.essentialAck,
      analytics: Boolean(p.analytics),
      ts: typeof p.ts === "string" ? p.ts : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function writeStoredConsent(next: Omit<StoredConsent, "v" | "ts"> & { ts?: string }): void {
  if (typeof window === "undefined") return;
  const payload: StoredConsent = {
    v: 1,
    policyVersion: next.policyVersion,
    essentialAck: next.essentialAck,
    analytics: next.analytics,
    ts: next.ts ?? new Date().toISOString(),
  };
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
}

export function clearStoredConsent(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CONSENT_STORAGE_KEY);
}

export function shouldShowConsentBanner(): boolean {
  const c = readStoredConsent();
  if (!c?.essentialAck) return true;
  return c.policyVersion !== PRIVACY_POLICY_VERSION;
}
