"use client";

import { useI18n } from "@/lib/i18n/i18n-context";
import { useKitchenItemTheme } from "@/components/kitchen/kitchen-theme-layer";
import type { ReactNode } from "react";

type ActionItem = {
  key: string;
  label: string;
  icon: ReactNode;
  title: string;
  onClick: () => void;
};

type KitchenQuickActionsProps = {
  onAddToInventory: () => void;
  onAddToCart: () => void;
  onMove: () => void;
  onMark: () => void;
};

function KitchenGlyph({ path }: { path: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {path}
    </svg>
  );
}

function ActionPill({ action }: { action: ActionItem }) {
  const { actionButton, categoryPill } = useKitchenItemTheme();

  return (
    <button
      type="button"
      onClick={action.onClick}
      title={action.title}
      className={`inline-flex shrink-0 items-center gap-2 border px-3 py-2 text-xs font-semibold transition-all duration-200 active:scale-95 ${actionButton}`}
      style={{
        borderColor: "color-mix(in srgb, var(--color-border) 42%, transparent)",
        color: "var(--color-text-primary)",
      }}
    >
      <span
        className={`inline-flex h-5 w-5 items-center justify-center text-[11px] ${categoryPill}`}
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

export function KitchenQuickActions({
  onAddToInventory,
  onAddToCart,
  onMove,
  onMark,
}: KitchenQuickActionsProps) {
  const { t } = useI18n();

  const actions: ActionItem[] = [
    {
      key: "home",
      label: t("kitchen.quickAction.addInventory"),
      title: t("kitchen.quickAction.addInventory"),
      icon: <KitchenGlyph path={<path d="M5 12.5h14M12 5.5v14" />} />,
      onClick: onAddToInventory,
    },
    {
      key: "cart",
      label: t("kitchen.quickAction.addCart"),
      title: t("kitchen.quickAction.addCart"),
      icon: (
        <KitchenGlyph
          path={
            <>
              <circle cx="9" cy="19" r="1.2" />
              <circle cx="17" cy="19" r="1.2" />
              <path d="M4 5h2l2 10h9l2-7H7" />
            </>
          }
        />
      ),
      onClick: onAddToCart,
    },
    {
      key: "move",
      label: t("kitchen.quickAction.moveToInventory"),
      title: t("kitchen.quickAction.moveToInventory"),
      icon: (
        <KitchenGlyph
          path={
            <>
              <path d="M4.5 12h11" />
              <path d="m12 7.5 4.5 4.5L12 16.5" />
            </>
          }
        />
      ),
      onClick: onMove,
    },
    {
      key: "mark",
      label: t("kitchen.quickAction.markPicked"),
      title: t("kitchen.quickAction.markPicked"),
      icon: <KitchenGlyph path={<path d="m5.5 12.5 4 4 9-9" />} />,
      onClick: onMark,
    },
  ];

  return (
    <section aria-label={t("kitchen.quickActions.ariaLabel")} className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-hide">
      <div className="flex min-w-full items-center gap-2">
        {actions.map((action) => (
          <ActionPill key={action.key} action={action} />
        ))}
      </div>
    </section>
  );
}
