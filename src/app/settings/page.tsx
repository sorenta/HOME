"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { ModuleShell } from "@/components/layout/module-shell";
import { HiddenSeasonalCollectible } from "@/components/seasonal/hidden-seasonal-collectible";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";
import { type ThemeId } from "@/lib/theme-logic";
import { hapticTap } from "@/lib/haptic";
import { type AiProvider, validateProviderKey } from "@/lib/ai/keys";
import { fetchHouseholdKitchenAiMeta, upsertHouseholdKitchenAi, deleteHouseholdKitchenAi } from "@/lib/household-kitchen-ai";
import { getBrowserClient } from "@/lib/supabase/client";
import { SettingsThemeLayer } from "@/components/settings/settings-theme-layer";
import { ForgeSettingsLayout } from "@/components/settings/layouts/forge-layout";
import { DefaultSettingsLayout } from "@/components/settings/layouts/default-layout";

const SETTINGS_KEY = "majapps-local-settings";

type LocalSettings = {
  pushFinance: boolean;
  pushPharmacy: boolean;
};

type ProviderState = {
  value: string;
  status: "idle" | "testing" | "error";
  error: string | null;
};

function readLocalSettings(): LocalSettings {
  const fallback: LocalSettings = { pushFinance: true, pushPharmacy: true };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const { themeId, setThemeId } = useTheme();
  const { user, refreshProfile, signOut } = useAuth();

  const [byok, setByok] = useState<Record<AiProvider, ProviderState>>({
    gemini: { value: "", status: "idle", error: null },
    openai: { value: "", status: "idle", error: null },
    deepseek: { value: "", status: "idle", error: null },
    grok: { value: "", status: "idle", error: null },
  });
  const [byokMeta, setByokMeta] = useState<any>(null);
  const [settings, setSettings] = useState<LocalSettings>(readLocalSettings());

  useEffect(() => {
    let alive = true;
    const syncMeta = async () => {
      const meta = await fetchHouseholdKitchenAiMeta();
      if (alive) setByokMeta(meta);
    };
    syncMeta();
    return () => { alive = false; };
  }, []);

  async function handleThemeChange(id: ThemeId) {
    hapticTap();
    setThemeId(id);
    if (!user) return;
    const supabase = getBrowserClient();
    if (!supabase) return;
    await supabase.from("profiles").update({ theme_id: id }).eq("id", user.id);
    await refreshProfile();
  }

  async function handleLocaleChange(nextLocale: "lv" | "en") {
    hapticTap();
    setLocale(nextLocale);
  }

  async function handleTestKey(provider: AiProvider) {
    const key = byok[provider].value.trim();
    if (!key) return;

    setByok(prev => ({ ...prev, [provider]: { ...prev[provider], status: "testing" } }));
    
    // 1. Local validation
    const localError = validateProviderKey(provider, key);
    if (localError) {
      setByok(prev => ({ ...prev, [provider]: { ...prev[provider], status: "error", error: t(`settings.byok.error.${localError}`) } }));
      return;
    }

    // 2. Server-side verification (Authenticated)
    try {
      const supabase = getBrowserClient();
      const { data: { session } } = await supabase!.auth.getSession();
      
      const res = await fetch("/api/ai/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ provider, key })
      });

      const result = await res.json();

      if (result.ok) {
        await upsertHouseholdKitchenAi({ provider, apiKey: key });
        const nextMeta = await fetchHouseholdKitchenAiMeta();
        setByokMeta(nextMeta);
        setByok(prev => ({ ...prev, [provider]: { ...prev[provider], status: "idle", value: "" } }));
        hapticTap();
      } else {
        setByok(prev => ({ ...prev, [provider]: { ...prev[provider], status: "error", error: result.message } }));
      }
    } catch {
      setByok(prev => ({ ...prev, [provider]: { ...prev[provider], status: "error", error: "Connection error" } }));
    }
  }

  async function handleDeleteAiConfig() {
    if (!confirm(t("settings.byok.deleteConfirm"))) return;
    await deleteHouseholdKitchenAi();
    setByokMeta(null);
    hapticTap();
  }

  const layoutProps = {
    t, locale, themeId, byok, byokMeta, settings,
    onThemeChange: handleThemeChange,
    onLocaleChange: handleLocaleChange,
    onByokChange: (provider: AiProvider, val: string) => {
      setByok(prev => ({ ...prev, [provider]: { ...prev[provider], value: val, status: "idle", error: null } }));
    },
    onByokTest: handleTestKey,
    onByokDelete: handleDeleteAiConfig,
    onToggleSetting: (key: string) => {
      const next = { ...settings, [key]: !settings[key as keyof LocalSettings] };
      setSettings(next);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    },
    onSignOut: () => signOut(),
  };

  return (
    <ModuleShell
      title={t("nav.settings")}
      sectionId="settings"
      description={t("settings.page.description")}
    >
      <SettingsThemeLayer>
        <HiddenSeasonalCollectible spotId="settings" />
        {themeId === "forge" ? (
          <ForgeSettingsLayout {...layoutProps} />
        ) : (
          <DefaultSettingsLayout {...layoutProps} />
        )}
      </SettingsThemeLayer>
    </ModuleShell>
  );
}
