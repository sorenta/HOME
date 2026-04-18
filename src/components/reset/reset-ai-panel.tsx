"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/lib/i18n/i18n-context";
import { hapticTap } from "@/lib/haptic";
import { fetchHouseholdKitchenAiMeta } from "@/lib/household-kitchen-ai";

import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/ui/glass-panel";
import { hapticTheme } from "@/lib/haptic";
import { useTheme } from "@/components/providers/theme-provider";
import { transitionForTheme } from "@/lib/theme-logic";

type Props = {
  mood?: string | null;
  moodScore?: number | null;
  energy?: number | null;
  signals?: Array<{ label: string; value: number }>;
  quitDays?: number | null;
  goals?: string[];
};

export function ResetAiPanel({ mood, moodScore, energy, signals, quitDays, goals }: Props) {
  const { t, locale } = useI18n();
  const { session } = useAuth();
  const { themeId } = useTheme();
  const spring = transitionForTheme(themeId);
  const [canUseAi, setCanUseAi] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [encouragement, setEncouragement] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Proactive AI Context Chips based on current state
  const contextChips = useMemo(() => {
    const chips: string[] = [];
    if (energy != null && energy <= 2) {
      chips.push(locale === "lv" ? "Kā atgūt enerģiju šovakar?" : "How to recover energy tonight?");
    }
    if (moodScore != null && moodScore < 40) {
      chips.push(locale === "lv" ? "Iesaki 5 minūšu miera rutīnu" : "Suggest a 5-minute peace routine");
    }
    if (quitDays != null && quitDays < 7) {
      chips.push(locale === "lv" ? "Man vajag motivāciju turpināt manu streak" : "I need motivation to keep my streak");
    }
    if (chips.length === 0) {
      chips.push(locale === "lv" ? "Kā saglabāt šo labo ritmu rītdienai?" : "How to keep this good rhythm for tomorrow?");
      chips.push(locale === "lv" ? "Iesaki mierīgu vakara aktivitāti" : "Suggest a calm evening activity");
    }
    return chips;
  }, [energy, moodScore, quitDays, locale]);

  useEffect(() => {
    let alive = true;
    const syncKeyState = async () => {
      const meta = await fetchHouseholdKitchenAiMeta();
      if (!alive) return;
      setCanUseAi(Boolean(meta?.provider));
    };
    const onFocus = () => {
      void syncKeyState();
    };
    void syncKeyState();
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  async function runAdvisor(immediatePrompt?: string) {
    const textToSend = immediatePrompt ?? prompt;
    setError(null);
    setReply(null);
    setSuggestions([]);
    setEncouragement(null);
    const token = session?.access_token;
    if (!token) {
      setError(t("kitchen.ai.error.auth"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          locale,
          prompt: textToSend.trim() || undefined,
          mood,
          moodScore,
          signals,
          quitDays,
          goals,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        code?: string;
        message?: string;
        reply?: string;
        suggestions?: string[];
        encouragement?: string;
      };

      if (!res.ok || !data.ok) {
        const code = data.code ?? "UNKNOWN";
        if (code === "SCHEMA_MISSING") setError(t("kitchen.ai.error.schema"));
        else if (code === "NO_USER_AI") setError(t("kitchen.ai.error.noKey"));
        else setError(data.message ?? t("kitchen.ai.error.generic"));
        return;
      }

      setReply(data.reply ?? "");
      setSuggestions(data.suggestions ?? []);
      setEncouragement(data.encouragement ?? null);
      hapticTheme(themeId);
    } catch {
      setError(t("kitchen.ai.error.generic"));
    } finally {
      setLoading(false);
    }
  }

  if (!canUseAi) {
    return null;
  }

  return (
    <GlassPanel className="p-5 space-y-5 overflow-hidden relative">
      {/* Decorative Glow Orb */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-1 relative z-10">
        <p className="text-sm font-black uppercase tracking-[0.12em] text-primary">
          {t("reset.ai.title")}
        </p>
        <p className="text-xs text-(--color-text-muted) leading-relaxed">
          {t("reset.ai.hint")}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!reply && contextChips.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap gap-2 relative z-10"
          >
            {contextChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setPrompt(chip);
                  void runAdvisor(chip);
                }}
                className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[0.7rem] font-bold text-primary hover:bg-primary/10 transition-all hover:scale-105 active:scale-95"
              >
                {chip}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3 relative z-10">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          placeholder={t("reset.ai.placeholder")}
          className="w-full resize-none rounded-2xl border border-(--color-border) bg-background/50 px-4 py-3 text-sm text-(--color-text-primary) focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all"
        />
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            hapticTheme(themeId);
            void runAdvisor();
          }}
          className="w-full rounded-2xl bg-primary px-4 py-3.5 text-sm font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50 transition-all active:scale-[0.98] hover:brightness-110"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" />
            </span>
          ) : t("reset.ai.run")}
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-xs font-bold text-rose-500 text-center"
          >
            {error}
          </motion.p>
        )}

        {reply && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 border-t border-(--color-border) pt-5 relative z-10"
          >
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
              <p className="text-sm leading-relaxed text-(--color-text-primary) font-medium">
                {reply}
              </p>
            </div>

            {suggestions.length > 0 && (
              <div className="px-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-(--color-text-muted) mb-2">
                  {t("reset.ai.suggestions")}
                </p>
                <div className="space-y-2">
                  {suggestions.map((s, idx) => (
                    <motion.div 
                      key={s}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-2 text-sm text-(--color-text-primary)"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{s}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {encouragement && (
              <p className="px-1 text-sm font-bold italic text-primary/80">
                "{encouragement}"
              </p>
            )}

            <button
              onClick={() => {
                setReply(null);
                setPrompt("");
              }}
              className="text-[10px] font-black uppercase tracking-widest text-(--color-text-muted) hover:text-primary transition-colors"
            >
              Jauna saruna
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassPanel>
  );
}
