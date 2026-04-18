"use client";

import { type ThemeId, transitionForTheme } from "@/lib/theme-logic";
import { useTheme } from "@/components/providers/theme-provider";
import { GlassPanel } from "@/components/ui/glass-panel";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/i18n-context";

type WalletHeroProps = {
  title: string;
  subtitle: string;
  total: string;
  incomeShare: number;
  expenseShare: number;
  initials: string[];
};

function OdometerDigit({ value, themeId }: { value: string, themeId: ThemeId }) {
  if (isNaN(Number(value))) return <span className="px-0.5">{value}</span>;
  const spring = transitionForTheme(themeId);

  return (
    <div className="relative h-[1.2em] w-[0.6em] overflow-hidden inline-flex justify-center items-center">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: 25, opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -25, opacity: 0, filter: "blur(4px)" }}
          transition={spring}
          className="font-mono tabular-nums inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function WalletHero({
  title,
  subtitle,
  total,
  incomeShare,
  expenseShare,
  initials,
}: WalletHeroProps) {
  const { themeId } = useTheme();
  const { locale } = useI18n();

  const joinedInitials = initials.slice(0, 2).join(" & ");

  // Per-theme card style
  let cardStyle: React.CSSProperties = {
    borderRadius: "var(--radius-card)",
    background:
      "linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 88%, transparent), color-mix(in srgb, var(--color-surface-2) 84%, transparent))",
  };

  if (themeId === "forge") {
    cardStyle = {
      borderRadius: "8px",
      background: "linear-gradient(180deg, #0C0E10 0%, #080a0c 100%)",
      border: "1px solid rgba(217,31,38,0.28)",
      borderLeft: "3px solid rgba(217,31,38,0.7)",
      boxShadow: "0 0 28px rgba(217,31,38,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
    };
  } else if (themeId === "botanical") {
    cardStyle = {
      borderRadius: "36px",
      background: "linear-gradient(135deg, rgba(255,255,255,0.72), rgba(238,232,216,0.85))",
      border: "1px solid rgba(62,107,50,0.22)",
      boxShadow: "0 8px 24px rgba(51,66,41,0.08), inset 0 1px 0 rgba(255,255,255,0.7)",
    };
  } else if (themeId === "pulse") {
    cardStyle = {
      borderRadius: "1.5rem",
      background: "#fff",
      border: "2.5px solid #000",
      boxShadow: "5px 5px 0 #000",
    };
  } else if (themeId === "lucent") {
    cardStyle = {
      borderRadius: "36px",
      background: "linear-gradient(180deg, rgba(255,255,255,0.82), rgba(248,244,238,0.6))",
      border: "1px solid rgba(184,150,106,0.24)",
      boxShadow: "0 16px 48px rgba(100,80,60,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
      backdropFilter: "blur(12px)",
    };
  } else if (themeId === "hive") {
    cardStyle = {
      borderRadius: "20px",
      background: "linear-gradient(135deg, rgba(255,246,214,0.95), rgba(255,240,188,0.9))",
      border: "1.5px solid rgba(217,119,6,0.28)",
      boxShadow: "0 8px 24px rgba(180,100,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
    };
  }

  let balanceClass = "text-3xl font-semibold leading-none";
  if (themeId === "forge") balanceClass = "text-3xl font-black leading-none tracking-widest uppercase";
  if (themeId === "pulse") balanceClass = "text-4xl font-black leading-none";
  if (themeId === "lucent") balanceClass = "text-3xl font-light leading-none tracking-tight";
  if (themeId === "hive") balanceClass = "text-3xl font-bold leading-none";
  if (themeId === "botanical") balanceClass = "text-3xl font-semibold leading-none";

  return (
    <GlassPanel className="space-y-6 p-6 overflow-hidden relative group" style={cardStyle}>
      {/* ── Lucent Shimmer Effect ── */}
      {themeId === "lucent" && (
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 5 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] pointer-events-none z-0"
        />
      )}

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="space-y-1">
          <p className={`text-xs uppercase tracking-[0.16em] ${themeId === "forge" ? "text-primary font-black" : "text-(--color-accent) font-bold"}`}>
            {title}
          </p>
          <p className="text-sm font-medium text-(--color-text-secondary)">{subtitle}</p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border" style={{ borderColor: "color-mix(in srgb, var(--color-border) 40%, transparent)", background: "color-mix(in srgb, var(--color-surface) 60%, transparent)" }}>
          <div className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-accent)" }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-wider text-(--color-text-primary)">
              {joinedInitials}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center relative z-10">
        <div className={balanceClass} style={{ color: "var(--color-text-primary)" }}>
          {total.split('').map((char, i) => (
            <OdometerDigit key={i} value={char} themeId={themeId} />
          ))}
        </div>
      </div>

      <div className="space-y-2 relative z-10">
        <div
          className="h-2 w-full overflow-hidden"
          style={{
            borderRadius: "var(--radius-pill)",
            background: "color-mix(in srgb, var(--color-border) 36%, transparent)",
          }}
        >
          <div className="flex h-full w-full">
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${incomeShare}%`,
                background: "linear-gradient(90deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 65%, white))",
              }}
            />
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${expenseShare}%`,
                background: "linear-gradient(90deg, color-mix(in srgb, var(--color-warning) 75%, var(--color-accent)), color-mix(in srgb, var(--color-warning) 94%, white))",
              }}
            />
          </div>
        </div>
        <div className="flex justify-between items-center px-1">
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--color-accent)" }}>
            {locale === "lv" ? "Ienākumi" : "Income"}
          </p>
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--color-warning)" }}>
            {locale === "lv" ? "Izdevumi" : "Expenses"}
          </p>
        </div>
      </div>
    </GlassPanel>
  );
}
