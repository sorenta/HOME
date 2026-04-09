"use client";

import { useEffect, useMemo, useState } from "react";
import { ModuleShell } from "@/components/layout/module-shell";
import { PharmacyThemeLayer, usePharmacyItemTheme } from "@/components/pharmacy/pharmacy-theme-layer";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { HiddenSeasonalCollectible } from "@/components/seasonal/hidden-seasonal-collectible";
import { formatAppDate } from "@/lib/date-format";
import { useSearchParams } from "next/navigation";
import { useThemeActionEffects } from "@/components/theme/theme-action-effects";
import {
  addPharmacyInventoryItem,
  deletePharmacyInventoryItem,
  fetchPharmacyInventory,
  type PharmacyInventoryRecord,
} from "@/lib/pharmacy";

export default function PharmacyPage() {
  const { t, locale } = useI18n();
  const { profile } = useAuth();
  const { themeId } = useTheme();
  const { triggerThemeActionEffect } = useThemeActionEffects();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<PharmacyInventoryRecord[]>([]);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemUnit, setItemUnit] = useState("");
  const [itemExpiry, setItemExpiry] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { itemCard, formControl, actionButton } = usePharmacyItemTheme();

  useEffect(() => {
    if (!profile?.household_id) {
      setItems([]);
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);
    void fetchPharmacyInventory(profile.household_id).then((next) => {
      if (alive) {
        setItems(next);
        setLoading(false);
      }
    });

    return () => {
      alive = false;
    };
  }, [profile?.household_id]);

  useEffect(() => {
    if (loading || !profile?.household_id) return;
    const action = searchParams.get("action");
    if (action === "add-med") {
      // Logic for quick add: auto-focus or show modal
      // For now, we'll just set a placeholder name to indicate add state
      setItemName(""); 
      const input = document.querySelector('input[type="text"]');
      if (input instanceof HTMLInputElement) input.focus();
      window.history.replaceState({}, "", "/pharmacy");
    }
  }, [loading, profile?.household_id, searchParams]);

  const pharmacyAiEnabled = false; // Note: Free inventory

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
          return t("pharmacy.reminder.critical", {
            item: item.name,
            date: formatAppDate(item.expiry_date, locale) ?? item.expiry_date ?? "",
          });
        }

        if (item.quantity <= 3) {
          return t("pharmacy.reminder.warning", {
            item: item.name,
            amount: `${item.quantity}${item.unit ? ` ${item.unit}` : ""}`,
          });
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
      triggerThemeActionEffect({ kind: "add", label: itemName });
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

  const isForge = themeId === "forge";

  return (
    <ModuleShell
      title={t("tile.pharmacy")}
      moduleId="pharmacy"
      sectionId="pharmacy"
      description={t("pharmacy.page.description")}
    >
     <PharmacyThemeLayer>
      <HiddenSeasonalCollectible spotId="pharmacy" />

      <div className="space-y-10 pt-4 pb-12">
        {isForge ? (
          <>
            {/* SECTOR 01: MEDICAL_INVENTORY */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-1 opacity-40">
                <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 01</span>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Medikamentu resursi</span>
              </div>
              
              <GlassPanel className="space-y-4 border-primary/20 bg-black/40">
                <form
                  onSubmit={handleAddItem}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  <label className="text-[0.6rem] font-black uppercase tracking-widest text-primary">
                    {t("pharmacy.form.name")}
                    <input
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="ENTRY_NAME..."
                      className="mt-1.5 w-full border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white font-mono focus:border-primary outline-none transition-all rounded-sm"
                    />
                  </label>
                  <label className="text-[0.6rem] font-black uppercase tracking-widest text-primary">
                    {t("pharmacy.form.quantity")}
                    <input
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(e.target.value)}
                      className="mt-1.5 w-full border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white font-mono focus:border-primary outline-none transition-all rounded-sm"
                    />
                  </label>
                  <label className="text-[0.6rem] font-black uppercase tracking-widest text-primary">
                    {t("pharmacy.form.unit")}
                    <input
                      type="text"
                      value={itemUnit}
                      onChange={(e) => setItemUnit(e.target.value)}
                      placeholder="UNIT_TYPE..."
                      className="mt-1.5 w-full border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white font-mono focus:border-primary outline-none transition-all rounded-sm"
                    />
                  </label>
                  <label className="text-[0.6rem] font-black uppercase tracking-widest text-primary">
                    {t("pharmacy.form.expiry")}
                    <input
                      type="date"
                      value={itemExpiry}
                      onChange={(e) => setItemExpiry(e.target.value)}
                      className="mt-1.5 w-full border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white font-mono focus:border-primary outline-none transition-all rounded-sm [color-scheme:dark]"
                    />
                  </label>
                  <div className="sm:col-span-2 mt-1">
                    <button
                      type="submit"
                      disabled={saving || !profile?.household_id}
                      className="w-full bg-primary py-3 rounded-sm text-[0.65rem] font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(225,29,46,0.4)] hover:bg-primary/80 disabled:opacity-30 transition-all"
                    >
                      [ INICIĒT_REĢISTRĀCIJU ]
                    </button>
                  </div>
                </form>

                <div className="space-y-2 mt-4">
                  {items.length === 0 ? (
                    <p className="border border-white/5 bg-white/5 px-3 py-3 text-[0.6rem] text-white/40 uppercase tracking-widest font-mono">
                      {t("pharmacy.empty").toUpperCase()}
                    </p>
                  ) : (
                    <div className="grid gap-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 border border-white/5 bg-black/20 px-4 py-3 hover:border-primary/30 transition-all group"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-white uppercase tracking-tight font-(family-name:--font-rajdhani)">{item.name}</p>
                            <p className="mt-0.5 text-[0.6rem] font-mono text-white/40">
                              QTY: {item.quantity} {item.unit?.toUpperCase() || "UNIT"}
                              {item.expiry_date ? ` · EXP: ${item.expiry_date}` : ""}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-4">
                            <span className={`text-[0.5rem] font-black px-1.5 py-0.5 border uppercase tracking-tighter ${
                              item.status === 'ok' ? 'border-emerald-500/30 text-emerald-500' : 'border-primary/30 text-primary'
                            }`}>
                              {statusLabel(item.status as any).toUpperCase()}
                            </span>
                            <button
                              type="button"
                              onClick={() => void handleDeleteItem(item.id)}
                              className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-primary transition-all p-1"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </GlassPanel>
            </div>

            {/* SECTOR 02: DOSAGE_CONTROL */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-1 opacity-40">
                <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 02</span>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Operatīvie atgādinājumi</span>
              </div>
              <div className="space-y-2">
                {reminders.length === 0 ? (
                  <div className="rounded-sm border border-white/5 bg-black/20 px-3 py-3 text-[0.6rem] text-white/40 uppercase tracking-widest font-mono">
                    {t("pharmacy.remindersEmpty").toUpperCase()}
                  </div>
                ) : (
                  reminders.map((reminder) => (
                    <div
                      key={reminder}
                      className="rounded-sm border border-primary/30 bg-primary/5 px-4 py-3 text-xs font-bold text-white uppercase tracking-tight flex items-center gap-3"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      {reminder}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SECTOR 03: HEALTH_LOG */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-1 opacity-40">
                <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 03</span>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Sistēmas savietojamība</span>
              </div>
              <GlassPanel className="space-y-3 border-white/5 bg-black/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 bg-primary/40 rounded-sm" />
                  <p className="text-[0.6rem] font-black uppercase tracking-widest text-primary">CORE_COMPATIBILITY_MODULE</p>
                </div>
                {!pharmacyAiEnabled && (
                  <div className="space-y-3 rounded-sm border border-primary/20 bg-primary/5 p-4">
                    <p className="text-[0.5rem] font-mono text-primary uppercase tracking-tighter mb-1">ACCESS_DENIED: PREMIUM_LAYER_REQUIRED</p>
                    <p className="text-sm leading-relaxed text-white/70">
                      {t("billing.pharmacyLocked")}
                    </p>
                  </div>
                )}
              </GlassPanel>
            </div>
          </>
        ) : (
          <div className="space-y-6">
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
                    className={`mt-1.5 w-full border bg-background/50 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${formControl}`}
                  />
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/70">
                  {t("pharmacy.form.quantity")}
                  <input
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                    className={`mt-1.5 w-full border bg-background/50 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${formControl}`}
                  />
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/70">
                  {t("pharmacy.form.unit")}
                  <input
                    type="text"
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    className={`mt-1.5 w-full border bg-background/50 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${formControl}`}
                  />
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/70">
                  {t("pharmacy.form.expiry")}
                  <input
                    type="date"
                    lang={locale === "lv" ? "lv-LV" : "en-US"}
                    value={itemExpiry}
                    onChange={(e) => setItemExpiry(e.target.value)}
                    className={`mt-1.5 w-full border bg-background/50 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${formControl}`}
                  />
                </label>
                <div className="sm:col-span-2 mt-1">
                  <button
                    type="submit"
                    disabled={saving || !profile?.household_id}
                    className={`w-full px-4 py-3 text-sm font-bold shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 ${actionButton}`}
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
                  <p className={`border border-border bg-background/40 px-3 py-3 text-sm text-foreground/60 italic ${itemCard}`}>
                    {t("pharmacy.empty")}
                  </p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex flex-wrap items-center justify-between gap-3 border border-border bg-background/40 px-4 py-3 transition-colors hover:border-primary/50 ${itemCard}`}
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
                        <StatusPill tone={statusTone(item.status as any)}>
                          {statusLabel(item.status as any)}
                        </StatusPill>
                        <button
                          type="button"
                          onClick={() => void handleDeleteItem(item.id)}
                          title={t("pharmacy.form.delete")}
                          aria-label={t("pharmacy.form.delete")}
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
              <div className="space-y-3 rounded-theme border border-primary/20 bg-primary/5 p-4">
                <StatusPill tone="warn">{t("billing.plan.premium")}</StatusPill>
                <p className="text-sm leading-relaxed text-foreground">
                  {t("billing.pharmacyLocked")}
                </p>
              </div>
            </GlassPanel>
          </div>
        )}
      </div>
     </PharmacyThemeLayer>
    </ModuleShell>
  );
}
