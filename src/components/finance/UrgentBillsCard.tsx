"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useTheme } from "@/components/providers/theme-provider";

type UrgentBill = {
  id: string;
  label: string;
  amountLabel: string;
  dueLabel: string;
  ownerLabel?: string | null;
};

type UrgentBillsCardProps = {
  title: string;
  subtitle: string;
  emptyLabel: string;
  items: UrgentBill[];
  onSwipePay: (billId: string) => void;
  payingBillId: string | null;
};

export function UrgentBillsCard({
  title,
  subtitle,
  emptyLabel,
  items,
  onSwipePay,
  payingBillId,
}: UrgentBillsCardProps) {
  const { themeId } = useTheme();

  // Mēs pielāgojamies tēmai (īpaši Lucent, kas ir pamatā)
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
    <GlassPanel
      className="space-y-4"
      style={cardStyle}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.12em]" style={{ color: "var(--color-accent)" }}>
          {title}
        </p>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {subtitle}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {emptyLabel}
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <motion.article
              key={item.id}
              drag="x"
              dragConstraints={{ left: -12, right: 140 }}
              whileDrag={{ scale: 0.99 }}
              onDragEnd={(_event, info) => {
                if (info.offset.x > 88 && payingBillId !== item.id) {
                  onSwipePay(item.id);
                }
              }}
              className="rounded-xl border px-3 py-2"
              style={{
                borderColor: "color-mix(in srgb, var(--color-border) 58%, transparent)",
                background: "color-mix(in srgb, var(--color-surface-2) 84%, transparent)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                    {item.label}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {item.amountLabel} · {item.dueLabel}
                    {item.ownerLabel ? ` · ${item.ownerLabel}` : ""}
                  </p>
                </div>
                <span className="text-xs uppercase" style={{ color: "var(--color-text-secondary)" }}>
                  {payingBillId === item.id ? "Maksa..." : "Pavelc ->"}
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </GlassPanel>
  );
}
