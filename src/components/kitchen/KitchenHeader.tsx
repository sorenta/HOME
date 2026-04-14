"use client";

import { useI18n } from "@/lib/i18n/i18n-context";
import { motion } from "framer-motion";
import { hapticTap } from "@/lib/haptic";
import { Button } from "@/components/ui/button";

type Props = {
  cartCount: number;
  onAddClick: () => void;
  onCartClick: () => void;
};

export function KitchenHeader({ cartCount, onAddClick, onCartClick }: Props) {
  const { locale } = useI18n();

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      {/* UniversÄlÄ Pievienot poga - pÄrveidota par ikonu tÄpat kÄ Grozs */}
      <div className="flex flex-col items-center gap-1">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => {
            hapticTap();
            onAddClick();
          }}
          className="relative w-12 h-12 rounded-full flex items-center justify-center !p-0"
          aria-label={locale === "lv" ? "Pievienot produktus" : "Add supplies"}
        >
          {/* Plus Icon */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </Button>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
          {locale === "lv" ? "Pievienot" : "Add"}
        </span>
      </div>

      {/* UniversÄlÄ Groza poga ar skaitÄ«tÄju */}
      <div className="flex flex-col items-center gap-1">
        <div className="relative">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => {
              hapticTap();
              onCartClick();
            }}
            className="relative w-12 h-12 rounded-full flex items-center justify-center !p-0"
            aria-label={locale === "lv" ? "Iepirkumu saraksts" : "Shopping list"}
          >
            {/* Shopping Cart Icon */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="22" 
              height="22" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </Button>

          {cartCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-black shadow-md bg-[var(--color-accent)] text-white"
            >
              {cartCount}
            </motion.div>
          )}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
          {locale === "lv" ? "Iepirkumi" : "List"}
        </span>
      </div>
    </div>
  );
}
