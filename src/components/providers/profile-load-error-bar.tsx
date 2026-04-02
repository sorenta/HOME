"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/lib/i18n/i18n-context";

/**
 * Minimal alert when profile load fails (not silent). No layout redesign — fixed strip above bottom nav.
 */
export function ProfileLoadErrorBar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { user, profileLoadError, refreshProfile } = useAuth();

  if (!user || !profileLoadError || pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <div
      role="alert"
      className="fixed bottom-[max(5.5rem,env(safe-area-inset-bottom))] left-1/2 z-[100] w-full max-w-lg -translate-x-1/2 px-3"
    >
      <div className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-[color:var(--color-danger)] bg-[color:color-mix(in_srgb,var(--color-surface)_92%,var(--color-danger))] px-3 py-2 text-sm text-[color:var(--color-text-primary)] shadow-lg">
        <p className="font-medium">{t("auth.profile.loadFailed")}</p>
        <p className="break-words font-mono text-xs text-[color:var(--color-text-secondary)]">
          {profileLoadError}
        </p>
        <button
          type="button"
          className="self-start rounded-[var(--radius-button)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[color:var(--color-text-primary)]"
          onClick={() => void refreshProfile()}
        >
          {t("auth.profile.retry")}
        </button>
      </div>
    </div>
  );
}
