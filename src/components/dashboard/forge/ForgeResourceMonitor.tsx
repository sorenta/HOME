"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { getBrowserClient } from "@/lib/supabase/client";
import { localDateIso } from "@/lib/reset-daily-signals";

export function ForgeResourceMonitor() {
  const { user } = useAuth();
  const [hydration, setHydration] = useState(0);
  const [wellness, setWellness] = useState(0);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    const supabase = getBrowserClient();
    if (!supabase) return;

    const today = localDateIso();

    const fetchData = async () => {
      // 1. Fetch Water Data
      const { data: waterData } = await supabase
        .from("water_logs")
        .select("ml")
        .eq("user_id", user.id)
        .eq("logged_on", today);

      const totalMl = (waterData ?? []).reduce((acc, curr) => acc + curr.ml, 0);
      const waterPct = Math.min(Math.round((totalMl / 2000) * 100), 100);

      // 2. Fetch Wellness Data (Mood + Energy average)
      const { data: resetData } = await supabase
        .from("reset_daily_signals")
        .select("mood, energy")
        .eq("user_id", user.id)
        .eq("logged_on", today)
        .single();

      let wellnessPct = 0;
      if (resetData) {
        const mood = resetData.mood ?? 0;
        const energy = resetData.energy ?? 0;
        wellnessPct = Math.round((mood + energy) / 2);
      }

      if (!alive) return;
      setHydration(waterPct);
      setWellness(wellnessPct || 50); // Fallback to 50 if no data
    };

    void fetchData();
    return () => { alive = false; };
  }, [user]);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="relative overflow-hidden rounded-sm border border-white/5 bg-black/20 p-4 backdrop-blur-xl">
        <div className="flex justify-between items-end mb-3">
          <div className="space-y-0.5">
            <p className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-primary">Resursi</p>
            <h3 className="text-[0.7rem] font-bold uppercase tracking-widest text-white/80">Ūdens līmenis</h3>
          </div>
          <p className="font-(family-name:--font-rajdhani) text-lg font-bold text-primary">{hydration}%</p>
        </div>
        
        <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${hydration}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_10px_var(--color-primary)]"
          />
        </div>
        <div className="mt-2 flex justify-between">
          <span className="text-[0.5rem] uppercase text-white/20">Kritiski</span>
          <span className="text-[0.5rem] uppercase text-white/20">Optimāli</span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-sm border border-white/5 bg-black/20 p-4 backdrop-blur-xl">
        <div className="flex justify-between items-end mb-3">
          <div className="space-y-0.5">
            <p className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-primary">Sistēma</p>
            <h3 className="text-[0.7rem] font-bold uppercase tracking-widest text-white/80">Labsajūtas jauda</h3>
          </div>
          <p className="font-(family-name:--font-rajdhani) text-lg font-bold text-primary">{wellness}%</p>
        </div>
        
        <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${wellness}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_10px_var(--color-primary)]"
          />
        </div>
        <div className="mt-2 flex justify-between">
          <span className="text-[0.5rem] uppercase text-white/20">Slodze</span>
          <span className="text-[0.5rem] uppercase text-white/20">Miers</span>
        </div>
      </div>
    </section>
  );
}
