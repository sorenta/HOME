import { motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { KitchenInventoryRecord } from "@/lib/kitchen";

type UrgentPreviewItem = {
  id: string;
  name: string;
  status: string;
  hint: string;
};

type UrgentItemsCardProps = {
  items: KitchenInventoryRecord[];
  onOpenAll: () => void;
};

function asUrgentPreview(item: KitchenInventoryRecord): UrgentPreviewItem {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let hint = "Parbaudit statusu";
  if (item.expiry_date) {
    const exp = new Date(item.expiry_date);
    exp.setHours(0, 0, 0, 0);
    const days = Math.ceil((exp.getTime() - today.getTime()) / 86400000);
    if (days <= 0) hint = "Beidzas sodien";
    else if (days === 1) hint = "Beidzas rit";
    else hint = `Beidzas pec ${days} dienam`;
  }

  if (item.status === "expiring") hint = "Driz jalieto";
  if (item.status === "low_stock") hint = "Sen stav plaukta";

  return {
    id: item.id,
    name: item.name,
    status: item.status,
    hint,
  };
}

export function UrgentItemsCard({ items, onOpenAll }: UrgentItemsCardProps) {
  const urgent = items
    .filter((item) => item.status === "expiring" || item.status === "low_stock" || item.expiry_date)
    .slice(0, 5)
    .map(asUrgentPreview);

  return (
    <GlassPanel className="space-y-4" style={{ background: "color-mix(in srgb, var(--color-surface) 90%, transparent)" }}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.12em]" style={{ color: "var(--color-text-secondary)" }}>
            Driz jaizlieto
          </p>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Swipe skelets gatavs turpmakai darbibu piesaistei.
          </p>
        </div>
      </div>

      {urgent.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Nav produktu ar steidzamu statusu.
        </p>
      ) : (
        <div className="space-y-2">
          {urgent.map((item) => (
            <motion.article
              key={item.id}
              drag="x"
              dragConstraints={{ left: -24, right: 24 }}
              whileDrag={{ scale: 0.99 }}
              className="rounded-xl border px-3 py-2"
              style={{
                borderColor: "color-mix(in srgb, var(--color-border) 58%, transparent)",
                background: "color-mix(in srgb, var(--color-surface-2) 84%, transparent)",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                  {item.name}
                </p>
                <span className="text-[11px] uppercase" style={{ color: "var(--color-text-secondary)" }}>
                  {item.status}
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                {item.hint}
              </p>
            </motion.article>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onOpenAll}
        className="w-full rounded-xl border px-4 py-2 text-sm font-semibold"
        style={{
          borderColor: "color-mix(in srgb, var(--color-border) 58%, transparent)",
          color: "var(--color-text-primary)",
        }}
      >
        Skatit visus
      </button>
    </GlassPanel>
  );
}
