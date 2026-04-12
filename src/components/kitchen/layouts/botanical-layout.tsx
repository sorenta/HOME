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

export function BotanicalKitchenLayout({
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
    <div className="space-y-8">
      <KitchenHeader 
        cartCount={shopping.filter(i => i.status === "open").length}
        onAddClick={onAddClick}
        onCartClick={() => {
          const cartEl = document.getElementById("shopping-cart-section");
          cartEl?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {expiringToday.length > 0 && (
        <GlassPanel className="border-emerald-500/30 bg-emerald-500/5 rounded-[32px_8px_32px_8px]">
          <div className="flex items-center gap-3">
            <span className="text-xl">🌿</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-[var(--color-text-primary)]">
                {locale === "lv" ? "Dabas veltes jāizmanto šodien!" : "Nature's gifts to use today!"}
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
              className="px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest bg-emerald-600 text-white rounded-full hover:bg-emerald-500 transition-colors"
            >
              {locale === "lv" ? "IZLIETOTS" : "USED"}
            </button>
          </div>
        </GlassPanel>
      )}

      <div className="maj-botanical-shelf">
        <KitchenStock
          items={normalInventory}
          onDelete={onDeleteInventory}
          onAddToCart={onAddToCart}
        />
      </div>

      <div className="maj-botanical-shelf">
        <ShoppingCart
          id="shopping-cart-section"
          items={shopping.filter(i => i.status === "open")}
          onBought={onBought}
          onDelete={onDeleteShopping}
        />
      </div>

      <div className="maj-botanical-shelf">
        <AiChefSuggestions
          inventory={normalInventory}
          urgentItems={urgentInventory}
          hasByok={hasServerByok}
          onAddToCart={(name) => onAddToCart(name, null)}
          onPinMeal={onPinMeal}
          onSaveRecipe={onSaveRecipe}
        />
      </div>
    </div>
  );
}
