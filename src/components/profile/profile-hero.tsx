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
  
  const isForge = themeId === "forge";

  const avatarStyle: React.CSSProperties =
    themeId === "hive"
      ? { clipPath: "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)" }
      : themeId === "botanical"
        ? { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%", animation: "theme-morph 8s ease-in-out infinite" }
        : themeId === "pulse"
          ? { borderRadius: "4px", border: "3px solid #000", boxShadow: "3px 3px 0px #000" }
          : themeId === "forge"
            ? { borderRadius: "2px", borderLeft: "3px solid var(--color-primary)" }
            : {};

  if (isForge) {
    return (
      <GlassPanel className="p-0 overflow-hidden font-mono">
        <div className="border-b border-white/5 bg-white/5 px-4 py-3 flex items-center justify-between">
          <h2 className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-white/80">Personāla_ID</h2>
          <button
            onClick={onEditProfile}
            className="text-[0.55rem] font-black uppercase tracking-widest text-primary hover:underline"
          >
            [ EDIT_DATA ]
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-5">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center border border-white/10 bg-black/40 text-xl font-black text-white"
              style={avatarStyle}
            >
              {initials}
            </div>

            <div className="min-w-0 flex-1 py-1">
              <h2 className="truncate text-lg font-black tracking-tight text-white uppercase">{displayName}</h2>
              <p className="mt-1 text-[0.6rem] font-black uppercase tracking-[0.2em] text-primary">{role}</p>
              {email ? <p className="mt-1 truncate text-[0.55rem] text-white/40 uppercase">{email}</p> : null}
            </div>
          </div>

          <div className="border border-white/5 bg-black/20 px-4 py-3">
            <p className="text-[0.5rem] font-black text-primary uppercase tracking-widest mb-1">OPERACIONĀLAIS_STATUSS</p>
            <p className="text-[0.65rem] text-white/80 leading-relaxed uppercase">
              {statusText}
            </p>
          </div>
        </div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="space-y-4">
      <div className="flex items-start gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center border border-(--color-border) bg-[color-mix(in_srgb,var(--color-surface)_70%,transparent)] text-lg font-black text-(--color-text-primary)"
          style={{
            borderRadius: themeId === "lucent" ? "9999px" : "var(--radius-card)",
            ...avatarStyle,
          } as React.CSSProperties}
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-2xl font-black tracking-tight text-(--color-text-primary)">{displayName}</h2>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-secondary)">{role}</p>
          {email ? <p className="mt-1 truncate text-xs text-(--color-text-secondary)">{email}</p> : null}
        </div>
      </div>

      <p className="rounded-(--radius-card) border border-(--color-border) bg-[color-mix(in_srgb,var(--color-surface)_85%,transparent)] px-3 py-2 text-sm text-(--color-text-primary)">
        {statusText}
      </p>

      <button
        type="button"
        onClick={onEditProfile}
        className="w-full rounded-(--radius-button) bg-(--color-button-primary) px-4 py-3 text-sm font-semibold text-(--color-button-primary-text)"
      >
        Rediģēt profilu
      </button>
    </GlassPanel>
  );
}
