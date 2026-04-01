"use client";

import { useEffect, useState } from "react";
import { ModuleShell } from "@/components/layout/module-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassPanel } from "@/components/ui/glass-panel";
import { pharmacyItems, pharmacyReminders } from "@/lib/demo-data";
import { useI18n } from "@/lib/i18n/i18n-context";
import { fetchMyHouseholdSummary, type Household } from "@/lib/household";
import { hasPlanFeature } from "@/lib/billing/plans";

export default function PharmacyPage() {
  const { t } = useI18n();
  const [household, setHousehold] = useState<Household | null>(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      const nextHousehold = await fetchMyHouseholdSummary();
      if (alive) setHousehold(nextHousehold);
    };

    void load();

    return () => {
      alive = false;
    };
  }, []);

  const pharmacyAiEnabled = hasPlanFeature(
    household?.subscription_type,
    "pharmacy_ai",
  );

  return (
    <ModuleShell title={t("tile.pharmacy")} moduleId="pharmacy">
      <GlassPanel className="space-y-3">
        <SectionHeading title={t("pharmacy.stock")} />
        <p className="text-sm leading-relaxed text-[color:var(--color-text)]">
          {t("module.pharmacy.blurb")}
        </p>
        {pharmacyItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3"
          >
            <div>
              <p className="font-medium text-[color:var(--color-text)]">{item.name}</p>
              <p className="text-xs text-[color:var(--color-secondary)]">
                {item.quantity}
                {item.expiry ? ` · ${item.expiry}` : ""}
              </p>
            </div>
            <StatusPill
              tone={
                item.status === "ok"
                  ? "good"
                  : item.status === "warning"
                    ? "warn"
                    : "critical"
              }
            >
              {item.status}
            </StatusPill>
          </div>
        ))}
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("pharmacy.reminders")} />
        {pharmacyReminders.map((reminder) => (
          <div
            key={reminder}
            className="rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3 text-sm text-[color:var(--color-text)]"
          >
            {reminder}
          </div>
        ))}
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("pharmacy.compatibility")} />
        {pharmacyAiEnabled ? (
          <p className="text-sm leading-relaxed text-[color:var(--color-text)]">
            AI piezīme: D vitamīnu ieteicams lietot kopā ar taukvielām, savukārt
            dzelzi labāk nodalīt no magnija. Šo sadaļu nākamajā solī var pieslēgt
            tavai BYOK plūsmai.
          </p>
        ) : (
          <div className="space-y-3 rounded-2xl border border-[color:var(--color-surface-border)] p-3">
            <StatusPill tone="warn">{t("billing.plan.premium")}</StatusPill>
            <p className="text-sm leading-relaxed text-[color:var(--color-text)]">
              {t("billing.pharmacyLocked")}
            </p>
          </div>
        )}
      </GlassPanel>
    </ModuleShell>
  );
}
