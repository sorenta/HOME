"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { ModuleShell } from "@/components/layout/module-shell";
import { HiddenSeasonalCollectible } from "@/components/seasonal/hidden-seasonal-collectible";
import {
  ForgeBandRule,
  ForgeDeckList,
  ForgeMainDeck,
  ForgeMetricDot,
  ForgeRowButton,
  ForgeSubLabel,
  ForgeSystemSlab,
} from "@/components/layout/forge/forge-inner";
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
import { getBrowserClient } from "@/lib/supabase/client";
import { ProfileSettingsSection } from "@/components/profile/profile-settings-section";

const SETTINGS_KEY = "majapps-local-settings";

type LocalSettings = {
  pushFinance: boolean;
  pushPharmacy: boolean;
  showResetMood: boolean;
};

type ProviderState = {
  value: string;
  savedValue: string;
  status: "idle" | "testing" | "error";
  error: string | null;
};

function readLocalSettings(): LocalSettings {
  const fallback: LocalSettings = { pushFinance: true, pushPharmacy: true, showResetMood: true };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch { return fallback; }
}

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const { themeId, setThemeId } = useTheme();
  const { user, profile, refreshProfile, signOut } = useAuth();
  
  const [byok, setByok] = useState<Record<AiProvider, ProviderState>>({
    gemini: { value: "", savedValue: "", status: "idle", error: null },
    openai: { value: "", savedValue: "", status: "idle", error: null },
  });
  
  const [settings, setSettings] = useState<LocalSettings>(readLocalSettings());
  const [empathyRecipientIds, setEmpathyRecipientIds] = useState<string[]>([]);

  useEffect(() => {
    setByok({
      gemini: { value: getProviderKeyFromStorage("gemini") ?? "", savedValue: getProviderKeyFromStorage("gemini") ?? "", status: "idle", error: null },
      openai: { value: getProviderKeyFromStorage("openai") ?? "", savedValue: getProviderKeyFromStorage("openai") ?? "", status: "idle", error: null },
    });
  }, [profile?.household_id]);

  async function handleThemeChange(id: ThemeId) {
    hapticTap();
    setThemeId(id);
    if (!user) return;
    const supabase = getBrowserClient();
    if (supabase) {
      await supabase.from("profiles").update({ theme_id: id }).eq("id", user.id);
      await refreshProfile();
    }
  }

  async function persistSettings(next: LocalSettings) {
    setSettings(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    if (!user) return;
    const supabase = getBrowserClient();
    if (supabase) {
      await supabase.from("notification_preferences").upsert({
        user_id: user.id,
        finance_enabled: next.pushFinance,
        pharmacy_enabled: next.pushPharmacy,
        reset_empathy_enabled: next.showResetMood,
        reset_empathy_recipient_ids: empathyRecipientIds,
        updated_at: new Date().toISOString(),
      });
    }
  }

  const verifyAndSaveProvider = async (provider: AiProvider) => {
    hapticTap();
    const value = byok[provider].value.trim();
    const validationError = validateProviderKey(provider, value);
    if (validationError) {
      setByok(prev => ({ ...prev, [provider]: { ...prev[provider], status: "error", error: validationError } }));
      return;
    }
    setByok(prev => ({ ...prev, [provider]: { ...prev[provider], status: "testing" } }));
    try {
      const response = await fetch("/api/ai/verify", { method: "POST", body: JSON.stringify({ provider, key: value }) });
      if (!response.ok) throw new Error("Verification failed");
      setProviderKeyInStorage(provider, value);
      setByok(prev => ({ ...prev, [provider]: { ...prev[provider], savedValue: value, status: "idle", error: null } }));
    } catch {
      setByok(prev => ({ ...prev, [provider]: { ...prev[provider], status: "error", error: "Invalid Key" } }));
    }
  };

  const renderProviderControl = (provider: AiProvider, label: string, isForge: boolean) => {
    const state = byok[provider];
    const isSaved = state.savedValue && state.savedValue === state.value.trim();
    const helperText = isSaved ? `${t("settings.byok.savedDevice")} ${maskKey(state.savedValue)}` : state.value.trim() ? t("settings.byok.unsaved") : t("settings.byok.notSaved");

    return (
      <div className={`space-y-3 ${isForge ? 'p-3' : 'rounded-xl border border-border p-4 bg-background/40'}`}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">{label}</p>
          <StatusPill tone={state.status === "error" ? "warn" : isSaved ? "good" : "neutral"}>
            {state.status === "testing" ? "..." : isSaved ? "OK" : "!"}
          </StatusPill>
        </div>
        <input
          type="password"
          value={state.value}
          onChange={e => setByok(prev => ({ ...prev, [provider]: { ...prev[provider], value: e.target.value, status: "idle" } }))}
          className="w-full rounded-theme border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary"
          placeholder={provider === "gemini" ? "AIza..." : "sk-..."}
        />
        <p className="text-[10px] uppercase font-bold tracking-widest text-foreground/40">{helperText}</p>
        <div className="flex gap-2">
          <button onClick={() => verifyAndSaveProvider(provider)} className="flex-1 rounded-theme bg-primary py-2 text-xs font-bold text-primary-foreground shadow-sm">
            {t("settings.byok.action.verify")}
          </button>
          <button onClick={() => { removeProviderKeyFromStorage(provider); setByok(prev => ({ ...prev, [provider]: { value: "", savedValue: "", status: "idle", error: null } })); }} className="rounded-theme border border-border px-3 py-2 text-xs font-bold">
            ✕
          </button>
        </div>
      </div>
    );
  };

  return (
    <ModuleShell title={t("settings.title")} moduleId="settings">
      <HiddenSeasonalCollectible spotId="settings" />
      {themeId === "forge" ? (
        <div className="space-y-1">
          <ForgeMainDeck>
            <ForgeSubLabel>{t("settings.theme")}</ForgeSubLabel>
            <ForgeDeckList>
              {(Object.keys(THEMES) as ThemeId[]).map(id => (
                <ForgeRowButton key={id} onClick={() => handleThemeChange(id)}>
                  <span className={themeId === id ? "text-primary font-bold" : ""}>{THEMES[id].emoji} {t(THEMES[id].labelKey)}</span>
                  {themeId === id && <ForgeMetricDot active />}
                </ForgeRowButton>
              ))}
            </ForgeDeckList>
            <ForgeBandRule />
            <ForgeSubLabel>{t("settings.language")}</ForgeSubLabel>
            <div className="flex gap-1 px-3 pb-3">
              {(["lv", "en"] as const).map(l => (
                <button key={l} onClick={() => setLocale(l)} className={`flex-1 py-2 text-xs font-bold border ${locale === l ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/40'}`}>
                  {l === "lv" ? "LATVIAN" : "ENGLISH"}
                </button>
              ))}
            </div>
          </ForgeMainDeck>
          
          <ForgeSystemSlab>
            <ForgeSubLabel>{t("settings.byok.title")}</ForgeSubLabel>
            <div className="space-y-1">
              {renderProviderControl("gemini", "GEMINI AI", true)}
              {renderProviderControl("openai", "OPENAI GPT", true)}
            </div>
            <ForgeBandRule />
            <button onClick={() => signOut()} className="w-full py-4 text-center text-xs font-black tracking-tighter text-red-500 hover:bg-red-500/10">
              TERMINATE SESSION (SIGN OUT)
            </button>
          </ForgeSystemSlab>
        </div>
      ) : (
        <div className="space-y-6">
          <ProfileSettingsSection />

          <GlassPanel className="space-y-4">
            <SectionHeading title={t("settings.theme")} />
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(THEMES) as ThemeId[]).map(id => (
                <button key={id} onClick={() => handleThemeChange(id)} className={`flex items-center justify-between rounded-theme border p-4 text-sm font-bold transition-all ${themeId === id ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border bg-background/40'}`}>
                  <span>{THEMES[id].emoji} {t(THEMES[id].labelKey)}</span>
                  {themeId === id && <span className="text-primary">✓</span>}
                </button>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="space-y-4">
            <SectionHeading title={t("settings.notifications")} />
            <div className="space-y-2">
              {[
                { key: 'pushFinance' as const, label: t("settings.notifications.finance") },
                { key: 'pushPharmacy' as const, label: t("settings.notifications.pharmacy") }
              ].map(item => (
                <button key={item.key} onClick={() => persistSettings({ ...settings, [item.key]: !settings[item.key] })} className="flex w-full items-center justify-between rounded-theme border border-border bg-background/40 p-4 text-sm font-bold">
                  {item.label}
                  <StatusPill tone={settings[item.key] ? "good" : "neutral"}>{settings[item.key] ? "ON" : "OFF"}</StatusPill>
                </button>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="space-y-4">
            <SectionHeading title={t("settings.byok.title")} />
            <div className="space-y-3">
              {renderProviderControl("gemini", "Gemini AI", false)}
              {renderProviderControl("openai", "OpenAI GPT", false)}
            </div>
          </GlassPanel>

          <div className="px-4 py-2 text-center">
            <button onClick={() => signOut()} className="text-sm font-bold text-foreground/40 underline decoration-primary/30 underline-offset-4">
              {t("auth.signout")}
            </button>
          </div>
        </div>
      )}
    </ModuleShell>
  );
}