"use client";

import { I18nProvider } from "@/lib/i18n/i18n-context";
import { PwaProvider } from "@/components/pwa/pwa-provider";
import { AuthProvider } from "./auth-provider";
import { SeasonalProvider } from "./seasonal-provider";
import { ProfileLoadErrorBar } from "./profile-load-error-bar";
import { ThemeProfileSync } from "./theme-profile-sync";
import { ThemeProvider } from "./theme-provider";
import { ThemeAmbientChrome } from "@/components/theme/theme-ambient-chrome";
import { ThemeActionEffectsProvider } from "@/components/theme/theme-action-effects";
import { SeasonalRewardModal } from "@/components/seasonal/seasonal-reward-modal";
import { SeasonalOverlays } from "@/components/seasonal/seasonal-overlays";
import { CookieConsentBar } from "@/components/legal/cookie-consent-bar";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <ThemeActionEffectsProvider>
          <AuthProvider>
            <SeasonalProvider>
              <ThemeProfileSync />
              <ProfileLoadErrorBar />
              <ThemeAmbientChrome />
              {children}
              <SeasonalRewardModal />
              <SeasonalOverlays />
              <PwaProvider />
              <CookieConsentBar />
            </SeasonalProvider>
          </AuthProvider>
        </ThemeActionEffectsProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
