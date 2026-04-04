import { GlassPanel } from "@/components/ui/glass-panel";

type PlannedBill = {
  id: string;
  label: string;
  amountLabel: string;
  dueLabel: string;
};

type PlannedBillsPreviewProps = {
  title: string;
  subtitle: string;
  emptyLabel: string;
  items: PlannedBill[];
};

export function PlannedBillsPreview({
  title,
  subtitle,
  emptyLabel,
  items,
}: PlannedBillsPreviewProps) {
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
            <article
              key={item.id}
              className="rounded-xl border px-3 py-2"
              style={{
                borderColor: "color-mix(in srgb, var(--color-border) 56%, transparent)",
                background: "color-mix(in srgb, var(--color-surface-2) 82%, transparent)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                  {item.label}
                </p>
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {item.amountLabel}
                </p>
              </div>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                {item.dueLabel}
              </p>
            </article>
          ))}
        </div>
      )}
    </GlassPanel>
  );
}
