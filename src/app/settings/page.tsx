"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HouseholdOnboarding } from "@/components/household/household-onboarding";
import { HouseholdSummary } from "@/components/household/household-summary";
import { useAuth } from "@/components/providers/auth-provider";
import { ModuleShell } from "@/components/layout/module-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";
import { THEMES, type ThemeId } from "@/lib/theme-logic";
import { hapticTap } from "@/lib/haptic";
import {
  type AiProvider,
  getProviderKeyFromStorage,
  maskKey,
  removeProviderKeyFromStorage,
  setProviderKeyInStorage,
  validateProviderKey,
} from "@/lib/ai/keys";
import { createClient } from "@/lib/supabase/client";

const SETTINGS_KEY = "majapps-local-settings";

type LocalSettings = {
  pushFinance: boolean;
  pushPharmacy: boolean;
  showResetAura: boolean;
};

type ByokProviderState = {
  value: string;
  savedValue: string;
  status: "idle" | "testing" | "error";
  error: string | null;
};

const EMPTY_PROVIDER_STATE: ByokProviderState = {
  value: "",
  savedValue: "",
  status: "idle",
  error: null,
};

function readLocalSettings(): LocalSettings {
  const fallback: LocalSettings = {
    pushFinance: true,
    pushPharmacy: true,
    showResetAura: true,
  };

  if (typeof window === "undefined") return fallback;

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return fallback;
    return {
      ...fallback,
      ...(JSON.parse(raw) as Partial<LocalSettings>),
    };
  } catch {
    return fallback;
  }
}

