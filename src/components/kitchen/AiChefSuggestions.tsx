"use client";

import { GlassPanel } from "@/components/ui/glass-panel";
import type { KitchenInventoryRecord } from "@/lib/kitchen";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";
import Link from "next/link";
import { motion } from "framer-motion";

type AiChefSuggestionsProps = {
  inventory: KitchenInventoryRecord[];
  urgentItems: KitchenInventoryRecord[];
  hasByok: boolean;
  onOpenPlan: () => void;
  onAddToCart: (name: string) => void;
  onPinMeal: (name: string) => void;
};

function buildSuggestion(inventory: KitchenInventoryRecord[], urgentItems: KitchenInventoryRecord[]) {
  const urgent = urgentItems[0]?.name;
  const stocked = inventory.find((item) => item.name !== urgent)?.name;

  if (urgent && stocked) {
    return {
      text: `Šodien gatavo ${stocked} ar ${urgent}, lai samazinātu atlikumus.`,
      missing: []
    };
  }

  if (urgent) {
    return {
      text: `Ierosinājums: izlieto ${urgent} šodienas vakariņām.`,
      missing: ["Siers", "Mērce"] // Example of missing items logic
    };
  }

  return {
    text: "Ierosinājums: izvēlies vienu vienkāršu recepti no mājas produktiem.",
    missing: []
  };
}

export function AiChefSuggestions({ inventory, urgentItems, hasByok, onOpenPlan, onAddToCart, onPinMeal }: AiChefSuggestionsProps) {
  const { t, locale } = useI18n();
  const { themeId } = useTheme();
  const isForge = themeId === "forge";

  if (!hasByok) {
    return (
      <GlassPanel className="p-6 border-dashed border-2 border-[var(--color-border)] opacity-80 hover:opacity-100 transition-opacity">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-[var(--color-surface-2)] text-2xl shadow-inner ${isForge ? 'border border-primary/30' : ''}`}>
            🔑
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-[var(--color-text-primary)]">
              {locale === "lv" 
                ? "Lai AI tev ieteiktu, ko pagatavot no mājās esošā," 
                : "For AI to suggest meals from what you have at home,"}
            </p>
            <p className="text-sm">
              {locale === "lv" ? "ievadi savu " : "enter your "}
              <Link 
                href="/settings" 
                className={`font-black underline decoration-2 underline-offset-4 hover:text-primary transition-colors ${isForge ? 'text-primary' : 'text-[var(--color-accent)]'}`}
              >
                KEY {locale === "lv" ? "šeit" : "here"}
              </Link>
            </p>
          </div>
        </div>
      </GlassPanel>
    );
  }

  const suggestion = buildSuggestion(inventory, urgentItems);
  const recipes = ["Cepti dārzeņi ar sieru", "Zupa ar pupiņām un burkāniem", "Ātrā pasta ar tomātiem"];

  return (
    <div className="space-y-3">
      <GlassPanel className="space-y-3" style={{ background: "color-mix(in srgb, var(--color-surface-2) 90%, transparent)" }}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">👨‍🍳</span>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                AI Šefpavāra Ieteikums
              </p>
            </div>
            <button
              onClick={() => onPinMeal(suggestion.text.split('gatavo ')[1]?.split(',')[0] || suggestion.text)}
              className={`px-2 py-1 text-[0.55rem] font-black uppercase tracking-widest border transition-all ${
                isForge ? 'border-primary/30 text-primary hover:bg-primary/10 rounded-sm' : 'border-[var(--color-border)] text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-surface-3)]'
              }`}
            >
              📌 {locale === "lv" ? "Piespraust" : "Pin"}
            </button>
          </div>
          <p className="text-sm leading-relaxed text-[var(--color-text-primary)]">
            {suggestion.text}
          </p>
          
          {suggestion.missing.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--color-border)] opacity-20">
              <p className="text-[0.6rem] font-bold uppercase mb-2">Trūkstošās sastāvdaļas:</p>
              <div className="flex flex-wrap gap-2">
                {suggestion.missing.map(item => (
                  <button
                    key={item}
                    onClick={() => onAddToCart(item)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-[0.6rem] font-black text-primary hover:bg-primary/20 transition-all"
                  >
                    + {item.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-3" style={{ background: "color-mix(in srgb, var(--color-surface) 90%, transparent)" }}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
            Saglabātās receptes
          </p>
          <button
            type="button"
            onClick={onOpenPlan}
            className={`px-3 py-1 text-[0.6rem] font-black uppercase tracking-widest border transition-all ${
              isForge ? 'border-primary/30 text-primary hover:bg-primary/10' : 'rounded-full border-[var(--color-border)] hover:bg-[var(--color-surface-2)]'
            }`}
          >
            {locale === "lv" ? "Visi plāni" : "Full plan"}
          </button>
        </div>

        <ul className="space-y-2">
          {recipes.map((recipe) => (
            <motion.li
              key={recipe}
              whileHover={{ x: 4 }}
              className={`flex items-center justify-between px-3 py-2 text-sm border cursor-pointer transition-all group ${
                isForge 
                  ? 'border-white/5 bg-black/40 text-white/80 hover:border-primary/30' 
                  : 'rounded-xl border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] hover:shadow-md'
              }`}
            >
              <span>{recipe}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPinMeal(recipe);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-primary transition-opacity"
                title={locale === "lv" ? "Piespraust kalendāram" : "Pin to calendar"}
              >
                📌
              </button>
            </motion.li>
          ))}
        </ul>
      </GlassPanel>
    </div>
  );
}
