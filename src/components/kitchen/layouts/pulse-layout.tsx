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

export function PulseKitchenLayout({
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
    <div className="space-y-10 pt-4 pb-12">
      <div className="pulse-pop relative p-4 bg-white">
        <KitchenHeader 
          cartCount={shopping.filter(i => i.status === "open").length}
          onAddClick={onAddClick}
          onCartClick={() => {
            const cartEl = document.getElementById("shopping-cart-section");
            cartEl?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </div>

      {expiringToday.length > 0 && (
        <div className="border-[3px] border-black bg-rose-500 p-4 shadow-[4px_4px_0_#000] transform -rotate-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-white">!</span>
            <div className="flex-1">
              <p className="text-sm font-black uppercase text-white">
                {locale === "lv" ? "TERMIŅŠ BEIDZAS!" : "EXPIRED!"}
              </p>
              <p className="text-xs font-bold text-white/90">
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
              className="px-4 py-2 text-[0.7rem] font-black uppercase bg-black text-white border-2 border-white hover:bg-white hover:text-black transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <div className="maj-pulse-dots-ambient opacity-10 absolute inset-0 pointer-events-none" />
        
        <KitchenStock
          items={normalInventory}
          onDelete={onDeleteInventory}
          onAddToCart={onAddToCart}
        />

        <div className="maj-pulse-hero-band h-2 w-full bg-black shadow-[2px_2px_0_var(--color-primary)]" />

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
    </div>
  );
}
