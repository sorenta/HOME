"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { AppMark } from "@/components/branding/app-mark";
import { RequireAuth } from "@/components/auth/require-auth";
import { hapticTap } from "@/lib/haptic";
import { recordModuleVisit, type ModuleId } from "@/lib/bento-usage";
import { useTheme } from "@/components/providers/theme-provider";

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
  const { themeId } = useTheme();

  useEffect(() => {
    if (moduleId) recordModuleVisit(moduleId);
  }, [moduleId]);

  // "Atpakaļ" pogas maģiskais dizains katrai tēmai
  let backBtnTheme = "bg-card text-foreground rounded-full shadow-sm border border-border hover:scale-105";
  
  if (themeId === "lucent") {
    backBtnTheme = "bg-card/60 backdrop-blur-md text-foreground rounded-full shadow-theme border border-border/50 hover:scale-105";
  }
  if (themeId === "hive") {
    backBtnTheme = "bg-primary text-primary-foreground octagon border-2 border-amber-500 hover:scale-105";
  }
  if (themeId === "pulse") {
    backBtnTheme = "bg-primary text-primary-foreground rounded-sm border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000]";
  }
  if (themeId === "forge") {
    backBtnTheme = "metal-gradient border-2 border-primary text-primary rounded-sm shadow-inner hover:bg-primary/20";
  }
  if (themeId === "botanical") {
    backBtnTheme = "bg-primary text-primary-foreground organic-shape hover:scale-105";
  }

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-8 md:p-8 space-y-6">
      
      {/* 1. Moduļa Galvene (Header) */}
      <motion.header
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center gap-4 border-b border-border/50 pb-4"
      >
        <Link
          href="/"
          onClick={() => hapticTap()}
          className={`flex h-12 w-12 items-center justify-center text-lg font-bold transition-all duration-300 ${backBtnTheme}`}
          aria-label="Atpakaļ"
        >
          ←
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <AppMark size="sm" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black mt-0.5 tracking-tight text-foreground">
            {title}
          </h1>
        </div>
      </motion.header>

      {/* 2. Moduļa Saturs (Children) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="relative z-10 flex min-h-0 flex-1 flex-col space-y-6"
      >
        {requireAuth ? <RequireAuth>{children}</RequireAuth> : children}
      </motion.div>
    </div>
  );
}