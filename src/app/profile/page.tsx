"use client";

import { ModuleShell } from "@/components/layout/module-shell";
import { HiddenSeasonalCollectible } from "@/components/seasonal/hidden-seasonal-collectible";
import { ProfileSettingsSection } from "@/components/profile/profile-settings-section";
import { ProfileThemeLayer } from "@/components/profile/profile-theme-layer";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function ProfilePage() {
  const { t } = useI18n();

  const settingsIcon = (
    <a
      aria-label={t("nav.settings")}
      className="pointer-events-auto absolute top-[max(1.5rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full border text-base backdrop-blur-xl transition right-4 bg-(--color-surface)/82 text-(--color-text)"
      style={{ borderColor: "var(--color-surface-border)", boxShadow: "0 12px 28px color-mix(in srgb, var(--color-primary) 12%, transparent)" }}
      href="/settings"
    >
      <span aria-hidden="true">⚙</span>
    </a>
  );

  return (
    <>
      {settingsIcon}
      <div className="pt-20">
        <ModuleShell
          title={t("nav.profile")}
          sectionId="profile"
          description={t("profile.page.description")}
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
