"use client";

import { ModuleShell } from "@/components/layout/module-shell";
import { HiddenSeasonalCollectible } from "@/components/seasonal/hidden-seasonal-collectible";
import { ProfileSettingsSection } from "@/components/profile/profile-settings-section";
import { ProfileThemeLayer } from "@/components/profile/profile-theme-layer";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function ProfilePage() {
  const { t } = useI18n();

  return (
    <>
      <div className="pt-4">
        <ModuleShell
          title={t("nav.profile")}
          sectionId="profile"
          description={t("profile.page.description")}
          actionHref="/settings"
          actionLabel="⚙ Iestatījumi"
        >
          <ProfileThemeLayer>
            <HiddenSeasonalCollectible spotId="profile" />
            <ProfileSettingsSection />
          </ProfileThemeLayer>
        </ModuleShell>
      </div>
    </>
  );
}
