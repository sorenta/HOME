"use client";

import { GlassPanel } from "@/components/ui/glass-panel";
import { useKitchenItemTheme } from "@/components/kitchen/kitchen-theme-layer";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { KitchenInventoryRecord } from "@/lib/kitchen";

type InventoryPreviewProps = {
  items: KitchenInventoryRecord[];
  totalCount: number;
  onOpenFullList: () => void;
};

export function InventoryPreview({ items, totalCount, onOpenFullList }: InventoryPreviewProps) {
  const { t } = useI18n();
  const { itemCard, categoryPill } = useKitchenItemTheme();

  const categorySummary = new Map<string, number>();
  for (const item of items) {
    const key = (item.category ?? t("kitchen.category.other")).trim() || t("kitchen.category.other");
    categorySummary.set(key, (categorySummary.get(key) ?? 0) + 1);
  }

  const categoryHints = [...categorySummary.entries()].slice(0, 3);

  return (
    <GlassPanel className="space-y-4" style={{ background: "color-mix(in srgb, var(--color-surface) 90%, transparent)" }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.12em]" style={{ color: "var(--color-text-secondary)" }}>
            {t("kitchen.label.homeNow")}
          </p>
          <h2 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
            {totalCount} {t("kitchen.summary.products")}
          </h2>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {t("kitchen.empty.stock")}
        </p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 5).map((item) => (
            <article
              key={item.id}
              className={`flex items-center justify-between border px-3 py-2 ${itemCard}`}
              style={{
                borderColor: "color-mix(in srgb, var(--color-border) 56%, transparent)",
                background: "color-mix(in srgb, var(--color-card) 88%, transparent)",
              }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                {item.name}
              </p>
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                {item.quantity}
                {item.unit ? ` ${item.unit}` : ""}
              </span>
            </article>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {categoryHints.map(([category, count]) => (
          <span
            key={category}
            className={`border px-2.5 py-1 text-xs ${categoryPill}`}
            style={{
              borderColor: "color-mix(in srgb, var(--color-border) 58%, transparent)",
              color: "var(--color-text-secondary)",
            }}
          >
            {category} - {count}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={onOpenFullList}
        className={`w-full px-4 py-2.5 text-sm font-semibold ${categoryPill}`}
        style={{
          background: "color-mix(in srgb, var(--color-primary) 14%, transparent)",
          color: "var(--color-text-primary)",
        }}
      >
        {t("kitchen.label.viewAll")}
      </button>
    </GlassPanel>
  );
}
