type Size = "sm" | "md" | "lg";

const sizeClass: Record<Size, string> = {
  sm: "px-3 py-0.5 text-[0.76rem]",
  md: "",
  lg: "px-5 py-1.5 text-[1rem]",
};

type Props = {
  size?: Size;
  /** Use on splash / loading where theme tokens are not applied yet. */
  variant?: "ui" | "splash";
  className?: string;
};

export function AppMark({
  size = "md",
  variant = "ui",
  className = "",
}: Props) {
  // Pārbaudām tēmu (izmantojot datu atribūtu, jo šī ir zema līmeņa komponente)
  // Bet labāk izmantosim props vai globālo klasi
  
  const isForge = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'forge';

  const forgeBase = [
    "inline-flex items-center justify-center rounded-sm px-4 py-1 leading-none",
    "text-[0.85rem] font-bold tracking-[0.4em] uppercase",
    "bg-gradient-to-b from-gray-300 via-gray-500 to-gray-400",
    "text-black shadow-[0_2px_4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.3)]",
    "border border-black/20",
    "select-none cursor-default",
  ].join(" ");

  const base = isForge ? forgeBase : [
    "inline-flex items-center justify-center rounded-full px-4 py-1 leading-none",
    "text-[0.85rem] font-extralight tracking-[0.3em]",
    "border backdrop-blur-[2px] transition-all duration-700",
    "text-(--color-text-primary)",
    "border-[color-mix(in_srgb,var(--color-border)_78%,transparent)]",
    "bg-[color-mix(in_srgb,var(--color-card-elevated)_92%,transparent)]",
    "shadow-[0_10px_22px_color-mix(in_srgb,var(--color-text-primary)_8%,transparent)]",
    "animate-pulse hover:animate-none hover:text-(--color-text-primary) hover:border-[color-mix(in_srgb,var(--color-accent)_52%,var(--color-border))]",
    variant === "splash"
      ? "bg-[color-mix(in_srgb,var(--color-card-elevated)_96%,transparent)]"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={[base, sizeClass[size], className].filter(Boolean).join(" ")}
      aria-label="H:O"
    >
      H:O
    </span>
  );
}
