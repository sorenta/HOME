import type { ReactNode } from "react";

type ActionItem = {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
};

type FinanceQuickActionsProps = {
  onAddExpense: () => void;
  onAddPayment: () => void;
  onMarkPaid: () => void;
  onEdit: () => void;
};

function ActionPill({ action }: { action: ActionItem }) {
  return (
    <button
      type="button"
      onClick={action.onClick}
      className="inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors"
      style={{
        borderColor: "color-mix(in srgb, var(--color-border) 62%, transparent)",
        background: "color-mix(in srgb, var(--color-surface-2) 82%, transparent)",
        color: "var(--color-text-primary)",
      }}
    >
      <span
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px]"
        style={{
          background: "color-mix(in srgb, var(--color-primary) 18%, transparent)",
          color: "var(--color-text-primary)",
        }}
      >
        {action.icon}
      </span>
      <span>{action.label}</span>
    </button>
  );
}

export function FinanceQuickActions({
  onAddExpense,
  onAddPayment,
  onMarkPaid,
  onEdit,
}: FinanceQuickActionsProps) {
  const actions: ActionItem[] = [
    { key: "expense", label: "Pievienot terinu", icon: "+", onClick: onAddExpense },
    { key: "payment", label: "Pievienot maksajumu", icon: "€", onClick: onAddPayment },
    { key: "mark", label: "Atzimet ka apmaksatu", icon: "✓", onClick: onMarkPaid },
    { key: "edit", label: "Rediget", icon: "✎", onClick: onEdit },
  ];

  return (
    <section aria-label="Atrie finansu soIi" className="-mx-1 overflow-x-auto px-1 pb-1">
      <div className="flex min-w-full items-center gap-2">
        {actions.map((action) => (
          <ActionPill key={action.key} action={action} />
        ))}
      </div>
    </section>
  );
}
