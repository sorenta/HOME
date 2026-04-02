"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { AppMark } from "@/components/branding/app-mark";
import { RequireAuth } from "@/components/auth/require-auth";
import { hapticTap } from "@/lib/haptic";
import { recordModuleVisit, type ModuleId } from "@/lib/bento-usage";

type Props = {
  title: string;
  /** When set, increments adaptive Bento usage for this module. */
  moduleId?: ModuleId;
  children: React.ReactNode;
  requireAuth?: boolean;
  /** Forge inner pages: tighter shell rhythm + control-surface framing. */
  shellVariant?: "default" | "forge";
};

export function ModuleShell({
  title,
  moduleId,
  children,
  requireAuth = true,
  shellVariant = "default",
}: Props) {
  useEffect(() => {
    if (moduleId) recordModuleVisit(moduleId);
  }, [moduleId]);

  const shellMod =
    shellVariant === "forge" ? "maj-module-shell--forge" : "";

  return (
    <div
      className={[
        "maj-module-shell maj-page-shell relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden",
        shellMod,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <motion.header
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="maj-section-gap relative z-10 flex items-center gap-[var(--maj-space-stack)]"
      >
        <Link
          href="/"
          onClick={() => hapticTap()}
          className="maj-header-chip flex h-10 w-10 items-center justify-center bg-[color:var(--color-surface)] text-lg text-[color:var(--color-primary)]"
          aria-label="Back"
        >
          ←
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <AppMark size="sm" />
          </div>
          <h1 className="maj-theme-module-title mt-0.5 text-[color:var(--color-text-primary)]">
            {title}
          </h1>
        </div>
      </motion.header>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="maj-stack-gap relative z-10 flex min-h-0 flex-1 flex-col"
      >
        {requireAuth ? <RequireAuth>{children}</RequireAuth> : children}
      </motion.div>
    </div>
  );
}
