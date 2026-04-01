"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/lib/i18n/i18n-context";
import { AuthScreen } from "./auth-screen";

type Props = {
  children: React.ReactNode;
  compact?: boolean;
};

export function RequireAuth({ children, compact = true }: Props) {
  const { ready, user } = useAuth();
  const { t } = useI18n();

  if (!ready) {
    return (
      <div className="rounded-3xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-5 text-sm text-[color:var(--color-secondary)]">
        {t("auth.session.loading")}
      </div>
    );
  }

  if (!user) {
    return compact ? (
      <div className="rounded-3xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-5">
        <p className="text-lg font-semibold text-[color:var(--color-text)]">
          {t("auth.session.required")}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-secondary)]">
          {t("auth.session.helper")}
        </p>
        <Link
          href="/auth"
          className="mt-4 inline-flex rounded-xl bg-[color:var(--color-primary)] px-4 py-3 text-sm font-semibold text-[color:var(--color-background)]"
        >
          {t("auth.session.cta")}
        </Link>
      </div>
    ) : (
      <div className="flex min-h-[100dvh] flex-col justify-center px-4 pb-28 pt-6">
        <AuthScreen compact={false} />
      </div>
    );
  }

  return <>{children}</>;
}
