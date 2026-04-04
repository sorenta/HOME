import { GlassPanel } from "@/components/ui/glass-panel";
import type { KitchenInventoryRecord } from "@/lib/kitchen";

type AiChefSuggestionsProps = {
  inventory: KitchenInventoryRecord[];
  urgentItems: KitchenInventoryRecord[];
  onOpenPlan: () => void;
};

function buildSuggestion(inventory: KitchenInventoryRecord[], urgentItems: KitchenInventoryRecord[]): string {
  const urgent = urgentItems[0]?.name;
  const stocked = inventory.find((item) => item.name !== urgent)?.name;

  if (urgent && stocked) {
    return `Sodien gatavo ${stocked} ar ${urgent}, lai samazinatu atlikumus.`;
  }

  if (urgent) {
    return `Ierosinajums: izlieto ${urgent} sodienas vakarinam.`;
  }

  return "Ierosinajums: izvelies vienu vienkarsu recepti no majas produktiem.";
}

export function AiChefSuggestions({ inventory, urgentItems, onOpenPlan }: AiChefSuggestionsProps) {
  const pinned = ["Cepti darzeni ar sieru", "Supa ar pupa un burkaniem", "Atra pasta ar tomatiem"];

  return (
    <>
      <GlassPanel className="space-y-3" style={{ background: "color-mix(in srgb, var(--color-surface-2) 90%, transparent)" }}>
        <div>
          <p className="text-xs uppercase tracking-[0.12em]" style={{ color: "var(--color-text-secondary)" }}>
            AI ieteikumi
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-primary)" }}>
            {buildSuggestion(inventory, urgentItems)}
          </p>
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-3" style={{ background: "color-mix(in srgb, var(--color-surface) 90%, transparent)" }}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.12em]" style={{ color: "var(--color-text-secondary)" }}>
            Nedelas receptes
          </p>
          <button
            type="button"
            onClick={onOpenPlan}
            className="rounded-full border px-3 py-1 text-xs font-semibold"
            style={{ borderColor: "color-mix(in srgb, var(--color-border) 56%, transparent)", color: "var(--color-text-primary)" }}
          >
            Atvert pilno planu
          </button>
        </div>

        <ul className="space-y-2">
          {pinned.map((recipe) => (
            <li
              key={recipe}
              className="rounded-xl border px-3 py-2 text-sm"
              style={{
                borderColor: "color-mix(in srgb, var(--color-border) 56%, transparent)",
                background: "color-mix(in srgb, var(--color-card) 88%, transparent)",
                color: "var(--color-text-primary)",
              }}
            >
              {recipe}
            </li>
          ))}
        </ul>
      </GlassPanel>
    </>
  );
}
