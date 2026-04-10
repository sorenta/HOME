"use client";

import { useCallback, useEffect, useState } from "react";
import { ModuleShell } from "@/components/layout/module-shell";
import { HouseholdOnboarding } from "@/components/household/household-onboarding";
import { HiddenSeasonalCollectible } from "@/components/seasonal/hidden-seasonal-collectible";
import { KitchenThemeLayer } from "@/components/kitchen/kitchen-theme-layer";
import { GlassPanel } from "@/components/ui/glass-panel";
import { KitchenStock } from "@/components/kitchen/KitchenStock";
import { ShoppingCart } from "@/components/kitchen/ShoppingCart";
import { AiChefSuggestions } from "@/components/kitchen/AiChefSuggestions";
import { SavedRecipes } from "@/components/kitchen/SavedRecipes";
import { fetchHouseholdKitchenAiMeta } from "@/lib/household-kitchen-ai";
import { KitchenHeader } from "@/components/kitchen/KitchenHeader";
import { KitchenItemForm } from "@/components/kitchen/kitchen-item-form";
import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { useThemeActionEffects } from "@/components/theme/theme-action-effects";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useSearchParams } from "next/navigation";
import {
  addKitchenInventoryItem,
  addShoppingItem,
  deleteKitchenInventoryItem,
  deleteShoppingItem,
  fetchKitchenInventory,
  fetchShoppingItems,
  moveShoppingItemToInventory,
  updateShoppingItemStatus,
  type KitchenInventoryRecord,
  type ShoppingRecord,
} from "@/lib/kitchen";
import { addPlannerEventSynced } from "@/lib/events-sync";

function normalizeKitchenError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error && typeof error === "object") {
    const details = error as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown };
    if (typeof details.message === "string" && details.message.trim()) {
      return details.message;
    }
    if (typeof details.details === "string" && details.details.trim()) {
      return details.details;
    }
    if (typeof details.hint === "string" && details.hint.trim()) {
      return details.hint;
    }
    if (typeof details.code === "string" && details.code.trim()) {
      return details.code;
    }
  }

  return fallback;
}

