import { KitchenHeader } from "@/components/kitchen/KitchenHeader";
import { KitchenStock } from "@/components/kitchen/KitchenStock";
import { ShoppingCart } from "@/components/kitchen/ShoppingCart";
import { AiChefSuggestions } from "@/components/kitchen/AiChefSuggestions";
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
};

export function ForgeKitchenLayout({
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
}: Props) {
  const { t } = useI18n();

  return (
    <>
      {/* SECTOR 01: INVENTORY_LOGISTICS */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1 opacity-40">
          <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 01</span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Krājumu loģistika</span>
        </div>
        
        <KitchenHeader 
          cartCount={shopping.filter(i => i.status === "open").length}
          onAddClick={onAddClick}
          onCartClick={() => {
            const cartEl = document.getElementById("shopping-cart-section");
            cartEl?.scrollIntoView({ behavior: "smooth" });
          }}
        />

        {expiringToday.length > 0 && (
          <div className="border border-red-500/20 bg-red-500/5 p-4 font-mono">
            <div className="flex items-center gap-3">
              <span className="text-primary animate-pulse text-lg">⚠️</span>
              <div className="flex-1">
                <p className="text-[0.6rem] font-black uppercase tracking-widest text-primary">KRITISKS_STATUSS: TERMIŅI</p>
                <p className="text-[0.55rem] text-white/60 uppercase">
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
                className="border border-primary px-3 py-1 text-[0.5rem] font-black uppercase text-primary hover:bg-primary/10 transition-all"
              >
                IZLIETOTS
              </button>
            </div>
          </div>
        )}

        <KitchenStock
          items={normalInventory}
          onDelete={onDeleteInventory}
          onAddToCart={onAddToCart}
        />
      </div>

      {/* SECTOR 02: PROCUREMENT_OPERATIONS */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1 opacity-40">
          <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 02</span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Iepirkumu operācijas</span>
        </div>
        <ShoppingCart
          id="shopping-cart-section"
          items={shopping.filter(i => i.status === "open")}
          onBought={onBought}
          onDelete={onDeleteShopping}
        />
      </div>

      {/* SECTOR 03: INTELLIGENCE_UNIT */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1 opacity-40">
          <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 03</span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Intelekta vienība</span>
        </div>
        <AiChefSuggestions
          inventory={normalInventory}
          urgentItems={urgentInventory}
          hasByok={hasServerByok}
          onAddToCart={(name) => onAddToCart(name, null)}
          onPinMeal={onPinMeal}
          onSaveRecipe={onSaveRecipe}
        />
      </div>
    </>
  );
}
