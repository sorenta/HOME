"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/lib/i18n/i18n-context";

const ALWAYS_SHOW_EMAIL = "sorentab.15@gmail.com";

export function AuthWelcomeModal() {
  const pathname = usePathname();
  const { ready, user } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ready || !user || pathname.startsWith("/auth")) {
      setOpen(false);
      return;
    }

    if (typeof window === "undefined") return;

    const email = user.email?.trim().toLowerCase();
    if (email === ALWAYS_SHOW_EMAIL) {
      setOpen(true);
      return;
    }

    const pendingKey = `majapps-auth-welcome-pending-${user.id}`;
    if (window.localStorage.getItem(pendingKey) === "true") {
      setOpen(true);
      window.localStorage.removeItem(pendingKey);
    }
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
        <p className="maj-auth-brand text-base uppercase tracking-[0.24em]">
          {t("auth.brand")}
        </p>
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
