"use client";

import { ModuleShell } from "@/components/layout/module-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassPanel } from "@/components/ui/glass-panel";
import { eventsList } from "@/lib/demo-data";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function CalendarPage() {
  const { t } = useI18n();

  return (
    <ModuleShell title={t("tile.calendar")} moduleId="calendar">
      <GlassPanel className="space-y-3">
        <SectionHeading title={t("calendar.upcoming")} />
        <p className="text-sm leading-relaxed text-[color:var(--color-text)]">
          {t("module.calendar.blurb")}
        </p>
        {eventsList.slice(0, 2).map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-[color:var(--color-text)]">
                  {item.title}
                </p>
                <p className="text-xs text-[color:var(--color-secondary)]">
                  {item.date}
                </p>
              </div>
              <StatusPill tone={item.style === "shared" ? "good" : "neutral"}>
                {item.countdown}
              </StatusPill>
            </div>
          </div>
        ))}
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("calendar.countdown")} />
        <div className="rounded-2xl border border-[color:var(--color-surface-border)] px-4 py-3">
          <p className="text-sm font-medium text-[color:var(--color-text)]">
            Kopīgā gadadiena
          </p>
          <p className="mt-1 text-2xl font-semibold text-[color:var(--color-primary)]">
            34 dienas
          </p>
          <p className="mt-1 text-xs text-[color:var(--color-secondary)]">
            Celebration Engine var izmantot sirsniņu lietu un partnera atgādinājumu.
          </p>
        </div>
      </GlassPanel>
    </ModuleShell>
  );
}
