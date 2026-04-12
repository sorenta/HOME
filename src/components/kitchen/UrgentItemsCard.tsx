import { motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useKitchenItemTheme } from "@/components/kitchen/kitchen-theme-layer";
import { useI18n } from "@/lib/i18n/i18n-context";
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

type TFunc = (key: string, vars?: Record<string, string>) => string;

function asUrgentPreview(item: KitchenInventoryRecord, t: TFunc): UrgentPreviewItem {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let hint = t("kitchen.ai.key.status"); // Generic status fallback
  if (item.expiry_date) {
    const exp = new Date(item.expiry_date);
    exp.setHours(0, 0, 0, 0);
    const days = Math.ceil((exp.getTime() - today.getTime()) / 86400000);
    if (days <= 0) hint = t("kitchen.status.expired") || "Beidzas šodien";
    else if (days === 1) hint = t("kitchen.status.expiringTomorrow") || "Beidzas rīt";
    else hint = (t("kitchen.status.expiringIn") || "Beidzas pēc {n} dienām").replace("{n}", String(days));
  }

  if (item.status === "expiring") hint = t("kitchen.status.expiringSoon") || "Drīz jālieto";
  if (item.status === "low_stock") hint = t("kitchen.status.lowStock") || "Zems atlikums";

  return {
    id: item.id,
    name: item.name,
    status: item.status,
    hint,
  };
}

export function UrgentItemsCard({ items, onOpenAll }: UrgentItemsCardProps) {
  const { t } = useI18n();
  const { itemCard, categoryPill } = useKitchenItemTheme();
  
  const urgent = items
    .filter((item) => item.status === "expiring" || item.status === "low_stock" || item.expiry_date)
    .slice(0, 5)
    .map(item => asUrgentPreview(item, t));

  return (
    <GlassPanel className="space-y-4" style={{ background: "color-mix(in srgb, var(--color-surface) 90%, transparent)" }}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.12em]" style={{ color: "var(--color-text-secondary)" }}>
            {t("kitchen.label.urgent")}
          </p>
          <p className="text-xs text-(--color-text-secondary) opacity-70">
            {t("kitchen.hint.swipeSkelet")}
          </p>
        </div>
      </div>

      {urgent.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {t("kitchen.empty.urgent")}
        </p>
      ) : (
        <div className="space-y-2">
          {urgent.map((item) => (
            <motion.article
              key={item.id}
              drag="x"
              dragConstraints={{ left: -24, right: 24 }}
              whileDrag={{ scale: 0.99 }}
              className={`border px-3 py-2 ${itemCard}`}
              style={{
                borderColor: "color-mix(in srgb, var(--color-border) 58%, transparent)",
                background: "color-mix(in srgb, var(--color-surface-2) 84%, transparent)",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                  {item.name}
                </p>
                <span className="text-xs uppercase" style={{ color: "var(--color-text-secondary)" }}>
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
        className={`w-full border px-4 py-2 text-sm font-semibold ${categoryPill}`}
        style={{
          borderColor: "color-mix(in srgb, var(--color-border) 58%, transparent)",
          color: "var(--color-text-primary)",
        }}
      >
        {t("kitchen.label.viewAll")}
      </button>
    </GlassPanel>
  );
}
