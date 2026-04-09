"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { type AppSectionId } from "@/components/icons";
import { hapticTap } from "@/lib/haptic";
import { recordModuleVisit, type ModuleId } from "@/lib/bento-usage";
import { useTheme } from "@/components/providers/theme-provider";
import { useI18n } from "@/lib/i18n/i18n-context";

type Props = {
  title: string;
  sectionId?: AppSectionId;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  /** When set, increments adaptive Bento usage for this module. */
  moduleId?: ModuleId;
  children: React.ReactNode;
  requireAuth?: boolean;
};

export function ModuleShell({
  title,
  sectionId,
  description,
  actionHref,
  actionLabel,
  moduleId,
  children,
  requireAuth = true,
}: Props) {
  const { t } = useI18n();
  const { themeId } = useTheme();

  useEffect(() => {
    if (moduleId) recordModuleVisit(moduleId);
  }, [moduleId]);

  // "Atpakaļ" pogas maģiskais dizains katrai tēmai
  let backBtnTheme = "bg-card text-foreground rounded-full shadow-sm border border-border hover:scale-105 py-2.5 px-4";

  if (themeId === "lucent") {
    backBtnTheme = "bg-card/60 backdrop-blur-md text-foreground rounded-full shadow-theme border border-border/50 hover:scale-105 py-2.5 px-4";
  }
  if (themeId === "hive") {
    backBtnTheme = "bg-primary text-primary-foreground theme-octagon border-2 border-amber-500 hover:scale-105 py-2.5 px-4";
  }
  if (themeId === "pulse") {
    backBtnTheme = "bg-primary text-primary-foreground rounded-sm border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] py-2.5 px-4";
  }
  if (themeId === "forge") {
    backBtnTheme = "metal-gradient border border-primary/40 text-primary rounded-sm shadow-[inset_0_0_10px_rgba(225,29,46,0.2)] hover:bg-primary/10 w-10 h-10 flex items-center justify-center relative group";
  }
  if (themeId === "botanical") {
    backBtnTheme = "bg-primary text-primary-foreground theme-organic hover:scale-105 py-2.5 px-4";
  }

  const backBtnClass = `flex items-center gap-2 transition-all duration-300 ${backBtnTheme}`;


  const shellClass = `maj-module-shell maj-module-shell--${themeId}`;
  const headerClass = `maj-module-header maj-module-header--${themeId}`;
  const contentClass = `maj-module-content maj-module-content--${themeId}`;
  const titleClass = themeId === "forge" 
    ? "font-(family-name:--font-rajdhani) font-bold uppercase tracking-[0.2em] text-white drop-shadow-[0_0_10px_rgba(225,29,46,0.3)]" 
    : `maj-module-title maj-module-title--${themeId}`;
  const actionClass = `maj-module-action maj-module-action--${themeId}`;

  // Per-theme entrance spring config
  const headerTransition =
    themeId === "forge"
      ? { type: "spring" as const, stiffness: 520, damping: 38 }
      : themeId === "lucent"
        ? { type: "spring" as const, stiffness: 80, damping: 20 }
        : themeId === "pulse"
          ? { type: "spring" as const, stiffness: 620, damping: 30 }
          : themeId === "botanical"
            ? { type: "spring" as const, stiffness: 110, damping: 22 }
            : { type: "spring" as const, stiffness: 280, damping: 32 };

  const contentTransition =
    themeId === "forge"
      ? { delay: 0.04, type: "spring" as const, stiffness: 480, damping: 40 }
      : themeId === "lucent"
        ? { delay: 0.12, type: "spring" as const, stiffness: 70, damping: 18 }
        : themeId === "pulse"
          ? { delay: 0.03, type: "spring" as const, stiffness: 580, damping: 28 }
          : themeId === "botanical"
            ? { delay: 0.1, type: "spring" as const, stiffness: 100, damping: 20 }
            : { delay: 0.05 };

  return (
    <div
      className={`relative z-1 flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-8 md:p-8 space-y-6 ${shellClass}`}
      data-section-id={sectionId}
    >
      
      {/* 1. Moduļa Galvene (Header) */}
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={headerTransition}
        className={`relative z-10 flex items-start gap-4 pb-4 ${headerClass}`}
      >
        <Link
          href="/"
          onClick={() => hapticTap()}
          className={`${backBtnClass} ${themeId === "forge" ? "-mt-1" : ""}`}
          aria-label={t("nav.back")}
        >
          {themeId === "forge" ? (
            <>
              <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-primary group-hover:scale-125 transition-transform" />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="butt" strokeLinejoin="miter">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-bold pr-1">{t("nav.back")}</span>
            </>
          )}
        </Link>
        <div className="min-w-0 flex-1 relative">
          <h1 className={`mt-0.5 text-2xl md:text-3xl font-black tracking-tight text-foreground ${titleClass}`}>
            {title}
          </h1>
          {description ? (
            <p className="maj-module-description">
              {description}
            </p>
          ) : null}
        </div>
        {actionHref && actionLabel ? (
          <Link href={actionHref} onClick={() => hapticTap()} className={actionClass}>
            {actionLabel}
          </Link>
        ) : null}
      </motion.header>

      {/* 2. Moduļa Saturs (Children) */}
      <motion.div
        initial={{ opacity: 0, y: themeId === "lucent" ? 12 : themeId === "botanical" ? 10 : 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={contentTransition}
        className={`relative z-10 flex min-h-0 flex-1 flex-col space-y-6 ${contentClass}`}
      >
        {requireAuth ? <RequireAuth>{children}</RequireAuth> : children}
      </motion.div>

      {/* 3. Theme-specific decorative/content zones */}
      <div aria-hidden className="relative z-0">
        {themeId === "forge" ? (
          <div className="maj-forge-control-deck" />
        ) : themeId === "botanical" ? (
          <div className="maj-botanical-shelf" />
        ) : themeId === "pulse" ? (
          <div className="maj-pulse-hero-band" />
        ) : themeId === "lucent" ? (
          <div className="maj-lucent-stack" />
        ) : themeId === "hive" ? (
          <div className="maj-hive-metrics-honey" />
        ) : null}
      </div>
    </div>
  );
}
