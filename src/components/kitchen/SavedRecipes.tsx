"use client";

import { useState } from "react";
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
  
  const [selectedRecipe, setSelectedRecipe] = useState<KitchenInventoryRecord | null>(null);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        {isForge ? (
          <>
            <span className="text-[0.5rem] font-black text-primary uppercase tracking-[0.4em]">Sektors 04</span>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
            <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Saglabātās receptes</span>
          </>
        ) : (
          <>
            <h3 className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] opacity-70">
              {locale === "lv" ? "Saglabātās receptes" : "Saved recipes"}
            </h3>
            <div className="h-px flex-1 bg-[var(--color-border)] opacity-20" />
            <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]">
              {items.length}
            </span>
          </>
        )}
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {items.map((item) => {
            const parts = item.name.split("\n\n");
            const title = parts[0];
            
            // Extract metadata
            let instructions = "";
            let sourceUrl = "";
            let imageUrl = "";
            let cookingTime = "";
            let temperature = "";

            if (parts.length > 1) {
              parts.slice(1).forEach(part => {
                if (part.startsWith("🔗 ")) sourceUrl = part.replace("🔗 ", "").trim();
                else if (part.startsWith("🖼️ ")) imageUrl = part.replace("🖼️ ", "").trim();
                else if (part.startsWith("---")) { /* separator */ }
                else if (part.startsWith("⏱️ ")) cookingTime = part.replace("⏱️ ", "").trim();
                else if (part.startsWith("🌡️ ")) temperature = part.replace("🌡️ ", "").trim();
                else if (part.trim()) instructions += part + "\n\n";
              });
            }

            // Fallback for old recipes
            if (!instructions && parts.length > 1) {
              instructions = parts.slice(1).join("\n\n");
            }

            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setSelectedRecipe(item)}
                className={`relative flex flex-col p-4 transition-all group border cursor-pointer hover:ring-2 hover:ring-primary/20 ${
                  isForge 
                    ? 'border-white/5 bg-black/40 text-white/80 hover:border-primary/30' 
                    : 'rounded-2xl border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-primary)] hover:shadow-lg'
                }`}
              >
                <div className="flex gap-4">
                  {imageUrl && (
                    <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-black/20">
                      <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-2">
                    <h4 className="font-bold pr-10 leading-tight group-hover:text-primary transition-colors truncate">{title}</h4>
                    <p className="text-xs opacity-70 line-clamp-2 leading-relaxed whitespace-pre-wrap italic">
                      {instructions.trim() || (locale === "lv" ? "Skatīt gatavošanas gaitu..." : "View cooking steps...")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--color-border)]/10">
                  <span className="text-[0.6rem] font-black uppercase tracking-widest text-primary">
                    {locale === "lv" ? "Skatīt pilnu →" : "View full →"}
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className={`flex items-center justify-center w-7 h-7 rounded-full transition-all shadow-sm ${
                      isForge ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                    }`}
                    title={locale === "lv" ? "Dzēst recepti" : "Delete recipe"}
                  >
                    <span className="text-xs">✕</span>
                  </button>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      {/* FULL RECIPE MODAL */}
      <AnimatePresence>
        {selectedRecipe && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRecipe(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto border shadow-2xl ${
                isForge 
                  ? 'bg-black border-primary/40 text-white' 
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)] rounded-[2.5rem]'
              }`}
            >
              {/* Image Header if exists */}
              {(() => {
                const parts = selectedRecipe.name.split("\n\n");
                let img = "";
                parts.forEach(p => { if (p.startsWith("🖼️ ")) img = p.replace("🖼️ ", "").trim(); });
                if (img) {
                  return (
                    <div className="w-full h-48 sm:h-72 overflow-hidden relative">
                      <img src={img} alt="Recipe" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </div>
                  );
                }
                return null;
              })()}

              <div className="p-6 sm:p-10 space-y-6">
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-surface-2)] hover:bg-primary hover:text-white transition-all z-10 shadow-lg"
                >
                  ✕
                </button>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="text-2xl">👨‍🍳</span>
                    <span className="text-[0.6rem] font-black uppercase tracking-[0.3em]">
                      {locale === "lv" ? "Saglabātā recepte" : "Saved recipe"}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black leading-tight">
                    {selectedRecipe.name.split("\n\n")[0]}
                  </h2>
                </div>

                {/* Meta data row */}
                {(() => {
                  const parts = selectedRecipe.name.split("\n\n");
                  let time = "", temp = "", source = "";
                  parts.forEach(p => {
                    if (p.startsWith("⏱️ ")) time = p.replace("⏱️ ", "");
                    if (p.startsWith("🌡️ ")) temp = p.replace("🌡️ ", "");
                    if (p.startsWith("🔗 ")) source = p.replace("🔗 ", "");
                  });
                  if (time || temp || source) {
                    return (
                      <div className="flex flex-wrap gap-4 pt-2">
                        {time && <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center gap-1.5">⏱️ {time}</span>}
                        {temp && <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center gap-1.5">🌡️ {temp}</span>}
                        {source && (
                          source === "AI-ORIGINAL" ? (
                            <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black italic flex items-center gap-1.5">
                              ✨ {locale === "lv" ? "AI oriģināls" : "AI Original"}
                            </span>
                          ) : (
                            <a href={source} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold flex items-center gap-1.5 hover:bg-primary/80 transition-all">
                              🔗 {locale === "lv" ? "Avots" : "Source"}
                            </a>
                          )
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="h-px w-20 bg-primary/30" />

                <div className="prose prose-sm max-w-none">
                  <p className="text-base sm:text-lg leading-relaxed whitespace-pre-wrap opacity-90">
                    {(() => {
                      const parts = selectedRecipe.name.split("\n\n");
                      let instr = "";
                      parts.slice(1).forEach(p => {
                        if (!p.startsWith("🔗 ") && !p.startsWith("🖼️ ") && !p.startsWith("---") && !p.startsWith("⏱️ ") && !p.startsWith("🌡️ ")) {
                          instr += p + "\n\n";
                        }
                      });
                      return instr.trim() || (locale === "lv" ? "Nav norādīta gatavošanas instrukcija." : "No cooking instructions provided.");
                    })()}
                  </p>
                </div>

                <div className="pt-6 flex gap-3">
                  <button
                    onClick={() => setSelectedRecipe(null)}
                    className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                      isForge ? 'bg-primary text-white hover:bg-primary/80' : 'bg-[var(--color-surface-2)] hover:bg-[var(--color-border)]'
                    }`}
                  >
                    {locale === "lv" ? "Aizvērt" : "Close"}
                  </button>
                  <button
                    onClick={() => {
                      onDelete(selectedRecipe.id);
                      setSelectedRecipe(null);
                    }}
                    className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  >
                    {locale === "lv" ? "Dzēst" : "Delete"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
