"use client";

import { ModuleShell } from "@/components/layout/module-shell";
import { useTheme } from "@/components/providers/theme-provider";
import { useI18n } from "@/lib/i18n/i18n-context";
import Link from "next/link";

export default function CalendarPage() {
  const { themeId } = useTheme();
  const { t, locale } = useI18n();

  return (
    <ModuleShell
      title={t("calendar.page.title")}
      sectionId="calendar"
      moduleId="calendar"
      requireAuth={false}
      description={t("calendar.page.description")}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
        {/* Decorative icon per theme */}
        <div
          className="flex h-20 w-20 items-center justify-center text-4xl"
          style={{
            background:
              themeId === "forge"
                ? "linear-gradient(135deg, color-mix(in srgb, var(--color-surface) 80%, transparent), var(--color-surface))"
                : themeId === "pulse"
                  ? "var(--color-primary)"
                  : "color-mix(in srgb, var(--color-accent-soft) 60%, transparent)",
            borderRadius:
              themeId === "botanical"
                ? "60% 40% 30% 70% / 60% 30% 70% 40%"
                : themeId === "hive"
                  ? undefined
                  : "var(--radius-card)",
            clipPath: themeId === "hive" ? "polygon(29% 0%, 71% 0%, 100% 29%, 100% 71%, 71% 100%, 29% 100%, 0% 71%, 0% 29%)" : undefined,
            border: themeId === "forge"
              ? "1px solid var(--color-border)"
              : themeId === "pulse"
                ? "3px solid #000"
                : "1px solid color-mix(in srgb, var(--color-border) 60%, transparent)",
            boxShadow: themeId === "pulse"
              ? "4px 4px 0px #000"
              : themeId === "lucent"
                ? "0 8px 32px color-mix(in srgb, var(--color-primary) 12%, transparent)"
                : undefined,
            color: themeId === "pulse" ? "var(--color-button-primary-text)" : "var(--color-primary)",
          }}
        >
          📅
        </div>

        {/* Status pill */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-widest"
          style={{
            borderRadius: "var(--radius-chip)",
            background: "color-mix(in srgb, var(--color-accent-soft) 50%, transparent)",
            color: "var(--color-text-secondary)",
            border: themeId === "pulse" ? "2px solid currentColor" : "1px solid color-mix(in srgb, var(--color-border) 60%, transparent)",
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--color-warning, #f59e0b)" }}
          />
          {t("calendar.page.soon")}
        </div>

        <div className="max-w-xs space-y-2">
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {t("calendar.page.hint")}
          </p>
        </div>

        <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            className="rounded-xl border px-4 py-3 text-left"
            style={{
              borderColor: "color-mix(in srgb, var(--color-border) 64%, transparent)",
              background: "color-mix(in srgb, var(--glass-bg, var(--color-surface)) 86%, transparent)",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--color-text-secondary)" }}>
              {t("calendar.countdown")}
            </p>
            <p className="mt-1 text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {locale === "lv" ? "Drīzumā" : "Coming soon"}
            </p>
          </div>

          <div
            className="rounded-xl border px-4 py-3 text-left"
            style={{
              borderColor: "color-mix(in srgb, var(--color-border) 64%, transparent)",
              background: "color-mix(in srgb, var(--glass-bg, var(--color-surface)) 86%, transparent)",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--color-text-secondary)" }}>
              {t("finance.goals")}
            </p>
            <p className="mt-1 text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {locale === "lv" ? "Vizuāls placeholder" : "Visual placeholder"}
            </p>
          </div>
        </div>

        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all"
          style={{
            borderRadius: "var(--radius-button)",
            background: "var(--color-button-primary)",
            color: "var(--color-button-primary-text)",
            border: themeId === "pulse" ? "2px solid #000" : "none",
            boxShadow: themeId === "pulse" ? "3px 3px 0px #000" : undefined,
          }}
        >
          {t("calendar.page.toEvents")}
        </Link>
      </div>
    </ModuleShell>
  );
}
