"use client";

import { AuthWelcomeModal } from "@/components/auth/auth-welcome-modal";
import { I18nProvider } from "@/lib/i18n/i18n-context";
import { PwaProvider } from "@/components/pwa/pwa-provider";
import { AuthProvider } from "./auth-provider";
import { ProfileLoadErrorBar } from "./profile-load-error-bar";
import { ThemeProfileSync } from "./theme-profile-sync";
import { ThemeProvider } from "./theme-provider";
import { ThemeAmbientChrome } from "@/components/theme/theme-ambient-chrome";
import { CookieConsentBar } from "@/components/legal/cookie-consent-bar";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <ThemeProfileSync />
          <ProfileLoadErrorBar />
          <ThemeAmbientChrome />
          {children}
          <AuthWelcomeModal />
          <PwaProvider />
          <CookieConsentBar />
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
