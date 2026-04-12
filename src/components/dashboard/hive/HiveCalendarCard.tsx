"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { getBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import hiveStyles from "@/components/theme/hive.module.css";
import { CalendarIcon } from "@heroicons/react/24/outline";

type NextEvent = {
  id: string;
  title: string;
  starts_on: string;
};

export function HiveCalendarCard() {
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
      <div className={`${hiveStyles.hiveCard} p-8 bg-black/40 border-2 border-primary/20 animate-pulse h-32`} style={{ clipPath: "polygon(12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px), 0% 12px)" }} />
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
      className={`relative overflow-hidden ${hiveStyles.hiveCard} p-6 bg-black/40 border border-primary/30 shadow-[0_4px_16px_rgba(251,191,36,0.05)]`}
      style={{ clipPath: "polygon(12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px), 0% 12px)" }}
    >
      {/* Soft gradient wash */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-bl from-primary/5 to-transparent pointer-events-none" />

      {/* Decorative hexagon shape */}
      <div className="absolute top-4 right-4 text-primary/10">
         <svg width="40" height="46" viewBox="0 0 40 46" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
           <path d="M20 0L40 11.547V34.641L20 46.188L0 34.641V11.547L20 0Z" />
         </svg>
      </div>

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-primary/20 border border-primary/30 text-primary" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-1">Nākamais notikums</p>
            <h3 className="text-lg font-medium text-(--color-text-primary) truncate max-w-[140px] md:max-w-xs">
              {nextEvent.title}
            </h3>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-primary/20 to-transparent" />

        <div className="flex items-baseline justify-around px-2 pt-1">
          {d > 0 && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-light text-(--color-text-primary)">{d}</span>     
              <span className="text-[0.65rem] font-bold text-(--color-text-secondary) uppercase tracking-widest">Dienas</span>
            </div>
          )}
          {h > 0 && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-light text-(--color-text-primary)">{h}</span>     
              <span className="text-[0.65rem] font-bold text-(--color-text-secondary) uppercase tracking-widest">Stund</span>
            </div>
          )}
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-medium text-primary drop-shadow-[0_2px_8px_rgba(251,191,36,0.3)]">{m.toString().padStart(2, '0')}</span>
            <span className="text-[0.65rem] font-bold text-(--color-text-secondary) uppercase tracking-widest">Min</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-light text-(--color-text-secondary)">{s.toString().padStart(2, '0')}</span>
            <span className="text-[0.65rem] font-bold text-(--color-text-secondary) uppercase tracking-widest">Sek</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}