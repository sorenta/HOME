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

export function AppMark({
  size = "md",
  variant = "ui",
  className = "",
}: Props) {
  const base = [
    "inline-flex items-center justify-center rounded-full font-extrabold leading-none",
    "bg-[#8f959d] text-white shadow-sm",
    variant === "splash" ? "ring-1 ring-white/25" : "",
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
