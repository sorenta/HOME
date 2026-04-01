"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HouseholdOnboarding } from "@/components/household/household-onboarding";
import { HouseholdPlanCard } from "@/components/billing/household-plan-card";
import { HouseholdMembersList } from "@/components/household/household-members-list";
import { HouseholdSummary } from "@/components/household/household-summary";
import { useAuth } from "@/components/providers/auth-provider";
import { ModuleShell } from "@/components/layout/module-shell";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassPanel } from "@/components/ui/glass-panel";
import { growthTips, profileSummary } from "@/lib/demo-data";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";
import { getBrowserClient } from "@/lib/supabase/client";

function toDateInputValue(value: string | null | undefined) {
  return value ?? "";
}

export default function ProfilePage() {
  const { t } = useI18n();
  const { user, profile, refreshProfile } = useAuth();
  const [birthdayAt, setBirthdayAt] = useState("");
  const [nameDayAt, setNameDayAt] = useState("");
  const [savingDates, setSavingDates] = useState(false);
  const [datesMessage, setDatesMessage] = useState<string | null>(null);
  const [datesTone, setDatesTone] = useState<"good" | "critical">("good");
  const secondaryModules = [
    { href: "/household", label: t("app.household"), icon: "⌂" },
    { href: "/calendar", label: t("tile.calendar"), icon: "📅" },
    { href: "/reset", label: t("tile.reset"), icon: "🧘" },
    { href: "/pharmacy", label: t("tile.pharmacy"), icon: "💊" },
    { href: "/settings", label: t("nav.settings"), icon: "⚙" },
  ];
  const displayName =
    profile?.display_name ?? user?.user_metadata.display_name ?? user?.email?.split("@")[0] ?? profileSummary.name;
  const role = profile?.role_label ?? profileSummary.role;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setBirthdayAt(toDateInputValue(profile?.birthday_at));
      setNameDayAt(toDateInputValue(profile?.name_day_at));
    });

    return () => cancelAnimationFrame(frame);
  }, [profile?.birthday_at, profile?.name_day_at]);

  async function saveSpecialDates() {
    if (!user?.id) return;
    const supabase = getBrowserClient();
    if (!supabase) return;

    setSavingDates(true);
    setDatesMessage(null);
    setDatesTone("good");

    const { error } = await supabase
      .from("profiles")
      .update({
        birthday_at: birthdayAt || null,
        name_day_at: nameDayAt || null,
      })
      .eq("id", user.id);

    setSavingDates(false);

    if (error) {
      setDatesTone("critical");
      setDatesMessage(t("profile.specialDates.error"));
      return;
    }

    await refreshProfile();
    setDatesTone("good");
    setDatesMessage(t("profile.specialDates.saved"));
  }

  return (
    <ModuleShell title={t("nav.profile")}>
      <GlassPanel className="space-y-3">
        <SectionHeading title={t("profile.identity")} />
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xl font-semibold text-[color:var(--color-text)]">
              {displayName}
            </p>
            <p className="text-sm text-[color:var(--color-secondary)]">
              {role} · {profileSummary.household}
            </p>
            {user?.email ? (
              <p className="mt-1 text-xs text-[color:var(--color-secondary)]">
                {user.email}
              </p>
            ) : null}
          </div>
          <StatusPill tone="good">{profileSummary.streak}</StatusPill>
        </div>
        <p className="text-sm leading-relaxed text-[color:var(--color-text)]">
          {t("profile.blurb")}
        </p>
      </GlassPanel>

      {profile?.household_id ? (
        <>
          <HouseholdSummary householdId={profile.household_id} showQr />
          <HouseholdPlanCard />
          <HouseholdMembersList />
        </>
      ) : (
        <HouseholdOnboarding compact />
      )}

      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="RESET" value={profileSummary.resetPoints} />
        <MetricCard label="Grozs" value={profileSummary.shoppingContributions} />
        <MetricCard label="Rēķini" value={profileSummary.financeActions} />
      </div>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("profile.shortcuts.title")} />
        <p className="text-sm leading-relaxed text-[color:var(--color-secondary)]">
          {t("profile.shortcuts.hint")}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {secondaryModules.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => hapticTap()}
              className="flex items-center gap-3 rounded-[var(--theme-tile-radius)] border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] px-3 py-3 text-sm font-medium text-[color:var(--color-text)]"
            >
              <span
                className="flex h-9 w-9 items-center justify-center border text-base"
                style={{
                  borderRadius: "var(--theme-chip-radius)",
                  borderColor: "var(--color-surface-border)",
                }}
                aria-hidden
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("profile.specialDates.title")} />
        <p className="text-sm leading-relaxed text-[color:var(--color-secondary)]">
          {t("profile.specialDates.blurb")}
        </p>
        <label className="block text-sm text-[color:var(--color-text)]">
          {t("profile.specialDates.birthday")}
          <input
            type="date"
            value={birthdayAt}
            onChange={(e) => setBirthdayAt(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm text-[color:var(--color-text)]">
          {t("profile.specialDates.nameday")}
          <input
            type="date"
            value={nameDayAt}
            onChange={(e) => setNameDayAt(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
          />
        </label>
        <p className="text-xs text-[color:var(--color-secondary)]">
          {t("profile.specialDates.namedayHint")}
        </p>
        <button
          type="button"
          onClick={() => void saveSpecialDates()}
          disabled={savingDates}
          className="w-full rounded-xl border border-[color:var(--color-primary)] bg-[color:var(--color-surface)] px-4 py-3 text-sm font-semibold text-[color:var(--color-text)] disabled:opacity-60"
        >
          {savingDates
            ? t("profile.specialDates.saving")
            : t("profile.specialDates.save")}
        </button>
        {datesMessage ? (
          <StatusPill tone={datesTone}>{datesMessage}</StatusPill>
        ) : null}
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("profile.growth")} />
        {growthTips.map((tip) => (
          <div
            key={tip}
            className="rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3 text-sm text-[color:var(--color-text)]"
          >
            {tip}
          </div>
        ))}
      </GlassPanel>
    </ModuleShell>
  );
}
