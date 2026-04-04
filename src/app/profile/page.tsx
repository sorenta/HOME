"use client";

import { ModuleShell } from "@/components/layout/module-shell";
import { HiddenSeasonalCollectible } from "@/components/seasonal/hidden-seasonal-collectible";
import { ProfileSettingsSection } from "@/components/profile/profile-settings-section";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function ProfilePage() {
  const { t } = useI18n();

  return (
    <ModuleShell title={t("nav.profile")}>
      <HiddenSeasonalCollectible spotId="profile" />
      <ProfileSettingsSection />
    </ModuleShell>
  );
}