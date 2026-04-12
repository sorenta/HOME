"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useTheme } from "@/components/providers/theme-provider";
import { type EventKind } from "@/lib/events-planner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (kind: EventKind) => void;
};

export function EventAddMenu({ isOpen, onClose, onSelect }: Props) {
  const { t } = useI18n();
  const { themeId } = useTheme();

  const options: { kind: EventKind; label: string; icon: string; code?: string }[] = [
    { kind: "reminder", label: t("events.type.reminder"), icon: "🔔", code: "OPS:REM" },
    { kind: "birthday", label: t("events.type.birthday"), icon: "🎂", code: "BIO:ANN" },
    { kind: "nameday", label: t("events.type.nameday"), icon: "✨", code: "BIO:NOM" },
    { kind: "homework", label: t("events.type.homework"), icon: "📝", code: "OPS:TSK" },
    { kind: "personal", label: t("events.type.personal"), icon: "🔒", code: "SEC:PRV" },
    { kind: "shared", label: t("events.type.shared"), icon: "👥", code: "SEC:SHR" },
  ];

  if (themeId === "forge") {
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm overflow-hidden rounded-sm border border-primary/30 bg-black/90 shadow-[0_0_50px_rgba(225,29,46,0.2)]"
            >
              <div className="border-b border-primary/20 bg-primary/10 px-4 py-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-(family-name:--font-rajdhani) text-sm font-bold uppercase tracking-[0.2em] text-primary">
                    Iniciēt operāciju
                  </h2>
                  <button onClick={onClose} className="text-primary/60 hover:text-primary">✕</button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-1 p-2">
                {options.map((opt) => (
                  <button
                    key={opt.kind}
                    onClick={() => onSelect(opt.kind)}
                    className="flex items-center justify-between rounded-sm px-4 py-3 hover:bg-primary/10 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[0.6rem] font-mono text-primary opacity-50">[{opt.code}]</span>
                      <span className="text-[0.7rem] font-black uppercase tracking-widest text-white/80 group-hover:text-primary">
                        {opt.label}
                      </span>
                    </div>
                    <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span>
                  </button>
                ))}
              </div>
              
              <div className="bg-black/40 px-4 py-2 border-t border-white/5">
                <p className="text-[0.5rem] font-mono text-white/20 uppercase tracking-tighter">Atlasiet režīmu, lai turpinātu_</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  // Lucent icons and colors - delicate, cozy icons with ultra-soft pastel washes
  const getLucentIcon = (kind: EventKind) => {
    switch (kind) {
      case "reminder": return { icon: "🕰️", bg: "bg-amber-50/50 dark:bg-amber-900/10", border: "border-amber-100/50 dark:border-amber-800/20" };
      case "birthday": return { icon: "🧁", bg: "bg-rose-50/50 dark:bg-rose-900/10", border: "border-rose-100/50 dark:border-rose-800/20" };
      case "nameday": return { icon: "🌸", bg: "bg-fuchsia-50/50 dark:bg-fuchsia-900/10", border: "border-fuchsia-100/50 dark:border-fuchsia-800/20" };
      case "homework": return { icon: "🧺", bg: "bg-emerald-50/50 dark:bg-emerald-900/10", border: "border-emerald-100/50 dark:border-emerald-800/20" };
      case "personal": return { icon: "☕", bg: "bg-sky-50/50 dark:bg-sky-900/10", border: "border-sky-100/50 dark:border-sky-800/20" };
      case "shared": return { icon: "🏡", bg: "bg-orange-50/50 dark:bg-orange-900/10", border: "border-orange-100/50 dark:border-orange-800/20" };
      default: return { icon: "📝", bg: "bg-[#FCFBF8] dark:bg-zinc-800/40", border: "border-[#E8E4DF] dark:border-zinc-700/40" };
    }
  };

  if (themeId === "lucent") {
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/10 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full max-w-md bg-gradient-to-br from-white to-[#FAF8F5] dark:from-zinc-900 dark:to-zinc-950 p-6 sm:p-8 shadow-[0_30px_60px_-15px_rgba(210,200,190,0.5),inset_0_1px_2px_rgba(255,255,255,1)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.05)] border border-[#F3F0EA] dark:border-zinc-800/80 rounded-t-[2.5rem] sm:rounded-[2.5rem]"
            >
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-xl font-medium text-foreground tracking-tight">
                  {t("events.quickAddTitle")}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF8F5] dark:bg-white/5 shadow-sm border border-white/80 dark:border-white/5 transition-transform active:scale-90"
                >
                  <span className="opacity-50 text-sm">✕</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {options.map((opt) => {
                  const lStyle = getLucentIcon(opt.kind);
                  return (
                    <button
                      key={opt.kind}
                      onClick={() => onSelect(opt.kind)}
                      className={`flex flex-col items-center justify-center gap-3 rounded-[2rem] border p-5 transition-all hover:scale-[1.02] active:scale-95 shadow-sm ${lStyle.bg} ${lStyle.border}`}
                    >
                      <span className="text-3xl opacity-80 drop-shadow-sm" aria-hidden>
                        {lStyle.icon}
                      </span>
                      <span className="text-xs font-medium text-foreground/70 tracking-wide">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md rounded-t-[2rem] bg-card p-6 shadow-xl sm:rounded-[2rem]"
            style={{
              background: "color-mix(in srgb, var(--color-surface) 98%, white)",
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: "var(--color-foreground)" }}>
                {t("events.quickAddTitle")}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/5"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {options.map((opt) => (
                <button
                  key={opt.kind}
                  onClick={() => onSelect(opt.kind)}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all active:scale-95"
                  style={{
                    borderColor: "var(--color-border)",
                    background: "color-mix(in srgb, var(--color-surface-2) 50%, transparent)",
                  }}
                >
                  <span className="text-2xl" aria-hidden>
                    {opt.icon}
                  </span>
                  <span className="text-xs font-bold" style={{ color: "var(--color-foreground)" }}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
