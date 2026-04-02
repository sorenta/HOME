"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HouseholdOnboarding } from "@/components/household/household-onboarding";
import { KitchenOnboardingSurvey } from "@/components/kitchen/kitchen-onboarding-survey";
import { KitchenAiPanel } from "@/components/kitchen/kitchen-ai-panel";
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
  updateShoppingItemStatus,
  type KitchenInventoryRecord,
  type ShoppingRecord,
} from "@/lib/kitchen";
import { kitchenOnboardingStorageKey, type KitchenOnboardingCategoryId } from "@/lib/kitchen-onboarding";
import {
  KITCHEN_CATEGORY_SLUGS,
  kitchenCategoryLabelKey,
} from "@/lib/kitchen-categories";
import {
  kitchenAutofillDatalistId,
  kitchenAutofillOptions,
  recordKitchenAutofillUsage,
} from "@/lib/kitchen-autofill";
import { formatAppDate } from "@/lib/date-format";
import { getBrowserClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";

function mapOnboardingCategory(id: KitchenOnboardingCategoryId): string {
  if (id === "dairy") return "dairy";
  if (id === "vegetables") return "veg";
  if (id === "protein") return "meat";
  return "dry";
}

export default function KitchenPage() {
  const { t, locale } = useI18n();
  const { profile, user } = useAuth();
  const [inventory, setInventory] = useState<KitchenInventoryRecord[]>([]);
  const [shopping, setShopping] = useState<ShoppingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [inventoryName, setInventoryName] = useState("");
  const [inventoryQuantity, setInventoryQuantity] = useState("1");
  const [inventoryUnit, setInventoryUnit] = useState("");
  const [inventoryExpiry, setInventoryExpiry] = useState("");
  const [inventoryCategorySlug, setInventoryCategorySlug] = useState("");
  const [shoppingName, setShoppingName] = useState("");
  const [shoppingQuantity, setShoppingQuantity] = useState("1");
  const [shoppingUnit, setShoppingUnit] = useState("");
  const [shoppingCategorySlug, setShoppingCategorySlug] = useState("");
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [showShoppingForm, setShowShoppingForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showOnboardingSurvey, setShowOnboardingSurvey] = useState(false);
  const [savingOnboarding, setSavingOnboarding] = useState(false);
  const [homeCategoryFilter, setHomeCategoryFilter] = useState<string>("__all__");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

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

  const autofillListId = householdId ? kitchenAutofillDatalistId(householdId) : "kitchen-autofill";

  const distinctHomeCategories = useMemo(() => {
    const set = new Set<string>();
    for (const item of inventory) {
      const s = (item.category ?? "").trim();
      set.add(s || "__none__");
    }
    return [...set];
  }, [inventory]);

  const filteredHomeInventory = useMemo(() => {
    if (homeCategoryFilter === "__all__") return inventory;
    if (homeCategoryFilter === "__none__") {
      return inventory.filter((i) => !(i.category ?? "").trim());
    }
    return inventory.filter((i) => (i.category ?? "").trim() === homeCategoryFilter);
  }, [inventory, homeCategoryFilter]);

  const inventoryByCategorySection = useMemo(() => {
    const map = new Map<string, KitchenInventoryRecord[]>();
    for (const item of filteredHomeInventory) {
      const key = (item.category ?? "").trim() || "__none__";
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    const order = [...KITCHEN_CATEGORY_SLUGS.map(String), "__none__"];
    return [...map.entries()].sort(([a], [b]) => {
      const ia = order.indexOf(a === "" ? "__none__" : a);
      const ib = order.indexOf(b === "" ? "__none__" : b);
      const sa = ia === -1 ? 999 : ia;
      const sb = ib === -1 ? 999 : ib;
      if (sa !== sb) return sa - sb;
      return a.localeCompare(b);
    });
  }, [filteredHomeInventory]);

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
        category: inventoryCategorySlug || null,
      });
      recordKitchenAutofillUsage({
        householdId,
        name: inventoryName,
        category: inventoryCategorySlug || null,
      });
      setInventoryName("");
      setInventoryQuantity("1");
      setInventoryUnit("");
      setInventoryExpiry("");
      setInventoryCategorySlug("");
      setShowInventoryForm(false);
      setMessage(t("kitchen.saved"));
      hapticTap();
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
        category: shoppingCategorySlug || null,
        suggestedByAi: false,
      });
      recordKitchenAutofillUsage({
        householdId,
        name: shoppingName,
        category: shoppingCategorySlug || null,
      });
      setShoppingName("");
      setShoppingQuantity("1");
      setShoppingUnit("");
      setShoppingCategorySlug("");
      setShowShoppingForm(false);
      setMessage(t("kitchen.saved"));
      hapticTap();
      await loadKitchenData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("household.error.generic"));
    }
  }

  async function handleInventoryDelete(itemId: string) {
    if (!householdId) return;
    setError(null);
    setMessage(null);

    try {
      await deleteKitchenInventoryItem({ householdId, itemId });
      setSelectedId(null);
      setMessage(t("kitchen.saved"));
      hapticTap();
      await loadKitchenData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("household.error.generic"));
    }
  }

  async function handleShoppingStatus(
    itemId: string,
    status: "open" | "picked" | "archived",
  ) {
    if (!householdId) return;
    setError(null);
    setMessage(null);

    try {
      await updateShoppingItemStatus({ householdId, itemId, status });
      if (status === "archived") {
        setSelectedId(null);
      }
      setMessage(t("kitchen.saved"));
      hapticTap();
      await loadKitchenData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("household.error.generic"));
    }
  }

  async function handleMoveToInventory(itemId: string) {
    if (!householdId) return;
    setError(null);
    setMessage(null);

    try {
      await moveShoppingItemToInventory({ householdId, itemId });
      setSelectedId(null);
      setMessage(t("kitchen.moved"));
      hapticTap();
      await loadKitchenData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("household.error.generic"));
    }
  }

  async function addProductToCart(item: KitchenInventoryRecord) {
    if (!householdId) return;
    setError(null);
    try {
      await addShoppingItem({
        householdId,
        title: item.name,
        quantity: 1,
        unit: item.unit ?? undefined,
        category: item.category ?? null,
        suggestedByAi: false,
      });
      hapticTap();
      await loadKitchenData();
      setMessage(t("kitchen.saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("household.error.generic"));
    }
  }

  async function applyAllAiSuggestions() {
    if (!householdId || aiSuggestions.length === 0) return;
    setError(null);
    const existing = new Set(shopping.map((s) => s.title.trim().toLowerCase()));
    try {
      for (const name of aiSuggestions) {
        const n = name.trim();
        if (!n || existing.has(n.toLowerCase())) continue;
        await addShoppingItem({
          householdId,
          title: n,
          quantity: 1,
          suggestedByAi: true,
        });
        existing.add(n.toLowerCase());
      }
      hapticTap();
      await loadKitchenData();
      setMessage(t("kitchen.saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("household.error.generic"));
    }
  }

  async function handleKitchenOnboardingComplete(
    items: Array<{ name: string; unit?: string; category: KitchenOnboardingCategoryId }>,
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
            category: mapOnboardingCategory(item.category),
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
      <GlassPanel className="space-y-3">
        <SectionHeading title={t("kitchen.section.ai")} detail={t("kitchen.assistant")} />
        <KitchenAiPanel
          householdId={householdId}
          inventory={inventory}
          shopping={shopping}
          onReload={loadKitchenData}
          onMissingListChange={setAiSuggestions}
        />
      </GlassPanel>

      <GlassPanel className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionHeading title={t("kitchen.section.cart")} detail={`${shopping.length}`} />
          <button
            type="button"
            onClick={() => setShowShoppingForm((v) => !v)}
            className="rounded-xl border border-[color:var(--color-surface-border)] px-3 py-2 text-sm text-[color:var(--color-text)]"
          >
            {showShoppingForm ? t("kitchen.hideForm") : t("kitchen.form.shopping")}
          </button>
        </div>
        {aiSuggestions.length > 0 ? (
          <div className="rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]/30 p-3">
            <p className="text-sm font-medium text-[color:var(--color-text)]">{t("kitchen.applyAiList")}</p>
            <p className="mt-1 text-xs text-[color:var(--color-secondary)]">{t("kitchen.applyAiList.hint")}</p>
            <button
              type="button"
              onClick={() => void applyAllAiSuggestions()}
              className="mt-2 w-full rounded-xl bg-[color:var(--color-primary)] px-4 py-2 text-sm font-semibold text-[color:var(--color-background)]"
            >
              {t("kitchen.applyAiList")}
            </button>
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-[color:var(--color-secondary)]">{t("kitchen.loading")}</p>
        ) : shopping.length === 0 ? (
          <p className="text-sm text-[color:var(--color-secondary)]">{t("kitchen.empty.cart")}</p>
        ) : (
          <div className="space-y-2">
            {shopping.map((item) => (
              <div key={item.id} className="rounded-2xl border border-[color:var(--color-surface-border)] p-2">
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedId((current) => (current === item.id ? null : item.id))
                    }
                    className="min-w-0 flex-1 text-left"
                  >
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
                      {item.suggested_by_ai ? ` · ${t("kitchen.ai.tag")}` : ""}
                    </p>
                  </button>
                  <StatusPill tone={shoppingTone(item.status)}>{item.status}</StatusPill>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.status === "open" ? (
                    <button
                      type="button"
                      onClick={() => void handleShoppingStatus(item.id, "picked")}
                      className="rounded-lg border border-[color:var(--color-surface-border)] px-2 py-1 text-xs font-medium text-[color:var(--color-text)]"
                    >
                      {t("kitchen.action.picked")}
                    </button>
                  ) : null}
                  {selectedId === item.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          item.status === "picked"
                            ? void handleShoppingStatus(item.id, "open")
                            : void handleMoveToInventory(item.id)
                        }
                        className="rounded-lg border border-[color:var(--color-surface-border)] px-2 py-1 text-xs text-[color:var(--color-text)]"
                      >
                        {item.status === "picked"
                          ? t("kitchen.action.reopen")
                          : t("kitchen.action.moveToInventory")}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleShoppingStatus(item.id, "archived")}
                        className="rounded-lg border border-[color:var(--color-surface-border)] px-2 py-1 text-xs text-[color:var(--color-secondary)]"
                      >
                        {t("kitchen.action.archive")}
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {showShoppingForm ? (
          <form
            className="grid grid-cols-2 gap-3 border-t border-[color:var(--color-surface-border)] pt-3"
            onSubmit={handleShoppingSubmit}
          >
            <label className="col-span-2 text-sm text-[color:var(--color-text)]">
              {t("kitchen.form.name")}
              <input
                type="text"
                value={shoppingName}
                onChange={(e) => setShoppingName(e.target.value)}
                list={autofillListId}
                className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="col-span-2 text-sm text-[color:var(--color-text)]">
              {t("kitchen.category")}
              <select
                value={shoppingCategorySlug}
                onChange={(e) => setShoppingCategorySlug(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm text-[color:var(--color-text)]"
              >
                <option value="">{t("kitchen.category.none")}</option>
                {KITCHEN_CATEGORY_SLUGS.map((slug) => (
                  <option key={slug} value={slug}>
                    {t(`kitchen.category.${slug}`)}
                  </option>
                ))}
              </select>
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

      <GlassPanel className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionHeading title={t("kitchen.section.home")} detail={`${inventory.length}`} />
          <button
            type="button"
            onClick={() => setShowInventoryForm((v) => !v)}
            className="rounded-xl border border-[color:var(--color-surface-border)] px-3 py-2 text-sm text-[color:var(--color-text)]"
          >
            {showInventoryForm ? t("kitchen.hideForm") : t("kitchen.form.inventory")}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setHomeCategoryFilter("__all__")}
            className={[
              "rounded-full border px-3 py-1 text-xs font-medium",
              homeCategoryFilter === "__all__"
                ? "border-[color:var(--color-primary)] bg-[color:var(--color-surface-border)]"
                : "border-[color:var(--color-surface-border)] text-[color:var(--color-secondary)]",
            ].join(" ")}
          >
            {t("kitchen.filter.all")}
          </button>
          {distinctHomeCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setHomeCategoryFilter(cat === "__none__" ? "__none__" : cat)}
              className={[
                "rounded-full border px-3 py-1 text-xs font-medium",
                (cat === "__none__" ? homeCategoryFilter === "__none__" : homeCategoryFilter === cat)
                  ? "border-[color:var(--color-primary)] bg-[color:var(--color-surface-border)]"
                  : "border-[color:var(--color-surface-border)] text-[color:var(--color-secondary)]",
              ].join(" ")}
            >
              {cat === "__none__" ? t("kitchen.category.none") : t(kitchenCategoryLabelKey(cat))}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-[color:var(--color-secondary)]">{t("kitchen.loading")}</p>
        ) : filteredHomeInventory.length === 0 ? (
          <p className="text-sm text-[color:var(--color-secondary)]">{t("kitchen.empty.stock")}</p>
        ) : (
          <div className="space-y-3">
            {inventoryByCategorySection.map(([catKey, items]) => (
              <details
                key={catKey || "none"}
                className="rounded-2xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)]/25"
                open
              >
                <summary className="cursor-pointer list-none px-3 py-3 font-semibold text-[color:var(--color-text)] [&::-webkit-details-marker]:hidden">
                  {catKey === "__none__" ? t("kitchen.category.none") : t(kitchenCategoryLabelKey(catKey))}
                  <span className="ml-2 text-xs font-normal text-[color:var(--color-secondary)]">
                    ({items.length})
                  </span>
                </summary>
                <div className="space-y-2 border-t border-[color:var(--color-surface-border)] px-2 pb-3 pt-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[color:var(--color-surface-border)] px-2 py-2"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-[color:var(--color-text)]">{item.name}</p>
                        <p className="text-xs text-[color:var(--color-secondary)]">
                          {formatQuantity(item.quantity, item.unit)}
                          {item.expiry_date
                            ? ` · ${formatAppDate(item.expiry_date, locale) ?? item.expiry_date}`
                            : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <StatusPill tone={inventoryTone(item.status)}>{item.status}</StatusPill>
                        <button
                          type="button"
                          onClick={() => void addProductToCart(item)}
                          className="rounded-lg border border-[color:var(--color-primary)] px-2 py-1 text-xs font-medium text-[color:var(--color-primary)]"
                        >
                          {t("kitchen.toCart")}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleInventoryDelete(item.id)}
                          className="rounded-lg border border-[color:var(--color-surface-border)] px-2 py-1 text-xs text-[color:var(--color-secondary)]"
                        >
                          {t("kitchen.action.remove")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}

        {showInventoryForm ? (
          <form
            className="grid grid-cols-2 gap-3 border-t border-[color:var(--color-surface-border)] pt-3"
            onSubmit={handleInventorySubmit}
          >
            <datalist id={autofillListId}>
              {(householdId ? kitchenAutofillOptions(householdId, inventoryCategorySlug || undefined) : []).map(
                (name) => (
                  <option key={name} value={name} />
                ),
              )}
            </datalist>
            <label className="col-span-2 text-sm text-[color:var(--color-text)]">
              {t("kitchen.form.name")}
              <input
                type="text"
                value={inventoryName}
                onChange={(e) => setInventoryName(e.target.value)}
                list={autofillListId}
                className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="col-span-2 text-sm text-[color:var(--color-text)]">
              {t("kitchen.category")}
              <select
                value={inventoryCategorySlug}
                onChange={(e) => setInventoryCategorySlug(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[color:var(--color-surface-border)] bg-transparent px-3 py-2 text-sm text-[color:var(--color-text)]"
              >
                <option value="">{t("kitchen.category.none")}</option>
                {KITCHEN_CATEGORY_SLUGS.map((slug) => (
                  <option key={slug} value={slug}>
                    {t(`kitchen.category.${slug}`)}
                  </option>
                ))}
              </select>
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
                lang={locale === "lv" ? "lv-LV" : "en-US"}
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
      </GlassPanel>

      {showOnboardingSurvey ? (
        <KitchenOnboardingSurvey
          onComplete={handleKitchenOnboardingComplete}
          onSkip={handleKitchenOnboardingSkip}
          saving={savingOnboarding}
        />
      ) : null}

      {error ? (
        <GlassPanel>
          <p className="text-sm text-[color:var(--color-text)]">{error}</p>
        </GlassPanel>
      ) : null}

      {message ? (
        <GlassPanel>
          <p className="text-sm text-[color:var(--color-text)]">{message}</p>
        </GlassPanel>
      ) : null}
    </ModuleShell>
  );
}
