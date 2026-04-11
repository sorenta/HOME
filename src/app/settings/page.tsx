"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { ModuleShell } from "@/components/layout/module-shell";
import { HiddenSeasonalCollectible } from "@/components/seasonal/hidden-seasonal-collectible";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";
import { THEMES, type ThemeId } from "@/lib/theme-logic";
import { hapticTap } from "@/lib/haptic";
import {
  type AiProvider,
  validateProviderKey,
} from "@/lib/ai/keys";
import {
  deleteHouseholdKitchenAi,
  fetchHouseholdKitchenAiMeta,
  upsertHouseholdKitchenAi,
} from "@/lib/household-kitchen-ai";
import { getBrowserClient } from "@/lib/supabase/client";
import { ThemeToolbarIcon } from "@/components/icons";
import { SettingsThemeLayer } from "@/components/settings/settings-theme-layer";

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
  const [byokMeta, setByokMeta] = useState<Awaited<ReturnType<typeof fetchHouseholdKitchenAiMeta>>>(null);
  const [settings, setSettings] = useState<LocalSettings>(readLocalSettings());

  useEffect(() => {
    let alive = true;
    const syncMeta = async () => {
      const meta = await fetchHouseholdKitchenAiMeta();
      if (!alive) return;
      setByokMeta(meta);
    };
    const onFocus = () => {
      void syncMeta();
    };
    void syncMeta();
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      window.removeEventListener("focus", onFocus);
    };
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

    if (!user) return;
    const supabase = getBrowserClient();
    if (!supabase) return;

    await supabase.from("profiles").update({ preferred_locale: nextLocale }).eq("id", user.id);
    await refreshProfile();
  }

  async function persistSettings(next: LocalSettings) {
    setSettings(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));

    if (!user) return;
    const supabase = getBrowserClient();
    if (!supabase) return;

    await supabase.from("notification_preferences").upsert({
      user_id: user.id,
      finance_enabled: next.pushFinance,
      pharmacy_enabled: next.pushPharmacy,
      updated_at: new Date().toISOString(),
    });
  }

  const verifyAndSaveProvider = async (provider: AiProvider) => {
    hapticTap();
    const value = byok[provider].value.trim();
    const validationError = validateProviderKey(provider, value);

    if (validationError) {
      const message =
        validationError === "missing"
          ? t("settings.byok.missing")
          : validationError === "invalid_gemini"
            ? t("settings.byok.invalidGemini")
            : validationError === "invalid_openai"
              ? t("settings.byok.invalidOpenai")
              : validationError;
      setByok((prev) => ({
        ...prev,
        [provider]: { ...prev[provider], status: "error", error: message },
      }));
      return;
    }

    setByok((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], status: "testing", error: null },
    }));

    try {
      const response = await fetch("/api/ai/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider, key: value }),
      });

      if (!response.ok) {
        throw new Error("Verification failed");
      }

      const saveResult = await upsertHouseholdKitchenAi({
        provider,
        apiKey: value,
      });

      if (!saveResult.ok) {
        throw new Error(saveResult.message);
      }

      setByok((prev) => ({
        ...prev,
        [provider]: { ...prev[provider], value: "", status: "idle", error: null },
      }));
      const meta = await fetchHouseholdKitchenAiMeta();
      setByokMeta(meta);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const fallback = t("settings.byok.verifyFailed");
      const normalized =
        message === "SCHEMA_MISSING" ? t("kitchen.ai.error.schema") : message;
      setByok((prev) => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          status: "error",
          error: normalized && normalized !== "Verification failed" ? normalized : fallback,
        },
      }));
    }
  };

  const renderProviderControl = (provider: AiProvider, label: string) => {
    const state = byok[provider];
    const isSaved = byokMeta?.provider === provider;
    const helperText = isSaved
      ? byokMeta?.key_last_four
        ? `${t("settings.byok.savedDevice")} ••••${byokMeta.key_last_four}`
        : t("settings.byok.state.saved")
      : state.value.trim()
        ? t("settings.byok.state.ready")
        : t("settings.byok.state.empty");

    if (themeId === "forge") {
      return (
        <div key={provider} className="space-y-2 border border-white/5 bg-black/20 p-4 rounded-sm font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[0.6rem] font-black uppercase tracking-widest text-white/80">{label}</span>
            <span className={`text-[0.5rem] font-black px-1.5 py-0.5 border uppercase tracking-tighter ${
              isSaved ? 'border-emerald-500 text-emerald-500' : 'border-white/20 text-white/20'
            }`}>
              {isSaved ? 'CONNECTED' : 'STANDBY'}
            </span>
          </div>
          <p className="text-[0.55rem] text-white/40 uppercase">{helperText}</p>
          
          <div className="flex gap-2 pt-1">
            <input
              type="password"
              placeholder="ENTER_KEY_..."
              value={state.value}
              onChange={(e) => setByok((prev) => ({
                ...prev,
                [provider]: { ...prev[provider], value: e.target.value, status: "idle", error: null },
              }))}
              className="flex-1 border border-white/10 bg-black/40 px-3 py-2 text-[0.7rem] text-white focus:border-primary outline-none transition-all rounded-sm uppercase"
            />
            <button
              onClick={() => void verifyAndSaveProvider(provider)}
              disabled={state.status === "testing" || !state.value.trim()}
              className="border border-primary bg-primary/10 px-4 py-2 text-[0.6rem] font-black uppercase tracking-widest text-primary hover:bg-primary/20 transition-all rounded-sm disabled:opacity-30"
            >
              {state.status === "testing" ? "[ TESTING... ]" : "[ SAVE ]"}
            </button>
          </div>
          {state.error && (
            <p className="text-[0.55rem] text-red-500 uppercase mt-1">ERROR: {state.error}</p>
          )}
          {isSaved && (
            <button
              onClick={() => {
                hapticTap();
                void deleteHouseholdKitchenAi();
                setByokMeta(null);
              }}
              className="text-[0.5rem] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-colors pt-1"
            >
              [ DISCONNECT_MODULE ]
            </button>
          )}
        </div>
      );
    }

    return (
      <div key={provider} className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-(--color-text-secondary)">{label}</span>
          <StatusPill tone={isSaved ? "good" : "neutral"}>
            {isSaved ? t("settings.byok.state.saved") : t("settings.byok.state.empty")}
          </StatusPill>
        </div>
        <p className="px-1 text-[0.65rem] text-(--color-text-secondary) opacity-70">{helperText}</p>
        <div className="flex gap-2">
          <input
            type="password"
            placeholder={t("settings.byok.placeholder")}
            value={state.value}
            onChange={(e) =>
              setByok((prev) => ({
                ...prev,
                [provider]: { ...prev[provider], value: e.target.value, status: "idle", error: null },
              }))
            }
            className={`flex-1 border bg-[color-mix(in_srgb,var(--color-surface)_84%,transparent)] px-3 py-2.5 text-sm text-(--color-text-primary) focus:border-(--color-button-primary) focus:ring-1 focus:ring-(--color-button-primary) outline-none transition-all rounded-(--radius-card)`}
          />
          <button
            onClick={() => void verifyAndSaveProvider(provider)}
            disabled={state.status === "testing" || !state.value.trim()}
            className="rounded-(--radius-button) bg-(--color-button-primary) px-4 py-2.5 text-sm font-semibold text-(--color-button-primary-text) shadow-sm hover:opacity-90 disabled:opacity-50"
          >
            {state.status === "testing" ? t("settings.byok.verifying") : t("settings.byok.save")}
          </button>
        </div>
        {state.error && <p className="px-1 text-xs font-medium text-red-500">{state.error}</p>}
        {isSaved && (
          <button
            onClick={() => {
              hapticTap();
              void deleteHouseholdKitchenAi();
              setByokMeta(null);
            }}
            className="px-1 text-xs font-bold text-red-500 hover:underline"
          >
            {t("settings.byok.delete")}
          </button>
        )}
      </div>
    );
  };

  const isForge = themeId === "forge";

  return (
    <ModuleShell
      title={t("tile.settings")}
      moduleId="settings"
      sectionId="settings"
      description={t("settings.page.description")}
    >
      <SettingsThemeLayer>
      <HiddenSeasonalCollectible spotId="settings" />

      <div className="space-y-10 pt-4 pb-12">
        {isForge ? (
          <>
            {/* SECTOR 01: UI_CONFIGURATION */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-1 opacity-40">
                <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 01</span>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Lietotāja saskarne</span>
              </div>
              
              <GlassPanel className="p-0 overflow-hidden">
                <div className="border-b border-white/5 bg-white/5 px-4 py-3">
                  <h2 className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-white/80">Sistēmas vizualizācija</h2>
                </div>
                <div className="p-4 space-y-6">
                  <div className="space-y-3">
                    <p className="text-[0.5rem] font-black text-primary uppercase tracking-widest ml-1">STILA_MOTĪVS</p>
                    <div className="grid grid-cols-1 gap-2">
                      {(Object.keys(THEMES) as ThemeId[]).map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => void handleThemeChange(id)}
                          className={`flex items-center justify-between border p-4 text-left transition-all rounded-sm ${
                            themeId === id
                              ? "border-primary bg-primary/10"
                              : "border-white/5 bg-white/5 hover:border-white/20"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <ThemeToolbarIcon themeId={id} size={22} tone={themeId === id ? "active" : "inactive"} />
                            <span className={`text-[0.65rem] font-black uppercase tracking-widest ${themeId === id ? 'text-primary' : 'text-white/60'}`}>
                              {t(THEMES[id].labelKey)}
                            </span>
                          </span>
                          {themeId === id ? (
                            <span className="text-[0.5rem] font-black px-1.5 py-0.5 border border-primary text-primary uppercase tracking-tighter">
                              ACTIVE
                            </span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[0.5rem] font-black text-primary uppercase tracking-widest ml-1">SISTĒMAS_VALODA</p>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { id: "lv", label: "Latviešu" },
                        { id: "en", label: "English" },
                      ] as const).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => void handleLocaleChange(item.id)}
                          className={`border px-4 py-3 text-[0.6rem] font-black uppercase tracking-widest rounded-sm transition-all ${
                            locale === item.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-white/10 text-white/40 hover:border-white/20"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassPanel>
            </div>

            {/* SECTOR 02: AI_COPROCESSOR */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-1 opacity-40">
                <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 02</span>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">AI Koprocesora konfigurācija</span>
              </div>
              <GlassPanel className="p-0 overflow-hidden">
                <div className="border-b border-white/5 bg-white/5 px-4 py-3">
                  <h2 className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-white/80">AI moduļu integrācija</h2>
                </div>
                <div className="p-4 space-y-4">
                  <p className="text-[0.55rem] font-mono text-white/40 uppercase leading-relaxed">
                    {t("settings.byok.hint")}
                  </p>
                  <div className="space-y-3">
                    {renderProviderControl("gemini", "Gemini")}
                    {renderProviderControl("openai", "OpenAI")}
                    {renderProviderControl("deepseek", "DeepSeek")}
                    {renderProviderControl("grok", "Grok (X.AI)")}
                  </div>
                </div>
              </GlassPanel>
            </div>

            {/* SECTOR 03: SYSTEM_NOTIFICATIONS */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-1 opacity-40">
                <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 03</span>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Sistēmas paziņojumi</span>
              </div>
              <div className="space-y-2">
                {[
                  { key: "pushFinance" as const, label: t("settings.notifications.finance") },
                  { key: "pushPharmacy" as const, label: t("settings.notifications.pharmacy") },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => void persistSettings({ ...settings, [item.key]: !settings[item.key] })}
                    className="flex w-full items-center justify-between border border-white/5 bg-black/20 p-4 text-left rounded-sm hover:border-primary/30 transition-all group font-mono"
                  >
                    <span className="text-[0.6rem] font-black uppercase tracking-widest text-white/80 group-hover:text-primary">
                      {item.label}
                    </span>
                    <span className={`text-[0.5rem] font-black px-1.5 py-0.5 border uppercase tracking-tighter ${
                      settings[item.key] ? 'border-emerald-500 text-emerald-500' : 'border-white/20 text-white/20'
                    }`}>
                      {settings[item.key] ? 'CONNECTED' : 'DISABLED'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* SECTOR 04: SECURITY_SESSION */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-1 opacity-40">
                <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 04</span>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Drošība un sesija</span>
              </div>
              <GlassPanel className="p-0 overflow-hidden font-mono">
                <div className="border-b border-white/5 bg-white/5 px-4 py-3">
                  <p className="text-[0.6rem] font-black uppercase tracking-widest text-primary">AUTHENTICATED_SESSION</p>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[0.5rem] font-black text-primary uppercase tracking-widest">IDENTIFICATOR</p>
                    <p className="text-[0.65rem] text-white/80 mt-1 uppercase">{user?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    className="border border-primary bg-primary/10 px-4 py-2 text-[0.6rem] font-black uppercase tracking-widest text-primary hover:bg-primary/20 transition-all rounded-sm"
                  >
                    [ {t("auth.signout").toUpperCase()} ]
                  </button>
                </div>
              </GlassPanel>
            </div>
          </>
        ) : (
          <>
            <GlassPanel className="space-y-4">
              <SectionHeading
                eyebrow={t("settings.profileSplit.eyebrow")}
                title={t("settings.profileSplit.title")}
              />
              <p className="text-sm leading-relaxed text-(--color-text-secondary)">
                {t("settings.profileSplit.body")}
              </p>
              <Link
                href="/profile"
                className="inline-flex items-center rounded-(--radius-button) border border-(--color-border) px-4 py-2.5 text-sm font-semibold text-(--color-text-primary)"
              >
                {t("settings.profileSplit.open")}
              </Link>
            </GlassPanel>

            <GlassPanel className="space-y-4">
              <SectionHeading
                eyebrow={t("settings.appearance.eyebrow")}
                title={t("settings.theme")}
                detail={t(THEMES[themeId].labelKey)}
              />
              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(THEMES) as ThemeId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => void handleThemeChange(id)}
                    className={`flex items-center justify-between rounded-(--radius-card) border p-4 text-left transition-all ${
                      themeId === id
                        ? "border-(--color-button-primary) bg-(--color-button-primary)/10"
                        : "border-(--color-border) bg-[color-mix(in_srgb,var(--color-surface)_84%,transparent)]"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <ThemeToolbarIcon themeId={id} size={22} tone={themeId === id ? "active" : "inactive"} />
                      <span className="text-sm font-semibold text-(--color-text-primary)">
                        {t(THEMES[id].labelKey)}
                      </span>
                    </span>
                    {themeId === id ? (
                      <StatusPill tone="good">{t("settings.state.active")}</StatusPill>
                    ) : null}
                  </button>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <SectionHeading title={t("settings.language")} />
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { id: "lv", label: "Latviešu" },
                    { id: "en", label: "English" },
                  ] as const).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => void handleLocaleChange(item.id)}
                      className={`rounded-(--radius-card) border px-4 py-3 text-sm font-semibold ${
                        locale === item.id
                          ? "border-(--color-button-primary) bg-(--color-button-primary)/10 text-(--color-text-primary)"
                          : "border-(--color-border) text-(--color-text-secondary)"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="space-y-4">
              <SectionHeading
                eyebrow={t("settings.notifications.eyebrow")}
                title={t("settings.notifications")}
              />
              <div className="space-y-2">
                {[
                  { key: "pushFinance" as const, label: t("settings.notifications.finance") },
                  { key: "pushPharmacy" as const, label: t("settings.notifications.pharmacy") },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => void persistSettings({ ...settings, [item.key]: !settings[item.key] })}
                    className="flex w-full items-center justify-between rounded-(--radius-card) border border-(--color-border) bg-[color-mix(in_srgb,var(--color-surface)_84%,transparent)] p-4 text-left"
                  >
                    <span className="text-sm font-semibold text-(--color-text-primary)">
                      {item.label}
                    </span>
                    <StatusPill tone={settings[item.key] ? "good" : "neutral"}>
                      {settings[item.key] ? "ON" : "OFF"}
                    </StatusPill>
                  </button>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel className="space-y-4">
              <SectionHeading
                eyebrow="AI"
                title={t("settings.byok.title")}
              />
              <p className="text-sm leading-relaxed text-(--color-text-secondary)">
                {t("settings.byok.hint")}
              </p>
              <div className="space-y-3">
                {renderProviderControl("gemini", "Gemini")}
                {renderProviderControl("openai", "OpenAI")}
                {renderProviderControl("deepseek", "DeepSeek")}
                {renderProviderControl("grok", "Grok (X.AI)")}
              </div>
            </GlassPanel>

            <GlassPanel className="space-y-4">
              <SectionHeading
                eyebrow={t("settings.session.eyebrow")}
                title={t("settings.session.title")}
              />
              <p className="text-sm text-(--color-text-secondary)">
                {user?.email ?? t("settings.session.signedIn")}
              </p>
              <button
                type="button"
                onClick={() => void signOut()}
                className="w-full rounded-(--radius-button) border border-(--color-border) px-4 py-3 text-sm font-semibold text-(--color-text-primary)"
              >
                {t("auth.signout")}
              </button>
            </GlassPanel>
          </>
        )}
      </div>
      </SettingsThemeLayer>
    </ModuleShell>
  );
}
