"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { GlassPanel } from "@/components/ui/glass-panel";

type WalletHeroProps = {
  title: string;
  subtitle: string;
  total: string;
  incomeShare: number;
  expenseShare: number;
  initials: string[];
};

export function WalletHero({
  title,
  subtitle,
  total,
  incomeShare,
  expenseShare,
  initials,
}: WalletHeroProps) {
  const { themeId } = useTheme();
  const leftInitial = initials[0] ?? "M";
  const rightInitial = initials[1] ?? "H";

  // Per-theme card style
  let cardStyle: React.CSSProperties = {
    borderRadius: "var(--radius-card)",
    background:
      "linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 88%, transparent), color-mix(in srgb, var(--color-surface-2) 84%, transparent))",
  };

  if (themeId === "forge") {
    cardStyle = {
      borderRadius: "8px",
      background:
        "linear-gradient(180deg, #0C0E10 0%, #080a0c 100%)",
      border: "1px solid rgba(217,31,38,0.28)",
      borderLeft: "3px solid rgba(217,31,38,0.7)",
      boxShadow: "0 0 28px rgba(217,31,38,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
    };
  } else if (themeId === "botanical") {
    cardStyle = {
      borderRadius: "36px",
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.72), rgba(238,232,216,0.85))",
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
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.82), rgba(248,244,238,0.6))",
      border: "1px solid rgba(184,150,106,0.24)",
      boxShadow:
        "0 16px 48px rgba(100,80,60,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
      backdropFilter: "blur(12px)",
    };
  } else if (themeId === "hive") {
    cardStyle = {
      borderRadius: "20px",
      background:
        "linear-gradient(135deg, rgba(255,246,214,0.95), rgba(255,240,188,0.9))",
      border: "1.5px solid rgba(217,119,6,0.28)",
      boxShadow: "0 8px 24px rgba(180,100,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
    };
  }

  // Balance text style per theme
  let balanceClass = "text-3xl font-semibold leading-none";
  if (themeId === "forge") balanceClass = "text-3xl font-black leading-none tracking-widest uppercase";
  if (themeId === "pulse") balanceClass = "text-4xl font-black leading-none";
  if (themeId === "lucent") balanceClass = "text-3xl font-light leading-none tracking-tight";
  if (themeId === "hive") balanceClass = "text-3xl font-bold leading-none";
  if (themeId === "botanical") balanceClass = "text-3xl font-semibold leading-none";

  return (
    <GlassPanel className="space-y-4" style={cardStyle}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--color-accent)" }}
          >
            {title}
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {subtitle}
          </p>
        </div>

        <div className="inline-flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
            style={{
              background: "color-mix(in srgb, var(--color-accent) 22%, transparent)",
              color: "var(--color-text-primary)",
              border: "1px solid color-mix(in srgb, var(--color-border) 56%, transparent)",
            }}
          >
            {leftInitial}
          </span>
          <span
            className="-ml-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
            style={{
              background: "color-mix(in srgb, var(--color-success) 20%, transparent)",
              color: "var(--color-text-primary)",
              border: "1px solid color-mix(in srgb, var(--color-border) 56%, transparent)",
            }}
          >
            {rightInitial}
          </span>
        </div>
      </div>

      <div>
        <p className={balanceClass} style={{ color: "var(--color-text-primary)" }}>
          {total}
        </p>
      </div>

      <div className="space-y-1.5">
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
                background:
                  "linear-gradient(90deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 65%, white))",
              }}
            />
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${expenseShare}%`,
                background:
                  "linear-gradient(90deg, color-mix(in srgb, var(--color-warning) 75%, var(--color-accent)), color-mix(in srgb, var(--color-warning) 94%, white))",
              }}
            />
          </div>
        </div>
        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          Kopskats no majas dalibnieku ierakstiem
        </p>
      </div>
    </GlassPanel>
  );
}
