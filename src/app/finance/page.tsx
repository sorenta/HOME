"use client";

import { ModuleShell } from "@/components/layout/module-shell";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassPanel } from "@/components/ui/glass-panel";
import { financeBills, financeSummary, liveFeed } from "@/lib/demo-data";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function FinancePage() {
  const { t } = useI18n();

  return (
    <ModuleShell title={t("tile.finance")} moduleId="finance">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label={t("finance.wallet")} value={financeSummary.balance} />
        <MetricCard label="Cashflow" value={financeSummary.income} hint={financeSummary.plannedSpend} />
      </div>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("finance.bills")} />
        {financeBills.map((bill) => (
          <div
            key={bill.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3"
          >
            <div>
              <p className="font-medium text-[color:var(--color-text)]">{bill.label}</p>
              <p className="text-xs text-[color:var(--color-secondary)]">
                {bill.amount} · {bill.due}
              </p>
            </div>
            <StatusPill tone={bill.paid ? "good" : "warn"}>
              {bill.paid ? "Samaksāts" : "Gaida"}
            </StatusPill>
          </div>
        ))}
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("finance.activity")} />
        {liveFeed.slice(0, 2).map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3"
          >
            <p className="text-sm text-[color:var(--color-text)]">
              <span className="font-semibold">{item.actor}</span> {item.action} {item.target}
            </p>
            <p className="mt-1 text-xs text-[color:var(--color-secondary)]">{item.time}</p>
          </div>
        ))}
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("finance.insight")} />
        <p className="text-sm leading-relaxed text-[color:var(--color-text)]">
          {financeSummary.aiInsight}
        </p>
      </GlassPanel>
    </ModuleShell>
  );
}
