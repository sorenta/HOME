"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { AppMark } from "@/components/branding/app-mark";
import { useI18n } from "@/lib/i18n/i18n-context";

type Props = {
  children: React.ReactNode;
  compact?: boolean;
};

export function RequireAuth({ children, compact = true }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, user } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    if (!ready || user || compact) return;
    if (pathname.startsWith("/auth")) return;
    router.replace("/auth");
  }, [compact, pathname, ready, router, user]);

  if (!ready) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 text-center text-sm text-[color:var(--color-text-secondary)]">
        <AppMark size="sm" />
        <p>{t("auth.session.loading")}</p>
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
      <div className="flex min-h-[100dvh] items-center justify-center px-4 pb-10 pt-6">
        <div className="rounded-3xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-5 text-center text-sm text-[color:var(--color-secondary)]">
          {t("auth.session.loading")}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
