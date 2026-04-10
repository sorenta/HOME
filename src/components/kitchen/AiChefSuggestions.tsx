"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { KitchenInventoryRecord } from "@/lib/kitchen";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";
import Link from "next/link";
import { motion } from "framer-motion";
import { getBrowserClient } from "@/lib/supabase/client";

type AiChefSuggestionsProps = {
  inventory: KitchenInventoryRecord[];
  urgentItems: KitchenInventoryRecord[];
  hasByok: boolean;
  onAddToCart: (name: string) => void;
  onPinMeal: (name: string) => void;
  onSaveRecipe: (recipe: string) => void;
};

type MealIdea = {
  recipe: string;
  missing: string[];
};

type AiResponse = {
  reply: string;
  missing: string[];
  recipes: MealIdea[];
};

export function AiChefSuggestions({ inventory, urgentItems, hasByok, onAddToCart, onPinMeal, onSaveRecipe }: AiChefSuggestionsProps) {
  const { locale } = useI18n();
  const { themeId } = useTheme();
  const isForge = themeId === "forge";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiData, setAiData] = useState<AiResponse | null>(null);

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

  const handleFetchAi = async () => {
    setLoading(true);
    setError(null);
    try {
      const client = getBrowserClient();
      const sessionRes = await client?.auth.getSession();
      const token = sessionRes?.data?.session?.access_token;

      if (!token) throw new Error("Nav autorizācijas.");

      const res = await fetch("/api/kitchen/meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          locale,
          inventory,
          shopping: [], // In this context we don't have shopping items directly, but we should pass them if available
          prompt: urgentItems.length > 0 
            ? `Man ir šādi produkti, kas drīz sabojāsies: ${urgentItems.map(i => i.name).join(", ")}. Lūdzu iekļauj tos receptē.`
            : ""
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        const code = data?.code;

        if (code === "NO_USER_AI_SECRET") {
          const msg = locale === "lv"
            ? "Neizdevās nolasīt tavu AI atslēgu no drošās krātuves."
            : "Failed to read your AI key from secure storage.";
          throw new Error(msg);
        }

        const msg = data?.message || (
          code === "NO_USER_AI" ? (locale === "lv" ? "AI atslēga nav atrasta." : "AI key not found.") :
          code === "RATE_LIMITED" ? (locale === "lv" ? "Pārāk daudz pieprasījumu." : "Too many requests.") :
          (locale === "lv" ? "Neizdevās sazināties ar AI." : "Could not connect to AI.")
        );

        throw new Error(msg);
      }

      setAiData({
        reply: data.reply || "",
        missing: data.missing_for_cart || [],
        recipes: data.meal_ideas || []
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nezināma kļūda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <GlassPanel className="space-y-3" style={{ background: "color-mix(in srgb, var(--color-surface-2) 90%, transparent)" }}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">👨‍🍳</span>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                AI Šefpavārs
              </p>
            </div>
            {!aiData && !loading && (
              <button
                onClick={handleFetchAi}
                className={`px-3 py-1 text-[0.55rem] font-black uppercase tracking-widest border transition-all ${
                  isForge ? 'border-primary/30 text-primary hover:bg-primary/10 rounded-sm' : 'border-[var(--color-border)] text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-surface-3)]'
                }`}
              >
                {locale === "lv" ? "Jautāt receptes" : "Ask for recipes"}
              </button>
            )}
          </div>
          
          {loading && (
            <p className="text-sm animate-pulse text-[var(--color-text-secondary)]">
              {locale === "lv" ? "Šefpavārs domā..." : "Chef is thinking..."}
            </p>
          )}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {aiData && (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-[var(--color-text-primary)]">
                {aiData.reply}
              </p>
              
              {aiData.missing.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[var(--color-border)] opacity-60">
                  <p className="text-[0.6rem] font-bold uppercase mb-2">Trūkstošās sastāvdaļas:</p>
                  <div className="flex flex-wrap gap-2">
                    {aiData.missing.map(item => (
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
          )}
        </div>
      </GlassPanel>

      {aiData && aiData.recipes.length > 0 && (
        <GlassPanel className="space-y-3" style={{ background: "color-mix(in srgb, var(--color-surface) 90%, transparent)" }}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
              {locale === "lv" ? "Ieteiktās receptes" : "Suggested recipes"}
            </p>
            <button
              onClick={handleFetchAi}
              className="px-2 py-1 text-[0.55rem] font-black uppercase border border-[var(--color-border)] rounded-full hover:bg-[var(--color-surface-2)]"
            >
              🔄
            </button>
          </div>

          <ul className="space-y-3">
            {aiData.recipes.map((idea, index) => (
              <motion.li
                key={index}
                whileHover={{ x: 4 }}
                className={`flex flex-col px-3 py-3 text-sm border transition-all group ${
                  isForge 
                    ? 'border-white/5 bg-black/40 text-white/80 hover:border-primary/30' 
                    : 'rounded-xl border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="leading-relaxed flex-1">{idea.recipe}</span>
                  <div className="pl-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onSaveRecipe(idea.recipe); }} className="text-xl" title={locale === "lv" ? "Saglabāt recepti" : "Save recipe"}>💾</button>
                    <button onClick={(e) => { e.stopPropagation(); onPinMeal(idea.recipe); }} className="text-xl" title={locale === "lv" ? "Piespraust kalendāram" : "Pin to calendar"}>📌</button>
                  </div>
                </div>
                
                {idea.missing && idea.missing.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[var(--color-border)] opacity-80 flex flex-wrap items-center gap-2">
                    <span className="text-[0.6rem] font-bold uppercase py-1 text-[var(--color-text-secondary)]">
                      {locale === "lv" ? "Grozam:" : "To buy:"}
                    </span>
                    {idea.missing.map(item => (
                      <button
                        key={item}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(item);
                        }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-[0.6rem] font-black transition-all ${
                          isForge 
                            ? 'bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20' 
                            : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)]'
                        }`}
                      >
                        + {item.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
              </motion.li>
            ))}
          </ul>
        </GlassPanel>
      )}
    </div>
  );
}
