/**
 * FORGE-only: stroke icons (machined / engraved — not emoji).
 * Bottom nav + module tiles share one visual language.
 */
import type { ModuleId } from "@/lib/bento-usage";

export type ForgeNavId =
  | "home"
  | "calendar"
  | "kitchen"
  | "finance"
  | "pharmacy"
  | "reset";

const base = {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.65,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

/** Bottom dock — crisp stroke marks */
export function ForgeNavIcon({
  id,
  size = 20,
  className,
}: {
  id: ForgeNavId;
  size?: number;
  className?: string;
}) {
  const cn = ["shrink-0", className].filter(Boolean).join(" ");
  const s = size;
  switch (id) {
    case "home":
      return (
        <svg {...base} className={cn} width={s} height={s} viewBox="0 0 24 24">
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...base} className={cn} width={s} height={s} viewBox="0 0 24 24">
          <rect x="3.5" y="4.5" width="17" height="16" rx="1.5" />
          <path d="M3.5 9.5h17M8 3v3M16 3v3" />
          <path d="M8 14h2M8 17h2M13 14h2M13 17h2" strokeWidth={1.35} />
        </svg>
      );
    case "kitchen":
      return (
        <svg {...base} className={cn} width={s} height={s} viewBox="0 0 24 24">
          <rect x="4" y="5" width="16" height="14" rx="1" />
          <path d="M4 10h16M9 5V3M15 5V3" />
          <circle cx="12" cy="15" r="1.35" strokeWidth={1.35} />
        </svg>
      );
    case "finance":
      return (
        <svg {...base} className={cn} width={s} height={s} viewBox="0 0 24 24">
          <path d="M4 16l5-6 4 3 7-9" />
          <path d="M17 7h3v3" />
          <path d="M5 19h14" strokeWidth={1.35} />
        </svg>
      );
    case "pharmacy":
      return (
        <svg {...base} className={cn} width={s} height={s} viewBox="0 0 24 24">
          <path d="M12 4v16M4 12h16" />
          <rect x="7" y="7" width="10" height="10" rx="1" strokeWidth={1.35} />
        </svg>
      );
    case "reset":
      return (
        <svg {...base} className={cn} width={s} height={s} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 8v8M8.5 12h7" strokeWidth={1.35} />
        </svg>
      );
  }
}

/** Module tiles — larger mark for legibility */
export function ForgeModuleGlyph({
  moduleId,
  size = 26,
  className,
}: {
  moduleId: ModuleId;
  size?: number;
  className?: string;
}) {
  return <ForgeNavIcon id={moduleId} size={size} className={className} />;
}
