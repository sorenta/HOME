type Props = {
  eyebrow?: string;
  title: string;
  detail?: string;
};

export function SectionHeading({ eyebrow, title, detail }: Props) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        {eyebrow ? (
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-secondary)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-base font-semibold text-[color:var(--color-text)]">
          {title}
        </h2>
      </div>
      {detail ? (
        <span className="rounded-full border border-[color:var(--color-surface-border)] px-2.5 py-1 text-[0.7rem] text-[color:var(--color-secondary)]">
          {detail}
        </span>
      ) : null}
    </div>
  );
}
