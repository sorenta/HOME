"use client";

import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";
import type { KitchenInventoryRecord } from "@/lib/kitchen";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  items: KitchenInventoryRecord[];
  onDelete: (id: string) => void;
};

export function SavedRecipes({ items, onDelete }: Props) {
  const { locale } = useI18n();
  const { themeId } = useTheme();
  const isForge = themeId === "forge";

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {isForge && (
        <div className="flex items-center gap-3 px-1 opacity-40">
          <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 04</span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Saglabātās receptes</span>
        </div>
      )}
      
      {!isForge && (
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] opacity-70">
            {locale === "lv" ? "Saglabātās receptes" : "Saved recipes"}
          </h3>
          <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]">
            {items.length}
          </span>
        </div>
      )}

      <ul className="grid gap-2 sm:grid-cols-2">
        <AnimatePresence>
          {items.map((item) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative flex flex-col p-3 text-sm transition-all group ${
                isForge 
                  ? 'border border-white/5 bg-black/40 text-white/80 hover:border-primary/30' 
                  : 'rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] hover:shadow-md'
              }`}
            >
              <div className="flex-1">
                <span className="leading-relaxed block pr-6 whitespace-pre-wrap">{item.name}</span>
              </div>
              
              <button
                onClick={() => onDelete(item.id)}
                className={`absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-all ${
                  isForge ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40' : 'bg-red-100 text-red-500 hover:bg-red-200'
                }`}
                title={locale === "lv" ? "Dzēst recepti" : "Delete recipe"}
              >
                ✕
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
