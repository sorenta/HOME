"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { getBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

type NextEvent = {
  id: string;
  title: string;
  starts_on: string;
};

export function LucentCalendarCard() {
  const { profile } = useAuth();
  const [nextEvent, setNextEvent] = useState<NextEvent | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);
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

    async function loadNext() {
      const { data, error } = await supabase!
        .from("calendar_events")
        .select("id, title, starts_on")
        .eq("household_id", profile!.household_id)
        .neq("event_type", "meal")
        .gte("starts_on", new Date().toISOString())
        .order("starts_on", { ascending: true })
        .limit(1)
        .single();
      
      if (!error && data) setNextEvent(data);
      setLoading(false);
    }
    loadNext();
  }, [profile]);

  useEffect(() => {
    if (!nextEvent) return;
    const end = new Date(nextEvent.starts_on).getTime();

    const tick = () => {
      const now = new Date().getTime();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft({ d, h, m, s });
    };
    
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nextEvent]);

  if (loading) {
    return (
      <div className="rounded-[2.5rem] bg-[#FCFBF8] dark:bg-zinc-900/90 p-8 shadow-[0_30px_60px_-15px_rgba(210,200,190,0.5),inset_0_1px_2px_rgba(255,255,255,1)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.05)] border border-[#F3F0EA] dark:border-zinc-800/80 h-32 animate-pulse" />
    );
  }

  if (!nextEvent || !timeLeft) {
    return null;
  }

  const { d, h, m, s } = timeLeft;
  
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.1 }}
      className="relative overflow-hidden rounded-[2.5rem] bg-[#FCFBF8] dark:bg-zinc-900/90 p-8 shadow-[0_30px_60px_-15px_rgba(210,200,190,0.5),inset_0_1px_2px_rgba(255,255,255,1)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.05)] border border-[#F3F0EA] dark:border-zinc-800/80"
    >
      {/* Soft gradient wash */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      
      {/* Slow breathing pulse */}
      <motion.div 
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/20 dark:from-white/5 to-transparent pointer-events-none"
      />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-[1.25rem] bg-white dark:bg-white/10 shadow-[0_8px_20px_-5px_rgba(0,0,0,0.08)] border border-black/5 dark:border-white/5">
              <span className="text-2xl drop-shadow-sm">📅</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-primary/70 uppercase tracking-widest mb-1">Nākamais notikums</p>
              <h3 className="text-lg font-medium text-foreground truncate max-w-[140px] md:max-w-xs">
                {nextEvent.title}
              </h3>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-foreground/5 via-foreground/10 to-transparent rounded-full" />

        <div className="flex items-baseline justify-around px-2">
          {d > 0 && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-light text-foreground/80">{d}</span>
              <span className="text-[0.65rem] font-semibold text-foreground/40 uppercase tracking-widest">Dienas</span>
            </div>
          )}
          {h > 0 && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-light text-foreground/80">{h}</span>
              <span className="text-[0.65rem] font-semibold text-foreground/40 uppercase tracking-widest">Stund</span>
            </div>
          )}
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-medium text-primary drop-shadow-[0_2px_8px_rgba(var(--color-primary-rgb),0.3)]">{m.toString().padStart(2, '0')}</span>
            <span className="text-[0.65rem] font-semibold text-foreground/40 uppercase tracking-widest">Min</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-light text-foreground/50">{s.toString().padStart(2, '0')}</span>
            <span className="text-[0.65rem] font-semibold text-foreground/40 uppercase tracking-widest">Sek</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
