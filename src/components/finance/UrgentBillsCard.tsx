import { motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/glass-panel";

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
  return (
    <GlassPanel
      className="space-y-4"
      style={{
        borderRadius: "var(--radius-card)",
        background: "color-mix(in srgb, var(--color-surface) 90%, transparent)",
      }}
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
                <span className="text-[11px] uppercase" style={{ color: "var(--color-text-secondary)" }}>
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
