"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function OdometerDigit({ value }: { value: string }) {
  return (
    <div className="relative h-5 w-3.5 overflow-hidden bg-black/40 border border-white/5 rounded-sm flex justify-center items-center">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -15, opacity: 0 }}
          transition={{ duration: 0.4, ease: "backOut" }}
          className="font-(family-name:--font-rajdhani) text-base font-bold text-primary tabular-nums"
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
      <span className="text-xs font-black text-white/20 uppercase tracking-tighter">{label}</span>
    </div>
  );
}

interface ForgeEvent {
  title: string;
  date: string;
  time?: string;
  style?: string;
}

export function UpcomingEventForge({ event }: { event: ForgeEvent }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    if (!event || !event.date) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(`${event.date}T${event.time || '00:00:00'}`).getTime();
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
  }, [event]);

  if (!event) return null;

  return (
    <div className="flex items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-2 w-2 bg-primary shadow-[0_0_5px_var(--color-primary)] rotate-45 shrink-0" />
        <div className="min-w-0">
          <p className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-primary/60">Aktīvais mērķis</p>
          <h2 className="text-sm font-bold uppercase tracking-tight text-white truncate">
            {event.title}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 bg-black/20 p-2 rounded border border-white/5 backdrop-blur-md">
        <OdometerGroup value={timeLeft?.d ?? 0} label="DIEN" />
        <span className="text-primary font-bold self-start mt-0.5">:</span>
        <OdometerGroup value={timeLeft?.h ?? 0} label="STUN" />
        <span className="text-primary font-bold self-start mt-0.5">:</span>
        <OdometerGroup value={timeLeft?.m ?? 0} label="MINU" />
        <span className="text-primary font-bold self-start mt-0.5">:</span>
        <OdometerGroup value={timeLeft?.s ?? 0} label="SEK" />
      </div>
    </div>
  );
}
