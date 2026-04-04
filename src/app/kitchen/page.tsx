"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ModuleShell } from "@/components/layout/module-shell";
import { HouseholdOnboarding } from "@/components/household/household-onboarding";
import { HiddenSeasonalCollectible } from "@/components/seasonal/hidden-seasonal-collectible";
import { KitchenThemeLayer } from "@/components/kitchen/kitchen-theme-layer";
import { GlassPanel } from "@/components/ui/glass-panel";
import { KitchenQuickActions } from "@/components/kitchen/KitchenQuickActions";
import { InventoryPreview } from "@/components/kitchen/InventoryPreview";
import { UrgentItemsCard } from "@/components/kitchen/UrgentItemsCard";
import { CartPreview } from "@/components/kitchen/CartPreview";
import { AiChefSuggestions } from "@/components/kitchen/AiChefSuggestions";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/lib/i18n/i18n-context";
import {
  addKitchenInventoryItem,
  addShoppingItem,
  fetchKitchenInventory,
  fetchShoppingItems,
  moveShoppingItemToInventory,
  updateShoppingItemStatus,
  type KitchenInventoryRecord,
  type ShoppingRecord,
} from "@/lib/kitchen";
import {
  getProviderKeyFromStorage,
  validateProviderKey,
  type AiProvider,
} from "@/lib/ai/keys";

type LocalSettings = {
  aiEnabled: boolean;
  aiRecipes: boolean;
};

const SETTINGS_KEY = "majapps-local-settings";

function readLocalSettings(): LocalSettings {
  const fallback: LocalSettings = {
    aiEnabled: false,
    aiRecipes: false,
  };

  if (typeof window === "undefined") return fallback;

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function hasValidByokKey(): boolean {
  const providers: AiProvider[] = ["gemini", "openai"];
  for (const provider of providers) {
    const key = (getProviderKeyFromStorage(provider) ?? "").trim();
    if (validateProviderKey(provider, key) === null) {
      return true;
    }
  }
  return false;
}

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
  const { t } = useI18n();
  const { profile } = useAuth();

  const [inventory, setInventory] = useState<KitchenInventoryRecord[]>([]);
  const [shopping, setShopping] = useState<ShoppingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [localSettings, setLocalSettings] = useState<LocalSettings>(readLocalSettings);
  const [hasValidByok, setHasValidByok] = useState(false);

  const householdId = profile?.household_id ?? null;

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
    const syncAiState = () => {
      setLocalSettings(readLocalSettings());
      setHasValidByok(hasValidByokKey());
    };

    syncAiState();
    window.addEventListener("storage", syncAiState);
    window.addEventListener("focus", syncAiState);

    return () => {
      window.removeEventListener("storage", syncAiState);
      window.removeEventListener("focus", syncAiState);
    };
  }, []);

  const urgentInventory = useMemo(() => {
    return inventory
      .filter((item) => item.status === "expiring" || item.status === "low_stock" || Boolean(item.expiry_date))
      .slice(0, 5);
  }, [inventory]);

  const showAiBlocks = localSettings.aiEnabled && localSettings.aiRecipes && hasValidByok;

  async function runKitchenAction(action: () => Promise<void>, successHint: string) {
    try {
      setError(null);
      await action();
      await loadKitchenData();
      setHintMessage(successHint);
    } catch (nextError) {
      setError(normalizeKitchenError(nextError, t("household.error.generic")));
    }
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

        <div className="space-y-3">
          <KitchenQuickActions
            onAddToInventory={() => {
              if (!householdId) return;
              void runKitchenAction(async () => {
                const source = shopping.find((item) => item.status === "open")?.title ?? "Produkts";
                await addKitchenInventoryItem({
                  householdId,
                  name: source,
                  quantity: 1,
                  category: null,
                });
              }, "Produkts pievienots inventaram");
            }}
            onAddToCart={() => {
              if (!householdId) return;
              void runKitchenAction(async () => {
                const source = inventory[0]?.name ?? "Pirkums";
                await addShoppingItem({
                  householdId,
                  title: source,
                  quantity: 1,
                  suggestedByAi: false,
                });
              }, "Produkts pievienots grozam");
            }}
            onMove={() => {
              if (!householdId) return;
              const firstOpen = shopping.find((item) => item.status === "open");
              if (!firstOpen) {
                setHintMessage("Nav ko parcelt uz inventaru");
                return;
              }
              void runKitchenAction(async () => {
                await moveShoppingItemToInventory({
                  householdId,
                  itemId: firstOpen.id,
                });
              }, "Pirmais iepirkuma ieraksts parcelts uz inventaru");
            }}
            onMark={() => {
              if (!householdId) return;
              const firstOpen = shopping.find((item) => item.status === "open");
              if (!firstOpen) {
                setHintMessage("Nav atvertu ierakstu atzimesanai");
                return;
              }
              void runKitchenAction(async () => {
                await updateShoppingItemStatus({
                  householdId,
                  itemId: firstOpen.id,
                  status: "picked",
                });
              }, "Iepirkuma ieraksts atzimets ka panemts");
            }}
          />

          <InventoryPreview
            items={inventory}
            totalCount={inventory.length}
            onOpenFullList={() => setHintMessage("Atvert pilno inventara sarakstu")}
          />

          <UrgentItemsCard
            items={inventory}
            onOpenAll={() => setHintMessage("Atvert pilno steidzamo produktu skatu")}
          />

          <CartPreview
            items={shopping}
            onOpenAll={() => setHintMessage("Atvert pilno iepirkumu sarakstu")}
          />

          {showAiBlocks ? (
            <AiChefSuggestions
              inventory={inventory.slice(0, 5)}
              urgentItems={urgentInventory}
              onOpenPlan={() => setHintMessage("Atvert pilno AI receptu planu")}
            />
          ) : null}

          {loading ? (
            <GlassPanel style={{ background: "color-mix(in srgb, var(--color-surface) 90%, transparent)" }}>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Ieladejas virtuves parskats...
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

          {hintMessage ? (
            <GlassPanel style={{ background: "color-mix(in srgb, var(--color-surface) 90%, transparent)" }}>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {hintMessage}
              </p>
            </GlassPanel>
          ) : null}
        </div>
      </KitchenThemeLayer>
    </ModuleShell>
  );
}
