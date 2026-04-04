"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { hapticTap } from "@/lib/haptic";
import { useI18n } from "@/lib/i18n/i18n-context";

export function GlobalCornerActions() {
  const pathname = usePathname();
  const { t } = useI18n();

  if (pathname.startsWith("/auth")) {
    return null;
  }

  const items = [
    { href: "/settings", label: t("nav.settings"), side: "right-4", icon: "⚙" },
  ];

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] mx-auto max-w-lg">
      {items.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => hapticTap()}
            aria-label={item.label}
            className={[
              "pointer-events-auto absolute top-[max(0.9rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full border text-base backdrop-blur-xl transition",
              item.side,
              active
                ? "bg-[color:var(--color-surface)] text-[color:var(--color-primary)]"
                : "bg-[color:var(--color-surface)]/82 text-[color:var(--color-text)]",
            ].join(" ")}
            style={{
              borderColor: "var(--color-surface-border)",
              boxShadow: "0 12px 28px color-mix(in srgb, var(--color-primary) 12%, transparent)",
            }}
          >
            <span aria-hidden>{item.icon}</span>
          </Link>
        );
      })}
    </div>
  );
}
