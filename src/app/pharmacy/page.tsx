"use client";

import { useEffect, useMemo, useState } from "react";
import { ModuleShell } from "@/components/layout/module-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useI18n } from "@/lib/i18n/i18n-context";
import { fetchMyHouseholdSummary, type Household } from "@/lib/household";
import { hasPlanFeature } from "@/lib/billing/plans";
import { useAuth } from "@/components/providers/auth-provider";
import { formatAppDate } from "@/lib/date-format";
import {
  addPharmacyInventoryItem,
  deletePharmacyInventoryItem,
  fetchPharmacyInventory,
  type PharmacyInventoryRecord,
} from "@/lib/pharmacy";

export default function PharmacyPage() {
  const { t, locale } = useI18n();
  const { profile } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [items, setItems] = useState<PharmacyInventoryRecord[]>([]);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemUnit, setItemUnit] = useState("");
  const [itemExpiry, setItemExpiry] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!profile?.household_id) {
      setItems([]);
      return;
    }

    let alive = true;
    void fetchPharmacyInventory(profile.household_id).then((next) => {
      if (alive) {
        setItems(next);
      }
    });

    return () => {
      alive = false;
    };
  }, [profile?.household_id]);

  const pharmacyAiEnabled = hasPlanFeature(household?.subscription_type, "pharmacy_ai");

  const reminders = useMemo(() => {
    const now = new Date();
    return items
      .map((item) => {
        const expiry = item.expiry_date ? new Date(item.expiry_date) : null;
        const diffDays =
          expiry && !Number.isNaN(expiry.getTime())
            ? Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            : null;

        if (diffDays !== null && diffDays <= 14) {
          return `${item.name} ${t("pharmacy.status.critical").toLowerCase()} · ${formatAppDate(item.expiry_date, locale)}`;
        }

        if (item.quantity <= 3) {
          return `${item.name} ${t("pharmacy.status.warning").toLowerCase()} · ${item.quantity}${item.unit ? ` ${item.unit}` : ""}`;
        }

        return null;
      })
      .filter((value): value is string => Boolean(value))
      .slice(0, 4);
  }, [items, locale, t]);

  function statusLabel(status: "ok" | "warning" | "critical") {
    if (status === "ok") return t("pharmacy.status.ok");
    if (status === "warning") return t("pharmacy.status.warning");
    return t("pharmacy.status.critical");
  }

  function statusTone(status: "ok" | "warning" | "critical") {
    if (status === "ok") return "good" as const;
    if (status === "warning") return "warn" as const;
    return "critical" as const;
  }

  async function reloadItems() {
    if (!profile?.household_id) return;
    const next = await fetchPharmacyInventory(profile.household_id);
    setItems(next);
  }

  async function handleAddItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile?.household_id || !itemName.trim()) return;

    setSaving(true);
    setError(null);

    try {
      await addPharmacyInventoryItem({
        householdId: profile.household_id,
        name: itemName,
        quantity: Number(itemQuantity) || 1,
        unit: itemUnit,
        expiryDate: itemExpiry || undefined,
      });
      await reloadItems();
      setItemName("");
      setItemQuantity("1");
      setItemUnit("");
      setItemExpiry("");
    } catch (nextError) {
      console.error(nextError);
      setError(t("pharmacy.form.error"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteItem(itemId: string) {
    if (!profile?.household_id) return;
    try {
      setError(null);
      await deletePharmacyInventoryItem({
        householdId: profile.household_id,
        itemId,
      });
      await reloadItems();
    } catch (nextError) {
      console.error(nextError);
      setError(t("pharmacy.form.error"));
    }
  }

  return (
    <ModuleShell title={t("tile.pharmacy")} moduleId="pharmacy">
      <GlassPanel className="space-y-4">
        <SectionHeading title={t("pharmacy.stock")} />
        <p className="text-sm leading-relaxed text-foreground/70">
          {t("pharmacy.overviewHint")}
        </p>
        <p className="text-sm leading-relaxed text-foreground">
          {t("module.pharmacy.blurb")}
        </p>

        <form
          onSubmit={handleAddItem}
          className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2"
        >
          <label className="text-xs font-bold uppercase tracking-wider text-foreground/70">
            {t("pharmacy.form.name")}
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="mt-1.5 w-full rounded-theme border border-border bg-background/50 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </label>
          <label className="text-xs font-bold uppercase tracking-wider text-foreground/70">
            {t("pharmacy.form.quantity")}
            <input
              type="number"
              min="1"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(e.target.value)}
              className="mt-1.5 w-full rounded-theme border border-border bg-background/50 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </label>
          <label className="text-xs font-bold uppercase tracking-wider text-foreground/70">
            {t("pharmacy.form.unit")}
            <input
              type="text"
              value={itemUnit}
              onChange={(e) => setItemUnit(e.target.value)}
              className="mt-1.5 w-full rounded-theme border border-border bg-background/50 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </label>
          <label className="text-xs font-bold uppercase tracking-wider text-foreground/70">
            {t("pharmacy.form.expiry")}
            <input
              type="date"
              lang={locale === "lv" ? "lv-LV" : "en-US"}
              value={itemExpiry}
              onChange={(e) => setItemExpiry(e.target.value)}
              className="mt-1.5 w-full rounded-theme border border-border bg-background/50 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </label>
          <div className="sm:col-span-2 mt-1">
            <button
              type="submit"
              disabled={saving || !profile?.household_id}
              className="w-full rounded-theme bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              {t("pharmacy.form.save")}
            </button>
          </div>
        </form>

        {error ? (
          <p className="text-sm font-medium text-red-500 bg-red-500/10 p-2 rounded-md">{error}</p>
        ) : null}

        <div className="space-y-2 mt-4">
          {items.length === 0 ? (
            <p className="rounded-theme border border-border bg-background/40 px-3 py-3 text-sm text-foreground/60 italic">
              {t("pharmacy.empty")}
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-theme border border-border bg-background/40 px-4 py-3 transition-colors hover:border-primary/50"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground">{item.name}</p>
                  <p className="mt-0.5 text-xs font-medium text-foreground/60">
                    {item.quantity}
                    {item.unit ? ` ${item.unit}` : ""}
                    {item.expiry_date ? ` · ${formatAppDate(item.expiry_date, locale)}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusPill tone={statusTone(item.status as "ok" | "warning" | "critical")}>
                    {statusLabel(item.status as "ok" | "warning" | "critical")}
                  </StatusPill>
                  <button
                    type="button"
                    onClick={() => void handleDeleteItem(item.id)}
                    className="rounded-md px-2 py-1.5 text-xs font-bold text-foreground/50 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("pharmacy.reminders")} />
        <div className="space-y-2">
          {reminders.length === 0 ? (
            <div className="rounded-theme border border-border bg-background/40 px-3 py-3 text-sm text-foreground/60 italic">
              {t("pharmacy.remindersEmpty")}
            </div>
          ) : (
            reminders.map((reminder) => (
              <div
                key={reminder}
                className="rounded-theme border border-rose-500/30 bg-rose-500/10 px-3 py-3 text-sm font-medium text-foreground"
              >
                {reminder}
              </div>
            ))
          )}
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <SectionHeading title={t("pharmacy.compatibility")} />
        {pharmacyAiEnabled ? (
          <p className="text-sm leading-relaxed text-foreground">
            {t("pharmacy.aiNote")}
          </p>
        ) : (
          <div className="space-y-3 rounded-theme border border-primary/20 bg-primary/5 p-4">
            <StatusPill tone="warn">{t("billing.plan.premium")}</StatusPill>
            <p className="text-sm leading-relaxed text-foreground">
              {t("billing.pharmacyLocked")}
            </p>
          </div>
        )}
      </GlassPanel>
    </ModuleShell>
  );
}