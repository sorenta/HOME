"use client";

import { useI18n } from "@/lib/i18n/i18n-context";
import { motion } from "framer-motion";
import Link from "next/link";

type Alert = {
  time: string;
  type: "WARN" | "INFO" | "CRIT";
  message: string;
  href: string;
};

export function ForgeAlertLog() {
  const { locale } = useI18n();

  // Šos datus vēlāk varēs padot kā props no BentoDashboard
  const alerts: Alert[] = [
    { time: "20:45", type: "WARN", message: locale === "lv" ? "2 NEAPMAKSĀTI RĒĶINI" : "2 UNPAID BILLS", href: "/finance" },
    { time: "19:12", type: "INFO", message: locale === "lv" ? "MĀJAS DARBI GAIDA" : "HOUSEHOLD TASKS PENDING", href: "/events" },
    { time: "08:00", type: "CRIT", message: locale === "lv" ? "RESET CHECK-IN NAV VEIKTS" : "RESET CHECK-IN MISSING", href: "/reset" },
  ];

  return (
    <section className="relative overflow-hidden rounded-sm border border-white/5 bg-black/20 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_5px_var(--color-primary)]" />
          <h2 className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-white/80">Sistēmas žurnāls</h2>
        </div>
        <span className="text-[0.5rem] font-mono text-white/30">v4.6.0_STABLE</span>
      </div>

      <div className="p-4 font-mono text-[0.7rem] space-y-2">
        {alerts.map((alert, index) => (
          <Link 
            key={index} 
            href={alert.href}
            className="flex items-start gap-3 group transition-colors hover:bg-white/5 p-1 -m-1 rounded"
          >
            <span className="text-white/30 shrink-0">[{alert.time}]</span>
            <span className={`font-bold shrink-0 ${
              alert.type === "CRIT" ? "text-primary" : 
              alert.type === "WARN" ? "text-amber-500" : "text-emerald-500"
            }`}>
              {alert.type}:
            </span>
            <span className="text-white/70 group-hover:text-white transition-colors">
              {alert.message}
            </span>
            <span className="ml-auto opacity-0 group-hover:opacity-100 text-primary transition-opacity">
              &gt;_
            </span>
          </Link>
        ))}
        <motion.div 
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-primary mt-4"
        >
          _
        </motion.div>
      </div>
    </section>
  );
}
