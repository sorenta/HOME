"use client";

import { AuthWelcomeModal } from "@/components/auth/auth-welcome-modal";
import { I18nProvider } from "@/lib/i18n/i18n-context";
import { PwaProvider } from "@/components/pwa/pwa-provider";
import { AuthProvider } from "./auth-provider";
import { SeasonalAppChrome } from "@/components/seasonal/seasonal-app-chrome";
import { SeasonalProvider } from "./seasonal-provider";
import { ThemeProvider } from "./theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <SeasonalProvider>
            <SeasonalAppChrome />
            {children}
            <AuthWelcomeModal />
            <PwaProvider />
          </SeasonalProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
