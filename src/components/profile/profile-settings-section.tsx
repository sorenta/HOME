"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { HouseholdCard } from "@/components/profile/household-card";
import { ProfileHero } from "@/components/profile/profile-hero";
import { ProfileSummary } from "@/components/profile/profile-summary";
import { fetchMyHouseholdMembers, fetchMyHouseholdSummary, type HouseholdMember } from "@/lib/household";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassPanel } from "@/components/ui/glass-panel";
import { loadUserWaterMedals } from "@/lib/household-water-sync";
import { useI18n } from "@/lib/i18n/i18n-context";
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
  const { t, locale } = useI18n();
  const { themeId } = useTheme();
  const { user, profile, refreshProfile } = useAuth();
  const { triggerThemeActionEffect } = useThemeActionEffects();
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

  const isForge = themeId === "forge";

  return (
    <div className={isForge ? "space-y-10 pt-4 pb-12" : "space-y-4"}>
      {isForge ? (
        <>
          {/* SECTOR 01: IDENTITY_PROFILE */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-1 opacity-40">
              <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 01</span>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
              <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Identitātes profils</span>
            </div>
            <ProfileHero
              displayName={displayName}
              role={role}
              email={user?.email}
              statusText={statusText}
              onEditProfile={() => setIsEditOpen(true)}
            />
          </div>

          {/* SECTOR 02: HOUSEHOLD_UNIT */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-1 opacity-40">
              <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 02</span>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
              <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Mājsaimniecības vienība</span>
            </div>
            <HouseholdCard
              householdName={householdName}
              roleLabel={role}
              members={householdMembers}
            />
          </div>

          {/* SECTOR 03: PERSONNEL_MANIFEST */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-1 opacity-40">
              <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 03</span>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
              <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Personāla manifests</span>
            </div>
            <ProfileSummary
              resetScore={resetScore}
              celebrationsCount={celebrationsCount}
              householdMemberCount={householdMemberCount}
              medals={medals}
            />
          </div>
        </>
      ) : (
        <>
          <ProfileHero
            displayName={displayName}
            role={role}
            email={user?.email}
            statusText={statusText}
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
        </>
      )}

      <AnimatePresence>
        {isEditOpen ? (
          <>
            <motion.button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className={`fixed inset-0 z-40 transition-all ${isForge ? 'bg-black/60 backdrop-blur-sm' : 'bg-[color-mix(in_srgb,var(--color-text-primary)_30%,transparent)]'}`}
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
              <GlassPanel className={`h-full space-y-4 overflow-y-auto ${isForge ? 'border-primary/20 bg-black/90' : ''}`}
                          style={{ borderRadius: isForge ? '2px' : undefined }}>
                <div className={`flex items-center justify-between border-b pb-3 mb-6 ${isForge ? 'border-white/10' : 'border-(--color-border)'}`}>
                  <h3 className={`text-lg font-bold uppercase tracking-widest ${isForge ? 'text-white font-(family-name:--font-rajdhani)' : 'text-(--color-text-primary)'}`}>
                    {isForge ? "PROFILA_KONFIGURĀCIJA" : "Pilnais profils"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-widest transition-all ${
                      isForge ? 'border border-white/10 text-white/40 hover:text-white' : 'rounded-full border border-(--color-border) text-sm'
                    }`}
                  >
                    {isForge ? "[ AIZVĒRT ]" : "Aizvērt"}
                  </button>
                </div>

                <label className="block space-y-1">
                  <span className={`text-[0.6rem] font-black uppercase tracking-[0.12em] ${isForge ? 'text-primary' : 'text-(--color-text-secondary)'}`}>
                    {t("profile.name.label")}
                  </span>
                  <input
                    type="text"
                    value={displayNameInput}
                    onChange={(event) => setDisplayNameInput(event.target.value)}
                    className={`w-full px-3 py-2.5 text-sm outline-none transition-all ${
                      isForge 
                        ? 'border border-white/10 bg-white/5 text-white font-mono focus:border-primary' 
                        : 'rounded-(--radius-button) border border-(--color-border) bg-transparent focus:border-(--color-button-primary)'
                    }`}
                  />
                </label>

                <label className="block space-y-1">
                  <span className={`text-[0.6rem] font-black uppercase tracking-[0.12em] ${isForge ? 'text-primary' : 'text-(--color-text-secondary)'}`}>
                    {t("profile.specialDates.birthday")}
                  </span>
                  <input
                    type="date"
                    lang={locale === "lv" ? "lv-LV" : "en-US"}
                    value={birthdayAt}
                    onChange={(event) => setBirthdayAt(event.target.value)}
                    className={`w-full px-3 py-2.5 text-sm outline-none transition-all ${
                      isForge 
                        ? 'border border-white/10 bg-white/5 text-white font-mono focus:border-primary [color-scheme:dark]' 
                        : 'rounded-(--radius-button) border border-(--color-border) bg-transparent focus:border-(--color-button-primary)'
                    }`}
                  />
                </label>

                <label className="block space-y-1">
                  <span className={`text-[0.6rem] font-black uppercase tracking-[0.12em] ${isForge ? 'text-primary' : 'text-(--color-text-secondary)'}`}>
                    {t("profile.specialDates.nameday")}
                  </span>
                  <input
                    type="date"
                    lang={locale === "lv" ? "lv-LV" : "en-US"}
                    value={nameDayAt}
                    onChange={(event) => setNameDayAt(event.target.value)}
                    className={`w-full px-3 py-2.5 text-sm outline-none transition-all ${
                      isForge 
                        ? 'border border-white/10 bg-white/5 text-white font-mono focus:border-primary [color-scheme:dark]' 
                        : 'rounded-(--radius-button) border border-(--color-border) bg-transparent focus:border-(--color-button-primary)'
                    }`}
                  />
                </label>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={() => void saveProfileDetails()}
                    disabled={savingProfile}
                    className={`w-full py-3 text-[0.65rem] font-black uppercase tracking-widest transition-all ${
                      isForge 
                        ? 'bg-primary text-white shadow-[0_0_20px_rgba(225,29,46,0.4)] hover:bg-primary/80' 
                        : 'rounded-theme bg-(--color-button-primary) text-(--color-button-primary-text)'
                    } disabled:opacity-60`}
                  >
                    {savingProfile ? "..." : (isForge ? "[ SAGLABĀT_IZMAIŅAS ]" : t("profile.action.saveChanges"))}
                  </button>
                </div>

                {editMessage ? <StatusPill tone={editTone}>{editMessage}</StatusPill> : null}
              </GlassPanel>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
