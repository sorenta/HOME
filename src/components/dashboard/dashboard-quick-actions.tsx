"use client";

import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";
import { AppSectionIcon } from "@/components/icons";
import { hapticTap } from "@/lib/haptic";
import Link from "next/link";
import { motion } from "framer-motion";

export function DashboardQuickActions() {
  const { t } = useI18n();
  const { themeId } = useTheme();

  const actions = [
    { 
      id: "kitchen", 
      label: t("kitchen.quickAction.addCart"), 
      href: "/kitchen?action=add-cart", 
      sectionId: "kitchen" as const 
    },
    { 
      id: "finance", 
      label: t("finance.action.addExpense"), 
      href: "/finance?action=add-expense", 
      sectionId: "finance" as const 
    },
    { 
      id: "calendar", 
      label: t("dashboard.quickAction.addEvent"), 
      href: "/calendar?action=add-event", 
      sectionId: "calendar" as const 
    },
    { 
      id: "pharmacy", 
      label: t("dashboard.quickAction.addMed"), 
      href: "/pharmacy?action=add-med", 
      sectionId: "pharmacy" as const 
    },
  ];

  let shapeClass = "rounded-2xl";
  if (themeId === "hive") shapeClass = "theme-octagon";
  if (themeId === "botanical") shapeClass = "theme-organic";
  if (themeId === "pulse") shapeClass = "rounded-sm border-2 border-black shadow-[3px_3px_0px_#000]";
  if (themeId === "forge") shapeClass = "rounded-none metal-gradient";

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { scale: 0.8, opacity: 0 },
    show: { scale: 1, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
    >
      {actions.map((action) => (
        <motion.div key={action.id} variants={item}>
          <Link
            href={action.href}
            onClick={() => hapticTap()}
            className="group flex flex-col items-center gap-2 min-w-[72px]"
          >
            <div className={`relative flex h-14 w-14 items-center justify-center border border-(--color-surface-border) bg-(--color-surface) transition-all duration-300 group-hover:border-(--color-primary) group-hover:shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.2)] group-active:scale-90 ${shapeClass}`}>
              <AppSectionIcon sectionId={action.sectionId} themeId={themeId} size={24} />
              <div className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center bg-(--color-primary) text-white shadow-sm border-2 border-(--color-surface) ${themeId === 'pulse' ? 'rounded-none border-black' : 'rounded-full'}`}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
            </div>
            <span className="max-w-[80px] text-center text-[0.58rem] font-black uppercase tracking-wider text-(--color-text-secondary) opacity-80 group-hover:opacity-100 group-hover:text-(--color-text-primary)">
              {action.label}
            </span>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
