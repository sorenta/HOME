"use client";

import type { ReactNode } from "react";

type ZoneProps = {
  children: ReactNode;
  className?: string;
};

/** Single outer “deck”: rail accent + matte shell (no glass blur). */
export function ForgeZone({ children, className = "" }: ZoneProps) {
  return (
    <section className={["maj-forge-zone relative overflow-hidden rounded-xl", className].join(" ")}>
      <span className="maj-forge-zone-rail pointer-events-none absolute bottom-0 left-0 top-0 w-[3px]" aria-hidden />
      {children}
    </section>
  );
}

type DeckProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Primary control slab — angular, low radius, one rail. Use for the main Forge page chassis.
 */
export function ForgeMainDeck({ children, className = "" }: DeckProps) {
  return (
    <section className={["maj-forge-main-deck relative overflow-hidden text-left", className].join(" ")}>
      <span className="maj-forge-zone-rail pointer-events-none absolute bottom-0 left-0 top-0 w-[3px]" aria-hidden />
      {children}
    </section>
  );
}

type SystemSlabProps = {
  children: ReactNode;
  className?: string;
};

/** Secondary system / legal / keys slab — flatter, darker, visually subordinate to the main deck. */
export function ForgeSystemSlab({ children, className = "" }: SystemSlabProps) {
  return (
    <section className={["maj-forge-system-slab relative overflow-hidden text-left", className].join(" ")}>
      <span
        className="maj-forge-system-slab-accent pointer-events-none absolute left-0 right-0 top-0 h-px"
        aria-hidden
      />
      {children}
    </section>
  );
}

type DeckListProps = {
  children: ReactNode;
  className?: string;
};

/** Edge-to-edge rows inside a deck (no nested rounded “card”). */
export function ForgeDeckList({ children, className = "" }: DeckListProps) {
  return (
    <div
      className={[
        "maj-forge-deck-list divide-y divide-[color:color-mix(in_srgb,var(--color-border)_72%,transparent)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/** Strong band separator inside the main deck (structural, not a new container). */
export function ForgeBandRule({ dense }: { dense?: boolean }) {
  return (
    <div
      className={[
        "maj-forge-band-rule w-full",
        dense ? "my-0.5" : "my-1",
      ].join(" ")}
      aria-hidden
    />
  );
}

type ZoneHeaderProps = {
  title: string;
  eyebrow?: string;
  detail?: ReactNode;
};

export function ForgeZoneHeader({ title, eyebrow, detail }: ZoneHeaderProps) {
  return (
    <header className="maj-forge-zone-header flex items-start justify-between gap-3 border-b border-[color:color-mix(in_srgb,var(--color-border)_70%,transparent)] px-3 py-2.5">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="maj-forge-eyebrow text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="maj-theme-section-title text-[color:var(--color-text-primary)]">{title}</h2>
      </div>
      {detail ? (
        <div className="shrink-0 pt-0.5 text-[0.65rem] font-semibold text-[color:var(--color-text-secondary)]">
          {detail}
        </div>
      ) : null}
    </header>
  );
}

type SubLabelProps = { children: ReactNode; tight?: boolean };

/** In-zone section break without a new card. */
export function ForgeSubLabel({ children, tight }: SubLabelProps) {
  return (
    <p
      className={[
        "maj-forge-sublabel px-3 pb-1 pt-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-secondary)] first:pt-2",
        tight ? "maj-forge-sublabel--tight" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </p>
  );
}

type InsetProps = {
  children: ReactNode;
  className?: string;
};

/** Recessed field / list tray (use sparingly — prefer ForgeDeckList in main deck). */
export function ForgeInset({ children, className = "" }: InsetProps) {
  return <div className={["maj-forge-inset mx-2 mb-2 rounded-lg", className].join(" ")}>{children}</div>;
}

export function ForgeDivider() {
  return (
    <div
      className="mx-3 h-px bg-[color:color-mix(in_srgb,var(--color-border)_55%,transparent)]"
      aria-hidden
    />
  );
}

type RowButtonProps = {
  children: ReactNode;
  onClick: () => void;
  className?: string;
};

/** Compact utility row (toggle / navigation). */
export function ForgeRowButton({ children, onClick, className = "" }: RowButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "maj-forge-row flex w-full min-h-[2.75rem] items-center justify-between gap-3 px-3 py-2 text-left text-sm text-[color:var(--color-text-primary)]",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

type RowStaticProps = {
  children: ReactNode;
  className?: string;
};

export function ForgeRowStatic({ children, className = "" }: RowStaticProps) {
  return (
    <div
      className={[
        "maj-forge-row flex min-h-[2.75rem] items-center justify-between gap-3 px-3 py-2 text-sm text-[color:var(--color-text-primary)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

type MetricDotProps = {
  active?: boolean;
  label?: string;
};

/** Small status ring — abstract “instrument” readout, not a gauge. */
export function ForgeMetricDot({ active, label }: MetricDotProps) {
  return (
    <span className="flex items-center gap-1.5" title={label}>
      <span
        className={[
          "inline-flex h-2 w-2 rounded-full ring-1 ring-offset-1 ring-offset-[color:var(--color-background)]",
          active
            ? "bg-[color:var(--color-primary)] ring-[color:color-mix(in_srgb,var(--color-primary)_55%,transparent)]"
            : "bg-[color:color-mix(in_srgb,var(--color-text-secondary)_40%,transparent)] ring-[color:color-mix(in_srgb,var(--color-border)_70%,transparent)]",
        ].join(" ")}
        aria-hidden
      />
      {label ? (
        <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-[color:var(--color-text-secondary)]">
          {label}
        </span>
      ) : null}
    </span>
  );
}

type BodyProps = { children: ReactNode; className?: string };

export function ForgeZoneBody({ children, className = "" }: BodyProps) {
  return <div className={["space-y-0 pb-2 pt-1", className].join(" ")}>{children}</div>;
}
