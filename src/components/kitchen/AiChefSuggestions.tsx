"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { KitchenInventoryRecord } from "@/lib/kitchen";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getBrowserClient } from "@/lib/supabase/client";
import { hapticTheme } from "@/lib/haptic";
import { transitionForTheme } from "@/lib/theme-logic";
import { ThemedFeedback } from "@/components/ui/themed-feedback";

type AiChefSuggestionsProps = {
  inventory: KitchenInventoryRecord[];
  urgentItems: KitchenInventoryRecord[];
  hasByok: boolean;
  onAddToCart: (name: string) => void;
  onPinMeal: (name: string) => void;
  onSaveRecipe: (title: string, instructions: string, metadata?: { source_url?: string; cooking_time?: string; temperature?: string; image_url?: string }) => void;
};

type MealIdea = {
  title: string;
  instructions: string;
  missing: string[];
  source_url?: string;
  cooking_time?: string;
  temperature?: string;
  image_url?: string;
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
  const spring = transitionForTheme(themeId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiData, setAiData] = useState<AiResponse | null>(null);
  const [mealType, setMealType] = useState<string | null>(null);

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
    hapticTheme(themeId);
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
          prompt: [
            mealType ? (locale === "lv" ? `Vēlos idejas šai ēdienreizei: ${mealType}.` : `I want ideas for this meal: ${mealType}.`) : "",
            urgentItems.length > 0 
              ? (locale === "lv" ? `Man ir šādi produkti, kas drīz sabojāsies: ${urgentItems.map(i => i.name).join(", ")}. Lūdzu iekļauj tos receptē.` : `I have these items expiring soon: ${urgentItems.map(i => i.name).join(", ")}. Please include them in the recipe.`)
              : ""
          ].filter(Boolean).join(" ")
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

  const mealTypes = [
    { id: "breakfast", lv: "Brokastis", en: "Breakfast", icon: "🍳" },
    { id: "lunch", lv: "Pusdienas", en: "Lunch", icon: "🍲" },
    { id: "dinner", lv: "Vakariņas", en: "Dinner", icon: "🍽️" },
    { id: "snack", lv: "Našķis", en: "Snack", icon: "🍎" },
  ];

  return (
    <div className="space-y-3">
      <GlassPanel className="p-5" style={{ background: "color-mix(in srgb, var(--color-surface-2) 90%, transparent)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">👨‍🍳</span>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
              AI Šefpavārs
            </p>
          </div>
          {aiData && !loading && (
            <button
              onClick={() => {
                setAiData(null);
                setMealType(null);
              }}
              className="text-[0.6rem] font-bold uppercase opacity-50 hover:opacity-100 transition-opacity"
            >
              {locale === "lv" ? "Jauna izvēle" : "New choice"}
            </button>
          )}
        </div>

        {!aiData && !loading && (
          <div className="space-y-4 py-2">
            <p className="text-[0.65rem] font-black uppercase tracking-widest text-primary/70 px-1">
              {locale === "lv" ? "Kas tevi interesē?" : "What are you looking for?"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {mealTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setMealType(type.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-sm font-bold ${
                    mealType === type.id
                      ? (isForge ? 'border-primary bg-primary/20 text-white' : 'border-primary bg-primary text-white shadow-md')
                      : (isForge ? 'border-white/10 bg-white/5 text-white/60 hover:border-white/20' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-primary/30')
                  }`}
                >
                  <span>{type.icon}</span>
                  <span>{locale === "lv" ? type.lv : type.en}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleFetchAi}
              disabled={!mealType}
              className={`w-full py-4 text-xs font-black uppercase tracking-[0.2em] transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                isForge 
                  ? 'bg-primary text-white hover:bg-primary/80 rounded-sm' 
                  : 'bg-primary text-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5'
              }`}
            >
              {locale === "lv" ? "Jautāt receptes" : "Ask for recipes"}
            </button>
          </div>
        )}
        
        {loading && (
          <div className="py-12 text-center space-y-5 relative overflow-hidden">
            <motion.div 
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="inline-block relative"
            >
              <span className="text-4xl block">🍲</span>
              {/* Magic Particles */}
              {[...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  animate={{ 
                    y: [-20, -60],
                    x: [0, (i % 2 === 0 ? 30 : -30)],
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    delay: i * 0.2, 
                    repeat: Infinity,
                    ease: "easeOut" 
                  }}
                  className="absolute top-0 left-1/2 text-xs"
                >
                  ✨
                </motion.span>
              ))}
            </motion.div>
            
            <div className="space-y-1">
              <p className="text-sm font-black uppercase tracking-[0.15em] text-primary animate-pulse">
                {locale === "lv" ? "Notiek garšu sintēze..." : "Synthesizing flavors..."}
              </p>
              <p className="text-[10px] font-bold text-(--color-text-muted) uppercase tracking-widest px-4">
                {themeId === "forge" ? "Analyzing molecular structure" : 
                 themeId === "botanical" ? "Gathering forest herbs" : 
                 "Consulting the master chef"}
              </p>
            </div>

            {/* Forge-specific scan overlay during loading */}
            {themeId === "forge" && (
              <motion.div 
                animate={{ y: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-primary/5 border-y border-primary/20 pointer-events-none"
              />
            )}
          </div>
        )}

import { ThemedFeedback } from "@/components/ui/themed-feedback";
...
        {error && (
          <div className="py-2">
            <ThemedFeedback
              type="error"
              title={locale === "lv" ? "Chef kļūda" : "Chef Error"}
              message={error}
              action={{
                label: locale === "lv" ? "Mēģināt vēlreiz" : "Try Again",
                onClick: () => handleFetchAi()
              }}
            />
          </div>
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
      </GlassPanel>

      {aiData && aiData.recipes.length > 0 && (
        <GlassPanel className="space-y-4" style={{ background: "color-mix(in srgb, var(--color-surface) 90%, transparent)" }}>
          <div className="flex items-center justify-between gap-2 px-1">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">
              {locale === "lv" ? "AI šedevri tev" : "AI Masterpieces"}
            </p>
            <button
              onClick={handleFetchAi}
              className="p-2 text-xs font-black uppercase bg-background/50 border border-[var(--color-border)] rounded-full hover:bg-primary hover:text-white transition-all active:scale-90 shadow-sm"
            >
              🔄
            </button>
          </div>

          <motion.ul 
            initial="hidden"
            animate="show"
            variants={{
              show: {
                transition: {
                  staggerChildren: 0.15
                }
              }
            }}
            className="space-y-4"
          >
            {aiData.recipes.map((idea, index) => (
              <motion.li
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.95 },
                  show: { opacity: 1, y: 0, scale: 1 }
                }}
                whileHover={{ scale: 1.02, x: 4 }}
                transition={spring}
                className={`flex flex-col overflow-hidden border transition-all group ${
                  isForge 
                    ? 'border-white/10 bg-black/60 text-white/90 rounded-sm' 
                    : 'rounded-3xl border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-primary)] shadow-sm hover:shadow-xl'
                }`}
              >
                <div className="flex gap-4 p-4">
                  {idea.image_url && (
                    <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-white/10 bg-black/20">
                      <img src={idea.image_url} alt={idea.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <span className="font-bold text-[var(--color-text-primary)] leading-tight truncate">{idea.title}</span>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); onSaveRecipe(idea.title, idea.instructions, { source_url: idea.source_url, cooking_time: idea.cooking_time, temperature: idea.temperature }); }} className="text-lg" title={locale === "lv" ? "Saglabāt recepti" : "Save recipe"}>💾</button>
                        <button onClick={(e) => { e.stopPropagation(); onPinMeal(idea.title); }} className="text-lg" title={locale === "lv" ? "Piespraust kalendāram" : "Pin to calendar"}>📌</button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2 opacity-60">
                      {idea.cooking_time && (
                        <span className="text-xs flex items-center gap-1">⏱️ {idea.cooking_time}</span>
                      )}
                      {idea.temperature && (
                        <span className="text-xs flex items-center gap-1">🌡️ {idea.temperature}</span>
                      )}
                    </div>

                    <p className="text-xs opacity-80 leading-relaxed mb-2 line-clamp-2">
                      {idea.instructions}
                    </p>

                    {idea.source_url && (
                      <div className="mt-2">
                        {idea.source_url === "AI-ORIGINAL" ? (
                          <span className="text-xs font-black uppercase text-primary/60 italic">
                            ✨ {locale === "lv" ? "AI oriģinālrecepte" : "AI Original Recipe"}
                          </span>
                        ) : (
                          <a 
                            href={idea.source_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            🔗 {locale === "lv" ? "Skatīt avotu" : "View source"}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {idea.missing && idea.missing.length > 0 && (
                  <div className="mt-1 pt-2 border-t border-[var(--color-border)] opacity-80 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase py-1 text-[var(--color-text-secondary)]">
                      {locale === "lv" ? "Grozam:" : "To buy:"}
                    </span>
                    {idea.missing.map(item => (
                      <button
                        key={item}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(item);
                        }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-black transition-all ${
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
          </motion.ul>
        </GlassPanel>
      )}
    </div>
  );
}
