"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HouseholdOnboarding } from "@/components/household/household-onboarding";
import { KitchenOnboardingSurvey } from "@/components/kitchen/kitchen-onboarding-survey";
import { useAuth } from "@/components/providers/auth-provider";
import { ModuleShell } from "@/components/layout/module-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { GlassPanel } from "@/components/ui/glass-panel";
import {
  addKitchenInventoryItems,
  addKitchenInventoryItem,
  addShoppingItem,
  deleteKitchenInventoryItem,
  fetchKitchenInventory,
  fetchShoppingItems,
  formatQuantity,
  inventoryTone,
  moveShoppingItemToInventory,
  shoppingTone,
  type KitchenInventoryRecord,
  type ShoppingRecord,
  updateShoppingItemStatus,
} from "@/lib/kitchen";
import { kitchenOnboardingStorageKey } from "@/lib/kitchen-onboarding";
import { getBrowserClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/i18n-context";

type KitchenView = "inventory" | "shopping";

export default function KitchenPage() {
  const { t } = useI18n();
  const { profile } = useAuth();
  const [inventory, setInventory] = useState<KitchenInventoryRecord[]>([]);
  const [shopping, setShopping] = useState<ShoppingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [inventoryName, setInventoryName] = useState("");
  const [inventoryQuantity, setInventoryQuantity] = useState("1");
  const [inventoryUnit, setInventoryUnit] = useState("");
  const [inventoryExpiry, setInventoryExpiry] = useState("");
  const [shoppingName, setShoppingName] = useState("");
  const [shoppingQuantity, setShoppingQuantity] = useState("1");
  const [shoppingUnit, setShoppingUnit] = useState("");
  const [activeView, setActiveView] = useState<KitchenView>("inventory");
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [showShoppingForm, setShowShoppingForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showOnboardingSurvey, setShowOnboardingSurvey] = useState(false);
  const [savingOnboarding, setSavingOnboarding] = useState(false);

  const householdId = profile?.household_id ?? null;
  const userId = profile?.id ?? null;

  const loadKitchenData = useCallback(async () => {
    if (!householdId) {
      setInventory([]);
      setShopping([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const [inventoryRows, shoppingRows] = await Promise.all([
      fetchKitchenInventory(householdId),
      fetchShoppingItems(householdId),
    ]);
    setInventory(inventoryRows);
    setShopping(shoppingRows);
    setLoading(false);
  }, [householdId]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void loadKitchenData();
    });

    return () => cancelAnimationFrame(frame);
  }, [loadKitchenData]);

  useEffect(() => {
    if (!householdId) return;
    const supabase = getBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`kitchen-realtime-${householdId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inventory_items",
          filter: `household_id=eq.${householdId}`,
        },
        () => {
          void loadKitchenData();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shopping_items",
          filter: `household_id=eq.${householdId}`,
        },
        () => {
          void loadKitchenData();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [householdId, loadKitchenData]);

  useEffect(() => {
    if (!householdId || !userId || loading) return;
    if (inventory.length > 0 || shopping.length > 0) {
      setShowOnboardingSurvey(false);
      return;
    }
    if (typeof window === "undefined") return;

    const key = kitchenOnboardingStorageKey(userId, householdId);
    const completed = window.localStorage.getItem(key) === "done";
    setShowOnboardingSurvey(!completed);
  }, [householdId, inventory.length, loading, shopping.length, userId]);

  const assistantMessage = useMemo(() => {
    if (inventory.length === 0) {
      return t("module.kitchen.blurb");
    }

    const expiring = inventory.find((item) => item.expiry_date);
    const nextNeeded = shopping[0]?.title;

    if (expiring && nextNeeded) {
      return `${expiring.name} tuvojas termiņam. Ieteikums: izmanto to nākamajā maltītē un pa ceļam paņem ${nextNeeded.toLowerCase()}.`;
    }

    if (expiring) {
      return `${expiring.name} jau ir tavā virtuvē un prasa uzmanību tuvākajās dienās.`;
    }

    return t("module.kitchen.blurb");
  }, [inventory, shopping, t]);

  async function handleInventorySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!householdId) return;

    setError(null);
    setMessage(null);

    try {
      await addKitchenInventoryItem({
        householdId,
        name: inventoryName,
        quantity: Number(inventoryQuantity) || 1,
        unit: inventoryUnit,
        expiryDate: inventoryExpiry,
      });
      setInventoryName("");
      setInventoryQuantity("1");
      setInventoryUnit("");
      setInventoryExpiry("");
      setShowInventoryForm(false);
      setMessage(t("kitchen.saved"));
      await loadKitchenData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("household.error.generic"));
    }
  }

  async function handleShoppingSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!householdId) return;

    setError(null);
    setMessage(null);

    try {
      await addShoppingItem({
        householdId,
        title: shoppingName,
        quantity: Number(shoppingQuantity) || 1,
        unit: shoppingUnit,
      });
      setShoppingName("");
      setShoppingQuantity("1");
      setShoppingUnit("");
      setShowShoppingForm(false);
      setMessage(t("kitchen.saved"));
      await loadKitchenData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("household.error.generic"));
    }
  }

  async function handleInventoryDelete(itemId: string) {
    setError(null);
    setMessage(null);

    try {
      await deleteKitchenInventoryItem(itemId);
      setSelectedId(null);
      setMessage(t("kitchen.saved"));
      await loadKitchenData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("household.error.generic"));
    }
  }

  async function handleShoppingStatus(
    itemId: string,
    status: "open" | "picked" | "archived",
  ) {
    setError(null);
    setMessage(null);

    try {
      await updateShoppingItemStatus(itemId, status);
      if (status === "archived") {
        setSelectedId(null);
      }
      setMessage(t("kitchen.saved"));
      await loadKitchenData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("household.error.generic"));
    }
  }

  async function handleMoveToInventory(itemId: string) {
    setError(null);
    setMessage(null);

    try {
      await moveShoppingItemToInventory(itemId);
      setSelectedId(null);
      setMessage(t("kitchen.moved"));
      await loadKitchenData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("household.error.generic"));
    }
  }

  async function handleKitchenOnboardingComplete(
    items: Array<{ name: string; unit?: string; category: string }>,
  ) {
    if (!householdId || !userId) return;

    setError(null);
    setMessage(null);
    setSavingOnboarding(true);

    try {
      if (items.length > 0) {
        await addKitchenInventoryItems(
          householdId,
          items.map((item) => ({
            name: item.name,
            unit: item.unit,
            category: item.category,
            quantity: 1,
          })),
        );
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          kitchenOnboardingStorageKey(userId, householdId),
          "done",
        );
      }

      setShowOnboardingSurvey(false);
      setMessage(
        items.length > 0 ? t("kitchen.onboarding.saved") : t("kitchen.onboarding.skipped"),
      );
      await loadKitchenData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("household.error.generic"));
    } finally {
      setSavingOnboarding(false);
    }
  }

  function handleKitchenOnboardingSkip() {
    if (!householdId || !userId) return;

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        kitchenOnboardingStorageKey(userId, householdId),
        "done",
      );
    }

    setShowOnboardingSurvey(false);
    setMessage(t("kitchen.onboarding.skipped"));
  }

  if (!householdId) {
    return (
      <ModuleShell title={t("tile.kitchen")} moduleId="kitchen">
        <HouseholdOnboarding compact />
      </ModuleShell>
    );
  }

  return (
    <ModuleShell title={t("tile.kitchen")} moduleId="kitchen">
      <GlassPanel className="space-y-4">
        <SectionHeading title={t("tile.kitchen")} detail={t("kitchen.realtime")} />
        <p className="text-sm leading-relaxed text-[color:var(--color-secondary)]">
          {assistantMessage}
        </p>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveView("inventory")}
            className={[
              "rounded-2xl border px-3 py-3 text-left transition-colors",
              activeView === "inventory"
                ? "border-[color:var(--color-primary)] bg-[color:var(--color-surface-border)]"
                : "border-[color:var(--color-surface-border)]",
            ].join(" ")}
          >
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[color:var(--color-secondary)]">
              {t("kitchen.view.inventory")}
            </p>
            <p className="mt-1 text-lg font-semibold text-[color:var(--color-text)]">
              {inventory.length}
            </p>
            <p className="text-xs text-[color:var(--color-secondary)]">
              {t("kitchen.summary.items")}
            </p>
          </button>
          <button
            type="button"
            onClick={() => setActiveView("shopping")}
            className={[
              "rounded-2xl border px-3 py-3 text-left transition-colors",
              activeView === "shopping"
                ? "border-[color:var(--color-primary)] bg-[color:var(--color-surface-border)]"
                : "border-[color:var(--color-surface-border)]",
            ].join(" ")}
          >
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[color:var(--color-secondary)]">
              {t("kitchen.view.shopping")}
            </p>
            <p className="mt-1 text-lg font-semibold text-[color:var(--color-text)]">
              {shopping.length}
            </p>
            <p className="text-xs text-[color:var(--color-secondary)]">
              {t("kitchen.summary.next")}
            </p>
          </button>
          <button
            type="button"
            onClick={() => {
              if (activeView === "inventory") {
                setShowInventoryForm((current) => !current);
                setShowShoppingForm(false);
              } else {
                setShowShoppingForm((current) => !current);
                setShowInventoryForm(false);
              }
            }}
            className="rounded-2xl border border-[color:var(--color-surface-border)] px-3 py-3 text-left transition-colors"
          >
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[color:var(--color-secondary)]">
              {t("kitchen.quickAdd")}
            </p>
            <p className="mt-1 text-lg font-semibold text-[color:var(--color-text)]">
              +
            </p>
            <p className="text-xs text-[color:var(--color-secondary)]">
              {activeView === "inventory" && showInventoryForm
                ? t("kitchen.hideForm")
                : activeView === "shopping" && showShoppingForm
                  ? t("kitchen.hideForm")
                  : t("kitchen.form.submit")}
            </p>
          </button>
        </div>
      </GlassPanel>

      {showOnboardingSurvey ? (
        <KitchenOnboardingSurvey
          onComplete={handleKitchenOnboardingComplete}
          onSkip={handleKitchenOnboardingSkip}
          saving={savingOnboarding}
        />
      ) : null}

      <GlassPanel className="space-y-3">
        <SectionHeading
          title={activeView === "inventory" ? t("kitchen.stock") : t("kitchen.cart")}
          detail={
            activeView === "inventory"
              ? `${inventory.length}`
              : `${shopping.length}`
          }
        />

        {loading ? (
          <p className="text-sm text-[color:var(--color-secondary)]">
            {t("kitchen.loading")}
          </p>
        ) : activeView === "inventory" ? (
          inventory.length === 0 ? (
            <p className="text-sm text-[color:var(--color-secondary)]">
              {t("kitchen.empty.stock")}
            </p>
          ) : (
            <div className="space-y-2">
              {inventory.map((item) => (
                <div key={item.id} className="space-y-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedId((current) => (current === item.id ? null : item.id))
                    }
                    className={[
                      "flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-left transition-colors",
                      selectedId === item.id
                        ? "border-[color:var(--color-primary)] bg-[color:var(--color-surface-border)]"
                        : "border-[color:var(--color-surface-border)]",
                    ].join(" ")}
                  >
                    <div>
                      <p className="font-medium text-[color:var(--color-text)]">{item.name}</p>
                      <p className="text-xs text-[color:var(--color-secondary)]">
                        {formatQuantity(item.quantity, item.unit)}
                        {item.expiry_date ? ` · ${item.expiry_date}` : ""}
                      </p>
                    </div>
                    <StatusPill tone={inventoryTone(item.status)}>{item.status}</StatusPill>
                  </button>
                  {selectedId === item.id ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void handleInventoryDelete(item.id)}
                        className="rounded-xl border border-[color:var(--color-surface-border)] px-3 py-2 text-sm font-medium text-[color:var(--color-text)]"
                      >
                        {t("kitchen.action.remove")}
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )
        ) : shopping.length === 0 ? (
          <p className="text-sm text-[color:var(--color-secondary)]">
            {t("kitchen.empty.cart")}
          </p>
        ) : (
          <div className="space-y-2">
            {shopping.map((item) => (
              <div key={item.id} className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedId((current) => (current === item.id ? null : item.id))
                  }
                  className={[
                    "flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-left transition-colors",
                    selectedId === item.id
                      ? "border-[color:var(--color-primary)] bg-[color:var(--color-surface-border)]"
                      : "border-[color:var(--color-surface-border)]",
                  ].join(" ")}
                >
                  <div>
                    <p
                      className={[
                        "font-medium text-[color:var(--color-text)]",
                        item.status === "picked" ? "line-through opacity-70" : "",
                      ].join(" ")}
                    >
                      {item.title}
                    </p>
                    <p className="text-xs text-[color:var(--color-secondary)]">
                      {formatQuantity(item.quantity, item.unit)}
                    </p>
                  </div>
                  <StatusPill tone={shoppingTone(item.status)}>{item.status}</StatusPill>
                </button>
                {selectedId === item.id ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        item.status === "picked"
                          ? void handleShoppingStatus(item.id, "open")
                          : void handleMoveToInventory(item.id)
                      }
                      className="rounded-xl border border-[color:var(--color-surface-border)] px-3 py-2 text-sm font-medium text-[color:var(--color-text)]"
                    >
                      {item.status === "picked"
                        ? t("kitchen.action.reopen")
                        : t("kitchen.action.moveToInventory")}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleShoppingStatus(item.id, "archived")}
                      className="rounded-xl border border-[color:var(--color-surface-border)] px-3 py-2 text-sm font-medium text-[color:var(--color-text)]"
                    >
                      {t("kitchen.action.archive")}
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {activeView === "inventory" && showInventoryForm ? (
          <form className="grid grid-cols-2 gap-3 border-t border-[color:var(--color-surface-border)] pt-3" onSubmit={handleInventorySubmit}>
            <label className="col-span-2 text-sm text-[color:var(--color-text)]">
              {t("kitchen.form.name")}
              <input
                type="text"
                value={inventoryName}
                onChange={(e) => setInventoryName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="text-sm text-[color:var(--color-text)]">
              {t("kitchen.form.quantity")}
              <input
                type="number"
                min="1"
                step="1"
                value={inventoryQuantity}
                onChange={(e) => setInventoryQuantity(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="text-sm text-[color:var(--color-text)]">
              {t("kitchen.form.unit")}
              <input
                type="text"
                value={inventoryUnit}
                onChange={(e) => setInventoryUnit(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
              />
            </label>
            <label className="col-span-2 text-sm text-[color:var(--color-text)]">
              {t("kitchen.form.expiry")}
              <input
                type="date"
                value={inventoryExpiry}
                onChange={(e) => setInventoryExpiry(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              className="col-span-2 rounded-xl bg-[color:var(--color-primary)] px-4 py-3 text-sm font-semibold text-[color:var(--color-background)]"
            >
              {t("kitchen.form.submit")}
            </button>
          </form>
        ) : null}

        {activeView === "shopping" && showShoppingForm ? (
          <form className="grid grid-cols-2 gap-3 border-t border-[color:var(--color-surface-border)] pt-3" onSubmit={handleShoppingSubmit}>
            <label className="col-span-2 text-sm text-[color:var(--color-text)]">
              {t("kitchen.form.name")}
              <input
                type="text"
                value={shoppingName}
                onChange={(e) => setShoppingName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="text-sm text-[color:var(--color-text)]">
              {t("kitchen.form.quantity")}
              <input
                type="number"
                min="1"
                step="1"
                value={shoppingQuantity}
                onChange={(e) => setShoppingQuantity(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="text-sm text-[color:var(--color-text)]">
              {t("kitchen.form.unit")}
              <input
                type="text"
                value={shoppingUnit}
                onChange={(e) => setShoppingUnit(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              className="col-span-2 rounded-xl bg-[color:var(--color-primary)] px-4 py-3 text-sm font-semibold text-[color:var(--color-background)]"
            >
              {t("kitchen.form.addToCart")}
            </button>
          </form>
        ) : null}
      </GlassPanel>

      {error ? (
        <GlassPanel>
          <p className="text-sm text-rose-300">{error}</p>
        </GlassPanel>
      ) : null}

      {message ? (
        <GlassPanel>
          <p className="text-sm text-emerald-300">{message}</p>
        </GlassPanel>
      ) : null}
    </ModuleShell>
  );
}
