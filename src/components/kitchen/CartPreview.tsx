import { GlassPanel } from "@/components/ui/glass-panel";
import type { ShoppingRecord } from "@/lib/kitchen";

type CartPreviewProps = {
  items: ShoppingRecord[];
  onOpenAll: () => void;
};

function contributorLabel(index: number): string | null {
  if (index % 3 === 0) return "Partneris";
  if (index % 4 === 0) return "Biedrs";
  return null;
}

export function CartPreview({ items, onOpenAll }: CartPreviewProps) {
  const preview = items.slice(0, 5);

  return (
    <GlassPanel className="space-y-4" style={{ background: "color-mix(in srgb, var(--color-surface) 90%, transparent)" }}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.12em]" style={{ color: "var(--color-text-secondary)" }}>
            Janoperk
          </p>
          <h2 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
            {items.length} ieraksti
          </h2>
        </div>
      </div>

      {preview.length === 0 ? (
        <div
          className="rounded-xl border px-4 py-5 text-sm"
          style={{
            borderColor: "color-mix(in srgb, var(--color-border) 56%, transparent)",
            color: "var(--color-text-secondary)",
            background: "color-mix(in srgb, var(--color-surface-2) 80%, transparent)",
          }}
        >
          Viss nopirkts.
        </div>
      ) : (
        <div className="space-y-2">
          {preview.map((item, index) => {
            const by = contributorLabel(index);
            return (
              <article
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2"
                style={{
                  borderColor: "color-mix(in srgb, var(--color-border) 56%, transparent)",
                  background: "color-mix(in srgb, var(--color-card) 88%, transparent)",
                }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                    {item.title}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {item.quantity}
                    {item.unit ? ` ${item.unit}` : ""}
                  </p>
                </div>

                {by ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]"
                    style={{
                      borderColor: "color-mix(in srgb, var(--color-border) 62%, transparent)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <span
                      aria-hidden
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full"
                      style={{ background: "color-mix(in srgb, var(--color-primary) 18%, transparent)" }}
                    >
                      {by[0]}
                    </span>
                    {by}
                  </span>
                ) : null}
              </article>
            );
          })}
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
