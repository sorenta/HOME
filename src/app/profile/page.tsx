"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HouseholdOnboarding } from "@/components/household/household-onboarding";
import { HouseholdPlanCard } from "@/components/billing/household-plan-card";
import { HouseholdMembersList } from "@/components/household/household-members-list";
import { HouseholdSummary } from "@/components/household/household-summary";
import { useAuth } from "@/components/providers/auth-provider";
import { fetchMyHouseholdSummary } from "@/lib/household";
import { ModuleShell } from "@/components/layout/module-shell";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassPanel } from "@/components/ui/glass-panel";
import { loadUserWaterMedals } from "@/lib/household-water-sync";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";
import { getBrowserClient } from "@/lib/supabase/client";

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

export default function ProfilePage() {
  const { t, locale } = useI18n();
  const { user, profile, refreshProfile } = useAuth();
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [birthdayAt, setBirthdayAt] = useState("");
  const [nameDayAt, setNameDayAt] = useState("");
  const [householdName, setHouseholdName] = useState<string | null>(null);
  const [householdMemberCount, setHouseholdMemberCount] = useState(0);
  const [medals, setMedals] = useState({ gold: 0, silver: 0, bronze: 0 });
  const [savingName, setSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState<string | null>(null);
  const [nameTone, setNameTone] = useState<"good" | "critical">("good");
  const [savingDates, setSavingDates] = useState(false);
  const [datesMessage, setDatesMessage] = useState<string | null>(null);
  const [datesTone, setDatesTone] = useState<"good" | "critical">("good");

  const secondaryModules = [
    { href: "/household", label: t("app.household"), icon: "⌂" },
    { href: "/events", label: t("tile.calendar"), icon: "📅" },
    { href: "/reset", label: t("tile.reset"), icon: "🧘" },
    { href: "/pharmacy", label: t("tile.pharmacy"), icon: "💊" },
    { href: "/settings", label: t("nav.settings"), icon: "⚙" },
  ];

  const displayName =
    profile?.display_name ?? user?.user_metadata.display_name ?? user?.email?.split("@")[0] ?? "";
  const role = profile?.role_label ?? t("profile.roleFallback");
  const resetScore = Math.round(Number(profile?.reset_score ?? 0));
  const celebrationsCount = Number(Boolean(birthdayAt)) + Number(Boolean(nameDayAt));

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
      const summary = await fetchMyHouseholdSummary();
      if (!alive) return;
      setHouseholdName(summary?.name ?? "");
      setHouseholdMemberCount(Number(summary?.member_count ?? 0));
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

  async function saveDisplayName() {
    if (!user?.id) return;
    const supabase = getBrowserClient();
    if (!supabase) return;
    const nextName = displayNameInput.trim();
    if (!nextName) {
      setNameTone("critical");
      setNameMessage(t("profile.name.error"));
      return;
    }
    setSavingName(true);
    setNameMessage(null);
    const { error } = await supabase.from("profiles").update({ display_name: nextName }).eq("id", user.id);
    if (error) {
      setSavingName(false);
      setNameTone("critical");
      setNameMessage(t("profile.name.error"));
      return;
    }
    await supabase.auth.updateUser({ data: { display_name: nextName, name: nextName } });
    await refreshProfile();
    setSavingName(false);
    setNameTone("good");
    setNameMessage(t("profile.name.saved"));
    hapticTap();
  }

  async function saveSpecialDates() {
    if (!user?.id) return;
    const supabase = getBrowserClient();
    if (!supabase) return;
    setSavingDates(true);
    setDatesMessage(null);
    const { error } = await supabase
      .from("profiles")
      .update({ birthday_at: birthdayAt || null, name_day_at: nameDayAt || null })
      .eq("id", user.id);
    setSavingDates(false);
    if (error) {
      setDatesTone("critical");
      setDatesMessage(isMissingSpecialDateColumns(error) ? t("profile.specialDates.missingColumns") : t("profile.specialDates.error"));
      return;
    }
    await refreshProfile();
    setDatesTone("good");
    setDatesMessage(t("profile.specialDates.saved"));
    hapticTap();
  }

  return (
    <ModuleShell title={t("nav.profile")}>
      <GlassPanel className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-black tracking-tight text-foreground truncate">{displayName}</h2>
            <p className="text-sm font-bold text-primary uppercase tracking-wider mt-1">
              {role} {householdName ? `• ${householdName}` : ""}
            </p>
            {user?.email && <p className="text-xs text-foreground/50 mt-1 font-mono">{user.email}</p>}
          </div>
          <StatusPill tone={resetScore >= 60 ? "good" : "neutral"}>{`RESET ${resetScore}%`}</StatusPill>
        </div>

        <div className="pt-4 border-t border-border/50">
          <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">
            {t("profile.name.label")}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={displayNameInput}
              onChange={(e) => setDisplayNameInput(e.target.value)}
              className="flex-1 rounded-theme border border-border bg-background/50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <button
              onClick={() => void saveDisplayName()}
              disabled={savingName}
              className="rounded-theme bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
            >
              {savingName ? "..." : t("profile.name.save")}
            </button>
          </div>
          {nameMessage && <div className="mt-2"><StatusPill tone={nameTone}>{nameMessage}</StatusPill></div>}
        </div>
      </GlassPanel>

      {profile?.household_id ? (
        <div className="space-y-6">
          <HouseholdSummary householdId={profile.household_id} showQr />
          <HouseholdPlanCard />
          <HouseholdMembersList />
        </div>
      ) : (
        <HouseholdOnboarding compact />
      )}

      <div className="grid grid-cols-3 gap-3">
        <MetricCard label={t("profile.metric.reset")} value={`${resetScore}%`} />
        <MetricCard label={t("profile.metric.medals")} value={medals.gold + medals.silver + medals.bronze} />
        <MetricCard label={t("profile.metric.celebrations")} value={celebrationsCount} hint={profile?.household_id ? String(householdMemberCount) : "0"} />
      </div>

      <GlassPanel className="space-y-4">
        <SectionHeading title={t("profile.medals.title")} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="bg-background/40 rounded-theme p-3 border border-border flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold uppercase text-foreground/50 mb-1">{t("profile.medals.gold")}</span>
            <span className="text-2xl">🥇</span>
            <span className="text-xl font-black mt-1">{medals.gold}</span>
          </div>
          <div className="bg-background/40 rounded-theme p-3 border border-border flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold uppercase text-foreground/50 mb-1">{t("profile.medals.silver")}</span>
            <span className="text-2xl">🥈</span>
            <span className="text-xl font-black mt-1">{medals.silver}</span>
          </div>
          <div className="bg-background/40 rounded-theme p-3 border border-border flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold uppercase text-foreground/50 mb-1">{t("profile.medals.bronze")}</span>
            <span className="text-2xl">🥉</span>
            <span className="text-xl font-black mt-1">{medals.bronze}</span>
          </div>
          <div className="bg-primary/10 rounded-theme p-3 border border-primary/20 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold uppercase text-primary mb-1">{t("profile.medals.total")}</span>
            <span className="text-2xl">🏆</span>
            <span className="text-xl font-black text-primary mt-1">{medals.gold + medals.silver + medals.bronze}</span>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-4">
        <SectionHeading title={t("profile.shortcuts.title")} />
        <div className="grid grid-cols-2 gap-3">
          {secondaryModules.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => hapticTap()}
              className="flex items-center gap-3 rounded-theme border border-border bg-background/50 p-3 hover:bg-primary/5 hover:border-primary/30 transition-all group"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-theme border border-border bg-background text-xl group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <span className="text-sm font-bold text-foreground truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-4">
        <SectionHeading title={t("profile.specialDates.title")} />
        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1.5 block">{t("profile.specialDates.birthday")}</span>
            <input
              type="date"
              lang={locale === "lv" ? "lv-LV" : "en-US"}
              value={birthdayAt}
              onChange={(e) => setBirthdayAt(e.target.value)}
              className="w-full rounded-theme border border-border bg-background/50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1.5 block">{t("profile.specialDates.nameday")}</span>
            <input
              type="date"
              lang={locale === "lv" ? "lv-LV" : "en-US"}
              value={nameDayAt}
              onChange={(e) => setNameDayAt(e.target.value)}
              className="w-full rounded-theme border border-border bg-background/50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </label>
        </div>
        <button
          onClick={() => void saveSpecialDates()}
          disabled={savingDates}
          className="w-full rounded-theme bg-foreground text-background px-4 py-4 text-sm font-bold shadow-md hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all"
        >
          {savingDates ? "..." : t("profile.specialDates.save")}
        </button>
        {datesMessage && <StatusPill tone={datesTone}>{datesMessage}</StatusPill>}
      </GlassPanel>
    </ModuleShell>
  );
}