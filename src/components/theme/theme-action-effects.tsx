"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeToolbarIcon } from "@/components/icons";
import { useTheme } from "@/components/providers/theme-provider";

type ThemeActionKind = "save" | "done" | "add";

type ThemeActionEffect = {
  id: number;
  kind: ThemeActionKind;
  label: string;
  comicWord: string;
};

type ThemeActionEffectsContextValue = {
  triggerThemeActionEffect: (input?: {
    kind?: ThemeActionKind;
    label?: string;
  }) => void;
};

const ThemeActionEffectsContext = createContext<ThemeActionEffectsContextValue | null>(null);

const COMIC_WORDS: Record<ThemeActionKind, string[]> = {
  save: ["BAM!", "POW!", "YES!"],
  done: ["WOW!", "NICE!", "BOOM!"],
  add: ["ZAP!", "POP!", "BING!"],
};

function trimLabel(label: string | undefined) {
  const value = (label ?? "").trim();
  if (!value) return "Fresh update";
  return value.length > 36 ? `${value.slice(0, 33)}...` : value;
}

function randomComicWord(kind: ThemeActionKind) {
  const pool = COMIC_WORDS[kind];
  return pool[Math.floor(Math.random() * pool.length)] ?? "BAM!";
}

function PulseActionOverlay({ effect }: { effect: ThemeActionEffect }) {
  return (
    <motion.div
      key={effect.id}
      initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      exit={{ scale: 1.28, opacity: 0, rotate: 6 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      className="pointer-events-none fixed inset-0 z-9999 flex items-center justify-center px-6"
    >
      <div className="relative">
        <motion.div
          initial={{ rotate: -8 }}
          animate={{ rotate: [0, -2, 2, 0] }}
          transition={{ duration: 0.28, ease: "easeInOut" }}
          className="relative flex h-56 w-56 items-center justify-center"
        >
          <div
            className="absolute inset-0 border-[5px] border-black bg-[#ffec66] shadow-[10px_10px_0_#00000024]"
            style={{
              clipPath:
                "polygon(50% 0%, 61% 18%, 82% 7%, 73% 28%, 100% 23%, 80% 43%, 100% 50%, 80% 57%, 100% 77%, 73% 72%, 82% 93%, 61% 82%, 50% 100%, 39% 82%, 18% 93%, 27% 72%, 0% 77%, 20% 57%, 0% 50%, 20% 43%, 0% 23%, 27% 28%, 18% 7%, 39% 18%)",
            }}
          />
          <span
            className="relative z-10 select-none text-center text-5xl font-black uppercase text-white"
            style={{
              WebkitTextStroke: "3px #000",
              paintOrder: "stroke fill",
              textShadow: "6px 6px 0 #ff6200, -3px -3px 0 #00000010",
            }}
          >
            {effect.comicWord}
          </span>
        </motion.div>

        <motion.div
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ delay: 0.05, duration: 0.2 }}
          className="absolute left-1/2 top-[72%] w-[16rem] -translate-x-1/2 rounded-[1.1rem] border-[4px] border-black bg-white px-4 py-3 text-center shadow-[8px_8px_0_#00000020]"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#ff6200]">
            {effect.kind}
          </p>
          <p className="mt-1 text-sm font-black uppercase tracking-[0.04em] text-black">
            {effect.label}
          </p>
        </motion.div>

        <div className="absolute -left-4 top-8 rounded-full border-[3px] border-black bg-white px-2 py-1 text-[0.65rem] font-black uppercase text-black shadow-[4px_4px_0_#00000018]">
          Ink!
        </div>
        <div className="absolute -right-1 bottom-9 rounded-full border-[3px] border-black bg-[#ff8f4d] px-2 py-1 text-[0.65rem] font-black uppercase text-white shadow-[4px_4px_0_#00000018]">
          Snap!
        </div>
      </div>
    </motion.div>
  );
}

function ForgeActionOverlay({ effect }: { effect: ThemeActionEffect }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-9998 overflow-hidden">
      {/* Red scan flash */}
      <motion.div
        key={`${effect.id}-flash`}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.18, 0] }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(217,31,38,0.25) 0%, transparent 60%)" }}
      />
      {/* Mechanical status card */}
      <motion.div
        key={effect.id}
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 520, damping: 36 }}
        className="absolute bottom-20 right-4 min-w-[10rem] overflow-hidden"
        style={{
          background: "#0C0E10",
          border: "1px solid rgba(217,31,38,0.55)",
          borderLeft: "3px solid #D91F26",
          borderRadius: "6px",
          boxShadow: "0 0 24px rgba(217,31,38,0.15), inset 0 1px 0 rgba(255,255,255,0.04)",
          padding: "0.6rem 0.85rem",
        }}
      >
        <p className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(217,31,38,0.9)" }}>
          {effect.kind === "done" ? "EXECUTED" : "SAVED"}
        </p>
        <p className="mt-0.5 text-[12px] font-bold uppercase tracking-[0.06em] text-white/90">
          {effect.label}
        </p>
        {/* Scan line */}
        <motion.div
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.28, ease: "easeOut", delay: 0.08 }}
          className="mt-1.5 h-px"
          style={{ background: "linear-gradient(90deg, rgba(217,31,38,0.8), transparent)" }}
        />
      </motion.div>
    </div>
  );
}

