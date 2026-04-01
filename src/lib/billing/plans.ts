export type HouseholdPlan = "free" | "premium";
export type SubscriptionStatus = "active" | "trial" | "past_due" | "canceled";

export type PlanFeature =
  | "ai_byok"
  | "kitchen_realtime"
  | "household_basic"
  | "finance_basic"
  | "events_basic"
  | "pharmacy_ai"
  | "advanced_insights"
  | "premium_themes"
  | "shared_automations";

const PLAN_FEATURES: Record<HouseholdPlan, PlanFeature[]> = {
  free: [
    "ai_byok",
    "kitchen_realtime",
    "household_basic",
    "finance_basic",
    "events_basic",
  ],
  premium: [
    "ai_byok",
    "kitchen_realtime",
    "household_basic",
    "finance_basic",
    "events_basic",
    "pharmacy_ai",
    "advanced_insights",
    "premium_themes",
    "shared_automations",
  ],
};

export function normalizeHouseholdPlan(value: string | null | undefined): HouseholdPlan {
  return value === "premium" ? "premium" : "free";
}

export function normalizeSubscriptionStatus(
  value: string | null | undefined,
): SubscriptionStatus {
  if (value === "trial" || value === "past_due" || value === "canceled") {
    return value;
  }

  return "active";
}

export function hasPlanFeature(
  plan: string | null | undefined,
  feature: PlanFeature,
): boolean {
  return PLAN_FEATURES[normalizeHouseholdPlan(plan)].includes(feature);
}

export function getIncludedPlanFeatures(plan: string | null | undefined): PlanFeature[] {
  return PLAN_FEATURES[normalizeHouseholdPlan(plan)];
}

export function getLockedPremiumFeatures(plan: string | null | undefined): PlanFeature[] {
  const normalizedPlan = normalizeHouseholdPlan(plan);

  if (normalizedPlan === "premium") {
    return [];
  }

  return PLAN_FEATURES.premium.filter(
    (feature) => !PLAN_FEATURES.free.includes(feature),
  );
}
