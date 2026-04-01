"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchMyHouseholdSummary, type Household } from "@/lib/household";
import {
  getIncludedPlanFeatures,
  getLockedPremiumFeatures,
  normalizeHouseholdPlan,
  normalizeSubscriptionStatus,
} from "@/lib/billing/plans";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { useI18n } from "@/lib/i18n/i18n-context";

function featureLabelKey(feature: string) {
  switch (feature) {
    case "ai_byok":
      return "billing.feature.aiByok";
    case "kitchen_realtime":
      return "billing.feature.kitchenRealtime";
    case "household_basic":
      return "billing.feature.householdBasic";
    case "finance_basic":
      return "billing.feature.financeBasic";
    case "events_basic":
      return "billing.feature.eventsBasic";
    case "pharmacy_ai":
      return "billing.feature.pharmacyAi";
    case "advanced_insights":
      return "billing.feature.advancedInsights";
    case "premium_themes":
      return "billing.feature.premiumThemes";
    default:
      return "billing.feature.sharedAutomations";
  }
}

function formatPlanDate(value: string | null | undefined, locale: string) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString(locale === "lv" ? "lv-LV" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function HouseholdPlanCard() {
  const { t, locale } = useI18n();
  const [household, setHousehold] = useState<Household | null>(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      const nextHousehold = await fetchMyHouseholdSummary();
      if (alive) setHousehold(nextHousehold);
    };

    void load();

    return () => {
      alive = false;
    };
  }, []);

  const plan = normalizeHouseholdPlan(household?.subscription_type);
  const status = normalizeSubscriptionStatus(household?.subscription_status);
  const includedFeatures = useMemo(
    () => getIncludedPlanFeatures(plan),
    [plan],
  );
  const lockedFeatures = useMemo(
    () => getLockedPremiumFeatures(plan),
    [plan],
  );

  const dateHint =
    status === "trial"
      ? formatPlanDate(household?.trial_ends_at, locale)
      : formatPlanDate(household?.current_period_ends_at, locale);

  return (
    <GlassPanel className="space-y-3">
      <SectionHeading
        title={t("billing.title")}
        detail={t(plan === "premium" ? "billing.plan.premium" : "billing.plan.free")}
      />
      <div className="flex flex-wrap gap-2">
        <StatusPill tone={plan === "premium" ? "good" : "neutral"}>
          {t(plan === "premium" ? "billing.plan.premium" : "billing.plan.free")}
        </StatusPill>
        <StatusPill tone={status === "past_due" ? "warn" : "good"}>
          {t(`billing.status.${status}`)}
        </StatusPill>
        {household?.billing_provider ? <StatusPill>{household.billing_provider}</StatusPill> : null}
      </div>
      <p className="text-sm leading-relaxed text-[color:var(--color-text)]">
        {t(plan === "premium" ? "billing.blurb.premium" : "billing.blurb.free")}
      </p>
      {dateHint ? (
        <p className="text-xs text-[color:var(--color-secondary)]">
          {status === "trial"
            ? `${t("billing.trialEnds")} ${dateHint}`
            : `${t("billing.renewsAt")} ${dateHint}`}
        </p>
      ) : null}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-secondary)]">
          {t("billing.included")}
        </p>
        <div className="flex flex-wrap gap-2">
          {includedFeatures.map((feature) => (
            <StatusPill key={feature} tone="good">
              {t(featureLabelKey(feature))}
            </StatusPill>
          ))}
        </div>
      </div>
      {lockedFeatures.length ? (
        <div className="space-y-2 rounded-2xl border border-[color:var(--color-surface-border)] p-3">
          <p className="text-sm font-semibold text-[color:var(--color-text)]">
            {t("billing.premiumComing")}
          </p>
          <p className="text-sm text-[color:var(--color-secondary)]">
            {t("billing.premiumHint")}
          </p>
          <div className="flex flex-wrap gap-2">
            {lockedFeatures.map((feature) => (
              <StatusPill key={feature} tone="warn">
                {t(featureLabelKey(feature))}
              </StatusPill>
            ))}
          </div>
        </div>
      ) : null}
    </GlassPanel>
  );
}
