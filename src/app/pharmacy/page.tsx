"use client";

import { useEffect, useMemo, useState } from "react";
import { ModuleShell } from "@/components/layout/module-shell";
import { PharmacyThemeLayer, usePharmacyItemTheme } from "@/components/pharmacy/pharmacy-theme-layer";
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
  const { formControl, actionButton, itemCard } = usePharmacyItemTheme();

  const reloadItems = async () => {
    if (!profile?.household_id) return;
    const next = await fetchPharmacyInventory(profile.household_id);
    setItems(next);
  };

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
      setItemName(""); 
      const input = document.querySelector('input[type="text"]');
      if (input instanceof HTMLInputElement) input.focus();
      window.history.replaceState({}, "", "/pharmacy");
    }
  }, [loading, profile?.household_id, searchParams]);

  const pharmacyAiEnabled = false;

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
      .filter((r): r is string => r !== null);
  }, [items, t, locale]);

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!profile?.household_id || !itemName.trim()) return;

    setSaving(true);
    setError(null);

    try {
      await addPharmacyInventoryItem({
        householdId: profile.household_id,
        name: itemName,
        quantity: Number(itemQuantity),
        unit: itemUnit,
        expiryDate: itemExpiry || undefined,
      });

      triggerThemeActionEffect({ kind: "add", label: itemName });
      setItemName("");
      setItemQuantity("1");
      setItemUnit("");
      setItemExpiry("");
      await reloadItems();
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

  function statusLabel(status: string) {
    switch (status) {
      case "ok": return t("pharmacy.status.ok");
      case "low_stock": return t("pharmacy.status.low");
      case "expiring": return t("pharmacy.status.expiring");
      case "expired": return t("pharmacy.status.expired");
      default: return status;
    }
  }

  function statusTone(status: string): "success" | "warning" | "error" | "neutral" {
    switch (status) {
      case "ok": return "success";
      case "low_stock":
      case "expiring": return "warning";
      case "expired": return "error";
      default: return "neutral";
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
            {/* SECTOR 01: MEDICAL_LOGISTICS */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-1 opacity-40">
                <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 01</span>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Medicīnas loģistika</span>
              </div>
              
              <GlassPanel className="p-0 overflow-hidden">
                <div className="border-b border-white/5 bg-white/5 px-4 py-3">
                  <h2 className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-white/80">Krājumu kontrole</h2>
                </div>
                <div className="p-4 space-y-4 font-mono">
                  <form
                    onSubmit={handleAddItem}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    <div className="space-y-1">
                      <p className="text-[0.5rem] font-black uppercase text-primary tracking-widest ml-1">NOSAUKUMS</p>
                      <input
                        type="text"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="ENTRY_NAME..."
                        className="w-full border border-white/10 bg-black/40 px-3 py-2 text-[0.7rem] text-white focus:border-primary outline-none transition-all rounded-sm uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[0.5rem] font-black uppercase text-primary tracking-widest ml-1">DAUDZUMS</p>
                      <input
                        type="number"
                        min="1"
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(e.target.value)}
                        className="w-full border border-white/10 bg-black/40 px-3 py-2 text-[0.7rem] text-white focus:border-primary outline-none transition-all rounded-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[0.5rem] font-black uppercase text-primary tracking-widest ml-1">VIENĪBA</p>
                      <input
                        type="text"
                        value={itemUnit}
                        onChange={(e) => setItemUnit(e.target.value)}
                        placeholder="UNIT_TYPE..."
                        className="w-full border border-white/10 bg-black/40 px-3 py-2 text-[0.7rem] text-white focus:border-primary outline-none transition-all rounded-sm uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[0.5rem] font-black uppercase text-primary tracking-widest ml-1">TERMIŅŠ</p>
                      <input
                        type="date"
                        value={itemExpiry}
                        onChange={(e) => setItemExpiry(e.target.value)}
                        className="w-full border border-white/10 bg-black/40 px-3 py-2 text-[0.7rem] text-white focus:border-primary outline-none transition-all rounded-sm [color-scheme:dark]"
                      />
                    </div>
                    <div className="sm:col-span-2 mt-1">
                      <button
                        type="submit"
                        disabled={saving || !profile?.household_id}
                        className="w-full border border-primary/40 bg-primary/10 py-2.5 text-[0.6rem] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/20 transition-all disabled:opacity-30"
                      >
                        [ PIEVIENOT_REĢISTRĀ ]
                      </button>
                    </div>
                  </form>

                  <div className="space-y-1 pt-2">
                    {items.length === 0 ? (
                      <p className="text-[0.6rem] text-white/20 uppercase text-center py-4 tracking-widest">
                        NAV AKTĪVU VIENĪBU
                      </p>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {items.map((item) => (
                          <div key={item.id} className="group flex items-center justify-between py-2.5">
                            <div className="min-w-0">
                              <p className="text-[0.7rem] font-bold text-white/90 uppercase tracking-tight truncate">{item.name}</p>
                              <p className="text-[0.55rem] text-white/40 uppercase">
                                QTY: {item.quantity} {item.unit?.toUpperCase() || "UNIT"}
                                {item.expiry_date ? ` · EXP: ${item.expiry_date}` : ""}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-4">
                              <StatusPill tone={statusTone(item.status as string)}>
                                {statusLabel(item.status as string)}
                              </StatusPill>
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
                </div>
              </GlassPanel>
            </div>

            {/* SECTOR 02: OPERATIONAL_ALERTS */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-1 opacity-40">
                <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 02</span>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Operatīvie atgādinājumi</span>
              </div>
              <div className="space-y-2">
                {reminders.length === 0 ? (
                  <div className="rounded-sm border border-white/5 bg-black/20 px-3 py-3 text-[0.6rem] text-white/40 uppercase tracking-widest font-mono">
                    SISTĒMAS_STATUSS: OPTIMĀLS
                  </div>
                ) : (
                  reminders.map((reminder) => (
                    <div
                      key={reminder}
                      className="rounded-sm border border-primary/30 bg-primary/5 px-4 py-3 text-[0.65rem] font-bold text-white uppercase tracking-tight flex items-center gap-3 font-mono"
                    >
                      <div className="w-1.5 h-1.5 bg-primary shadow-[0_0_5px_var(--color-primary)] rotate-45 animate-pulse" />
                      {reminder}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SECTOR 03: SYSTEM_INTEGRITY */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-1 opacity-40">
                <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 03</span>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Sistēmas savietojamība</span>
              </div>
              <GlassPanel className="p-0 overflow-hidden">
                <div className="border-b border-white/5 bg-white/5 px-4 py-3">
                  <p className="text-[0.6rem] font-black uppercase tracking-widest text-primary">CORE_COMPATIBILITY_MODULE</p>
                </div>
                <div className="p-4">
                  {!pharmacyAiEnabled && (
                    <div className="space-y-3 rounded-sm border border-primary/20 bg-primary/5 p-4 font-mono">
                      <p className="text-[0.5rem] text-primary uppercase tracking-tighter mb-1 font-black">ACCESS_DENIED: PREMIUM_LAYER_REQUIRED</p>
                      <p className="text-[0.65rem] leading-relaxed text-white/70 uppercase">
                        {t("billing.pharmacyLocked")}
                      </p>
                    </div>
                  )}
                </div>
              </GlassPanel>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <GlassPanel className="space-y-4">
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
                        <StatusPill tone={statusTone(item.status as string)}>
                          {statusLabel(item.status as string)}
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
          </div>
        )}
      </div>
     </PharmacyThemeLayer>
    </ModuleShell>
  );
}
