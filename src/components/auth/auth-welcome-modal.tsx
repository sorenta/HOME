"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/lib/i18n/i18n-context";

export function AuthWelcomeModal() {
  const pathname = usePathname();
  const { ready, user } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ready || !user || pathname.startsWith("/auth")) {
      const frame = window.requestAnimationFrame(() => setOpen(false));
      return () => window.cancelAnimationFrame(frame);
    }

    if (typeof window === "undefined") return;

    const pendingKey = `majapps-auth-welcome-pending-${user.id}`;
    const shouldOpen = window.localStorage.getItem(pendingKey) === "true";

    if (shouldOpen) {
      window.localStorage.removeItem(pendingKey);
      const frame = window.requestAnimationFrame(() => setOpen(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const frame = window.requestAnimationFrame(() => setOpen(false));
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, ready, user]);

  if (!open || !user || pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <div className="maj-auth-welcome-backdrop" role="dialog" aria-modal="true">
      <div className="maj-auth-welcome-orb maj-auth-welcome-orb--rose" aria-hidden />
      <div className="maj-auth-welcome-orb maj-auth-welcome-orb--sage" aria-hidden />
      <div className="maj-auth-welcome-orb maj-auth-welcome-orb--pearl" aria-hidden />

      <div className="maj-auth-welcome-card">
        <div className="maj-ho-mark mx-auto">
          <span className="maj-ho-mark-text maj-ho-mark-text--large">H:O</span>
        </div>
        <p className="maj-splash-kicker">HOME:OS</p>
        <h2 className="maj-auth-welcome-title">
          {t("auth.welcome.title")}
        </h2>
        <p className="maj-auth-welcome-copy">
          {t("auth.welcome.body")}
        </p>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.localStorage.setItem(
                `majapps-auth-welcome-seen-${user.id}`,
                "true",
              );
            }
            setOpen(false);
          }}
          className="maj-auth-primary-button mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold"
        >
          {t("auth.welcome.cta")}
        </button>
      </div>
    </div>
  );
}
