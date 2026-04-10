"use client";

import { useState, useMemo } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";
import type { KitchenInventoryRecord } from "@/lib/kitchen";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  items: KitchenInventoryRecord[];
  onDelete: (id: string) => void;
  onAddToCart: (name: string, category: string | null) => void;
};

const CATEGORY_ORDER: string[] = [
  "veg", "fruit", "meat", "dairy", "bakery", "dry", "frozen", "drinks", "sweets", "other"
];

export function KitchenStock({ items, onDelete, onAddToCart }: Props) {
  const { t, locale } = useI18n();
  const { themeId } = useTheme();
  const [isSectionExpanded, setIsSectionExpanded] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const isForge = themeId === "forge";

  const title = t(`kitchen.label.stock.${themeId}`) || t("kitchen.label.homeNow");

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const groupedAndSortedItems = useMemo(() => {
    const groups: Record<string, KitchenInventoryRecord[]> = {};
    
    // Initial grouping
    items.forEach(item => {
      const cat = item.category || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    // Sorting within groups (alphabetical)
    Object.keys(groups).forEach(cat => {
      groups[cat].sort((a, b) => a.name.localeCompare(b.name, locale));
    });

    return groups;
  }, [items, locale]);

  const categoriesInStock = useMemo(() => {
    return CATEGORY_ORDER.filter(cat => groupedAndSortedItems[cat] && groupedAndSortedItems[cat].length > 0);
  }, [groupedAndSortedItems]);

  if (items.length === 0) {
    return (
      <GlassPanel className="p-8 text-center opacity-60 border-dashed border-2 border-[var(--color-border)]">
        <p className="text-sm italic">{t("kitchen.empty.stock")}</p>
      </GlassPanel>
    );
  }

  return (
    <div className="space-y-4">
      <button 
        onClick={() => setIsSectionExpanded(!isSectionExpanded)}
        className="w-full flex items-center gap-3 px-1 mb-2 group transition-all"
      >
        <div className={`w-2 h-2 rounded-full ${isForge ? 'bg-primary animate-pulse' : 'bg-[var(--color-accent)]'}`} />
        <h2 className="text-lg font-black uppercase tracking-widest text-[var(--color-text-primary)]">
          {title}
        </h2>
        <div className="flex-1 h-px bg-[var(--color-border)] opacity-20" />
        <motion.span 
          animate={{ rotate: isSectionExpanded ? 180 : 0 }}
          className="text-xs opacity-40 group-hover:opacity-100"
        >
          ▼
        </motion.span>
        <span className="text-xs font-mono opacity-40">{items.length} PRODUCTS</span>
      </button>

      <AnimatePresence>
        {isSectionExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-2"
          >
            {categoriesInStock.map((cat) => {
              const isOpen = expandedCategories[cat] || false;
              const groupItems = groupedAndSortedItems[cat];

              return (
                <div key={cat} className={`overflow-hidden transition-all ${isForge ? 'border border-white/5' : 'border border-[var(--color-border)] rounded-xl'}`}>
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(cat)}
                    className={`w-full flex items-center justify-between p-4 transition-colors ${
                      isForge ? 'bg-black/40 hover:bg-black/60' : 'bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <motion.span animate={{ rotate: isOpen ? 0 : -90 }} className="text-xs opacity-40">
                        ▼
                      </motion.span>
                      <span className={`text-xs font-black uppercase tracking-widest ${isForge ? 'text-white/80' : 'text-[var(--color-text-primary)]'}`}>
                        {t(`kitchen.category.${cat}`)}
                      </span>
                      <span className="text-[0.6rem] px-1.5 py-0.5 rounded-full bg-black/20 opacity-40">
                        {groupItems.length}
                      </span>
                    </div>
                  </button>

                  {/* Items Table */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <table className="w-full text-left border-t border-white/5">
                          <thead className={`text-[0.55rem] font-black uppercase tracking-widest opacity-30 ${isForge ? 'bg-white/5' : 'bg-[var(--color-surface-1)]'}`}>
                            <tr>
                              <th className="px-4 py-2">{locale === "lv" ? "Nosaukums" : "Name"}</th>
                              <th className="px-4 py-2">{locale === "lv" ? "Daudzums" : "Qty"}</th>
                              <th className="px-4 py-2 text-right">{locale === "lv" ? "Darbības" : "Actions"}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {groupItems.map((item) => (
                              <tr key={item.id} className={`group ${isForge ? 'hover:bg-primary/5' : 'hover:bg-[var(--color-surface-1)]'} transition-colors`}>
                                <td className="px-4 py-3">
                                  <p className="text-sm font-bold text-[var(--color-text-primary)]">{item.name}</p>
                                  {item.expiry_date && (
                                    <p className="text-[0.6rem] text-amber-500 font-mono">EXP: {item.expiry_date}</p>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-xs font-mono opacity-60">
                                  {item.quantity} {item.unit || ""}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => onAddToCart(item.name, item.category)}
                                      className={`p-3 -m-1 transition-all ${isForge ? 'hover:text-primary' : 'hover:text-[var(--color-accent)]'}`}
                                      title={locale === "lv" ? "Pievienot grozam" : "Add to cart"}
                                    >
                                      <span className="text-xl">🛒</span>
                                    </button>
                                    <button
                                      onClick={() => onDelete(item.id)}
                                      className={`p-3 -m-1 transition-all ${isForge ? 'hover:text-primary' : 'hover:text-red-500'}`}
                                      title={locale === "lv" ? "Dzēst" : "Delete"}
                                    >
                                      <span className="text-xl">✕</span>
                                    </button>
                                  </div>
                                </td>                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
