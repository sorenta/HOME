"use client";

import { GlassPanel } from "@/components/ui/glass-panel";
import { useTheme } from "@/components/providers/theme-provider";
import type { HouseholdMember } from "@/lib/household";

type HouseholdCardProps = {
  householdName: string | null;
  roleLabel: string;
  members: HouseholdMember[];
};

function memberBadgeName(member: HouseholdMember): string {
  return member.display_name?.trim() || "Member";
}

function initialsFromName(name: string): string {
  const chunks = name.split(" ").map((c) => c.trim()).filter(Boolean);
  if (chunks.length === 0) return "M";
  if (chunks.length === 1) return chunks[0].slice(0, 2).toUpperCase();
  return `${chunks[0][0] ?? ""}${chunks[1][0] ?? ""}`.toUpperCase();
}

export function HouseholdCard({ householdName, roleLabel, members }: HouseholdCardProps) {
  const { themeId } = useTheme();

  // Avatar shape per theme
  const avatarStyle: React.CSSProperties =
    themeId === "hive"
      ? { clipPath: "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)" }
      : themeId === "botanical"
        ? { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }
        : themeId === "pulse"
          ? { borderRadius: "4px", border: "2px solid #000" }
          : themeId === "forge"
            ? { borderRadius: "4px", borderLeft: "2px solid var(--color-primary)" }
            : { borderRadius: "9999px" }; // lucent — circle

  // Member row card style per theme
  const rowStyle: React.CSSProperties =
    themeId === "pulse"
      ? { border: "2px solid #000", boxShadow: "2px 2px 0px #000", borderRadius: "var(--radius-card)" }
      : themeId === "forge"
        ? { borderLeft: "2px solid var(--color-primary)", borderRadius: "var(--radius-card)" }
        : themeId === "hive"
          ? { borderWidth: "2px", borderRadius: "var(--radius-card)" }
          : {};

  return (
    <GlassPanel className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-secondary)">
          Mans household
        </p>
        <h3 className="mt-1 text-lg font-bold text-(--color-text-primary)">
          {householdName || "Personal space"}
        </h3>
        <p className="mt-1 text-sm text-(--color-text-secondary)">{roleLabel}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {members.slice(0, 6).map((member) => {
          const name = memberBadgeName(member);
          return (
            <div
              key={member.id}
              className="flex items-center gap-2 border border-(--color-border) bg-[color-mix(in_srgb,var(--color-surface)_85%,transparent)] px-2.5 py-2"
              style={{
                borderRadius: "var(--radius-card)",
                ...rowStyle,
              }}
            >
              <span
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center bg-(--color-surface-2) text-xs font-bold text-(--color-text-primary)"
                style={avatarStyle}
              >
                {initialsFromName(name)}
              </span>
              <span className="truncate text-xs font-medium text-(--color-text-primary)">{name}</span>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}
