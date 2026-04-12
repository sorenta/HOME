"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import hiveStyles from "@/components/theme/hive.module.css";

export function HiveHero() {
  const { profile, user } = useAuth();
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const displayName = profile?.display_name ?? user?.email?.split("@")[0] ?? "Viesi";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return { main: "Labrīt", sub: "Mosties lēnām un dabiski." };
    if (hour >= 12 && hour < 18) return { main: "Dienas vidus", sub: "Ritms kūsā kā saules gaisma stropos." };
    if (hour >= 18 && hour < 22) return { main: "Vakars", sub: "Siltums sildās un rosība norimst." };
    return { main: "Nakts miers", sub: "Laiks saldam miegam." };
  };

  const greeting = getGreeting();

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden ${hiveStyles.hiveCard} rounded-3xl p-6 sm:p-8 bg-[color-mix(in_srgb,var(--color-card)_85%,transparent)] backdrop-blur-md border-2 border-primary/20 shadow-[0_12px_32px_rgba(217,119,6,0.1)]`}
    >
      {/* Background amber glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 pointer-events-none" />
      
      {/* Decorative hexagon watermark */}
      <div 
        className="absolute -right-8 -top-8 w-40 h-40 opacity-[0.04] pointer-events-none"
        style={{
          background: "currentColor",
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          color: "var(--color-primary)"
        }}
      />

      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex justify-between items-start">
          <div className="space-y-1.5">
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-xs font-bold text-primary/90 uppercase tracking-widest"
            >
              {greeting.main}
            </motion.p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-(--color-foreground) tracking-tight">
              {displayName}
            </h1>
            <p className="text-sm font-medium text-(--color-foreground) opacity-70">
              {greeting.sub}
            </p>
          </div>
          
          <div className="text-right">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="flex flex-col items-end"
            >
              <p className="text-xs font-bold text-(--color-foreground) opacity-60 mb-0.5 uppercase tracking-wide">
                {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
              <p className="text-2xl font-bold tabular-nums text-(--color-foreground) opacity-90 tracking-tight">
                {time}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
