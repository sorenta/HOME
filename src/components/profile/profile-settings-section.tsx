"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { HouseholdCard } from "@/components/profile/household-card";
import { ProfileHero } from "@/components/profile/profile-hero";
import { ProfileSummary } from "@/components/profile/profile-summary";
import { AiProfileCard } from "@/components/profile/ai-profile-card";
import { fetchMyHouseholdMembers, fetchMyHouseholdSummary, type HouseholdMember } from "@/lib/household";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassPanel } from "@/components/ui/glass-panel";
import { loadUserWaterMedals } from "@/lib/household-water-sync";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";
import { getProviderKeyFromStorage, validateProviderKey } from "@/lib/ai/keys";
import { getBrowserClient } from "@/lib/supabase/client";

const SETTINGS_KEY = "majapps-local-settings";

type LocalSettings = {
  aiEnabled: boolean;
  aiRecipes: boolean;
  aiFinanceInsights: boolean;
  aiMedicationSafety: boolean;
};

function readLocalSettings(): LocalSettings {
  const fallback: LocalSettings = {
    aiEnabled: false,
    aiRecipes: false,
    aiFinanceInsights: false,
    aiMedicationSafety: false,
  };

  if (typeof window === "undefined") return fallback;

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function readAiProviderLabel(): "Gemini" | "OpenAI" | null {
  const geminiKey = (getProviderKeyFromStorage("gemini") ?? "").trim();
  if (validateProviderKey("gemini", geminiKey) === null) return "Gemini";

  const openAiKey = (getProviderKeyFromStorage("openai") ?? "").trim();
  if (validateProviderKey("openai", openAiKey) === null) return "OpenAI";

  return null;
}

function toDateInputValue(value: string | null | undefined) {
  return value ?? "";
}

function isMissingSpecialDateColumns(error: unknown) {
  const message =
    typeof error === "object" && error
      ? `${(error as { message?: string }).message ?? ""}`.toLowerCase()
      : "";
  return (
    message.includes("birthday_at") ||
    message.includes("name_day_at") ||
    message.includes("column") ||
    message.includes("schema cache")
  );
}

export function ProfileSettingsSection() {
  const { t, locale } = useI18n();
  const { user, profile, refreshProfile } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [birthdayAt, setBirthdayAt] = useState("");
  const [nameDayAt, setNameDayAt] = useState("");
  const [householdName, setHouseholdName] = useState<string | null>(null);
  const [householdMemberCount, setHouseholdMemberCount] = useState(0);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [medals, setMedals] = useState({ gold: 0, silver: 0, bronze: 0 });
  const [savingProfile, setSavingProfile] = useState(false);
  const [editMessage, setEditMessage] = useState<string | null>(null);
  const [editTone, setEditTone] = useState<"good" | "critical">("good");
  const [localSettings, setLocalSettings] = useState<LocalSettings>(readLocalSettings);
  const [aiProviderLabel, setAiProviderLabel] = useState<"Gemini" | "OpenAI" | null>(null);

  const displayName =
    profile?.display_name ?? user?.user_metadata.display_name ?? user?.email?.split("@")[0] ?? "";
  const role = profile?.role_label ?? t("profile.roleFallback");
  const resetScore = Math.round(Number(profile?.reset_score ?? 0));
  const celebrationsCount = Number(Boolean(birthdayAt)) + Number(Boolean(nameDayAt));
  const aiDomains = useMemo(() => {
    const domains: string[] = [];
    if (localSettings.aiRecipes) domains.push("Virtuve");
    if (localSettings.aiFinanceInsights) domains.push("Finanses");
    if (localSettings.aiMedicationSafety) domains.push("Farmacija");
    return domains.length > 0 ? domains : ["Virtuve", "Finanses"];
  }, [localSettings]);
  const showAiProfile = localSettings.aiEnabled && aiProviderLabel !== null;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setDisplayNameInput(displayName);
      setBirthdayAt(toDateInputValue(profile?.birthday_at));
      setNameDayAt(toDateInputValue(profile?.name_day_at));
    });
    return () => cancelAnimationFrame(frame);
  }, [displayName, profile?.birthday_at, profile?.name_day_at]);

  useEffect(() => {
    let alive = true;
    const loadHousehold = async () => {
      const [summary, members] = await Promise.all([fetchMyHouseholdSummary(), fetchMyHouseholdMembers()]);
      if (!alive) return;
      setHouseholdName(summary?.name ?? "");
      setHouseholdMemberCount(Number(summary?.member_count ?? 0));
      setHouseholdMembers(members);
    };
    void loadHousehold();
    return () => { alive = false; };
  }, [profile?.household_id]);

  useEffect(() => {
    const syncAiState = () => {
      setLocalSettings(readLocalSettings());
      setAiProviderLabel(readAiProviderLabel());
    };

    syncAiState();
    window.addEventListener("storage", syncAiState);
    window.addEventListener("focus", syncAiState);

    return () => {
      window.removeEventListener("storage", syncAiState);
      window.removeEventListener("focus", syncAiState);
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    void loadUserWaterMedals({
      scopeId: profile?.household_id ?? `personal:${user.id}`,
      householdId: profile?.household_id ?? null,
      userId: user.id,
    }).then((next) => {
      if (alive) setMedals(next);
    });
    return () => { alive = false; };
  }, [profile?.household_id, user?.id]);

  async function saveProfileDetails() {
    if (!user?.id) return;
    const supabase = getBrowserClient();
    if (!supabase) return;

    const nextName = displayNameInput.trim();
    if (!nextName) {
      setEditTone("critical");
      setEditMessage(t("profile.name.error"));
      return;
    }

    setSavingProfile(true);
    setEditMessage(null);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: nextName,
        birthday_at: birthdayAt || null,
        name_day_at: nameDayAt || null,
      })
      .eq("id", user.id);

    if (error) {
      setSavingProfile(false);
      setEditTone("critical");
      setEditMessage(
        isMissingSpecialDateColumns(error)
          ? t("profile.specialDates.missingColumns")
          : t("profile.specialDates.error"),
      );
      return;
    }

    await supabase.auth.updateUser({ data: { display_name: nextName, name: nextName } });
    await refreshProfile();
    setSavingProfile(false);
    setEditTone("good");
    setEditMessage(t("profile.specialDates.saved"));
    hapticTap();
    setIsEditOpen(false);
  }

  return (
    <div className="space-y-4">
      <ProfileHero
        displayName={displayName}
        role={role}
        email={user?.email}
        statusText={`Tu esi svarīga daļa no sava household ritma. RESET progress: ${resetScore}%.`}
        onEditProfile={() => setIsEditOpen(true)}
      />

      <HouseholdCard
        householdName={householdName}
        roleLabel={role}
        members={householdMembers}
      />

      <ProfileSummary
        resetScore={resetScore}
        celebrationsCount={celebrationsCount}
        householdMemberCount={householdMemberCount}
        medals={medals}
      />

      {showAiProfile ? (
        <AiProfileCard
          providerLabel={aiProviderLabel ?? "Gemini"}
          domains={aiDomains}
          summary="Asistents pielāgojas tavam ikdienas ritmam un ieteikumiem Virtuves un finanšu moduļos."
        />
      ) : null}

      <AnimatePresence>
        {isEditOpen ? (
          <>
            <motion.button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="fixed inset-0 z-40 bg-[color:color-mix(in_srgb,var(--color-text-primary)_30%,transparent)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Profila rediģēšana"
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md p-3"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            >
              <GlassPanel className="h-full space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[color:var(--color-text-primary)]">Pilnais profils</h3>
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="rounded-[var(--radius-button)] border border-[color:var(--color-border)] px-3 py-2 text-sm"
                  >
                    Aizvērt
                  </button>
                </div>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-secondary)]">
                    {t("profile.name.label")}
                  </span>
                  <input
                    type="text"
                    value={displayNameInput}
                    onChange={(event) => setDisplayNameInput(event.target.value)}
                    className="w-full rounded-[var(--radius-button)] border border-[color:var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[color:var(--color-button-primary)]"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-secondary)]">
                    {t("profile.specialDates.birthday")}
                  </span>
                  <input
                    type="date"
                    lang={locale === "lv" ? "lv-LV" : "en-US"}
                    value={birthdayAt}
                    onChange={(event) => setBirthdayAt(event.target.value)}
                    className="w-full rounded-[var(--radius-button)] border border-[color:var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[color:var(--color-button-primary)]"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-secondary)]">
                    {t("profile.specialDates.nameday")}
                  </span>
                  <input
                    type="date"
                    lang={locale === "lv" ? "lv-LV" : "en-US"}
                    value={nameDayAt}
                    onChange={(event) => setNameDayAt(event.target.value)}
                    className="w-full rounded-[var(--radius-button)] border border-[color:var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[color:var(--color-button-primary)]"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => void saveProfileDetails()}
                  disabled={savingProfile}
                  className="w-full rounded-[var(--radius-button)] bg-[color:var(--color-button-primary)] px-4 py-3 text-sm font-semibold text-[color:var(--color-button-primary-text)] disabled:opacity-60"
                >
                  {savingProfile ? "..." : "Saglabāt izmaiņas"}
                </button>

                {editMessage ? <StatusPill tone={editTone}>{editMessage}</StatusPill> : null}
              </GlassPanel>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}