"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function ForgeHero() {
  const { profile, user } = useAuth();
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const displayName = profile?.display_name ?? user?.email?.split("@")[0] ?? "User";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return { main: "MOSTIES UN RADI", sub: "Jauna enerģija tavam mājas ritmam." };
    if (hour >= 12 && hour < 18) return { main: "MĀJAS SIRDS", sub: `Šodiena ir tava, ${displayName}.` };
    if (hour >= 18 && hour < 22) return { main: "ATELPAS MIRKLIS", sub: "Gaisma un miers tavā patvērumā." };
    return { main: "KLUSĀ JAUDA", sub: "Atpūties, māja ir drošībā." };
  };

  const greeting = getGreeting();

  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-sm border border-white/5 bg-black/20 p-6 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
    >
      {/* Background technical grid accent and smoke gradient */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(var(--color-primary) 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-black/20 pointer-events-none" />
      
      {/* Top red neon bar with softer glow */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_15px_rgba(225,29,46,0.3)]" />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[0.62rem] font-black uppercase tracking-[0.25em] text-primary"
            >
              {greeting.main}
            </motion.p>
            <h1 className="text-3xl font-bold text-white tracking-wider font-(family-name:--font-rajdhani) uppercase">
              <span className="text-primary opacity-70 mr-1">[</span>
              {displayName}
              <span className="text-primary opacity-70 ml-1">]</span>
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 1] }}
                className="inline-block w-2 h-6 bg-primary ml-2 translate-y-1"
              />
            </h1>
            <p className="text-[0.6rem] font-medium text-white/40 italic">
              {greeting.sub}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[0.62rem] font-bold uppercase tracking-widest text-white/40">
              Terminal Time
            </p>
            <p className="font-(family-name:--font-theme-display) text-xl font-bold tabular-nums text-primary drop-shadow-[0_0_8px_rgba(225,29,46,0.5)]">
              {time}
            </p>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[0.55rem] uppercase tracking-widest text-white/30">Node Status</span>
            <span className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase text-emerald-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
              Online
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.55rem] uppercase tracking-widest text-white/30">Protocol</span>
            <span className="text-[0.7rem] font-bold uppercase text-white/80">HomeOS v4.6</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.55rem] uppercase tracking-widest text-white/30">Auth Level</span>
            <span className="text-[0.7rem] font-bold uppercase text-primary">Admin</span>
          </div>
        </div>
      </div>

      {/* Decorative corner brackets */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-white/20" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-white/20" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-white/20" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-white/20" />
    </motion.section>
  );
}
