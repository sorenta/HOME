"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function LucentHero() {
  const { profile, user } = useAuth();
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const displayName = profile?.display_name ?? user?.email?.split("@")[0] ?? "Viesi";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return { main: "Labrīt", sub: "Mierīgs sākums jaunai dienai." };
    if (hour >= 12 && hour < 18) return { main: "Sveiki", sub: "Laiks ieelpot un turpināt." };
    if (hour >= 18 && hour < 22) return { main: "Labvakar", sub: "Lēna atelpa pēc garas dienas." };
    return { main: "Ar labunakti", sub: "Saldus sapņus un mieru mājās." };
  };

  const greeting = getGreeting();

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[2.5rem] bg-[#FCFBF8] dark:bg-zinc-900/90 p-8 sm:p-10 shadow-[0_30px_60px_-15px_rgba(210,200,190,0.5),inset_0_1px_2px_rgba(255,255,255,1)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.05)] border border-[#F3F0EA] dark:border-zinc-800/80"
    >
      {/* Soft, slow "Morning slumber" pulse gradient in the background - enhanced shadows */}
      <motion.div 
        whileInView={{ 
          scale: [1, 1.05, 1],
          opacity: [0.4, 0.7, 0.4],
          x: [0, 20, 0], // Subtle wind drift
          y: [0, -10, 0]
        }}
        viewport={{ margin: "100px" }}
        transition={{ 
          duration: 12, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        className="absolute -top-24 -right-24 w-72 h-72 bg-primary/30 rounded-full blur-[80px] pointer-events-none" 
      />
      <motion.div 
        whileInView={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, -30, 0], // Subtle wind drift
          y: [0, 15, 0]
        }}
        viewport={{ margin: "100px" }}
        transition={{ 
          duration: 15, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2 
        }}
        className="absolute -bottom-12 -left-12 w-56 h-56 bg-blue-300/30 dark:bg-blue-400/30 rounded-full blur-[64px] pointer-events-none" 
      />
      
      {/* Wind particle lines sweeping across */}
      <motion.div
        whileInView={{
          x: ["-100%", "200%"],
          opacity: [0, 0.3, 0]
        }}
        viewport={{ margin: "100px" }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
          delay: 1
        }}
        className="absolute top-1/4 left-0 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none rotate-3"
      />
      <motion.div
        whileInView={{
          x: ["-100%", "200%"],
          opacity: [0, 0.2, 0]
        }}
        viewport={{ margin: "100px" }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "linear",
          delay: 4
        }}
        className="absolute bottom-1/3 left-0 w-1/4 h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none blur-[1px] -rotate-2"
      />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-sm font-medium text-primary/80 dark:text-primary/70 tracking-wide"
            >
              {greeting.main},
            </motion.p>
            <h1 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight">
              {displayName}
            </h1>
            <p className="text-base font-normal text-foreground/80">
              {greeting.sub}
            </p>
          </div>
          
          <div className="text-right">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="inline-flex flex-col items-end"
            >
              <p className="text-sm font-medium text-foreground/70 mb-1">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-3xl font-light tabular-nums text-foreground/80 tracking-tight">
                {time}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
