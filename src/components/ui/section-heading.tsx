type Props = {
  eyebrow?: string;
  title: string;
  detail?: string;
};

export function SectionHeading({ eyebrow, title, detail }: Props) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        {eyebrow ? <p className="maj-theme-eyebrow">{eyebrow}</p> : null}
        <h2 className="maj-theme-section-title mt-1">{title}</h2>
      </div>
      {detail ? (
        <span className="rounded-[var(--radius-chip)] border border-[color:var(--color-border)] px-2.5 py-1 font-[family-name:var(--font-theme-sans)] text-[0.68rem] text-[color:var(--color-text-secondary)]">
          {detail}
        </span>
      ) : null}
    </div>
  );
}
