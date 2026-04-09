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
