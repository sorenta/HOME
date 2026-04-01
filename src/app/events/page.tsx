"use client";

import { useMemo } from "react";
import { ModuleShell } from "@/components/layout/module-shell";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassPanel } from "@/components/ui/glass-panel";
import { eventsList, liveFeed } from "@/lib/demo-data";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function EventsPage() {
  const { t } = useI18n();
  const nextEvent = eventsList[0] ?? null;
  const sharedEvents = useMemo(
    () => eventsList.filter((item) => item.style === "shared"),
    [],
  );
  const personalEvents = useMemo(
    () => eventsList.filter((item) => item.style === "personal"),
    [],
  );

  return (
    <ModuleShell title={t("tile.events")} moduleId="events">
      <GlassPanel className="space-y-4">
        <SectionHeading
          eyebrow={t("tile.events")}
          title={t("events.overview")}
          detail={nextEvent?.countdown ?? ""}
        />
        <p className="text-sm leading-relaxed text-[color:var(--color-text)]">
          {t("module.events.blurb")}
        </p>
        {nextEvent ? (
          <div className="rounded-3xl border border-[color:var(--color-surface-border)] bg-[linear-gradient(180deg,var(--color-surface),transparent)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-secondary)]">
                  {t("events.next")}
                </p>
                <p className="mt-2 text-xl font-semibold text-[color:var(--color-text)]">
                  {nextEvent.title}
                </p>
                <p className="mt-1 text-sm text-[color:var(--color-secondary)]">
                  {nextEvent.date}
                </p>
              </div>
              <StatusPill tone={nextEvent.style === "shared" ? "good" : "neutral"}>
                {nextEvent.style === "shared"
                  ? t("events.shared")
                  : t("events.personal")}
              </StatusPill>
            </div>
            <p className="mt-4 text-sm font-medium text-[color:var(--color-text)]">
              {nextEvent.countdown}
            </p>
          </div>
        ) : null}
        <div className="grid grid-cols-3 gap-3">
          <MetricCard label={t("events.total")} value={eventsList.length} />
          <MetricCard label={t("events.shared")} value={sharedEvents.length} />
          <MetricCard label={t("events.personal")} value={personalEvents.length} />
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-4">
        <SectionHeading title={t("events.upcoming")} />
        <div className="space-y-3">
          {eventsList.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-[color:var(--color-text)]">
                    {item.title}
                  </p>
                  <StatusPill tone={item.style === "shared" ? "good" : "neutral"}>
                    {item.style === "shared"
                      ? t("events.shared")
                      : t("events.personal")}
                  </StatusPill>
                </div>
                <p className="mt-1 text-xs text-[color:var(--color-secondary)]">
                  {item.date}
                </p>
              </div>
              <StatusPill tone={item.style === "shared" ? "good" : "neutral"}>
                {item.countdown}
              </StatusPill>
            </div>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-4">
        <SectionHeading title={t("events.celebration")} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3">
            <p className="text-sm font-semibold text-[color:var(--color-text)]">
              {t("events.plan.sharedTitle")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-secondary)]">
              {t("events.plan.sharedBody")}
            </p>
          </div>
          <div className="rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3">
            <p className="text-sm font-semibold text-[color:var(--color-text)]">
              {t("events.plan.personalTitle")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-secondary)]">
              {t("events.plan.personalBody")}
            </p>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-4">
        <SectionHeading title={t("events.feed")} detail={liveFeed.length.toString()} />
        <div className="space-y-3">
          {liveFeed.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3"
            >
              <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[color:var(--color-primary)]" />
              <div className="min-w-0">
                <p className="text-sm text-[color:var(--color-text)]">
                  <span className="font-semibold">{item.actor}</span> {item.action}{" "}
                  <span className="font-medium">{item.target}</span>
                </p>
                <p className="mt-1 text-xs text-[color:var(--color-secondary)]">
                  {item.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </ModuleShell>
  );
}
