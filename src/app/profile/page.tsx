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

    return () => {
      alive = false;
    };
  }, [profile?.household_id]);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;

    void loadUserWaterMedals({
      scopeId: profile?.household_id ?? `personal:${user.id}`,
      householdId: profile?.household_id ?? null,
      userId: user.id,
    }).then((next) => {
      if (alive) {
        setMedals(next);
      }
    });

    return () => {
      alive = false;
    };
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
    setNameTone("good");

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: nextName,
      })
      .eq("id", user.id);

    if (error) {
      setSavingName(false);
      setNameTone("critical");
      setNameMessage(t("profile.name.error"));
      return;
    }

    await supabase.auth.updateUser({
      data: {
        display_name: nextName,
        name: nextName,
      },
    });

    await refreshProfile();
    setSavingName(false);
    setNameTone("good");
    setNameMessage(t("profile.name.saved"));
  }

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
      setDatesMessage(
        isMissingSpecialDateColumns(error)
          ? t("profile.specialDates.missingColumns")
          : t("profile.specialDates.error"),
      );
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
              {role} ·{" "}
              {householdName === null
                ? t("profile.householdLoading")
                : profile?.household_id
                  ? householdName || t("profile.householdUnset")
                  : t("profile.householdUnset")}
            </p>
            {user?.email ? (
              <p className="mt-1 text-xs text-[color:var(--color-secondary)]">
                {user.email}
              </p>
            ) : null}
          </div>
          <StatusPill tone={resetScore >= 60 ? "good" : "neutral"}>{`RESET ${resetScore}%`}</StatusPill>
        </div>
        <p className="text-sm leading-relaxed text-[color:var(--color-text)]">
          {t("profile.blurb")}
        </p>
        <label className="block text-sm text-[color:var(--color-text)]">
          {t("profile.name.label")}
          <input
            type="text"
            value={displayNameInput}
            onChange={(e) => setDisplayNameInput(e.target.value)}
            placeholder={t("profile.name.placeholder")}
            className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={() => void saveDisplayName()}
          disabled={savingName}
          className="w-full rounded-xl border border-[color:var(--color-primary)] bg-[color:var(--color-surface)] px-4 py-3 text-sm font-semibold text-[color:var(--color-text)] disabled:opacity-60"
        >
          {savingName ? t("profile.name.saving") : t("profile.name.save")}
        </button>
        {nameMessage ? <StatusPill tone={nameTone}>{nameMessage}</StatusPill> : null}
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
        <MetricCard label={t("profile.metric.reset")} value={`${resetScore}%`} />
        <MetricCard
          label={t("profile.metric.medals")}
          value={medals.gold + medals.silver + medals.bronze}
        />
        <MetricCard
          label={t("profile.metric.celebrations")}
          value={celebrationsCount}
          hint={profile?.household_id ? String(householdMemberCount) : "0"}
        />
      </div>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("profile.medals.title")} />
        <p className="text-sm leading-relaxed text-[color:var(--color-secondary)]">
          {t("profile.medals.hint")}
        </p>
        <div className="grid grid-cols-4 gap-3">
          <MetricCard
            label={t("profile.medals.total")}
            value={medals.gold + medals.silver + medals.bronze}
          />
          <MetricCard label={t("profile.medals.gold")} value={medals.gold} />
          <MetricCard label={t("profile.medals.silver")} value={medals.silver} />
          <MetricCard label={t("profile.medals.bronze")} value={medals.bronze} />
        </div>
      </GlassPanel>

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
            lang={locale === "lv" ? "lv-LV" : "en-US"}
            value={birthdayAt}
            onChange={(e) => setBirthdayAt(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm text-[color:var(--color-text)]">
          {t("profile.specialDates.nameday")}
          <input
            type="date"
            lang={locale === "lv" ? "lv-LV" : "en-US"}
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

    </ModuleShell>
  );
}
