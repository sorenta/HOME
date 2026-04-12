"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { HouseholdCard } from "@/components/profile/household-card";
import { ProfileHero } from "@/components/profile/profile-hero";
import { ProfileSummary } from "@/components/profile/profile-summary";
import { ForgeProfileLayout } from "@/components/profile/layouts/forge-layout";
import { DefaultProfileLayout } from "@/components/profile/layouts/default-layout";
import { fetchMyHouseholdMembers, fetchMyHouseholdSummary, type HouseholdMember, type Household } from "@/lib/household";
import { loadUserWaterMedals } from "@/lib/household-water-sync";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";
import { hapticTap } from "@/lib/haptic";
import { getBrowserClient } from "@/lib/supabase/client";
import { useThemeActionEffects } from "@/components/theme/theme-action-effects";

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
  const { t } = useI18n();
  const { themeId } = useTheme();
  const { user, profile, refreshProfile } = useAuth();
  const { triggerThemeActionEffect } = useThemeActionEffects();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [birthdayAt, setBirthdayAt] = useState("");
  const [nameDayAt, setNameDayAt] = useState("");
  const [household, setHousehold] = useState<Household | null>(null);
  const [householdName, setHouseholdName] = useState<string | null>(null);
  const [householdMemberCount, setHouseholdMemberCount] = useState(0);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [medals, setMedals] = useState({ gold: 0, silver: 0, bronze: 0 });
  const [savingProfile, setSavingProfile] = useState(false);
  const [editMessage, setEditMessage] = useState<string | null>(null);
  const [editTone, setEditTone] = useState<"good" | "critical">("good");

  const displayName =
    profile?.display_name ?? user?.user_metadata.display_name ?? user?.email?.split("@")[0] ?? "";
  const role = profile?.role_label ?? t("profile.roleFallback");
  const resetScore = Math.round(Number(profile?.reset_score ?? 0));
  const celebrationsCount = Number(Boolean(birthdayAt)) + Number(Boolean(nameDayAt));
  const statusText = t("profile.statusText", { score: String(resetScore) });

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
      setHousehold(summary);
      setHouseholdName(summary?.name ?? "");
      setHouseholdMemberCount(Number(summary?.member_count ?? 0));
      setHouseholdMembers(members);
    };
    void loadHousehold();
    return () => { alive = false; };
  }, [profile?.household_id]);

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
    triggerThemeActionEffect({ kind: "save", label: nextName });
    setIsEditOpen(false);
  }

  const layoutProps = {
    displayName,
    role,
    email: user?.email,
    statusText,
    onEditProfile: () => setIsEditOpen(true),
    household,
    householdMembers,
    resetScore,
    celebrationsCount,
    householdMemberCount,
    medals,
  };

  return (
    <div className={isForge ? "space-y-10 pt-4 pb-12" : "space-y-4"}>
      {isForge ? (
        <ForgeProfileLayout {...layoutProps} />
      ) : (
        <DefaultProfileLayout {...layoutProps} />
      )}

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-md overflow-hidden border p-6 shadow-2xl ${
                isForge 
                  ? 'bg-black border-primary/40 text-white font-mono rounded-sm' 
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)] rounded-[2.5rem]'
              }`}
            >
              <div className={`mb-6 border-b pb-3 ${isForge ? 'border-white/10' : 'border-current opacity-20'}`}>
                <h2 className={`text-lg font-bold uppercase tracking-widest ${isForge ? 'text-primary' : ''}`}>
                  {t("profile.edit.title")}
                </h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className={`text-[0.6rem] font-black uppercase tracking-widest ${isForge ? 'text-primary' : 'text-[var(--color-text-secondary)]'}`}>
                    {t("profile.form.name")}
                  </label>
                  <input
                    type="text"
                    value={displayNameInput}
                    onChange={(e) => setDisplayNameInput(e.target.value)}
                    className={`w-full px-4 py-3 text-sm transition-all outline-none border ${
                      isForge 
                        ? 'bg-black/40 border-white/10 text-white focus:border-primary rounded-sm uppercase' 
                        : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl focus:border-primary'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={`text-[0.6rem] font-black uppercase tracking-widest ${isForge ? 'text-primary' : 'text-[var(--color-text-secondary)]'}`}>
                      {t("profile.form.birthday")}
                    </label>
                    <input
                      type="date"
                      value={birthdayAt}
                      onChange={(e) => setBirthdayAt(e.target.value)}
                      className={`w-full px-4 py-2 text-xs transition-all outline-none border ${
                        isForge 
                          ? 'bg-black/40 border-white/10 text-white focus:border-primary rounded-sm [color-scheme:dark]' 
                          : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl focus:border-primary'
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`text-[0.6rem] font-black uppercase tracking-widest ${isForge ? 'text-primary' : 'text-[var(--color-text-secondary)]'}`}>
                      {t("profile.form.nameDay")}
                    </label>
                    <input
                      type="date"
                      value={nameDayAt}
                      onChange={(e) => setNameDayAt(e.target.value)}
                      className={`w-full px-4 py-2 text-xs transition-all outline-none border ${
                        isForge 
                          ? 'bg-black/40 border-white/10 text-white focus:border-primary rounded-sm [color-scheme:dark]' 
                          : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl focus:border-primary'
                      }`}
                    />
                  </div>
                </div>

                {editMessage && (
                <p className={`text-xs font-bold uppercase ${editTone === 'critical' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {editMessage}
                </p>
                )}

                <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsEditOpen(false)}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                    isForge ? 'border border-white/10 text-white/40 hover:bg-white/5' : 'text-[var(--color-text-secondary)] hover:opacity-70'
                  }`}
                >
                  {t("nav.back")}
                </button>
                <button
                  onClick={saveProfileDetails}
                  disabled={savingProfile || !displayNameInput.trim()}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-30 ${
                    isForge 
                      ? 'bg-primary text-white shadow-[0_0_20px_rgba(225,29,46,0.4)] hover:bg-primary/80 rounded-sm' 
                      : 'bg-[var(--color-button-primary)] text-[var(--color-button-primary-text)] rounded-full'
                  }`}
                >                    {savingProfile ? '...' : t("events.form.save")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
  )}
      </AnimatePresence>
    </div>
  );
}
