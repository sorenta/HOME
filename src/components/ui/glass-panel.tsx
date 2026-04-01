type Props = {
  children: React.ReactNode;
  className?: string;
};

export function GlassPanel({ children, className = "" }: Props) {
  return (
    <div
      className={[
        "maj-glass-panel bg-[color:var(--color-surface)] p-4 backdrop-blur-sm",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
