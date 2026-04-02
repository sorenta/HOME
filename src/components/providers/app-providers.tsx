"use client";

import { AuthWelcomeModal } from "@/components/auth/auth-welcome-modal";
import { I18nProvider } from "@/lib/i18n/i18n-context";
import { PwaProvider } from "@/components/pwa/pwa-provider";
import { AuthProvider } from "./auth-provider";
import { SpringRabbitCompanion } from "@/components/spring/spring-rabbit-companion";
import { SeasonalProvider } from "./seasonal-provider";
import { ThemeProfileSync } from "./theme-profile-sync";
import { ThemeProvider } from "./theme-provider";
import { ThemeAmbientChrome } from "@/components/theme/theme-ambient-chrome";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <ThemeProfileSync />
          <SeasonalProvider>
            <ThemeAmbientChrome />
            <SpringRabbitCompanion />
            {children}
            <AuthWelcomeModal />
            <PwaProvider />
          </SeasonalProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
