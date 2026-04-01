"use client";

import { RequireAuth } from "@/components/auth/require-auth";
import { HouseholdOnboarding } from "@/components/household/household-onboarding";
import { HouseholdSummary } from "@/components/household/household-summary";
import { useAuth } from "@/components/providers/auth-provider";

function HouseholdPageInner() {
  const { profile } = useAuth();

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pb-28 pt-6">
      {profile?.household_id ? (
        <HouseholdSummary householdId={profile.household_id} />
      ) : (
        <HouseholdOnboarding />
      )}
    </div>
  );
}

export default function HouseholdPage() {
  return (
    <RequireAuth compact={false}>
      <HouseholdPageInner />
    </RequireAuth>
  );
}
