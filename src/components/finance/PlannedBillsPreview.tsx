import { useRouter } from "next/navigation";
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
  const router = useRouter();

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
              className="group relative rounded-xl border px-3 py-2"
              style={{
                borderColor: "color-mix(in srgb, var(--color-border) 56%, transparent)",
                background: "color-mix(in srgb, var(--color-surface-2) 82%, transparent)",
              }}
            >
              <button
                onClick={() => router.push(`/finance?action=edit-bill&id=${item.id}`)}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-(--color-surface) opacity-0 transition-opacity hover:bg-(--color-surface-2) group-hover:opacity-100"
                aria-label="Edit bill"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>

              <div className="flex items-start justify-between gap-2 pr-6">
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
