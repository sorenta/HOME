"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { hapticTap } from "@/lib/haptic";
import { recordModuleVisit, type ModuleId } from "@/lib/bento-usage";
import { SeasonalRewardModal } from "@/components/seasonal/seasonal-reward-modal";
import { HiddenSeasonalCollectible } from "@/components/seasonal/hidden-seasonal-collectible";

type Props = {
  title: string;
  /** When set, increments adaptive Bento usage for this module. */
  moduleId?: ModuleId;
  children: React.ReactNode;
  requireAuth?: boolean;
};

export function ModuleShell({
  title,
  moduleId,
  children,
  requireAuth = true,
}: Props) {
  const pathname = usePathname();

  useEffect(() => {
    if (moduleId) recordModuleVisit(moduleId);
  }, [moduleId]);

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-28 pt-18">
      <motion.header
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-6 flex items-center gap-3"
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
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--color-secondary)]">
            HOME:OS
          </p>
          <h1 className="font-[family-name:var(--font-theme-display)] text-2xl font-semibold text-[color:var(--color-text)]">
            {title}
          </h1>
        </div>
        <div className="ml-auto">
          <HiddenSeasonalCollectible
            spotId={pathname === "/" ? "home" : pathname.replace("/", "")}
          />
        </div>
      </motion.header>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="relative z-10 flex min-h-0 flex-1 flex-col gap-4"
      >
        {requireAuth ? <RequireAuth>{children}</RequireAuth> : children}
      </motion.div>
      <SeasonalRewardModal />
    </div>
  );
}
