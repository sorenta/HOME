"use client";

import { useI18n } from "@/lib/i18n/i18n-context";
import { motion } from "framer-motion";
import Link from "next/link";
import hiveStyles from "@/components/theme/hive.module.css";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

type Alert = {
  time: string;
  type: "WARN" | "INFO" | "CRIT";
  message: string;
  href: string;
};

export function HiveAlertLog() {
  const { locale } = useI18n();

  // Šos datus vēlāk varēs padot kā props no BentoDashboard
  const alerts: Alert[] = [
    { time: "20:45", type: "WARN", message: locale === "lv" ? "2 NEAPMAKSĀTI RĒĶINI" : "2 UNPAID BILLS", href: "/finance" },
    { time: "19:12", type: "INFO", message: locale === "lv" ? "MĀJAS DARBI GAIDA" : "HOUSEHOLD TASKS PENDING", href: "/events" },
    { time: "08:00", type: "CRIT", message: locale === "lv" ? "RESET CHECK-IN NAV VEIKTS" : "RESET CHECK-IN MISSING", href: "/reset" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className={`relative overflow-hidden ${hiveStyles.hiveCard} p-6 bg-black/40 border border-primary/30 shadow-[0_4px_16px_rgba(251,191,36,0.05)]`}
      style={{ clipPath: "polygon(12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px), 0% 12px)" }}
    >
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4">
         <div className="flex items-center gap-3 border-b border-primary/20 pb-3">
           <div className="w-10 h-10 flex items-center justify-center bg-primary/20 border border-primary/30 text-primary" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
             <ExclamationTriangleIcon className="w-5 h-5" />
           </div>
           <div>
             <h2 className="text-base font-semibold text-(--color-text-primary) tracking-tight">
               Uzmanības kodols
             </h2>
             <p className="text-xs font-medium text-(--color-text-secondary) mt-0.5 uppercase tracking-wider">
               Statusa žurnāls
             </p>
           </div>
         </div>

        <div className="flex flex-col gap-1">
          {alerts.map((alert, index) => (
            <Link
              key={index}
              href={alert.href}
              className="flex items-start gap-3 group transition-colors hover:bg-primary/5 p-2 rounded"
            >
              <span className="text-(--color-text-secondary) font-mono text-xs opacity-70 shrink-0 pt-0.5">
                {alert.time}
              </span>
              <div className="flex-1 min-w-0">
                <span className={`text-[0.65rem] font-bold tracking-widest uppercase block ${
                  alert.type === "CRIT" ? "text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]" :
                  alert.type === "WARN" ? "text-primary drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]" : "text-emerald-400"
                }`}>
                  {alert.type}
                </span>
                <span className="text-sm font-medium text-(--color-text-primary) group-hover:text-primary transition-colors block truncate"> 
                  {alert.message}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.section>
  );
}