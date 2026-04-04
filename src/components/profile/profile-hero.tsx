"use client";

import { useMemo } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useTheme } from "@/components/providers/theme-provider";

type ProfileHeroProps = {
  displayName: string;
  role: string;
  email?: string;
  statusText: string;
  onEditProfile: () => void;
};

function getInitials(value: string): string {
  const parts = value
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return "ME";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function ProfileHero({ displayName, role, email, statusText, onEditProfile }: ProfileHeroProps) {
  const { themeId } = useTheme();
  const initials = useMemo(() => getInitials(displayName), [displayName]);
  const avatarStyle =
    themeId === "hive"
      ? { clipPath: "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)" }
      : undefined;

  return (
    <GlassPanel className="space-y-4">
      <div className="flex items-start gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_70%,transparent)] text-lg font-black text-[color:var(--color-text-primary)]"
          style={{
            borderRadius: themeId === "lucent" ? "9999px" : "var(--radius-card)",
            ...avatarStyle,
          }}
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-2xl font-black tracking-tight text-[color:var(--color-text-primary)]">{displayName}</h2>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)]">{role}</p>
          {email ? <p className="mt-1 truncate text-xs text-[color:var(--color-text-secondary)]">{email}</p> : null}
        </div>
      </div>

      <p className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_85%,transparent)] px-3 py-2 text-sm text-[color:var(--color-text-primary)]">
        {statusText}
      </p>

      <button
        type="button"
        onClick={onEditProfile}
        className="w-full rounded-[var(--radius-button)] bg-[color:var(--color-button-primary)] px-4 py-3 text-sm font-semibold text-[color:var(--color-button-primary-text)]"
      >
        Rediģēt profilu
      </button>
    </GlassPanel>
  );
}
