"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { getBrowserClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/i18n-context";
import { motion } from "framer-motion";
import Link from "next/link";

type Alert = {
  time: string;
  type: "WARN" | "INFO" | "CRIT";
  message: string;
  href: string;
};

export function LucentAlertLog() {
  const { profile } = useAuth();
  const { locale } = useI18n();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.household_id) {
      setLoading(false);
      return;
    }
    const supabase = getBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    async function loadAlerts() {
      // Izgūstam šodienas neizpildītos uzdevumus un notikumus kā reālus datus
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase!
        .from("household_tasks")
        .select("id, title, due_on")
        .eq("household_id", profile!.household_id)
        .eq("is_done", false)
        .lte("due_on", today)
        .order("due_on", { ascending: true })
        .limit(4);

      if (!error && data) {
        const liveAlerts: Alert[] = data.map((task) => {
          const isOverdue = task.due_on < today;
          return {
            time: "10:00", // Laika lauks uzdevumiem parasti nav tik svarīgs, te var ielikt defaultu vai rīta laiku
            type: isOverdue ? "CRIT" : "WARN",
            message: task.title,
            href: "/events",
          };
        });
        
        setAlerts(liveAlerts);
      }
      setLoading(false);
    }
    
    loadAlerts();
  }, [profile]);

  if (loading) {
    return (
      <div className="rounded-[2.5rem] bg-[#FCFBF8] dark:bg-zinc-900/90 p-8 shadow-[0_30px_60px_-15px_rgba(210,200,190,0.5),inset_0_1px_2px_rgba(255,255,255,1)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.05)] border border-[#F3F0EA] dark:border-zinc-800/80 h-32 animate-pulse" />
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="relative overflow-hidden rounded-[2.5rem] bg-[#FCFBF8] dark:bg-zinc-900/90 p-6 sm:p-8 shadow-[0_30px_60px_-15px_rgba(210,200,190,0.5),inset_0_1px_2px_rgba(255,255,255,1)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.05)] border border-[#F3F0EA] dark:border-zinc-800/80"
    >
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-200/20 dark:bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-[#FAF8F5] dark:bg-white/5 shadow-sm border border-white/80 dark:border-white/5">
              <span className="text-xl opacity-70 drop-shadow-sm">✨</span>
            </div>
            <div>
              <h2 className="text-base font-medium text-foreground tracking-tight">
                Mājas plūsma
              </h2>
              <p className="text-xs font-light text-foreground/70 mt-0.5">
                {alerts.length > 0 ? (locale === "lv" ? "Šodienas aktivitātes" : "Today's activities") : (locale === "lv" ? "Viss izdarīts" : "All caught up")}
              </p>
            </div>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm italic text-foreground/40">
              {locale === "lv" ? "Visi šodienas uzdevumi un brīdinājumi ir izpildīti." : "All tasks and alerts are cleared for today."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-1">
            {alerts.map((alert, index) => (
              <Link 
                key={index} 
                href={alert.href}
                className="flex items-start gap-3 text-sm p-2 -mx-2 rounded-xl transition-all hover:bg-[#FAF8F5] dark:hover:bg-white/5 border border-transparent hover:border-white/80 dark:hover:border-white/10"
              >
                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                  alert.type === "CRIT" ? "bg-rose-400" : 
                  alert.type === "WARN" ? "bg-amber-400" : "bg-emerald-400"
                }`} />
                <div className="flex flex-col gap-0.5 flex-1">
                  <span className="text-foreground/90 font-medium leading-tight">
                    {alert.message}
                  </span>
                  <span className="text-xs text-foreground/60 font-light">
                    {alert.type === "CRIT" ? (locale === "lv" ? "Kavējas" : "Overdue") : (locale === "lv" ? "Šodien" : "Today")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}