"use client";

import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";
import { motion } from "framer-motion";
import { hapticTap } from "@/lib/haptic";

type Props = {
  cartCount: number;
  onAddClick: () => void;
  onCartClick: () => void;
};

export function KitchenHeader({ cartCount, onAddClick, onCartClick }: Props) {
  const { t, locale } = useI18n();
  const { themeId } = useTheme();

  const isForge = themeId === "forge";
  const isPulse = themeId === "pulse";
  const isLucent = themeId === "lucent";

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      {/* Add Button */}
      <button
        onClick={() => {
          hapticTap();
          onAddClick();
        }}
        className={`flex items-center gap-3 px-4 py-3 transition-all active:scale-[0.98] ${
          isForge 
            ? "bg-primary/10 border border-primary/30 text-primary font-mono rounded-sm hover:bg-primary/20" 
            : isLucent
              ? "bg-white/40 backdrop-blur-md border border-white/40 text-[var(--color-foreground)] rounded-2xl shadow-sm hover:bg-white/60"
              : isPulse
                ? "bg-white border-2 border-black text-black font-bold rounded-none shadow-[4px_4px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_black]"
                : "bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-foreground)] rounded-xl hover:bg-[var(--color-surface-3)]"
        }`}
      >
        <span className="text-lg font-bold">[ + ]</span>
        <span className={`text-xs font-black uppercase tracking-widest ${isForge ? 'font-(family-name:--font-rajdhani)' : ''}`}>
          {locale === "lv" ? "Pievienot produktus mājās" : "Add supplies home"}
        </span>
      </button>

      {/* Cart Button with Counter */}
      <button
        onClick={() => {
          hapticTap();
          onCartClick();
        }}
        className="relative p-3 transition-all active:scale-90 group"
      >
        <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
          isForge 
            ? "bg-black border border-white/10 group-hover:border-primary/50" 
            : isLucent
              ? "bg-white/40 backdrop-blur-md border border-white/40 group-hover:bg-white/60"
              : isPulse
                ? "bg-white border-2 border-black group-hover:bg-yellow-400 shadow-[2px_2px_0px_black]"
                : "bg-[var(--color-surface-2)] border border-[var(--color-border)] group-hover:bg-[var(--color-surface-3)]"
        }`}>
          <span className="text-xl">🛒</span>
        </div>
        
        {cartCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[0.65rem] font-black shadow-lg ${
              isForge ? "bg-primary text-white" : "bg-red-500 text-white"
            }`}
          >
            {cartCount}
          </motion.div>
        )}
      </button>
    </div>
  );
}
