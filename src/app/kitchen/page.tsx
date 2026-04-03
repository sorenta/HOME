"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HouseholdOnboarding } from "@/components/household/household-onboarding";
import { KitchenOnboardingSurvey } from "@/components/kitchen/kitchen-onboarding-survey";
import { KitchenAiPanel } from "@/components/kitchen/kitchen-ai-panel";
import { KitchenThemeLayer, useKitchenItemTheme } from "@/components/kitchen/kitchen-theme-layer";
import { useAuth } from "@/components/providers/auth-provider";
import { ModuleShell } from "@/components/layout/module-shell";
import { HiddenSeasonalCollectible } from "@/components/seasonal/hidden-seasonal-collectible";
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
  const { itemCard: themeItemCard, categoryPill: themeCategoryPill, detailsSection: themeDetailsSection } = useKitchenItemTheme();

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
     <KitchenThemeLayer>
      <HiddenSeasonalCollectible spotId="kitchen" />
      {/* AI ASSISTANT PANELIS */}
      <GlassPanel className="space-y-4">
        <SectionHeading title={t("kitchen.section.ai")} detail={t("kitchen.assistant")} />
        <KitchenAiPanel
          householdId={householdId}
          inventory={inventory}
          shopping={shopping}
          onReload={loadKitchenData}
          onMissingListChange={setAiSuggestions}
        />
      </GlassPanel>

      {/* IEPIRKUMU GROZS */}
      <GlassPanel className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionHeading title={t("kitchen.section.cart")} detail={`${shopping.length}`} />
          <button
            type="button"
            onClick={() => setShowShoppingForm((v) => !v)}
            className="rounded-theme border border-border bg-background/50 px-4 py-2 text-sm font-medium text-foreground hover:bg-foreground/5 transition-colors"
          >
            {showShoppingForm ? t("kitchen.hideForm") : t("kitchen.form.shopping")}
          </button>
        </div>
        
        {aiSuggestions.length > 0 ? (
          <div className="rounded-theme border border-primary/30 bg-primary/5 p-4 shadow-sm">
            <p className="text-sm font-bold text-foreground">{t("kitchen.applyAiList")}</p>
            <p className="mt-1 text-xs text-foreground/70">{t("kitchen.applyAiList.hint")}</p>
            <button
              type="button"
              onClick={() => void applyAllAiSuggestions()}
              className="mt-3 w-full rounded-theme bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {t("kitchen.applyAiList")}
            </button>
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-foreground/60 p-2">{t("kitchen.loading")}</p>
        ) : shopping.length === 0 ? (
          <p className="text-sm text-foreground/60 italic p-2">{t("kitchen.empty.cart")}</p>
        ) : (
          <div className="space-y-2">
            {shopping.map((item) => (
              <div key={item.id} className={`rounded-theme border border-border p-3 bg-background/40 transition-all hover:border-primary/50 ${themeItemCard}`}>
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedId((current) => (current === item.id ? null : item.id))}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className={`font-semibold text-foreground text-sm ${item.status === "picked" ? "line-through opacity-50" : ""}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-foreground/60 font-medium mt-0.5">
                      {formatQuantity(item.quantity, item.unit)}
                      {item.suggested_by_ai ? ` · ${t("kitchen.ai.tag")}` : ""}
                    </p>
                  </button>
                  <StatusPill tone={shoppingTone(item.status)}>{item.status}</StatusPill>
                </div>
                
                {selectedId === item.id && (
                  <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-border/50">
                    {item.status === "open" ? (
                      <button
                        type="button"
                        onClick={() => void handleShoppingStatus(item.id, "picked")}
                        className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground hover:bg-foreground/5 transition-colors"
                      >
                        {t("kitchen.action.picked")}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() =>
                        item.status === "picked"
                          ? void handleShoppingStatus(item.id, "open")
                          : void handleMoveToInventory(item.id)
                      }
                      className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground hover:bg-foreground/5 transition-colors"
                    >
                      {item.status === "picked" ? t("kitchen.action.reopen") : t("kitchen.action.moveToInventory")}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleShoppingStatus(item.id, "archived")}
                      className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      {t("kitchen.action.archive")}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showShoppingForm ? (
          <form className="grid grid-cols-2 gap-3 border-t border-border pt-4" onSubmit={handleShoppingSubmit}>
            <label className="col-span-2 text-xs font-bold uppercase tracking-wider text-foreground/70">
              {t("kitchen.form.name")}
              <input
                type="text"
                value={shoppingName}
                onChange={(e) => setShoppingName(e.target.value)}
                list={autofillListId}
                className="mt-1.5 w-full rounded-theme border border-border bg-background/50 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                required
              />
            </label>
            <label className="col-span-2 text-xs font-bold uppercase tracking-wider text-foreground/70">
              {t("kitchen.category")}
              <select
                value={shoppingCategorySlug}
                onChange={(e) => setShoppingCategorySlug(e.target.value)}
                className="mt-1.5 w-full rounded-theme border border-border bg-background/50 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              >
                <option value="">{t("kitchen.category.none")}</option>
                {KITCHEN_CATEGORY_SLUGS.map((slug) => (
                  <option key={slug} value={slug}>
                    {t(`kitchen.category.${slug}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/70">
              {t("kitchen.form.quantity")}
              <input
                type="number"
                min="1"
                step="1"
                value={shoppingQuantity}
                onChange={(e) => setShoppingQuantity(e.target.value)}
                className="mt-1.5 w-full rounded-theme border border-border bg-background/50 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                required
              />
            </label>
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/70">
              {t("kitchen.form.unit")}
              <input
                type="text"
                value={shoppingUnit}
                onChange={(e) => setShoppingUnit(e.target.value)}
                className="mt-1.5 w-full rounded-theme border border-border bg-background/50 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </label>
            <button
              type="submit"
              className="col-span-2 rounded-theme bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {t("kitchen.form.addToCart")}
            </button>
          </form>
        ) : null}
      </GlassPanel>

      <GlassPanel className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionHeading title={t("kitchen.section.home")} detail={`${inventory.length}`} />
          <button
            type="button"
            onClick={() => setShowInventoryForm((v) => !v)}
            className="rounded-theme border border-border bg-background/50 px-4 py-2 text-sm font-medium text-foreground hover:bg-foreground/5 transition-colors"
          >
            {showInventoryForm ? t("kitchen.hideForm") : t("kitchen.form.inventory")}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setHomeCategoryFilter("__all__")}
            className={[
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              homeCategoryFilter === "__all__"
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-foreground/70 hover:bg-foreground/5",
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
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                (cat === "__none__" ? homeCategoryFilter === "__none__" : homeCategoryFilter === cat)
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-foreground/70 hover:bg-foreground/5",
              ].join(" ")}
            >
              {cat === "__none__" ? t("kitchen.category.none") : t(kitchenCategoryLabelKey(cat))}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-foreground/60 p-2">{t("kitchen.loading")}</p>
        ) : filteredHomeInventory.length === 0 ? (
          <p className="text-sm text-foreground/60 italic p-2">{t("kitchen.empty.stock")}</p>
        ) : (
          <div className="space-y-3">
            {inventoryByCategorySection.map(([catKey, items]) => (
              <details
                key={catKey || "none"}
                className={`rounded-theme border border-border bg-background/40 shadow-sm ${themeDetailsSection}`}
                open
              >
                <summary className="cursor-pointer list-none px-3 py-3 font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                  {catKey === "__none__" ? t("kitchen.category.none") : t(kitchenCategoryLabelKey(catKey))}
                  <span className="ml-2 text-xs font-normal text-foreground/60">({items.length})</span>
                </summary>
                <div className="space-y-2 border-t border-border/50 px-2 pb-3 pt-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex flex-wrap items-center justify-between gap-2 rounded-theme border border-border bg-background/30 px-3 py-2.5 ${themeItemCard}`}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground">{item.name}</p>
                        <p className="text-xs text-foreground/60 font-medium mt-0.5">
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
                          className="rounded-md border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
                        >
                          {t("kitchen.toCart")}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleInventoryDelete(item.id)}
                          className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground/70 hover:bg-foreground/5 transition-colors"
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
          <form className="grid grid-cols-2 gap-3 border-t border-border pt-4" onSubmit={handleInventorySubmit}>
            <datalist id={autofillListId}>
              {(householdId ? kitchenAutofillOptions(householdId, inventoryCategorySlug || undefined) : []).map(
                (name) => (
                  <option key={name} value={name} />
                ),
              )}
            </datalist>
            <label className="col-span-2 text-xs font-bold uppercase tracking-wider text-foreground/70">
              {t("kitchen.form.name")}
              <input
                type="text"
                value={inventoryName}
                onChange={(e) => setInventoryName(e.target.value)}
                list={autofillListId}
                className="mt-1.5 w-full rounded-theme border border-border bg-background/50 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                required
              />
            </label>
            <label className="col-span-2 text-xs font-bold uppercase tracking-wider text-foreground/70">
              {t("kitchen.category")}
              <select
                value={inventoryCategorySlug}
                onChange={(e) => setInventoryCategorySlug(e.target.value)}
                className="mt-1.5 w-full rounded-theme border border-border bg-background/50 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              >
                <option value="">{t("kitchen.category.none")}</option>
                {KITCHEN_CATEGORY_SLUGS.map((slug) => (
                  <option key={slug} value={slug}>
                    {t(`kitchen.category.${slug}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/70">
              {t("kitchen.form.quantity")}
              <input
                type="number"
                min="1"
                step="1"
                value={inventoryQuantity}
                onChange={(e) => setInventoryQuantity(e.target.value)}
                className="mt-1.5 w-full rounded-theme border border-border bg-background/50 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                required
              />
            </label>
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/70">
              {t("kitchen.form.unit")}
              <input
                type="text"
                value={inventoryUnit}
                onChange={(e) => setInventoryUnit(e.target.value)}
                className="mt-1.5 w-full rounded-theme border border-border bg-background/50 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </label>
            <label className="col-span-2 text-xs font-bold uppercase tracking-wider text-foreground/70">
              {t("kitchen.form.expiry")}
              <input
                type="date"
                lang={locale === "lv" ? "lv-LV" : "en-US"}
                value={inventoryExpiry}
                onChange={(e) => setInventoryExpiry(e.target.value)}
                className="mt-1.5 w-full rounded-theme border border-border bg-background/50 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </label>
            <button
              type="submit"
              className="col-span-2 rounded-theme bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
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
          <p className="text-sm text-foreground">{error}</p>
        </GlassPanel>
      ) : null}

      {message ? (
        <GlassPanel>
          <p className="text-sm text-foreground">{message}</p>
        </GlassPanel>
      ) : null}
     </KitchenThemeLayer>
    </ModuleShell>
  );
}