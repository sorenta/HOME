"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { useI18n } from "@/lib/i18n/i18n-context";

type Props = {
  children: React.ReactNode;
  compact?: boolean;
};

export function RequireAuth({ children, compact = true }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, user } = useAuth();
  const { themeId } = useTheme();
  const { t } = useI18n();

  useEffect(() => {
    if (!ready || user || compact) return;
    if (pathname.startsWith("/auth")) return;
    router.replace("/auth");
  }, [compact, pathname, ready, router, user]);

  if (!ready) {
    return (
      <div
        className="flex flex-col items-center gap-3 p-6 text-center text-sm"
        style={{
          borderRadius: "var(--radius-card)",
          border: "1px solid var(--color-border)",
          background: "color-mix(in srgb, var(--color-surface) 80%, transparent)",
          color: "var(--color-text-secondary)",
        }}
      >
        <div
          className="h-1.5 w-12 animate-pulse rounded-full"
          style={{ background: "var(--color-border)" }}
        />
        <p>{t("auth.session.loading")}</p>
      </div>
    );
  }

  if (!user) {
    const cardStyle: React.CSSProperties = {
      borderRadius: "var(--radius-card)",
      background: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
      color: "var(--color-text-primary)",
    };

    const ctaStyle: React.CSSProperties = {
      borderRadius: "var(--radius-button)",
      background: "var(--color-button-primary)",
      color: "var(--color-button-primary-text)",
    };

    // Tēmai specifiskas novirzes
    if (themeId === "lucent") {
      cardStyle.backdropFilter = "blur(16px)";
      cardStyle.border = "1px solid color-mix(in srgb, var(--color-border) 50%, transparent)";
      cardStyle.boxShadow = "0 8px 32px color-mix(in srgb, var(--color-primary) 8%, transparent)";
    } else if (themeId === "pulse") {
      cardStyle.border = "3px solid #000";
      cardStyle.boxShadow = "5px 5px 0px #000";
      ctaStyle.border = "2px solid #000";
      ctaStyle.boxShadow = "3px 3px 0px #000";
    } else if (themeId === "forge") {
      cardStyle.background = "linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 92%, #ffffff 8%) 0%, var(--color-surface) 100%)";
      cardStyle.border = "1px solid var(--color-border)";
      cardStyle.borderLeft = "3px solid var(--color-primary)";
    } else if (themeId === "botanical") {
      cardStyle.border = "1px solid color-mix(in srgb, var(--color-border) 70%, transparent)";
      cardStyle.boxShadow = "inset 0 0 24px rgba(255,255,255,0.25)";
    } else if (themeId === "hive") {
      cardStyle.border = "3px solid var(--color-border)";
    } else {
      cardStyle.border = "1px solid var(--color-border)";
    }

    return compact ? (
      <div className="relative overflow-hidden p-5" style={cardStyle}>
        {/* Forge: sarkana akcenta josla */}
        {themeId === "forge" && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, var(--color-primary), transparent)" }}
            aria-hidden
          />
        )}
        {/* Hive: sešstūra ūdenszīme */}
        {themeId === "hive" && (
          <div
            className="pointer-events-none absolute right-3 top-3 select-none text-5xl leading-none"
            style={{ color: "var(--color-primary)", opacity: 0.06 }}
            aria-hidden
          >
            ⬡
          </div>
        )}
        {/* Lucent: spīduma bumba */}
        {themeId === "lucent" && (
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl"
            style={{ background: "var(--color-primary)", opacity: 0.07 }}
            aria-hidden
          />
        )}
        {/* Botanical: lapas akcents */}
        {themeId === "botanical" && (
          <div
            className="pointer-events-none absolute right-3 top-2 select-none text-4xl leading-none"
            style={{ opacity: 0.12, transform: "rotate(15deg)" }}
            aria-hidden
          >
            🌿
          </div>
        )}

        <div className="relative z-10">
          <p
            className="text-base font-bold leading-snug"
            style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-theme-sans)" }}
          >
            {t("auth.session.required")}
          </p>
          <p
            className="mt-1.5 text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {t("auth.session.helper")}
          </p>
          <Link
            href="/auth"
            className="mt-4 inline-flex items-center px-4 py-2.5 text-sm font-semibold transition-all"
            style={ctaStyle}
          >
            {t("auth.session.cta")}
          </Link>
        </div>
      </div>
    ) : (
      <div className="flex min-h-dvh items-center justify-center px-4 pb-10 pt-6">
        <div className="w-full max-w-sm p-6 text-center" style={cardStyle}>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {t("auth.session.required")}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
