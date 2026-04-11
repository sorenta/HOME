"use client";

import { useEffect, useState } from "react";
import { HouseholdOnboarding } from "@/components/household/household-onboarding";
import { HiddenSeasonalCollectible } from "@/components/seasonal/hidden-seasonal-collectible";
import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { fetchMyHouseholdMembers, type HouseholdMember } from "@/lib/household";
import { subscribeHouseholdActivity } from "@/lib/household-activity";
import { DashboardHomeLayout } from "@/components/dashboard/dashboard-home-layout";
import { HouseholdWaterWidget } from "@/components/dashboard/household-water-widget";
import { TodayFocus } from "@/components/dashboard/today-focus";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";

export { ThemeBottomNav as AppBottomNav } from "@/components/navigation/theme-bottom-nav";

export function BentoDashboard() {
  const { profile, user } = useAuth();
  const { themeId } = useTheme();

  const [members, setMembers] = useState<HouseholdMember[]>([]);

  const householdId = profile?.household_id ?? null;
  const waterScopeId = householdId ?? (user?.id ? `personal:${user.id}` : "personal:guest");

  useEffect(() => {
    if (!householdId) return;
    let alive = true;

    const fetchData = async () => {
      const nextMembers = await fetchMyHouseholdMembers();

      if (!alive) return;
      setMembers(nextMembers);
    };

    void fetchData();

    const unsubscribe = subscribeHouseholdActivity(householdId, () => {
      void fetchData();
    });

    return () => {
      alive = false;
      unsubscribe?.();
    };
  }, [householdId]);

  return (
    <DashboardHomeLayout
      themeId={themeId}
      slots={{
        notice: (
          <div className="space-y-6">
            <DashboardQuickActions />
            <HiddenSeasonalCollectible spotId="dashboard" />
          </div>
        ),
        focus: <TodayFocus />,
        householdSummary: householdId ? <HouseholdWaterWidget scopeId={waterScopeId} members={members} currentUserId={user?.id ?? null} /> : null,
        water: null,
      }}
    >
    </DashboardHomeLayout>
  );
}