function BotanicalActionOverlay({ effect }: { effect: ThemeActionEffect }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-9998 overflow-hidden">
      {/* Sprout growing upward */}
      <motion.div
        key={effect.id}
        initial={{ y: 60, opacity: 0, scale: 0.7 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="absolute bottom-24 left-5 flex flex-col items-center gap-1"
      >
        <motion.span
          animate={{ rotate: [0, -8, 6, -4, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="text-4xl select-none"
          style={{ filter: "drop-shadow(0 4px 12px rgba(62,107,50,0.25))" }}
        >
          🌿
        </motion.span>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          style={{
            background: "rgba(238,232,216,0.95)",
            border: "1px solid rgba(62,107,50,0.28)",
            borderRadius: "20px",
            padding: "0.45rem 0.8rem",
            boxShadow: "0 6px 20px rgba(51,66,41,0.10)",
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "rgba(62,107,50,0.85)" }}>
            {effect.kind === "done" ? "Izaudzis ✓" : "Saglabāts"}
          </p>
          <p className="mt-0.5 text-xs font-semibold" style={{ color: "#1E2E18" }}>
            {effect.label}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

function HiveActionOverlay({ effect }: { effect: ThemeActionEffect }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-9998 overflow-hidden">
      <motion.div
        key={effect.id}
        initial={{ x: -90, y: 90, opacity: 0, rotate: -8, scale: 0.88 }}
        animate={{
          x: [0, 18, 120, 240, 300],
          y: [0, -20, -120, -235, -300],
          opacity: [0, 1, 1, 1, 0],
          rotate: [-8, -2, 2, 7, 10],
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.55, ease: "easeInOut" }}
        className="absolute bottom-24 left-6 flex items-center gap-3"
      >
        <motion.div
          animate={{ y: [0, -5, 0], rotate: [0, 6, -4, 0] }}
          transition={{ duration: 0.55, repeat: 2, ease: "easeInOut" }}
          className="relative rounded-[1.25rem] border-2 border-amber-500/70 bg-[rgba(255,248,220,0.96)] px-4 py-3 shadow-[0_10px_28px_rgba(245,184,0,0.18)]"
        >
          <div className="absolute -left-2 top-3 h-3 w-3 rounded-full bg-amber-400/70 blur-[1px]" />
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
            {effect.kind === "done" ? "Pienests stropam" : "Jauna zīmīte"}
          </p>
          <p className="mt-1 max-w-[11rem] text-sm font-semibold text-(--color-text-primary)">
            {effect.label}
          </p>
        </motion.div>

        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 10, -8, 0] }}
          transition={{ duration: 0.42, repeat: 3, ease: "easeInOut" }}
          className="drop-shadow-[0_10px_16px_rgba(0,0,0,0.12)]"
        >
          <ThemeToolbarIcon themeId="hive" size={34} tone="active" />
        </motion.div>
      </motion.div>
    </div>
  );
}

function LucentActionOverlay({ effect }: { effect: ThemeActionEffect }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-9998 overflow-hidden flex items-center justify-center">
      <motion.div
        key={effect.id}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.1, y: -20 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative px-8 py-4 rounded-[2.5rem] bg-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_20px_50px_rgba(184,150,106,0.15)]"
      >
        {/* Soft floating orbs inside the notification */}
        <motion.div 
          animate={{ x: [0, 10, 0], y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-4 -right-4 w-12 h-12 bg-primary/20 rounded-full blur-xl"
        />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-1 text-center">
          {effect.kind === "done" ? "Pabeigts" : "Saglabāts"}
        </p>
        <p className="text-sm font-medium text-foreground/80 tracking-tight text-center">
          {effect.label}
        </p>
      </motion.div>
    </div>
  );
}

export function ThemeActionEffectsProvider({ children }: { children: React.ReactNode }) {
  const { themeId } = useTheme();
  const [effect, setEffect] = useState<ThemeActionEffect | null>(null);

  useEffect(() => {
    if (!effect) return;
    const timer = setTimeout(() => {
      setEffect(null);
    }, 2500);
    return () => clearTimeout(timer);
  }, [effect]);

  const triggerThemeActionEffect = useCallback(
    (input?: { kind?: ThemeActionKind; label?: string }) => {
      const kind = input?.kind ?? "save";
      setEffect({
        id: Date.now() + Math.round(Math.random() * 1000),
        kind,
        label: trimLabel(input?.label),
        comicWord: randomComicWord(kind),
      });
    },
    [],
  );

  const value = useMemo(
    () => ({ triggerThemeActionEffect }),
    [triggerThemeActionEffect],
  );

  return (
    <ThemeActionEffectsContext.Provider value={value}>
      {children}
      <AnimatePresence onExitComplete={() => setEffect(null)}>
        {effect && themeId === "pulse" ? <PulseActionOverlay key={effect.id} effect={effect} /> : null}
        {effect && themeId === "hive" ? <HiveActionOverlay key={effect.id} effect={effect} /> : null}
        {effect && themeId === "forge" ? <ForgeActionOverlay key={effect.id} effect={effect} /> : null}
        {effect && themeId === "botanical" ? <BotanicalActionOverlay key={effect.id} effect={effect} /> : null}
        {effect && themeId === "lucent" ? <LucentActionOverlay key={effect.id} effect={effect} /> : null}
      </AnimatePresence>
    </ThemeActionEffectsContext.Provider>
  );
}

export function useThemeActionEffects() {
  const ctx = useContext(ThemeActionEffectsContext);
  if (!ctx) {
    throw new Error("ThemeActionEffectsProvider missing");
  }
  return ctx;
}

