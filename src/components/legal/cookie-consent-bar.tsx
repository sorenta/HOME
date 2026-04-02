"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";
import { PRIVACY_POLICY_VERSION } from "@/lib/legal/privacy-policy";
import {
  readStoredConsent,
  shouldShowConsentBanner,
  writeStoredConsent,
} from "@/lib/legal/consent-storage";

export function CookieConsentBar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    setVisible(shouldShowConsentBanner());
    const c = readStoredConsent();
    setAnalytics(Boolean(c?.analytics));
  }, []);

  if (!visible || pathname?.startsWith("/auth")) {
    return null;
  }

  function acknowledge(allowAnalytics: boolean) {
    hapticTap();
    writeStoredConsent({
      policyVersion: PRIVACY_POLICY_VERSION,
      essentialAck: true,
      analytics: allowAnalytics,
    });
    setVisible(false);
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[85] mx-auto max-w-lg px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2"
      role="dialog"
      aria-label={t("consent.bannerAria")}
    >
      <div className="rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]/95 p-4 shadow-lg backdrop-blur-xl">
        <p className="text-sm leading-relaxed text-[color:var(--color-text)]">{t("consent.bannerText")}</p>
        <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-[color:var(--color-text)]">
          <input
            type="checkbox"
            checked={analytics}
            onChange={(e) => setAnalytics(e.target.checked)}
            className="mt-0.5"
          />
          <span>{t("consent.analyticsOptional")}</span>
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => acknowledge(false)}
            className="flex-1 rounded-xl border border-[color:var(--color-surface-border)] px-3 py-2.5 text-sm font-semibold text-[color:var(--color-text)]"
          >
            {t("consent.essentialOnly")}
          </button>
          <button
            type="button"
            onClick={() => acknowledge(analytics)}
            className="flex-1 rounded-xl bg-[color:var(--color-primary)] px-3 py-2.5 text-sm font-semibold text-[color:var(--color-background)]"
          >
            {t("consent.saveChoice")}
          </button>
        </div>
        <Link
          href="/legal/privacy"
          className="mt-2 inline-block text-xs font-medium text-[color:var(--color-primary)] underline-offset-2 hover:underline"
          onClick={() => hapticTap()}
        >
          {t("legal.privacy.title")}
        </Link>
      </div>
    </div>
  );
}
