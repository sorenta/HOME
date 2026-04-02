"use client";

import { RequireAuth } from "@/components/auth/require-auth";
import { HouseholdOnboarding } from "@/components/household/household-onboarding";
import { HouseholdSummary } from "@/components/household/household-summary";
import { ModuleShell } from "@/components/layout/module-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/lib/i18n/i18n-context";

function HouseholdPageInner() {
  const { profile } = useAuth();
  const { t } = useI18n();

  return (
    <ModuleShell title={t("app.household")}>
      {profile?.household_id ? (
        <HouseholdSummary householdId={profile.household_id} />
      ) : (
        <HouseholdOnboarding />
      )}
    </ModuleShell>
  );
}

export default function HouseholdPage() {
  return (
    <RequireAuth compact={false}>
      <HouseholdPageInner />
    </RequireAuth>
  );
}
