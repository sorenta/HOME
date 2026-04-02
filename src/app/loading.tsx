export default function Loading() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-6">
      <div className="w-full max-w-xs rounded-3xl border border-[color:var(--color-surface-border)] bg-[color:var(--color-surface)] p-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-secondary)]">
          HOME:OS
        </p>
        <p className="mt-2 text-lg font-semibold text-[color:var(--color-text)]">
          Ielādē mājas ritmu...
        </p>
      </div>
    </div>
  );
}
