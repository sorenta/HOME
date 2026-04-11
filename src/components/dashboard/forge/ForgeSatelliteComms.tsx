"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { getBrowserClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

type NextEvent = {
  id: string;
  title: string;
  starts_on: string;
};

function OdometerDigit({ value }: { value: string }) {
  return (
    <div className="relative h-6 w-4 overflow-hidden bg-black/40 border border-white/5 rounded-sm flex justify-center items-center">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.4, ease: "backOut" }}
          className="font-(family-name:--font-rajdhani) text-lg font-bold text-primary tabular-nums"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function OdometerGroup({ value, label }: { value: number, label: string }) {
  const digits = String(value).padStart(2, '0').split('');
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex gap-0.5">
        {digits.map((d, i) => <OdometerDigit key={i} value={d} />)}
      </div>
      <span className="text-[0.45rem] font-black text-white/20 uppercase tracking-tighter">{label}</span>
    </div>
  );
}

export function ForgeSatelliteComms() {
  const { profile } = useAuth();
  const [nextEvent, setNextEvent] = useState<NextEvent | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.household_id) return;
    const supabase = getBrowserClient();
    if (!supabase) return;

    const fetchNextEvent = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("calendar_events")
        .select("id, title, starts_on")
        .eq("household_id", profile.household_id)
        .neq("event_type", "meal")
        .gte("starts_on", today)
        .order("starts_on", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setNextEvent(data);
      }
      setLoading(false);
    };

    fetchNextEvent();
  }, [profile?.household_id]);

  useEffect(() => {
    if (!nextEvent) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(nextEvent.starts_on).getTime();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(timer);
        return;
      }
      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [nextEvent]);

  if (loading || !nextEvent) return null;

  return (
    <section className="relative overflow-hidden rounded-sm border border-white/5 bg-black/20 backdrop-blur-xl p-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Event Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="h-2 w-2 bg-primary shadow-[0_0_5px_var(--color-primary)] rotate-45 shrink-0" />
          <div className="min-w-0">
            <p className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-primary/60">Nākamā misija</p>
            <h2 className="text-xs font-bold uppercase tracking-tight text-white truncate">
              {nextEvent.title}
            </h2>
          </div>
        </div>

        {/* Right Side: Odometer Countdown */}
        <div className="flex items-center gap-1.5 shrink-0">
          <OdometerGroup value={timeLeft?.d ?? 0} label="DIEN" />
          <span className="text-primary font-bold self-start mt-1">:</span>
          <OdometerGroup value={timeLeft?.h ?? 0} label="STUN" />
          <span className="text-primary font-bold self-start mt-1">:</span>
          <OdometerGroup value={timeLeft?.m ?? 0} label="MINU" />
          <span className="text-primary font-bold self-start mt-1">:</span>
          <OdometerGroup value={timeLeft?.s ?? 0} label="SEK" />
        </div>
      </div>
      
      {/* Background scanner line accent */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </section>
  );
}
