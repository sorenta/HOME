"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ModuleShell } from "@/components/layout/module-shell";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassPanel } from "@/components/ui/glass-panel";
import { dashboardSnapshot, householdMembers, resetMetrics } from "@/lib/demo-data";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";
import { hasResetCheckInToday, markResetCheckInDone } from "@/lib/reset-checkin";

export default function ResetPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [doneToday, setDoneToday] = useState(true);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setDoneToday(hasResetCheckInToday());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function onCheckIn() {
    hapticTap();
    markResetCheckInDone();
    setDoneToday(true);
    router.push("/");
  }

  return (
    <ModuleShell title={t("tile.reset")} moduleId="reset">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label={t("reset.score")} value={`${dashboardSnapshot.resetScore}%`} />
        <MetricCard label="Partnera aura" value="Maiga" hint="Redzama bez jēldatiem" />
      </div>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("reset.metrics")} />
        <p className="text-sm leading-relaxed text-[color:var(--color-text)]">
          {t("module.reset.blurb")}
        </p>
        {resetMetrics.map((metric) => (
          <div
            key={metric.label}
            className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3"
          >
            <p className="text-sm font-medium text-[color:var(--color-text)]">{metric.label}</p>
            <StatusPill tone={metric.tone === "good" ? "good" : "warn"}>
              {metric.value}
            </StatusPill>
          </div>
        ))}
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("reset.privacy")} />
        <p className="text-sm leading-relaxed text-[color:var(--color-text)]">
          Partneris redz tikai auru un RESET procentu, nevis konkrētas lietotnes,
          soļu maršrutu vai ekrāna lietojuma detaļas.
        </p>
        <div className="flex flex-wrap gap-2">
          {householdMembers.slice(0, 2).map((member) => (
            <StatusPill key={member.id}>{member.name} redz tikai auru</StatusPill>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-4">
        <SectionHeading title={t("reset.recommendation")} />
        <p className="text-sm leading-relaxed text-[color:var(--color-text)]">
          Izskatās, ka mājās šodien vajadzīgs mierīgāks temps. AI var ieteikt īsu
          pastaigu, vakariņu deleģēšanu vai klusāku vakara rutīnu.
        </p>
        <button
          type="button"
          onClick={onCheckIn}
          disabled={doneToday}
          className={[
            "w-full rounded-xl px-4 py-3 text-sm font-semibold transition-opacity",
            doneToday
              ? "cursor-default bg-[color:var(--color-surface-border)] text-[color:var(--color-secondary)]"
              : "bg-[color:var(--color-primary)] text-[color:var(--color-background)]",
          ].join(" ")}
        >
          {doneToday ? t("module.reset.done") : t("module.reset.checkin")}
        </button>
      </GlassPanel>
    </ModuleShell>
  );
}
