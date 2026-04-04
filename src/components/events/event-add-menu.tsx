"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/i18n-context";

type OptionKey = "event" | "reminder" | "birthday" | "homework" | "personal" | "shared";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (key: OptionKey) => void;
};

const OPTIONS: { key: OptionKey; labelKey: string }[] = [
  { key: "event", labelKey: "events.entry.event" },
  { key: "reminder", labelKey: "events.entry.reminder" },
  { key: "birthday", labelKey: "events.entry.birthday" },
  { key: "homework", labelKey: "events.entry.homework" },
  { key: "personal", labelKey: "events.entry.personal" },
  { key: "shared", labelKey: "events.entry.shared" },
];

export function EventAddMenu({ isOpen, onClose, onSelect }: Props) {
  const { t } = useI18n();

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className="fixed bottom-5 right-5 z-30 h-14 w-14 text-2xl font-semibold"
        style={{
          borderRadius: "999px",
          background: "var(--color-accent)",
          color: "var(--color-accent-foreground)",
          boxShadow: "0 10px 32px color-mix(in srgb, var(--color-accent) 38%, transparent)",
        }}
        aria-label={t("events.addEntry")}
      >
        +
      </button>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={onClose}
              className="fixed inset-0 z-40"
              style={{ background: "color-mix(in srgb, var(--color-foreground) 24%, transparent)" }}
              aria-label={t("events.closeMenu")}
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 27, stiffness: 240 }}
              className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-2xl p-4"
            >
              <div
                className="space-y-3 border p-4"
                style={{
                  borderColor: "var(--color-border)",
                  borderRadius: "var(--radius-xl)",
                  background: "color-mix(in srgb, var(--color-card) 92%, transparent)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div className="mx-auto h-1.5 w-12" style={{ borderRadius: "999px", background: "var(--color-border)" }} />
                <p className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
                  {t("events.addNewEntry")}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => {
                        onSelect(option.key);
                        onClose();
                      }}
                      className="px-3 py-2 text-left text-sm font-medium"
                      style={{
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-foreground)",
                        background: "color-mix(in srgb, var(--color-card) 76%, transparent)",
                      }}
                    >
                      {t(option.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
