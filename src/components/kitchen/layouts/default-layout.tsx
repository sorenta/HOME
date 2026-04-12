import { KitchenHeader } from "@/components/kitchen/KitchenHeader";
import { KitchenStock } from "@/components/kitchen/KitchenStock";
import { ShoppingCart } from "@/components/kitchen/ShoppingCart";
import { AiChefSuggestions } from "@/components/kitchen/AiChefSuggestions";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { KitchenInventoryRecord, ShoppingRecord } from "@/lib/kitchen";

type Props = {
  normalInventory: KitchenInventoryRecord[];
  urgentInventory: KitchenInventoryRecord[];
  expiringToday: KitchenInventoryRecord[];
  shopping: ShoppingRecord[];
  hasServerByok: boolean;
  onAddClick: () => void;
  onDeleteInventory: (id: string) => void;
  onAddToCart: (name: string, category: string | null) => void;
  onBought: (id: string) => void;
  onDeleteShopping: (id: string) => void;
  onPinMeal: (name: string) => Promise<void>;
  onSaveRecipe: (title: string, instructions: string, metadata: any) => void;
  runKitchenAction: (action: () => Promise<void>, hint: string) => void;
  householdId: string | null;
  locale: "lv" | "en";
};

export function DefaultKitchenLayout({
  normalInventory,
  urgentInventory,
  expiringToday,
  shopping,
  hasServerByok,
  onAddClick,
  onDeleteInventory,
  onAddToCart,
  onBought,
  onDeleteShopping,
  onPinMeal,
  onSaveRecipe,
  runKitchenAction,
  householdId,
  locale,
}: Props) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <KitchenHeader 
        cartCount={shopping.filter(i => i.status === "open").length}
        onAddClick={onAddClick}
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
                {expiringToday.map(i => i.name).join(", ")}
              </p>
            </div>
            <button 
              onClick={() => {
                runKitchenAction(async () => {
                  for (const item of expiringToday) {
                    onDeleteInventory(item.id);
                  }
                }, t("kitchen.quickAction.move.done"));
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
        onDelete={onDeleteInventory}
        onAddToCart={onAddToCart}
      />

      <ShoppingCart
        id="shopping-cart-section"
        items={shopping.filter(i => i.status === "open")}
        onBought={onBought}
        onDelete={onDeleteShopping}
      />

      <AiChefSuggestions
        inventory={normalInventory}
        urgentItems={urgentInventory}
        hasByok={hasServerByok}
        onAddToCart={(name) => onAddToCart(name, null)}
        onPinMeal={onPinMeal}
        onSaveRecipe={onSaveRecipe}
      />
    </div>
  );
}
