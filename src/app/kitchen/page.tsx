"use client";

import { useCallback, useEffect, useState } from "react";
import { ModuleShell } from "@/components/layout/module-shell";
import { KitchenThemeLayer } from "@/components/kitchen/kitchen-theme-layer";
import { SavedRecipes } from "@/components/kitchen/SavedRecipes";
import { fetchHouseholdKitchenAiMeta } from "@/lib/household-kitchen-ai";
import { KitchenItemForm } from "@/components/kitchen/kitchen-item-form";
import { ForgeKitchenLayout } from "@/components/kitchen/layouts/forge-layout";
import { BotanicalKitchenLayout } from "@/components/kitchen/layouts/botanical-layout";
import { PulseKitchenLayout } from "@/components/kitchen/layouts/pulse-layout";
import { HiveKitchenLayout } from "@/components/kitchen/layouts/hive-layout";
import { DefaultKitchenLayout } from "@/components/kitchen/layouts/default-layout";
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

  const urgentInventory = normalInventory
    .filter((item) => item.status === "expiring" || item.status === "low_stock" || Boolean(item.expiry_date))
    .slice(0, 5);

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
      if (effect) triggerThemeActionEffect(effect);
      if (optimisticUpdate) optimisticUpdate();

      try {
        setError(null);
        await action();
        void loadKitchenData();
      } catch (nextError) {
        setError(normalizeKitchenError(nextError, t("household.error.generic")));
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

  const layoutProps = {
    normalInventory,
    urgentInventory,
    expiringToday,
    shopping,
    hasServerByok,
    onAddClick: () => setIsAddFormOpen(true),
    onDeleteInventory: (id: string) => {
      void runKitchenAction(async () => {
        await deleteKitchenInventoryItem({ householdId: householdId!, itemId: id });
      }, t("kitchen.quickAction.move.done"));
    },
    onAddToCart: (name: string, category: string | null) => {
      void runKitchenAction(async () => {
        await addShoppingItem({
          householdId: householdId!,
          title: name,
          quantity: 1,
          category
        });
      }, t("kitchen.quickAction.addCart.done"), { kind: "add", label: name });
    },
    onBought: (id: string) => {
      const item = shopping.find(i => i.id === id);
      void runKitchenAction(
        async () => {
          await moveShoppingItemToInventory({ householdId: householdId!, itemId: id });
        },
        t("kitchen.quickAction.move.done"),
        { kind: "done", label: item?.title || "" },
        () => setShopping(prev => prev.filter(i => i.id !== id))
      );
    },
    onDeleteShopping: (id: string) => {
      void runKitchenAction(async () => {
        await deleteShoppingItem({ householdId: householdId!, itemId: id });
      }, t("kitchen.quickAction.move.done"));
    },
    onPinMeal: async (name: string) => {
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
        triggerThemeActionEffect({ kind: "save", label: name });
      }
    },
    onSaveRecipe: (title: string, instructions: string, metadata: any) => {
      let fullText = instructions ? `${title}\n\n${instructions}` : title;
      if (metadata?.cooking_time || metadata?.temperature) {
        fullText += `\n\n---`;
        if (metadata.cooking_time) fullText += `\n⏱️ ${metadata.cooking_time}`;
        if (metadata.temperature) fullText += `\n🌡️ ${metadata.temperature}`;
      }
      if (metadata?.source_url) fullText += `\n\n🔗 ${metadata.source_url}`;
      if (metadata?.image_url) fullText += `\n\n🖼️ ${metadata.image_url}`;

      void runKitchenAction(async () => {
        await addKitchenInventoryItem({
          householdId: householdId!,
          name: fullText,
          category: "recipe",
          quantity: 1
        });
      }, t("kitchen.saved"), { kind: "save", label: "Recepte" });
    },
    runKitchenAction,
    householdId,
    locale
  };

  const isForge = themeId === "forge";

  return (
    <ModuleShell
      title={t("tile.kitchen")}
      moduleId="kitchen"
      sectionId="kitchen"
      description={t("kitchen.page.description")}
    >
      <KitchenThemeLayer>
        <div className="space-y-10 pt-4 pb-12">
          {themeId === "forge" ? (
            <ForgeKitchenLayout {...layoutProps} />
          ) : themeId === "botanical" ? (
            <BotanicalKitchenLayout {...layoutProps} />
          ) : themeId === "pulse" ? (
            <PulseKitchenLayout {...layoutProps} />
          ) : themeId === "hive" ? (
            <HiveKitchenLayout {...layoutProps} />
          ) : (
            <DefaultKitchenLayout {...layoutProps} />
          )}

          <div className={`pt-6 border-t opacity-90 ${isForge ? 'border-white/5' : 'border-[var(--color-border)]'}`}>
            <SavedRecipes
              items={savedRecipes}
              onDelete={(id) => {
                void runKitchenAction(async () => {
                  await deleteKitchenInventoryItem({ householdId: householdId!, itemId: id });
                }, t("kitchen.quickAction.move.done"));
              }}
            />
          </div>

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

          {error && (
            <div className={`p-4 font-mono uppercase text-[0.6rem] ${isForge ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-red-50 text-red-500 rounded-xl'}`}>
              [ SISTĒMAS_KĻŪDA ]: {error}
            </div>
          )}
        </div>
      </KitchenThemeLayer>
    </ModuleShell>
  );
}
