type Size = "sm" | "md" | "lg";

const sizeClass: Record<Size, string> = {
  sm: "text-xs px-2 py-0.5",
  md: "text-[0.95rem] px-2.5 py-1",
  lg: "text-2xl px-4 py-2.5 tracking-tight",
};

type Props = {
  size?: Size;
  /** Use on splash / loading where theme tokens are not applied yet. */
  variant?: "ui" | "splash";
  className?: string;
};

/**
 * Primary app mark: **H:0** — light frosted surface, dark type (splash);
 * theme-aware on in-app surfaces (Forge / Canopy invert for contrast).
 */
export function AppMark({
  size = "md",
  variant = "ui",
  className = "",
}: Props) {
  const base =
    variant === "splash"
      ? "maj-app-mark maj-app-mark--splash"
      : "maj-app-mark";
  return (
    <span
      className={[base, sizeClass[size], className].filter(Boolean).join(" ")}
      aria-label="H:0"
    >
      H:0
    </span>
  );
}