export default function SettingsPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useI18n();
  const { themeId, setThemeId } = useTheme();
  const { user, profile, signOut } = useAuth();
  const [byok, setByok] = useState<Record<AiProvider, ByokProviderState>>({
    gemini: EMPTY_PROVIDER_STATE,
    openai: EMPTY_PROVIDER_STATE,
  });
  const [settings, setSettings] = useState<LocalSettings>({
    pushFinance: true,
    pushPharmacy: true,
    showResetAura: true,
  });
  const supabaseReady = createClient() !== null;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setByok({
        gemini: (() => {
          const saved = getProviderKeyFromStorage("gemini") ?? "";
          return {
            value: saved,
            savedValue: saved,
            status: "idle",
            error: null,
          };
        })(),
        openai: (() => {
          const saved = getProviderKeyFromStorage("openai") ?? "";
          return {
            value: saved,
            savedValue: saved,
            status: "idle",
            error: null,
          };
        })(),
      });
      setSettings(readLocalSettings());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function persistSettings(next: LocalSettings) {
    setSettings(next);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function setProviderValue(provider: AiProvider, value: string) {
    setByok((current) => ({
      ...current,
      [provider]: {
        ...current[provider],
        value,
        status: "idle",
        error: null,
      },
    }));
  }

  function resolveByokMessage(message: string) {
    switch (message) {
      case "missing":
        return t("settings.byok.missing");
      case "invalid_gemini":
        return t("settings.byok.invalidGemini");
      case "invalid_openai":
        return t("settings.byok.invalidOpenai");
      default:
        return message || t("settings.byok.verifyFailed");
    }
  }

  async function verifyAndSaveProvider(provider: AiProvider) {
    const value = byok[provider].value.trim();
    const validationError = validateProviderKey(provider, value);

    if (validationError) {
      setByok((current) => ({
        ...current,
        [provider]: {
          ...current[provider],
          status: "error",
          error: resolveByokMessage(validationError),
        },
      }));
      return;
    }

    hapticTap();
    setByok((current) => ({
      ...current,
      [provider]: {
        ...current[provider],
        status: "testing",
        error: null,
      },
    }));

    try {
      const response = await fetch("/api/ai/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider, key: value }),
      });

      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        throw new Error(resolveByokMessage(data.message ?? ""));
      }

      setProviderKeyInStorage(provider, value);
      setByok((current) => ({
        ...current,
        [provider]: {
          value,
          savedValue: value,
          status: "idle",
          error: null,
        },
      }));
    } catch (error) {
      setByok((current) => ({
        ...current,
        [provider]: {
          ...current[provider],
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : t("settings.byok.verifyFailed"),
        },
      }));
    }
  }

  function removeProvider(provider: AiProvider) {
    hapticTap();
    removeProviderKeyFromStorage(provider);
    setByok((current) => ({
      ...current,
      [provider]: EMPTY_PROVIDER_STATE,
    }));
  }

  async function onSignOut() {
    await signOut();
    router.push("/auth");
  }

  function renderProviderCard(provider: AiProvider, label: string) {
    const state = byok[provider];
    const isSaved = Boolean(
      state.savedValue && state.savedValue === state.value.trim(),
    );

    const tone =
      state.status === "error"
        ? "warn"
        : state.status === "testing"
          ? "neutral"
          : isSaved
            ? "good"
            : "neutral";

    const statusLabel =
      state.status === "error"
        ? t("settings.byok.state.error")
        : state.status === "testing"
          ? t("settings.byok.state.testing")
          : isSaved
            ? t("settings.byok.state.saved")
            : t("settings.byok.state.notSaved");

    const helperText = state.error
      ? state.error
      : isSaved
        ? `${t("settings.byok.savedDevice")} ${maskKey(state.savedValue)}`
        : state.value.trim()
          ? t("settings.byok.unsaved")
          : t("settings.byok.notSaved");

    return (
      <div
        key={provider}
        className="space-y-3 rounded-2xl border border-[color:var(--color-surface-border)] p-3"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[color:var(--color-text)]">
            {label}
          </p>
          <StatusPill tone={tone}>{statusLabel}</StatusPill>
        </div>
        <label className="block text-sm text-[color:var(--color-text)]">
          {label}
          <input
            type="password"
            autoComplete="off"
            value={state.value}
            onChange={(e) => setProviderValue(provider, e.target.value)}
            placeholder={provider === "gemini" ? "AIza..." : "sk-..."}
            className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
          />
        </label>
        <p className="text-xs text-[color:var(--color-secondary)]">
          {helperText}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => verifyAndSaveProvider(provider)}
            disabled={state.status === "testing"}
            className="flex-1 rounded-xl border border-[color:var(--color-primary)] bg-[color:var(--color-surface)] px-4 py-3 text-sm font-semibold text-[color:var(--color-text)] disabled:opacity-60"
          >
            {state.status === "testing"
              ? t("settings.byok.action.testing")
              : t("settings.byok.action.verify")}
          </button>
          <button
            type="button"
            onClick={() => removeProvider(provider)}
            disabled={!state.value && !state.savedValue}
            className="rounded-xl border border-[color:var(--color-surface-border)] px-4 py-3 text-sm font-semibold text-[color:var(--color-text)] disabled:opacity-50"
          >
            {t("settings.byok.action.remove")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <ModuleShell title={t("settings.title")}>
      <GlassPanel className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-secondary)]">
            {t("settings.theme")}
          </p>
          <div className="flex flex-col gap-2">
            {(Object.keys(THEMES) as ThemeId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  hapticTap();
                  setThemeId(id);
                }}
                className={[
                  "flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm",
                  themeId === id
                    ? "border-[color:var(--color-primary)] bg-[color:var(--color-surface)]"
                    : "border-[color:var(--color-surface-border)]",
                ].join(" ")}
              >
                <span>
                  {THEMES[id].emoji} {t(THEMES[id].labelKey)}
                </span>
                {themeId === id ? "✓" : ""}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-secondary)]">
            {t("settings.language")}
          </p>
          <div className="flex gap-2">
            {(["lv", "en"] as const).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => {
                  hapticTap();
                  setLocale(loc);
                }}
                className={[
                  "flex-1 rounded-xl border px-3 py-2 text-sm font-medium",
                  locale === loc
                    ? "border-[color:var(--color-primary)] bg-[color:var(--color-surface)]"
                    : "border-[color:var(--color-surface-border)]",
                ].join(" ")}
              >
                {loc === "lv" ? "Latviešu" : "English"}
              </button>
            ))}
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("settings.household")} />
        {profile?.household_id ? (
          <HouseholdSummary householdId={profile.household_id} />
        ) : (
          <HouseholdOnboarding compact />
        )}
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("settings.notifications")} />
        <button
          type="button"
          onClick={() =>
            persistSettings({
              ...settings,
              pushFinance: !settings.pushFinance,
            })
          }
          className="flex w-full items-center justify-between rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3 text-left text-sm"
        >
          <span>Finanšu paziņojumi</span>
          <StatusPill tone={settings.pushFinance ? "good" : "neutral"}>
            {settings.pushFinance ? "ON" : "OFF"}
          </StatusPill>
        </button>
        <button
          type="button"
          onClick={() =>
            persistSettings({
              ...settings,
              pushPharmacy: !settings.pushPharmacy,
            })
          }
          className="flex w-full items-center justify-between rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3 text-left text-sm"
        >
          <span>Aptieciņas atgādinājumi</span>
          <StatusPill tone={settings.pushPharmacy ? "good" : "neutral"}>
            {settings.pushPharmacy ? "ON" : "OFF"}
          </StatusPill>
        </button>
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("settings.privacy")} />
        <button
          type="button"
          onClick={() =>
            persistSettings({
              ...settings,
              showResetAura: !settings.showResetAura,
            })
          }
          className="flex w-full items-center justify-between rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3 text-left text-sm"
        >
          <span>Partnerim rādīt RESET auru</span>
          <StatusPill tone={settings.showResetAura ? "warn" : "neutral"}>
            {settings.showResetAura ? "Atļauts" : "Paslēpts"}
          </StatusPill>
        </button>
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-secondary)]">
          {t("settings.byok.title")}
        </p>
        <p className="text-xs text-[color:var(--color-secondary)]">
          {t("settings.byok.hint")}
        </p>
        <p className="text-xs text-[color:var(--color-secondary)]">
          {t("settings.byok.localStorageNote")}
        </p>
        {renderProviderCard("gemini", "Gemini")}
        {renderProviderCard("openai", "OpenAI")}
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("settings.supabase")} />
        <StatusPill tone={supabaseReady ? "good" : "warn"}>
          {supabaseReady ? t("settings.connected") : t("settings.localOnly")}
        </StatusPill>
        <p className="text-sm leading-relaxed text-[color:var(--color-text)]">
          {supabaseReady ? "Supabase klientu var savienot ar reālajiem datiem." : t("supabase.missing")}
        </p>
        {user?.email ? (
          <p className="text-xs text-[color:var(--color-secondary)]">{user.email}</p>
        ) : null}
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("auth.signout")} />
        <button
          type="button"
          onClick={onSignOut}
          className="w-full rounded-xl border border-[color:var(--color-surface-border)] px-4 py-3 text-sm font-semibold text-[color:var(--color-text)]"
        >
          {t("auth.signout")}
        </button>
      </GlassPanel>
    </ModuleShell>
  );
}