export default function KitchenPage() {
  const { t, locale } = useI18n();
  const { profile } = useAuth();
  const { themeId } = useTheme();
  const { triggerThemeActionEffect } = useThemeActionEffects();
  const searchParams = useSearchParams();

  const [inventory, setInventory] = useState<KitchenInventoryRecord[]>([]);
  const [shopping, setShopping] = useState<ShoppingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [hasServerByok, setHasServerByok] = useState(false);

  const householdId = profile?.household_id ?? null;

  useEffect(() => {
    async function checkByok() {
      const meta = await fetchHouseholdKitchenAiMeta();
      setHasServerByok(Boolean(meta));
    }
    void checkByok();
  }, [profile]);

  const normalInventory = inventory.filter((i) => i.category !== "recipe");
  const savedRecipes = inventory.filter((i) => i.category === "recipe");

  const expiringToday = normalInventory.filter(item => {
    if (!item.expiry_date) return false;
    const today = new Date().toISOString().split("T")[0];
    return item.expiry_date === today;
  });

  const loadKitchenData = useCallback(async (signal?: AbortSignal) => {
    if (!householdId) {
      if (signal?.aborted) return;
      setInventory([]);
      setShopping([]);
      setLoading(false);
      return;
    }

    if (signal?.aborted) return;
    setLoading(true);
    setError(null);

    const [inventoryRows, shoppingRows] = await Promise.all([
      fetchKitchenInventory(householdId),
      fetchShoppingItems(householdId),
    ]);

    if (signal?.aborted) return;
    setInventory(inventoryRows);
    setShopping(shoppingRows);
    setLoading(false);
  }, [householdId]);

  const runKitchenAction = useCallback(
    async (
      action: () => Promise<void>,
      successHint: string,
      effect?: { kind: "add" | "done" | "save"; label: string },
      optimisticUpdate?: () => void
    ) => {
      // 1. OPTIMISTIC UI: Atskaņojam efektu un nomainām state uzreiz (0ms delay)
      if (effect) {
        triggerThemeActionEffect(effect);
      }
      if (optimisticUpdate) {
        optimisticUpdate();
      }

      try {
        setError(null);
        // 2. Sūtām operāciju uz serveri
        await action();
        
        // 3. Fonā ielādējam un izlīdzinām datus
        void loadKitchenData();
        setHintMessage(successHint);
      } catch (nextError) {
        setError(normalizeKitchenError(nextError, t("household.error.generic")));
        // Kļūdas gadījumā ielādējam datus atpakaļ no datubāzes (rollback)
        void loadKitchenData();
      }
    },
    [loadKitchenData, t, triggerThemeActionEffect]
  );

  const handleAddCart = useCallback(() => {
    if (!householdId) return;
    void runKitchenAction(async () => {
      const source = inventory[0]?.name ?? "Pirkums";
      await addShoppingItem({
        householdId,
        title: source,
        quantity: 1,
        suggestedByAi: false,
      });
    }, t("kitchen.quickAction.addCart.done"), { kind: "add", label: inventory[0]?.name ?? "Pirkums" });
  }, [householdId, inventory, runKitchenAction, t]);

  useEffect(() => {
    const controller = new AbortController();
    const frame = requestAnimationFrame(() => {
      void loadKitchenData(controller.signal);
    });

    return () => {
      controller.abort();
      cancelAnimationFrame(frame);
    };
  }, [loadKitchenData]);

  useEffect(() => {
    if (loading || !householdId) return;
    const action = searchParams.get("action");
    if (action === "add-cart") {
      setTimeout(() => {
        handleAddCart();
        window.history.replaceState({}, "", "/kitchen");
      }, 0);
    }
  }, [loading, householdId, searchParams, handleAddCart]);

  const urgentInventory = normalInventory
      .filter((item) => item.status === "expiring" || item.status === "low_stock" || Boolean(item.expiry_date))
      .slice(0, 5);

  const showAiBlocks = false;

  const themeDescription = (({
    forge: locale === "lv" ? "Mājas resursu loģistika un pārtikas krājumu kontrole." : "Home resource logistics and food stock control.",
    lucent: locale === "lv" ? "Dzidrs un caurspīdīgs skats uz mājas pieliekamo." : "A clear and transparent view of the home pantry.",
    botanical: locale === "lv" ? "Zemes augļi un mājas barojošais ritms." : "Fruits of the earth and the home's nourishing rhythm.",
    pulse: locale === "lv" ? "Dinamiska maltīšu plānošana un gatavošanas jauda." : "Dynamic meal planning and cooking power.",
    hive: locale === "lv" ? "Mājas strops – organizēta un kopīga pārtikas plūsma." : "Home hive – organized and shared food flow.",
  } as Record<string, string>)[themeId]) || t("kitchen.page.description");

  if (!householdId) {
    return (
      <ModuleShell
        title={t("tile.kitchen")}
        moduleId="kitchen"
        sectionId="kitchen"
        description={themeDescription}
      >
        <HouseholdOnboarding compact />
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      title={t("tile.kitchen")}
      moduleId="kitchen"
      sectionId="kitchen"
      description={themeDescription}
    >
      <KitchenThemeLayer>
        <HiddenSeasonalCollectible spotId="kitchen" />

        <div className="space-y-10 pt-4 pb-12">
          {themeId === "forge" ? (
            <>
              {/* SECTOR 01: SUPPLY LOGISTICS */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-1 opacity-40">
                  <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 01</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                  <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Loģistikas krājumi</span>
                </div>
                
                <KitchenHeader 
                  cartCount={shopping.filter(i => i.status === "open").length}
                  onAddClick={() => setIsAddFormOpen(true)}
                  onCartClick={() => {
                    const cartEl = document.getElementById("shopping-cart-section");
                    cartEl?.scrollIntoView({ behavior: "smooth" });
                  }}
                />

                <KitchenStock
                  items={normalInventory}
                  onDelete={(id) => {
                    void runKitchenAction(async () => {
                      await deleteKitchenInventoryItem({ householdId: householdId!, itemId: id });
                    }, locale === "lv" ? "Produkts izņemts no krājumiem" : "Product removed from stock");
                  }}
                  onAddToCart={(name, category) => {
                    void runKitchenAction(async () => {
                      await addShoppingItem({
                        householdId: householdId!,
                        title: name,
                        quantity: 1,
                        category
                      });
                    }, t("kitchen.quickAction.addCart.done"), { kind: "add", label: name });
                  }}
                />
              </div>

              {/* SECTOR 02: PROCUREMENT OPERATIONS */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-1 opacity-40">
                  <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 02</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                  <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Iepirkumu operācijas</span>
                </div>
                <ShoppingCart
                  id="shopping-cart-section"
                  items={shopping.filter(i => i.status === "open")}
                  onBought={(id) => {
                    const item = shopping.find(i => i.id === id);
                    void runKitchenAction(
                      async () => {
                        await moveShoppingItemToInventory({ householdId: householdId!, itemId: id });
                      },
                      t("kitchen.quickAction.move.done"),
                      { kind: "done", label: item?.title || "" },
                      () => setShopping(prev => prev.filter(i => i.id !== id))
                    );
                  }}
                  onDelete={(id) => {
                    void runKitchenAction(async () => {
                      await deleteShoppingItem({ householdId: householdId!, itemId: id });
                    }, locale === "lv" ? "Ieraksts izdzēsts" : "Item deleted");
                  }}
                />
              </div>

              {/* SECTOR 03: INTELLIGENCE & PLANNING */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-1 opacity-40">
                  <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 03</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                  <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Intelekts un plānošana</span>
                </div>
                <AiChefSuggestions
                  inventory={normalInventory}
                  urgentItems={urgentInventory}
                  hasByok={hasServerByok}
                  onAddToCart={(name) => {
                    void runKitchenAction(async () => {
                      await addShoppingItem({
                        householdId: householdId!,
                        title: name,
                        quantity: 1
                      });
                    }, t("kitchen.quickAction.addCart.done"), { kind: "add", label: name });
                  }}
                  onPinMeal={async (name) => {
                    if (!householdId) return;
                    const today = new Date().toISOString().split("T")[0];
                    const response = await addPlannerEventSynced({
                      householdId,
                      userId: profile?.id ?? null,
                      title: `Vakariņas: ${name}`,
                      date: today,
                      style: "shared",
                      kind: "meal"
                    });
                    
                    if (response.ok) {
                      setHintMessage(`${locale === "lv" ? "Maltīte piesprausta šodienas kalendārā" : "Meal pinned to today's calendar"}: ${name}`);
                      triggerThemeActionEffect({ kind: "save", label: name });
                    } else {
                      setError(response.message);
                    }
                  }}
                  onSaveRecipe={(recipe) => {
                    void runKitchenAction(async () => {
                      await addKitchenInventoryItem({
                        householdId: householdId!,
                        name: recipe,
                        category: "recipe",
                        quantity: 1
                      });
                    }, locale === "lv" ? "Recepte saglabāta" : "Recipe saved", { kind: "save", label: "Recepte" });
                  }}
                />
                <SavedRecipes
                  items={savedRecipes}
                  onDelete={(id) => {
                    void runKitchenAction(async () => {
                      await deleteKitchenInventoryItem({ householdId: householdId!, itemId: id });
                    }, locale === "lv" ? "Recepte dzēsta" : "Recipe deleted");
                  }}
                />
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <KitchenHeader 
                cartCount={shopping.filter(i => i.status === "open").length}
                onAddClick={() => setIsAddFormOpen(true)}
                onCartClick={() => {
                  const cartEl = document.getElementById("shopping-cart-section");
                  cartEl?.scrollIntoView({ behavior: "smooth" });
                }}
              />

              {expiringToday.length > 0 && (
                <GlassPanel className="border-amber-500/50 bg-amber-500/5">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[var(--color-text-primary)]">
                        {locale === "lv" ? "Derīguma termiņš beidzas šodien!" : "Expires today!"}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {expiringToday.map(i => i.name).join(", ")}. {locale === "lv" ? "Vai jau izlietoji?" : "Did you use it already?"}
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        void runKitchenAction(async () => {
                          for (const item of expiringToday) {
                            await deleteKitchenInventoryItem({ householdId: householdId!, itemId: item.id });
                          }
                        }, locale === "lv" ? "Krājumi atjaunināti" : "Inventory updated");
                      }}
                      className="px-3 py-1 text-[0.6rem] font-black uppercase tracking-widest bg-amber-500 text-white rounded-full"
                    >
                      {locale === "lv" ? "JĀ, IZLIETOJU" : "YES, USED IT"}
                    </button>
                  </div>
                </GlassPanel>
              )}

              <KitchenStock
                items={normalInventory}
                onDelete={(id) => {
                  void runKitchenAction(async () => {
                    await deleteKitchenInventoryItem({ householdId: householdId!, itemId: id });
                  }, locale === "lv" ? "Produkts izņemts no krājumiem" : "Product removed from stock");
                }}
                onAddToCart={(name, category) => {
                  void runKitchenAction(async () => {
                    await addShoppingItem({
                      householdId: householdId!,
                      title: name,
                      quantity: 1,
                      category
                    });
                  }, t("kitchen.quickAction.addCart.done"), { kind: "add", label: name });
                }}
              />

              <ShoppingCart
                id="shopping-cart-section"
                items={shopping.filter(i => i.status === "open")}
                onBought={(id) => {
                  const item = shopping.find(i => i.id === id);
                  void runKitchenAction(
                    async () => {
                      await moveShoppingItemToInventory({ householdId: householdId!, itemId: id });
                    },
                    t("kitchen.quickAction.move.done"),
                    { kind: "done", label: item?.title || "" },
                    () => setShopping(prev => prev.filter(i => i.id !== id))
                  );
                }}
                onDelete={(id) => {
                  void runKitchenAction(async () => {
                    await deleteShoppingItem({ householdId: householdId!, itemId: id });
                  }, locale === "lv" ? "Ieraksts izdzēsts" : "Item deleted");
                }}
              />

              <AiChefSuggestions
                inventory={normalInventory}
                urgentItems={urgentInventory}
                hasByok={hasServerByok}
                onAddToCart={(name) => {
                  void runKitchenAction(async () => {
                    await addShoppingItem({
                      householdId: householdId!,
                      title: name,
                      quantity: 1
                    });
                  }, t("kitchen.quickAction.addCart.done"), { kind: "add", label: name });
                }}
                onPinMeal={async (name) => {
                  if (!householdId) return;
                  const today = new Date().toISOString().split("T")[0];
                  const response = await addPlannerEventSynced({
                    householdId,
                    userId: profile?.id ?? null,
                    title: `Vakariņas: ${name}`,
                    date: today,
                    style: "shared",
                    kind: "meal"
                  });
                  
                  if (response.ok) {
                    setHintMessage(`${locale === "lv" ? "Maltīte piesprausta šodienas kalendārā" : "Meal pinned to today's calendar"}: ${name}`);
                    triggerThemeActionEffect({ kind: "save", label: name });
                  } else {
                    setError(response.message);
                  }
                }}
                onSaveRecipe={(recipe) => {
                  void runKitchenAction(async () => {
                    await addKitchenInventoryItem({
                      householdId: householdId!,
                      name: recipe,
                      category: "recipe",
                      quantity: 1
                    });
                  }, locale === "lv" ? "Recepte saglabāta" : "Recipe saved", { kind: "save", label: "Recepte" });
                }}
              />
              <SavedRecipes
                items={savedRecipes}
                onDelete={(id) => {
                  void runKitchenAction(async () => {
                    await deleteKitchenInventoryItem({ householdId: householdId!, itemId: id });
                  }, locale === "lv" ? "Recepte dzēsta" : "Recipe deleted");
                }}
              />
            </div>
          )}

          {isAddFormOpen && (
            <KitchenItemForm
              locale={locale}
              onCancel={() => setIsAddFormOpen(false)}
              onSave={(data) => {
                const existing = inventory.find((item) => item.name.trim().toLowerCase() === data.name.trim().toLowerCase());
                if (existing) {
                  setError(locale === "lv" ? `Tev mājās jau ir ${data.name} :)` : `You already have ${data.name} at home :)`);
                  return;
                }
                setIsAddFormOpen(false);
                void runKitchenAction(async () => {
                  await addKitchenInventoryItem({
                    householdId: householdId!,
                    name: data.name,
                    quantity: data.quantity,
                    expiryDate: data.expiryDate,
                    category: data.category
                  });
                }, t("kitchen.saved"), { kind: "add", label: data.name });
              }}
            />
          )}

          {loading ? (
            <GlassPanel style={{ background: "color-mix(in srgb, var(--color-surface) 90%, transparent)" }}>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {t("kitchen.loading")}
              </p>
            </GlassPanel>
          ) : null}

          {error ? (
            <GlassPanel style={{ background: "color-mix(in srgb, var(--color-surface) 90%, transparent)" }}>
              <p className="text-sm" style={{ color: "var(--color-text-primary)" }}>
                {error}
              </p>
            </GlassPanel>
          ) : null}
        </div>
      </KitchenThemeLayer>
    </ModuleShell>
  );
}
