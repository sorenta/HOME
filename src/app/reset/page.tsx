"use client";

import { useEffect, useState } from "react";
import { ModuleShell } from "@/components/layout/module-shell";
import { ResetDashboard } from "@/components/reset/reset-dashboard";
import { ResetThemeLayer } from "@/components/reset/reset-theme-layer";
import { HiddenSeasonalCollectible } from "@/components/seasonal/hidden-seasonal-collectible";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/lib/i18n/i18n-context";
import {
  useResetWellness,
  persistWellness,
  type ResetWellnessV1,
} from "@/lib/reset-wellness";

export default function ResetPage() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const [wellness, setWellness] = useResetWellness();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <ModuleShell
        title={locale === "lv" ? "Kā tu šodien jūties?" : "How are you feeling today?"}
        moduleId="reset"
        sectionId="reset"
      >
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-(--color-secondary)">
            {locale === "lv" ? "Ielādē..." : "Loading..."}
          </p>
        </div>
      </ModuleShell>
    );
  }

  // Force onboarding configuration to be considered "done" locally in UI,
  // since the Global Onboarding handles it now.
  const resolvedWellness: ResetWellnessV1 = {
    ...wellness,
    onboardingDone: true,
  };

  return (
    <ModuleShell
      title={locale === "lv" ? "Kā tu šodien jūties?" : "How are you feeling today?"}
      moduleId="reset"
      sectionId="reset"
    >
      <ResetThemeLayer>
        <HiddenSeasonalCollectible spotId="reset" />
        <ResetDashboard
          wellness={resolvedWellness}
          userId={user?.id ?? null}
          onOpenQuestionnaire={() => {
            alert(locale === "lv" ? "Iestatījumi drīzumā būs pieejami šeit." : "Settings will be available here soon.");
          }}
          onUpdate={(next) => {
            setWellness(next);
            persistWellness(next);
          }}
        />
      </ResetThemeLayer>
    </ModuleShell>
  );
}
