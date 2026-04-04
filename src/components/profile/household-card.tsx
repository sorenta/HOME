"use client";

import { GlassPanel } from "@/components/ui/glass-panel";
import type { HouseholdMember } from "@/lib/household";

type HouseholdCardProps = {
  householdName: string | null;
  roleLabel: string;
  members: HouseholdMember[];
};

function memberBadgeName(member: HouseholdMember): string {
  const raw = member.display_name?.trim() || "Member";
  return raw;
}

function initialsFromName(name: string): string {
  const chunks = name
    .split(" ")
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  if (chunks.length === 0) return "M";
  if (chunks.length === 1) return chunks[0].slice(0, 1).toUpperCase();
  return `${chunks[0][0] ?? ""}${chunks[1][0] ?? ""}`.toUpperCase();
}

export function HouseholdCard({ householdName, roleLabel, members }: HouseholdCardProps) {
  return (
    <GlassPanel className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)]">Mans household</p>
        <h3 className="mt-1 text-lg font-bold text-[color:var(--color-text-primary)]">{householdName || "Personal space"}</h3>
        <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">{roleLabel}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {members.slice(0, 6).map((member) => {
          const name = memberBadgeName(member);
          return (
            <div
              key={member.id}
              className="flex items-center gap-2 rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_85%,transparent)] px-2.5 py-2"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-surface-2)] text-xs font-bold text-[color:var(--color-text-primary)]">
                {initialsFromName(name)}
              </span>
              <span className="truncate text-xs font-medium text-[color:var(--color-text-primary)]">{name}</span>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}
