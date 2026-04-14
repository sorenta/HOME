"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { hapticTap } from "@/lib/haptic";
import { useI18n } from "@/lib/i18n/i18n-context";

export function GlobalCornerActions() {
  const pathname = usePathname();
  const { t } = useI18n();
  const isDev = process.env.NODE_ENV !== "production";

  if (pathname.startsWith("/auth") || pathname.startsWith("/sandbox")) {
    return null;
  }

  const items = [
    { href: "/profile", label: t("nav.profile"), side: "right-4", icon: "👤" },
  ];

  async function resetLocalState() {
    const confirmed = window.confirm(
      "Notīrīt lokālo stāvokli šai vietnei? (cache, service worker, localStorage, sessionStorage)",
    );
    if (!confirmed) {
      return;
    }

    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.allSettled(
          registrations.map((registration) => registration.unregister()),
        );
      }

      if ("caches" in window) {
        const keys = await window.caches.keys();
        await Promise.allSettled(keys.map((key) => window.caches.delete(key)));
      }

      window.localStorage.clear();
      window.sessionStorage.clear();
    } catch (error) {
      console.error("Failed to reset local state", error);
    } finally {
      window.location.reload();
    }
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-60 mx-auto max-w-lg">
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
                ? "bg-(--color-surface) text-primary"
                : "bg-(--color-surface)/82 text-(--color-text)",
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
      {isDev ? (
        <button
          type="button"
          aria-label="Reset local state"
          className="pointer-events-auto absolute left-4 top-[max(0.9rem,env(safe-area-inset-top))] flex h-11 items-center justify-center rounded-full border px-3 text-[0.68rem] font-semibold uppercase tracking-[0.08em] backdrop-blur-xl transition active:scale-[0.98]"
          style={{
            borderColor: "var(--color-surface-border)",
            background: "color-mix(in srgb, var(--color-surface) 84%, transparent)",
            color: "var(--color-text)",
            boxShadow: "0 12px 28px color-mix(in srgb, var(--color-primary) 12%, transparent)",
          }}
          onClick={() => {
            hapticTap();
            void resetLocalState();
          }}
        >
          Reset
        </button>
      ) : null}
    </div>
  );
}
