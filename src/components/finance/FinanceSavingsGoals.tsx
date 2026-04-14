"use client";

import { useI18n } from "@/lib/i18n/i18n-context";
import { GlassPanel } from "@/components/ui/glass-panel";
import { motion } from "framer-motion";
import { useTheme } from "@/components/providers/theme-provider";

export type SavingsGoal = {
  id: string;
  label: string;
  current: string;
  target: string;
  pct: number;
};

type Props = {
  goals?: SavingsGoal[];
  isSolo?: boolean;
};

export function FinanceSavingsGoals({ goals = [], isSolo = false }: Props) {
  const { t, locale } = useI18n();
  const { themeId } = useTheme();

  let cardStyle: React.CSSProperties = {
    borderRadius: "var(--radius-card)",
    background: "color-mix(in srgb, var(--color-surface) 90%, transparent)",
  };

  if (themeId === "lucent") {
    cardStyle = {
      borderRadius: "36px",
      background: "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(250,248,244,0.7))",
      border: "1px solid rgba(184,150,106,0.18)",
      boxShadow: "0 20px 40px -10px rgba(100,80,60,0.06), inset 0 2px 4px rgba(255,255,255,0.9)",
      backdropFilter: "blur(16px)",
    };
  } else if (themeId === "forge") {
    cardStyle = {
      borderRadius: "4px",
      background: "linear-gradient(180deg, #111418 0%, #0a0c0e 100%)",
      border: "1px solid rgba(217,31,38,0.2)",
      boxShadow: "0 0 12px rgba(217,31,38,0.05)",
    };
  } else if (themeId === "pulse") {
    cardStyle = {
      borderRadius: "1rem",
      background: "#fff",
      border: "2.5px solid #000",
      boxShadow: "4px 4px 0 #000",
    };
  } else if (themeId === "botanical") {
    cardStyle = {
      borderRadius: "28px",
      background: "rgba(255,255,255,0.7)",
      border: "1px solid rgba(62,107,50,0.15)",
      boxShadow: "0 4px 12px rgba(51,66,41,0.05)",
    };
  } else if (themeId === "hive") {
    cardStyle = {
      borderRadius: "16px",
      background: "rgba(255,250,230,0.85)",
      border: "1.5px solid rgba(217,119,6,0.2)",
    };
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between px-1">
        <div className="space-y-0.5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-(--color-accent)">
            {t("finance.goals") || (locale === "lv" ? "Kopīgie mērķi" : "Shared goals")}
          </p>
          <p className="text-xs text-(--color-text-secondary)">
            {t("finance.goalsHint") || (locale === "lv" ? "Kopīgie krājumi — progress redzams visiem biedriem" : "Shared savings — progress visible to everyone")}
          </p>
        </div>
      </div>

      {goals.length === 0 ? (
        <GlassPanel style={cardStyle} className="p-6 text-center">
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">
            {locale === "lv" ? "Pagaidām nav pievienoti lieli mērķi." : "No big goals set yet."}
          </p>
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {goals.map((goal) => (
          <GlassPanel
            key={goal.id}
            className="group relative flex flex-col justify-between overflow-hidden p-4 transition-all hover:scale-[1.01]"
            style={cardStyle}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-(--color-text-primary)">
                  {goal.label}
                </p>
                <p className="mt-0.5 text-xs text-(--color-text-secondary)">
                  {goal.current} / {goal.target}
                </p>
              </div>
              <div className="ml-3 text-right">
                <p className="text-sm font-black text-(--color-accent)">
                  {goal.pct}%
                </p>
              </div>
            </div>

            <div className="relative h-3 overflow-hidden rounded-full bg-(--color-border)/20">
              {/* Botanical special: organic growth indicator */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${goal.pct}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="maj-botanical-goal-progress relative h-full rounded-full bg-(--color-accent)"
                style={{
                  background: `linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 80%, transparent), var(--color-accent))`,
                }}
              >
                {/* Botanical "leaf" at the end of progress */}
                <div className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 rotate-12 opacity-0 group-hover:opacity-100 transition-opacity">
                   <svg viewBox="0 0 24 24" fill="currentColor" className="text-(--color-accent)">
                     <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                   </svg>
                </div>
              </motion.div>
            </div>
          </GlassPanel>
        ))}
      </div>
      )}
    </section>
  );
}
