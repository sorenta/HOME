import { GlassPanel } from "@/components/ui/glass-panel";
import type { KitchenInventoryRecord } from "@/lib/kitchen";

type InventoryPreviewProps = {
  items: KitchenInventoryRecord[];
  totalCount: number;
  onOpenFullList: () => void;
};

export function InventoryPreview({ items, totalCount, onOpenFullList }: InventoryPreviewProps) {
  const categorySummary = new Map<string, number>();
  for (const item of items) {
    const key = (item.category ?? "Cits").trim() || "Cits";
    categorySummary.set(key, (categorySummary.get(key) ?? 0) + 1);
  }

  const categoryHints = [...categorySummary.entries()].slice(0, 3);

  return (
    <GlassPanel className="space-y-4" style={{ background: "color-mix(in srgb, var(--color-surface) 90%, transparent)" }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.12em]" style={{ color: "var(--color-text-secondary)" }}>
            Majas tagad
          </p>
          <h2 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
            {totalCount} produkti
          </h2>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Paslaik nav pievienotu produktu.
        </p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 5).map((item) => (
            <article
              key={item.id}
              className="flex items-center justify-between rounded-xl border px-3 py-2"
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
            className="rounded-full border px-2.5 py-1 text-xs"
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
        className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold"
        style={{
          background: "color-mix(in srgb, var(--color-primary) 14%, transparent)",
          color: "var(--color-text-primary)",
        }}
      >
        Atvert pilno sarakstu
      </button>
    </GlassPanel>
  );
}
