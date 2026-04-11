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
import { ResetMoodPanel } from "@/components/reset/reset-mood-panel";
import { CartPreview } from "@/components/kitchen/CartPreview";
import { useI18n } from "@/lib/i18n/i18n-context";
import { fetchShoppingItems, type ShoppingRecord } from "@/lib/kitchen";
import { useRouter } from "next/navigation";

export { ThemeBottomNav as AppBottomNav } from "@/components/navigation/theme-bottom-nav";

export function BentoDashboard() {
  const { profile, user } = useAuth();
  const { themeId } = useTheme();
  const { t } = useI18n();
  const router = useRouter();

  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingRecord[]>([]);

  const householdId = profile?.household_id ?? null;
  const waterScopeId = householdId ?? (user?.id ? `personal:${user.id}` : "personal:guest");

  const resetScore = Math.round(Number(profile?.reset_score ?? 0));

  useEffect(() => {
    if (!householdId) return;
    let alive = true;

    const fetchData = async () => {
      const [nextMembers, nextShopping] = await Promise.all([
        fetchMyHouseholdMembers(),
        fetchShoppingItems(householdId)
      ]);

      if (!alive) return;
      setMembers(nextMembers);
      setShoppingItems(nextShopping);
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
        header: <DashboardQuickActions />,
        notice: (
          <div className="space-y-6">
            <HiddenSeasonalCollectible spotId="dashboard" />
          </div>
        ),
        focus: <TodayFocus />,
        water: (
          <HouseholdWaterWidget 
            scopeId={waterScopeId} 
            members={members} 
            currentUserId={user?.id ?? null} 
          />
        ),
        metrics: (
          <ResetMoodPanel
            scorePercent={resetScore}
            scoreLabel={t("reset.wellness.title")}
            partnerLabel="Mājas vibrācija"
            partnerValue="Stabila"
            partnerHint="Visi biedri ir sinhronizēti"
          />
        ),
        cart: (
          <CartPreview 
            items={shoppingItems} 
            onOpenAll={() => router.push("/kitchen")} 
          />
        ),
        reminders: (
          <div className="space-y-3">
            {/* Šeit vēlāk varam ielikt specifisku CalendarWidget, pagaidām placeholderis */}
            <p className="text-xs text-(--color-text-secondary) italic">Visi šīs dienas notikumi ir sakārtoti.</p>
          </div>
        ),
        householdSummary: null,
      }}
    >
    </DashboardHomeLayout>
  );
}
